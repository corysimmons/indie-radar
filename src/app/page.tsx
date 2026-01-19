'use client';

import { useState } from 'react';

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

interface GameData {
  generated: string;
  freshReleases: Game[];
  upcoming: UpcomingGame[];
  news: NewsArticle[];
  itch: ItchGame[];
}

export default function Home() {
  const [data, setData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/games');
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setData(json);
    } catch {
      setError('Failed to fetch games. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-[#e0e0e0] relative overflow-hidden">
      {/* CRT scan lines overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.15),rgba(0,0,0,0.15)_1px,transparent_1px,transparent_2px)]" />

      {/* Vignette */}
      <div className="pointer-events-none fixed inset-0 z-40 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="font-black text-6xl md:text-8xl tracking-tighter mb-4 bg-gradient-to-r from-[#ff6b6b] via-[#feca57] to-[#48dbfb] bg-clip-text text-transparent animate-pulse">
            INDIE RADAR
          </h1>
          <p className="text-[#666] font-mono text-sm tracking-[0.3em] uppercase">
            Trending Games Scanner
          </p>
        </header>

        {/* Big Button */}
        <div className="flex justify-center mb-16">
          <button
            onClick={fetchGames}
            disabled={loading}
            className="group relative px-12 py-6 bg-transparent border-2 border-[#ff6b6b] text-[#ff6b6b] font-mono text-xl uppercase tracking-widest transition-all duration-300 hover:bg-[#ff6b6b] hover:text-[#0a0a0f] hover:shadow-[0_0_40px_rgba(255,107,107,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="relative z-10">
              {loading ? (
                <span className="inline-flex items-center gap-3">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  SCANNING...
                </span>
              ) : (
                'SCAN FOR GAMES'
              )}
            </span>
            {/* Glitch effect on hover */}
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[#ff6b6b] blur-xl transition-opacity duration-300" />
          </button>
        </div>

        {error && (
          <div className="text-center text-[#ff6b6b] font-mono mb-8 p-4 border border-[#ff6b6b]/30 bg-[#ff6b6b]/5">
            {error}
          </div>
        )}

        {data && (
          <div className="space-y-16 animate-fadeIn">
            {/* Generated timestamp */}
            <p className="text-center text-[#444] font-mono text-xs">
              GENERATED: {new Date(data.generated).toLocaleString()}
            </p>

            {/* Fresh Releases */}
            <section>
              <SectionHeader icon="🚀" title="FRESH RELEASES" subtitle="Last 30 Days" color="#48dbfb" />
              <div className="grid gap-3">
                {data.freshReleases.filter(g => g.score >= 1).slice(0, 10).map((game, i) => (
                  <GameCard key={i} game={game} />
                ))}
              </div>
              {data.freshReleases.filter(g => g.score === 0).length > 0 && (
                <>
                  <h4 className="text-[#666] font-mono text-xs mt-8 mb-4 tracking-wider">BRAND NEW — NO REVIEWS YET</h4>
                  <div className="grid gap-2">
                    {data.freshReleases.filter(g => g.score === 0).slice(0, 5).map((game, i) => (
                      <a
                        key={i}
                        href={game.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 bg-[#111118] border border-[#222] hover:border-[#48dbfb]/50 transition-colors font-mono text-sm"
                      >
                        <span className="text-[#888]">{game.title}</span>
                        <span className="text-[#444] ml-3">{game.release}</span>
                      </a>
                    ))}
                  </div>
                </>
              )}
            </section>

            {/* Upcoming */}
            <section>
              <SectionHeader icon="⏳" title="UPCOMING HYPE" subtitle="Most Wishlisted" color="#feca57" />
              <div className="grid md:grid-cols-2 gap-3">
                {data.upcoming.map((game, i) => (
                  <a
                    key={i}
                    href={game.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block p-4 bg-[#111118] border border-[#222] hover:border-[#feca57]/50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-[#e0e0e0] group-hover:text-[#feca57] transition-colors">
                          {game.title}
                        </h4>
                        <p className="text-[#666] font-mono text-xs mt-1">{game.release}</p>
                      </div>
                      <span className="text-[#feca57] font-mono text-lg">#{i + 1}</span>
                    </div>
                  </a>
                ))}
              </div>
            </section>

            {/* News */}
            <section>
              <SectionHeader icon="📰" title="NEWS BUZZ" subtitle="Press Coverage" color="#ff6b6b" />
              <div className="space-y-2">
                {data.news.map((article, i) => (
                  <a
                    key={i}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-[#111118] border border-[#222] hover:border-[#ff6b6b]/50 transition-colors"
                  >
                    <span className="text-[#ff6b6b] font-mono text-xs">[{article.source}]</span>
                    <p className="text-[#ccc] text-sm mt-1">{article.title}</p>
                  </a>
                ))}
              </div>
            </section>

            {/* Itch.io */}
            <section>
              <SectionHeader icon="🕹️" title="ITCH.IO" subtitle="Trending Indies" color="#a55eea" />
              <div className="grid md:grid-cols-2 gap-3">
                {data.itch.map((game, i) => (
                  <a
                    key={i}
                    href={game.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-[#111118] border border-[#222] hover:border-[#a55eea]/50 transition-colors"
                  >
                    <h4 className="font-bold text-[#e0e0e0]">{game.title}</h4>
                    <p className="text-[#666] font-mono text-xs mt-1">by {game.author}</p>
                  </a>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Empty state */}
        {!data && !loading && (
          <div className="text-center text-[#333] font-mono py-24">
            <p className="text-6xl mb-4">▲</p>
            <p>PRESS SCAN TO BEGIN</p>
          </div>
        )}
      </div>
    </main>
  );
}

function SectionHeader({ icon, title, subtitle, color }: { icon: string; title: string; subtitle: string; color: string }) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <span className="text-3xl">{icon}</span>
      <div>
        <h2 className="font-black text-2xl tracking-tight" style={{ color }}>{title}</h2>
        <p className="text-[#444] font-mono text-xs tracking-wider uppercase">{subtitle}</p>
      </div>
    </div>
  );
}

function GameCard({ game }: { game: Game }) {
  const isHot = game.score === 2;

  return (
    <a
      href={game.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block p-4 border transition-all ${
        isHot
          ? 'bg-gradient-to-r from-[#ff6b6b]/10 to-transparent border-[#ff6b6b]/30 hover:border-[#ff6b6b]'
          : 'bg-[#111118] border-[#222] hover:border-[#48dbfb]/50'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isHot && <span className="text-[#ff6b6b]">🔥</span>}
            <h3 className="font-bold text-[#e0e0e0] group-hover:text-[#48dbfb] transition-colors truncate">
              {game.title}
            </h3>
          </div>
          <div className="flex items-center gap-4 mt-2 font-mono text-xs">
            <span className="text-[#666]">{game.release}</span>
            <span className={isHot ? 'text-[#ff6b6b]' : 'text-[#48dbfb]'}>{game.reviews}</span>
          </div>
        </div>
        <span className="text-[#333] group-hover:text-[#48dbfb] transition-colors">→</span>
      </div>
    </a>
  );
}
