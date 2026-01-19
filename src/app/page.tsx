'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

const Scene = dynamic(() => import('./components/Scene'), { ssr: false });

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
  const [scanProgress, setScanProgress] = useState(0);

  const fetchGames = async () => {
    setLoading(true);
    setError(null);
    setScanProgress(0);

    const progressInterval = setInterval(() => {
      setScanProgress((prev) => Math.min(prev + Math.random() * 12, 90));
    }, 150);

    try {
      const res = await fetch('/api/games');
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setScanProgress(100);
      setTimeout(() => {
        setData(json);
        setLoading(false);
      }, 600);
    } catch {
      setError('SIGNAL LOST');
      setLoading(false);
    } finally {
      clearInterval(progressInterval);
    }
  };

  return (
    <main className="min-h-screen bg-[#030306] text-white relative overflow-x-hidden">
      {/* 3D Background */}
      <div className="fixed inset-0 z-0">
        <Suspense fallback={null}>
          <Scene scanning={loading} />
        </Suspense>
      </div>

      {/* Gradient overlays */}
      <div className="fixed inset-0 z-10 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-[#030306]" />
      <div className="fixed inset-0 z-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,#030306_70%)]" />

      {/* Content */}
      <div className="relative z-20">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 relative">
          {/* Status bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute top-8 left-8 right-8 flex justify-between items-center"
          >
            <div className="flex items-center gap-6 font-mono text-xs">
              <StatusPill label="STEAM" color="#00ff41" />
              <StatusPill label="ITCH" color="#00f0ff" />
              <StatusPill label="NEWS" color="#ff00aa" />
            </div>
            <div className="font-mono text-xs text-white/30">
              v2.0.26 // RADAR SYSTEMS
            </div>
          </motion.div>

          {/* Main title */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="text-center mb-12"
          >
            <h1 className="font-[family-name:var(--font-display)] text-7xl md:text-9xl font-black tracking-tighter bg-gradient-to-b from-white via-white to-white/20 bg-clip-text text-transparent">
              INDIE
              <br />
              <span className="text-[#00ff41]">RADAR</span>
            </h1>
            <p className="mt-6 font-mono text-sm text-white/40 tracking-[0.3em]">
              FIND THEM BEFORE THEY BLOW UP
            </p>
          </motion.div>

          {/* Scan button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={fetchGames}
              disabled={loading}
              className="group relative"
            >
              {/* Glow effect */}
              <div className={`absolute -inset-1 bg-gradient-to-r from-[#00ff41] via-[#00f0ff] to-[#00ff41] rounded-full blur-lg transition-opacity duration-500 ${loading ? 'opacity-60 animate-pulse' : 'opacity-0 group-hover:opacity-40'}`} />

              <div className={`relative px-12 py-5 rounded-full border backdrop-blur-sm font-[family-name:var(--font-display)] text-sm uppercase tracking-[0.2em] transition-all duration-300 ${loading ? 'bg-[#00ff41]/20 border-[#00ff41] text-[#00ff41]' : 'bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/40'}`}>
                {loading ? (
                  <span className="flex items-center gap-3">
                    <LoadingSpinner />
                    SCANNING
                  </span>
                ) : (
                  <span className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#00ff41] shadow-[0_0_10px_#00ff41]" />
                    INITIATE SCAN
                  </span>
                )}
              </div>
            </button>
          </motion.div>

          {/* Progress */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 300 }}
                exit={{ opacity: 0 }}
                className="mt-8"
              >
                <div className="flex justify-between font-mono text-xs text-white/30 mb-2">
                  <span>SCANNING FREQUENCIES</span>
                  <span>{Math.round(scanProgress)}%</span>
                </div>
                <div className="h-0.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#00ff41] to-[#00f0ff]"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scroll indicator */}
          {data && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="absolute bottom-12 left-1/2 -translate-x-1/2"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex flex-col items-center gap-2 text-white/30"
              >
                <span className="font-mono text-xs tracking-wider">SCROLL</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="opacity-50">
                  <path d="M10 4L10 16M10 16L16 10M10 16L4 10" stroke="currentColor" strokeWidth="2" />
                </svg>
              </motion.div>
            </motion.div>
          )}
        </section>

        {/* Results */}
        <AnimatePresence>
          {data && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative z-20 px-6 pb-24"
            >
              {/* Bento Grid */}
              <div className="max-w-7xl mx-auto">
                {/* Timestamp */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center font-mono text-xs text-white/20 mb-12"
                >
                  SCAN COMPLETE // {new Date(data.generated).toLocaleString()}
                </motion.p>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 auto-rows-min">

                  {/* Fresh Releases - Large card spanning 8 cols */}
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-8 row-span-2"
                  >
                    <GlassCard>
                      <CardHeader icon="◈" title="FRESH INTEL" subtitle="Last 30 days" color="#00f0ff" />
                      <div className="space-y-2 mt-6">
                        {data.freshReleases.filter(g => g.score >= 1).slice(0, 6).map((game, i) => (
                          <GameRow key={i} game={game} index={i} />
                        ))}
                      </div>
                    </GlassCard>
                  </motion.div>

                  {/* Stats card */}
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-4"
                  >
                    <GlassCard className="h-full">
                      <div className="flex flex-col h-full justify-between">
                        <div>
                          <p className="font-mono text-xs text-white/40 mb-2">GAMES FOUND</p>
                          <p className="font-[family-name:var(--font-display)] text-6xl font-black text-[#00ff41]">
                            {data.freshReleases.length}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-6">
                          <StatBlock label="HOT" value={data.freshReleases.filter(g => g.score === 2).length} color="#00f0ff" />
                          <StatBlock label="NEW" value={data.freshReleases.filter(g => g.score === 0).length} color="#ffb800" />
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>

                  {/* Upcoming - Vertical list */}
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-4"
                  >
                    <GlassCard>
                      <CardHeader icon="◎" title="INCOMING" subtitle="Most wishlisted" color="#ffb800" />
                      <div className="space-y-3 mt-6">
                        {data.upcoming.slice(0, 5).map((game, i) => (
                          <a
                            key={i}
                            href={game.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
                          >
                            <span className="font-[family-name:var(--font-display)] text-[#ffb800]/50 text-sm">#{i + 1}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-white/80 group-hover:text-[#ffb800] transition-colors truncate">
                                {game.title}
                              </p>
                              <p className="font-mono text-xs text-white/30">{game.release}</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </GlassCard>
                  </motion.div>

                  {/* News - Wide card */}
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-8"
                  >
                    <GlassCard>
                      <CardHeader icon="◆" title="INTERCEPTED" subtitle="News & press" color="#ff00aa" />
                      <div className="grid md:grid-cols-2 gap-3 mt-6">
                        {data.news.slice(0, 6).map((article, i) => (
                          <a
                            key={i}
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group p-3 rounded-lg bg-white/[0.02] hover:bg-[#ff00aa]/10 transition-colors"
                          >
                            <span className="font-mono text-xs text-[#ff00aa]/60">[{article.source.slice(0, 15)}]</span>
                            <p className="text-sm text-white/70 group-hover:text-white mt-1 line-clamp-2">
                              {article.title}
                            </p>
                          </a>
                        ))}
                      </div>
                    </GlassCard>
                  </motion.div>

                  {/* Itch.io */}
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-4"
                  >
                    <GlassCard>
                      <CardHeader icon="◇" title="ITCH.IO" subtitle="Underground" color="#00ff41" />
                      <div className="space-y-2 mt-6">
                        {data.itch.slice(0, 5).map((game, i) => (
                          <a
                            key={i}
                            href={game.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block p-3 rounded-lg bg-white/[0.02] hover:bg-[#00ff41]/10 transition-colors"
                          >
                            <p className="font-medium text-sm text-white/80 group-hover:text-[#00ff41] transition-colors">
                              {game.title}
                            </p>
                            <p className="font-mono text-xs text-white/30">@{game.author}</p>
                          </a>
                        ))}
                      </div>
                    </GlassCard>
                  </motion.div>

                  {/* Unreviewed games */}
                  {data.freshReleases.filter(g => g.score === 0).length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="lg:col-span-12"
                    >
                      <GlassCard>
                        <CardHeader icon="⬡" title="UNVERIFIED" subtitle="No reviews yet — be first" color="#666" />
                        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3 mt-6">
                          {data.freshReleases.filter(g => g.score === 0).slice(0, 8).map((game, i) => (
                            <a
                              key={i}
                              href={game.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 transition-all"
                            >
                              <p className="font-medium text-sm text-white/60 group-hover:text-white transition-colors truncate">
                                {game.title}
                              </p>
                              <p className="font-mono text-xs text-white/20 mt-1">{game.release}</p>
                            </a>
                          ))}
                        </div>
                      </GlassCard>
                    </motion.div>
                  )}
                </div>

                {/* Footer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-center mt-16 pt-8 border-t border-white/5"
                >
                  <p className="font-mono text-xs text-white/20">
                    INDIE RADAR // CLASSIFIED TREND INTELLIGENCE
                  </p>
                </motion.div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="px-6 py-3 rounded-full bg-[#ff00aa]/20 border border-[#ff00aa]/30 backdrop-blur-sm">
              <p className="font-mono text-sm text-[#ff00aa]">⚠ {error}</p>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}

function StatusPill({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
      <span className="text-white/50">{label}</span>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ icon, title, subtitle, color }: { icon: string; title: string; subtitle: string; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-2xl" style={{ color }}>{icon}</span>
      <div>
        <h2 className="font-[family-name:var(--font-display)] font-bold text-lg tracking-tight" style={{ color }}>{title}</h2>
        <p className="font-mono text-xs text-white/30">{subtitle}</p>
      </div>
    </div>
  );
}

function StatBlock({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="p-3 rounded-xl bg-white/[0.02]">
      <p className="font-mono text-xs text-white/40 mb-1">{label}</p>
      <p className="font-[family-name:var(--font-display)] text-2xl font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

function GameRow({ game, index }: { game: Game; index: number }) {
  const isHot = game.score === 2;

  return (
    <motion.a
      href={game.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.05 }}
      className={`group flex items-center gap-4 p-4 rounded-xl transition-all ${isHot ? 'bg-[#00f0ff]/5 hover:bg-[#00f0ff]/10' : 'bg-white/[0.02] hover:bg-white/[0.05]'}`}
    >
      {/* Hot indicator */}
      {isHot && (
        <div className="w-1 h-8 rounded-full bg-[#00f0ff] shadow-[0_0_10px_#00f0ff]" />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {isHot && <span className="text-[#00f0ff] text-xs">▲ HOT</span>}
          <h3 className="font-medium text-white/90 group-hover:text-[#00f0ff] transition-colors truncate">
            {game.title}
          </h3>
        </div>
        <div className="flex items-center gap-4 mt-1 font-mono text-xs">
          <span className="text-white/30">{game.release}</span>
          <span className={isHot ? 'text-[#00f0ff]' : 'text-white/50'}>{game.reviews}</span>
        </div>
      </div>

      <svg className="w-5 h-5 text-white/20 group-hover:text-[#00f0ff] transition-colors" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd" />
      </svg>
    </motion.a>
  );
}
