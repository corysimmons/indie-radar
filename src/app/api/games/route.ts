import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import * as cheerio from 'cheerio';

// ============================================
// RATE LIMITING & CACHING (in-memory, no Redis)
// ============================================

interface CachedData {
  data: GameResponse;
  timestamp: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Cache the full response for 5 minutes
const CACHE_TTL = 5 * 60 * 1000;
let cachedResponse: CachedData | null = null;

// Rate limit: 10 requests per minute per IP
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 10;
const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up old rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

function getClientIP(headersList: Headers): string {
  // Check various headers for the real IP
  const forwarded = headersList.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIP = headersList.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  return 'unknown';
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    // New window
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetIn: RATE_LIMIT_WINDOW };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetIn: entry.resetTime - now };
  }

  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count, resetIn: entry.resetTime - now };
}

// ============================================
// DATA FETCHING
// ============================================

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
    /^([A-Za-z]{3}) (\d{1,2}), (\d{4})$/,
    /^(\d{1,2}) ([A-Za-z]{3}), (\d{4})$/,
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

interface GameResponse {
  generated: string;
  freshReleases: Game[];
  upcoming: UpcomingGame[];
  news: NewsArticle[];
  itch: ItchGame[];
  cached?: boolean;
}

async function getFreshReleases(): Promise<Game[]> {
  try {
    const res = await fetch(
      'https://store.steampowered.com/search/?sort_by=Released_DESC&tags=492&category1=998&ndl=1',
      { headers: HEADERS }
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
      { headers: HEADERS }
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
      { headers: HEADERS }
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
      { headers: HEADERS }
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

async function fetchAllData(): Promise<GameResponse> {
  const [freshReleases, upcoming, news, itch] = await Promise.all([
    getFreshReleases(),
    getUpcomingHype(),
    getNewsBuzz(),
    getItchTrending(),
  ]);

  return {
    generated: new Date().toISOString(),
    freshReleases,
    upcoming,
    news,
    itch,
  };
}

// ============================================
// API ROUTE
// ============================================

export async function GET() {
  // Get client IP for rate limiting
  const headersList = await headers();
  const clientIP = getClientIP(headersList);

  // Check rate limit
  const rateLimit = checkRateLimit(clientIP);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again later.', resetIn: Math.ceil(rateLimit.resetIn / 1000) },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetIn / 1000)),
          'Retry-After': String(Math.ceil(rateLimit.resetIn / 1000)),
        },
      }
    );
  }

  // Check cache
  const now = Date.now();
  if (cachedResponse && (now - cachedResponse.timestamp) < CACHE_TTL) {
    return NextResponse.json(
      { ...cachedResponse.data, cached: true },
      {
        headers: {
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-Cache': 'HIT',
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
        },
      }
    );
  }

  // Fetch fresh data
  const data = await fetchAllData();

  // Update cache
  cachedResponse = { data, timestamp: now };

  return NextResponse.json(data, {
    headers: {
      'X-RateLimit-Remaining': String(rateLimit.remaining),
      'X-Cache': 'MISS',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
    },
  });
}
