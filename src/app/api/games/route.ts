import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
};

function isRecentRelease(releaseText: string): boolean {
  if (!releaseText) return false;

  const skipWords = ['coming', 'tba', 'to be', 'announced', 'soon', 'q1', 'q2', 'q3', 'q4'];
  if (skipWords.some(w => releaseText.toLowerCase().includes(w))) return false;

  const now = new Date();
  const formats = [
    /^([A-Za-z]{3}) (\d{1,2}), (\d{4})$/, // "Jan 15, 2026"
    /^(\d{1,2}) ([A-Za-z]{3}), (\d{4})$/,  // "15 Jan, 2026"
  ];

  for (const fmt of formats) {
    const match = releaseText.trim().match(fmt);
    if (match) {
      const dateStr = releaseText.trim();
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        const diffDays = (now.getTime() - parsed.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 30;
      }
    }
  }

  return false;
}

interface Game {
  title: string;
  release: string;
  reviews: string;
  url: string;
  score: number;
}

interface UpcomingGame {
  title: string;
  release: string;
  url: string;
}

interface NewsArticle {
  title: string;
  source: string;
  url: string;
}

interface ItchGame {
  title: string;
  author: string;
  url: string;
}

async function getFreshReleases(): Promise<Game[]> {
  try {
    const res = await fetch(
      'https://store.steampowered.com/search/?sort_by=Released_DESC&tags=492&category1=998&ndl=1',
      { headers: HEADERS, next: { revalidate: 300 } }
    );
    const html = await res.text();
    const $ = cheerio.load(html);

    const games: Game[] = [];

    $('a.search_result_row').slice(0, 60).each((_, el) => {
      const $el = $(el);
      const title = $el.find('.title').text().trim();
      const release = $el.find('.search_released').text().trim();

      if (!isRecentRelease(release)) return;

      const reviewEl = $el.find('.search_review_summary');
      let reviews = 'New';
      if (reviewEl.length) {
        const tooltip = reviewEl.attr('data-tooltip-html') || '';
        reviews = tooltip.split('<br>')[0] || 'New';
      }

      const href = ($el.attr('href') || '').split('?')[0];

      let score = 0;
      if (reviews.includes('Very Positive') || reviews.includes('Overwhelmingly')) score = 2;
      else if (reviews.includes('Positive')) score = 1;

      games.push({ title, release, reviews, url: href, score });
    });

    return games.sort((a, b) => b.score - a.score);
  } catch (e) {
    console.error('Error fetching fresh releases:', e);
    return [];
  }
}

async function getUpcomingHype(): Promise<UpcomingGame[]> {
  try {
    const res = await fetch(
      'https://store.steampowered.com/search/?filter=popularwishlist&tags=492&category1=998',
      { headers: HEADERS, next: { revalidate: 300 } }
    );
    const html = await res.text();
    const $ = cheerio.load(html);

    const games: UpcomingGame[] = [];
    const upcomingKeywords = ['coming', 'tba', 'to be', 'announced', '2026', '2027', 'soon', 'q1', 'q2', 'q3', 'q4'];

    $('a.search_result_row').slice(0, 20).each((_, el) => {
      const $el = $(el);
      const title = $el.find('.title').text().trim();
      const release = $el.find('.search_released').text().trim() || 'TBA';

      if (!upcomingKeywords.some(w => release.toLowerCase().includes(w))) return;

      const href = ($el.attr('href') || '').split('?')[0];
      games.push({ title, release, url: href });
    });

    return games.slice(0, 12);
  } catch (e) {
    console.error('Error fetching upcoming:', e);
    return [];
  }
}

async function getNewsBuzz(): Promise<NewsArticle[]> {
  try {
    const res = await fetch(
      'https://news.google.com/rss/search?q=indie+game+viral+OR+trending+OR+%22new+indie%22&hl=en-US&gl=US&ceid=US:en',
      { headers: HEADERS, next: { revalidate: 300 } }
    );
    const xml = await res.text();
    const $ = cheerio.load(xml, { xmlMode: true });

    const articles: NewsArticle[] = [];

    $('item').slice(0, 10).each((_, el) => {
      const $el = $(el);
      const title = $el.find('title').text().trim().slice(0, 80);
      const url = $el.find('link').text().trim();
      const source = $el.find('source').text() || 'News';

      articles.push({ title, source, url });
    });

    return articles;
  } catch (e) {
    console.error('Error fetching news:', e);
    return [];
  }
}

async function getItchTrending(): Promise<ItchGame[]> {
  try {
    const res = await fetch(
      'https://itch.io/games/new-and-popular',
      { headers: HEADERS, next: { revalidate: 300 } }
    );
    const html = await res.text();
    const $ = cheerio.load(html);

    const games: ItchGame[] = [];

    $('.game_cell').slice(0, 10).each((_, el) => {
      const $el = $(el);
      const title = $el.find('.title').text().trim();
      const author = $el.find('.game_author').text().trim() || 'Unknown';

      let url = '';
      $el.find('a').each((_, a) => {
        const href = $(a).attr('href') || '';
        if (href.includes('itch.io') && !href.includes('/games')) {
          url = href;
          return false;
        }
      });

      if (title) games.push({ title, author, url });
    });

    return games;
  } catch (e) {
    console.error('Error fetching itch:', e);
    return [];
  }
}

export async function GET() {
  const [freshReleases, upcoming, news, itch] = await Promise.all([
    getFreshReleases(),
    getUpcomingHype(),
    getNewsBuzz(),
    getItchTrending(),
  ]);

  return NextResponse.json({
    generated: new Date().toISOString(),
    freshReleases,
    upcoming,
    news,
    itch,
  });
}
