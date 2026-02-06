'use client';

import { useTheme } from '@/contexts/ThemeContext';
import MapGallery from '@/components/dashboard/MapGallery';

export default function DashboardPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="bg-body flex min-h-screen flex-col">
      {/* Header */}
      <header className="bg-surface border-theme border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-primary">Pix</span>
            <span style={{ color: '#E74C3C' }}>3</span>
            <span style={{ color: '#3498DB' }}>l</span>
            <span className="text-primary">Maps</span>
          </h1>

          <button
            onClick={toggleTheme}
            className="text-secondary hover:text-primary cursor-pointer rounded-lg p-2 transition-colors"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              /* Sun icon */
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="10" cy="10" r="4" />
                <line x1="10" y1="1" x2="10" y2="3" />
                <line x1="10" y1="17" x2="10" y2="19" />
                <line x1="1" y1="10" x2="3" y2="10" />
                <line x1="17" y1="10" x2="19" y2="10" />
                <line x1="3.5" y1="3.5" x2="5" y2="5" />
                <line x1="15" y1="15" x2="16.5" y2="16.5" />
                <line x1="3.5" y1="16.5" x2="5" y2="15" />
                <line x1="15" y1="5" x2="16.5" y2="3.5" />
              </svg>
            ) : (
              /* Moon icon */
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 11.5A7.5 7.5 0 0 1 8.5 3 7.5 7.5 0 1 0 17 11.5z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-7xl">
          <MapGallery />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface border-theme border-t">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-4 text-xs sm:flex-row sm:justify-between">
          <span className="text-secondary">
            From the{' '}
            <a
              href="https://pix3ltools.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[var(--accent)] hover:underline"
            >
              Pix3lTools
            </a>{' '}
            Collection
          </span>

          <div className="flex items-center gap-4">
            <a
              href="https://x.com/pix3ltools"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:text-primary inline-flex items-center gap-1.5 transition-colors"
            >
              {/* X logo */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Follow
            </a>
            <a
              href="/privacy"
              className="text-secondary hover:text-primary transition-colors"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
