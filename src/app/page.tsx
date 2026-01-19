'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

// Boot sequence messages
const bootMessages = [
  'INITIALIZING RADAR SYSTEMS...',
  'CONNECTING TO STEAM DATABASE...',
  'SCANNING ITCH.IO FREQUENCIES...',
  'INTERCEPTING NEWS FEEDS...',
  'DECRYPTING TREND DATA...',
  'SYSTEMS ONLINE',
];

export default function Home() {
  const [data, setData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bootComplete, setBootComplete] = useState(false);
  const [bootIndex, setBoot] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);

  // Boot sequence
  useEffect(() => {
    const timer = setInterval(() => {
      setBoot((prev) => {
        if (prev >= bootMessages.length - 1) {
          clearInterval(timer);
          setTimeout(() => setBootComplete(true), 500);
          return prev;
        }
        return prev + 1;
      });
    }, 400);
    return () => clearInterval(timer);
  }, []);

  const fetchGames = async () => {
    setLoading(true);
    setError(null);
    setScanProgress(0);

    // Fake progress while loading
    const progressInterval = setInterval(() => {
      setScanProgress((prev) => Math.min(prev + Math.random() * 15, 90));
    }, 200);

    try {
      const res = await fetch('/api/games');
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setScanProgress(100);
      setTimeout(() => {
        setData(json);
        setLoading(false);
      }, 500);
    } catch {
      setError('CONNECTION LOST. RETRY SCAN.');
      setLoading(false);
    } finally {
      clearInterval(progressInterval);
    }
  };

  return (
    <main className="min-h-screen bg-[#050508] text-[#e0e0e8] relative overflow-hidden crt-flicker">
      {/* Overlays */}
      <div className="noise-overlay" />
      <div className="scanlines" />

      {/* Grid background */}
      <div className="fixed inset-0 grid-bg opacity-50" />

      {/* Vignette */}
      <div className="pointer-events-none fixed inset-0 z-30 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.7)_100%)]" />

      {/* Boot sequence */}
      <AnimatePresence>
        {!bootComplete && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#050508] flex items-center justify-center"
          >
            <div className="font-mono text-[#00ff41] text-sm space-y-1">
              {bootMessages.slice(0, bootIndex + 1).map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={i === bootIndex ? 'cursor-blink' : ''}
                >
                  <span className="text-[#3a3a4a] mr-2">[{String(i).padStart(2, '0')}]</span>
                  {msg}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: bootComplete ? 1 : 0, y: bootComplete ? 0 : -50 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-20"
        >
          {/* Decorative top line */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-[#00ff41]" />
            <span className="text-[#3a3a4a] font-mono text-xs tracking-[0.3em]">SYS.ONLINE</span>
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-[#00ff41]" />
          </div>

          {/* Main title */}
          <h1 className="glitch-text font-[family-name:var(--font-display)] font-black text-6xl md:text-8xl tracking-tight mb-4 text-[#00ff41]">
            INDIE RADAR
          </h1>

          {/* Subtitle */}
          <p className="font-mono text-[#3a3a4a] text-xs tracking-[0.4em] uppercase">
            // CLASSIFIED TREND INTELLIGENCE //
          </p>

          {/* Status indicators */}
          <div className="flex items-center justify-center gap-8 mt-8 font-mono text-xs">
            <StatusIndicator label="STEAM" status="online" />
            <StatusIndicator label="ITCH.IO" status="online" />
            <StatusIndicator label="NEWS" status="online" />
          </div>
        </motion.header>

        {/* Scan Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: bootComplete ? 1 : 0, scale: bootComplete ? 1 : 0.9 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center mb-16"
        >
          <button
            onClick={fetchGames}
            disabled={loading}
            className="group relative"
          >
            {/* Outer glow ring */}
            <div className={`absolute -inset-4 rounded-full bg-[#00ff41]/20 blur-xl transition-opacity duration-500 ${loading ? 'opacity-100 pulse-glow' : 'opacity-0 group-hover:opacity-50'}`} />

            {/* Button */}
            <div className={`relative px-16 py-6 border-2 border-[#00ff41] bg-[#050508] font-[family-name:var(--font-display)] text-lg uppercase tracking-[0.2em] transition-all duration-300 ${loading ? 'text-[#050508] bg-[#00ff41]' : 'text-[#00ff41] hover:bg-[#00ff41]/10'}`}>
              {loading ? (
                <span className="flex items-center gap-4">
                  <RadarIcon />
                  SCANNING...
                </span>
              ) : (
                <span className="flex items-center gap-4">
                  <span className="text-2xl">◉</span>
                  INITIATE SCAN
                </span>
              )}
            </div>

            {/* Corner accents */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#00ff41]" />
            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#00ff41]" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#00ff41]" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#00ff41]" />
          </button>
        </motion.div>

        {/* Progress bar */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-md mx-auto mb-16"
            >
              <div className="flex justify-between font-mono text-xs text-[#3a3a4a] mb-2">
                <span>SCANNING DATABASES</span>
                <span>{Math.round(scanProgress)}%</span>
              </div>
              <div className="h-1 bg-[#1a1a24] overflow-hidden">
                <motion.div
                  className="h-full bg-[#00ff41]"
                  initial={{ width: 0 }}
                  animate={{ width: `${scanProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center font-mono text-[#ff00aa] mb-8 p-4 border border-[#ff00aa]/30 bg-[#ff00aa]/5"
          >
            ⚠ {error}
          </motion.div>
        )}

        {/* Results */}
        <AnimatePresence>
          {data && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-20"
            >
              {/* Timestamp */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center font-mono text-xs text-[#3a3a4a]"
              >
                SCAN COMPLETE // {new Date(data.generated).toLocaleString()}
              </motion.p>

              {/* Fresh Releases */}
              <Section
                icon="◈"
                title="FRESH INTEL"
                subtitle="RELEASES // LAST 30 DAYS"
                color="#00f0ff"
                delay={0}
              >
                <div className="space-y-3">
                  {data.freshReleases.filter(g => g.score >= 1).slice(0, 10).map((game, i) => (
                    <GameCard key={i} game={game} index={i} />
                  ))}
                </div>

                {data.freshReleases.filter(g => g.score === 0).length > 0 && (
                  <div className="mt-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-px flex-1 bg-[#1a1a24]" />
                      <span className="font-mono text-xs text-[#3a3a4a] tracking-wider">UNVERIFIED // NO REVIEWS</span>
                      <div className="h-px flex-1 bg-[#1a1a24]" />
                    </div>
                    <div className="grid md:grid-cols-2 gap-2">
                      {data.freshReleases.filter(g => g.score === 0).slice(0, 6).map((game, i) => (
                        <motion.a
                          key={i}
                          href={game.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + i * 0.05 }}
                          className="block p-3 bg-[#0a0a10] border border-[#1a1a24] hover:border-[#00f0ff]/30 transition-colors font-mono text-sm group"
                        >
                          <span className="text-[#6a6a7a] group-hover:text-[#00f0ff] transition-colors">{game.title}</span>
                          <span className="text-[#3a3a4a] ml-3 text-xs">{game.release}</span>
                        </motion.a>
                      ))}
                    </div>
                  </div>
                )}
              </Section>

              {/* Upcoming */}
              <Section
                icon="◎"
                title="INCOMING"
                subtitle="WISHLISTED // UNRELEASED"
                color="#ffb800"
                delay={0.2}
              >
                <div className="grid md:grid-cols-2 gap-3">
                  {data.upcoming.map((game, i) => (
                    <motion.a
                      key={i}
                      href={game.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className="group block p-5 bg-[#0a0a10] border border-[#1a1a24] hover:border-[#ffb800]/50 transition-all relative overflow-hidden"
                    >
                      {/* Rank badge */}
                      <div className="absolute top-0 right-0 bg-[#ffb800]/10 px-3 py-1 font-[family-name:var(--font-display)] text-[#ffb800] text-sm">
                        #{i + 1}
                      </div>

                      <h4 className="font-[family-name:var(--font-display)] font-bold text-[#e0e0e8] group-hover:text-[#ffb800] transition-colors pr-12">
                        {game.title}
                      </h4>
                      <p className="font-mono text-xs text-[#3a3a4a] mt-2 flex items-center gap-2">
                        <span className="text-[#ffb800]">◷</span>
                        {game.release}
                      </p>
                    </motion.a>
                  ))}
                </div>
              </Section>

              {/* News */}
              <Section
                icon="◆"
                title="INTERCEPTED"
                subtitle="NEWS // PRESS COVERAGE"
                color="#ff00aa"
                delay={0.4}
              >
                <div className="space-y-2">
                  {data.news.map((article, i) => (
                    <motion.a
                      key={i}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.05 }}
                      className="group block p-4 bg-[#0a0a10] border border-[#1a1a24] hover:border-[#ff00aa]/30 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-[#ff00aa] font-mono text-xs shrink-0">[{article.source.slice(0, 12)}]</span>
                        <p className="text-[#e0e0e8] text-sm group-hover:text-[#ff00aa] transition-colors">{article.title}</p>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </Section>

              {/* Itch.io */}
              <Section
                icon="◇"
                title="ITCH.IO"
                subtitle="UNDERGROUND // TRENDING"
                color="#00ff41"
                delay={0.6}
              >
                <div className="grid md:grid-cols-2 gap-3">
                  {data.itch.map((game, i) => (
                    <motion.a
                      key={i}
                      href={game.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 + i * 0.05 }}
                      className="group block p-4 bg-[#0a0a10] border border-[#1a1a24] hover:border-[#00ff41]/50 transition-all gradient-border"
                    >
                      <h4 className="font-[family-name:var(--font-display)] font-bold text-[#e0e0e8] group-hover:text-[#00ff41] transition-colors">
                        {game.title}
                      </h4>
                      <p className="font-mono text-xs text-[#3a3a4a] mt-1">
                        <span className="text-[#00ff41]">@</span> {game.author}
                      </p>
                    </motion.a>
                  ))}
                </div>
              </Section>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center pt-16 border-t border-[#1a1a24]"
              >
                <p className="font-mono text-xs text-[#3a3a4a]">
                  INDIE RADAR // FIND THEM BEFORE THEY BLOW UP
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!data && !loading && bootComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center font-mono py-32"
          >
            <div className="text-6xl text-[#1a1a24] mb-4">◉</div>
            <p className="text-[#3a3a4a] tracking-wider">AWAITING SCAN COMMAND</p>
          </motion.div>
        )}
      </div>
    </main>
  );
}

function StatusIndicator({ label, status }: { label: string; status: 'online' | 'offline' }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-[#00ff41] shadow-[0_0_8px_#00ff41]' : 'bg-[#ff00aa]'}`} />
      <span className="text-[#6a6a7a]">{label}</span>
    </div>
  );
}

function RadarIcon() {
  return (
    <div className="relative w-6 h-6">
      <div className="absolute inset-0 border-2 border-current rounded-full" />
      <div className="absolute inset-1 border border-current rounded-full opacity-50" />
      <div className="absolute top-1/2 left-1/2 w-3 h-0.5 bg-current origin-left radar-sweep" style={{ marginTop: '-1px', marginLeft: '-1px' }} />
    </div>
  );
}

function Section({ icon, title, subtitle, color, delay, children }: {
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <span className="text-4xl" style={{ color }}>{icon}</span>
        <div>
          <h2 className="font-[family-name:var(--font-display)] font-black text-2xl tracking-tight" style={{ color }}>
            {title}
          </h2>
          <p className="font-mono text-xs text-[#3a3a4a] tracking-[0.2em]">{subtitle}</p>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-[#1a1a24]" style={{ backgroundImage: `linear-gradient(to right, ${color}33, transparent)` }} />
      </div>

      {children}
    </motion.section>
  );
}

function GameCard({ game, index }: { game: Game; index: number }) {
  const isHot = game.score === 2;

  return (
    <motion.a
      href={game.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 + index * 0.05, duration: 0.4 }}
      className={`group block p-5 border transition-all relative overflow-hidden ${
        isHot
          ? 'bg-gradient-to-r from-[#00f0ff]/5 to-transparent border-[#00f0ff]/30 hover:border-[#00f0ff]'
          : 'bg-[#0a0a10] border-[#1a1a24] hover:border-[#00f0ff]/50'
      }`}
    >
      {/* Hot indicator */}
      {isHot && (
        <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#00f0ff] shadow-[0_0_10px_#00f0ff]" />
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 pl-2">
          <div className="flex items-center gap-3">
            {isHot && <span className="text-[#00f0ff] text-lg">▲</span>}
            <h3 className="font-[family-name:var(--font-display)] font-bold text-[#e0e0e8] group-hover:text-[#00f0ff] transition-colors">
              {game.title}
            </h3>
          </div>
          <div className="flex items-center gap-6 mt-3 font-mono text-xs">
            <span className="text-[#3a3a4a]">{game.release}</span>
            <span className={isHot ? 'text-[#00f0ff]' : 'text-[#6a6a7a]'}>{game.reviews}</span>
          </div>
        </div>
        <span className="text-[#1a1a24] group-hover:text-[#00f0ff] transition-colors text-xl">→</span>
      </div>
    </motion.a>
  );
}
