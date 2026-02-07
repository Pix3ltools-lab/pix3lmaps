import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy - Pix3lMaps',
};

export default function PrivacyPage() {
  return (
    <div className="bg-body text-secondary min-h-screen px-5 py-10 leading-relaxed">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-primary mb-2 text-3xl font-bold">Privacy Policy</h1>
        <p className="mb-10 text-sm opacity-60">Last updated: February 7, 2026</p>

        <p className="mb-4">
          This Privacy Policy describes how Pix3lMaps (&ldquo;we&rdquo;,
          &ldquo;us&rdquo;, or &ldquo;our&rdquo;) collects, uses, and protects
          your information when you use our web application.
        </p>

        <H2>1. Data Controller</H2>
        <p className="mb-4">
          The data controller for this application is{' '}
          <strong className="text-primary">Pix3lTools</strong>.
        </p>
        <p className="mb-4">
          For any privacy-related inquiries, please contact us through our{' '}
          <A href="https://github.com/Pix3ltools-lab">GitHub page</A> or via{' '}
          <A href="https://x.com/pix3ltools">X/Twitter</A>.
        </p>

        <H2>2. Information We Collect</H2>

        <H3>2.1 Data Stored Locally</H3>
        <p className="mb-4">
          Pix3lMaps stores the following data in your browser&rsquo;s IndexedDB:
        </p>
        <ul className="mb-5 ml-5 list-disc space-y-1">
          <li>Mind map data (nodes, edges, images, comments, settings)</li>
          <li>Auto-save data and map thumbnails</li>
          <li>User preferences (e.g., dismissed warnings)</li>
        </ul>
        <p className="mb-4">
          <strong className="text-primary">Important:</strong> This data is
          stored only on your device and is never transmitted to our servers. We
          do not have access to your maps or images.
        </p>

        <H3>2.2 Analytics Data</H3>
        <p className="mb-4">
          We use Vercel Analytics to collect anonymous usage statistics. This may
          include:
        </p>
        <ul className="mb-5 ml-5 list-disc space-y-1">
          <li>Pages visited</li>
          <li>Time spent on the application</li>
          <li>Browser type and version</li>
          <li>Device type</li>
          <li>Country/region (approximate)</li>
        </ul>
        <p className="mb-4">
          This data is collected in aggregate form and cannot be used to identify
          individual users.
        </p>

        <H2>3. Cookies and Similar Technologies</H2>
        <div className="mb-5 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="py-3 pr-4 text-left font-semibold text-[var(--accent)]">
                  Type
                </th>
                <th className="py-3 pr-4 text-left font-semibold text-[var(--accent)]">
                  Purpose
                </th>
                <th className="py-3 text-left font-semibold text-[var(--accent)]">
                  Duration
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--border-color)]">
                <td className="py-3 pr-4">IndexedDB</td>
                <td className="py-3 pr-4">
                  Store your maps and preferences locally
                </td>
                <td className="py-3">Until cleared by user</td>
              </tr>
              <tr className="border-b border-[var(--border-color)]">
                <td className="py-3 pr-4">Local Storage</td>
                <td className="py-3 pr-4">
                  Store UI preferences (e.g., warning dismissal)
                </td>
                <td className="py-3">Until cleared by user</td>
              </tr>
              <tr className="border-b border-[var(--border-color)]">
                <td className="py-3 pr-4">Vercel Analytics</td>
                <td className="py-3 pr-4">Anonymous usage statistics</td>
                <td className="py-3">Session</td>
              </tr>
            </tbody>
          </table>
        </div>

        <H2>4. Third-Party Services</H2>

        <H3>4.1 Google Fonts</H3>
        <p className="mb-4">
          We use Google Fonts to display text in the application. When you load
          the application, your browser makes requests to Google&rsquo;s servers
          to download font files. Google may collect:
        </p>
        <ul className="mb-5 ml-5 list-disc space-y-1">
          <li>Your IP address</li>
          <li>Browser information</li>
        </ul>
        <p className="mb-4">
          For more information, see{' '}
          <A href="https://policies.google.com/privacy">
            Google&rsquo;s Privacy Policy
          </A>
          .
        </p>

        <H3>4.2 Vercel</H3>
        <p className="mb-4">
          Our application is hosted on Vercel. Vercel may collect standard web
          server logs. For more information, see{' '}
          <A href="https://vercel.com/legal/privacy-policy">
            Vercel&rsquo;s Privacy Policy
          </A>
          .
        </p>

        <H2>5. Data Retention</H2>
        <p className="mb-4">
          Since your map data is stored locally on your device:
        </p>
        <ul className="mb-5 ml-5 list-disc space-y-1">
          <li>
            We do not retain any of your map data on our servers
          </li>
          <li>
            You can delete your data at any time by clearing your browser&rsquo;s
            storage
          </li>
          <li>
            Data may be lost if you clear your browser data or switch devices
          </li>
        </ul>

        <H2>6. Your Rights (GDPR)</H2>
        <p className="mb-4">
          Under the General Data Protection Regulation (GDPR), you have the
          following rights:
        </p>
        <ul className="mb-5 ml-5 list-disc space-y-1">
          <li>
            <strong className="text-primary">Right of Access:</strong> You can
            access your data directly in your browser&rsquo;s developer tools
          </li>
          <li>
            <strong className="text-primary">Right to Erasure:</strong> You can
            delete your data by clearing your browser&rsquo;s storage
          </li>
          <li>
            <strong className="text-primary">Right to Data Portability:</strong>{' '}
            You can export your maps as JSON or PNG at any time
          </li>
          <li>
            <strong className="text-primary">Right to Object:</strong> You can
            disable analytics by using browser privacy features or ad blockers
          </li>
        </ul>

        <H2>7. Children&rsquo;s Privacy</H2>
        <p className="mb-4">
          Pix3lMaps is not directed at children under 13 years of age. We do not
          knowingly collect personal information from children.
        </p>

        <H2>8. Changes to This Policy</H2>
        <p className="mb-4">
          We may update this Privacy Policy from time to time. We will notify you
          of any changes by posting the new Privacy Policy on this page and
          updating the &ldquo;Last updated&rdquo; date.
        </p>

        <H2>9. Contact Us</H2>
        <p className="mb-4">
          If you have any questions about this Privacy Policy, please contact us:
        </p>
        <ul className="mb-5 ml-5 list-disc space-y-1">
          <li>
            Website:{' '}
            <A href="https://www.pix3ltools.com/">pix3ltools.com</A>
          </li>
          <li>
            X/Twitter:{' '}
            <A href="https://x.com/pix3ltools">@pix3ltools</A>
          </li>
        </ul>

        <Link
          href="/"
          className="mt-10 inline-block rounded-lg bg-[var(--bg-surface)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:brightness-125"
        >
          &larr; Back to Pix3lMaps
        </Link>
      </div>
    </div>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 mt-8 text-xl font-semibold text-[var(--accent)]">
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-primary mb-2 mt-5 text-base font-semibold">
      {children}
    </h3>
  );
}

function A({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[var(--accent)] hover:underline"
    >
      {children}
    </a>
  );
}
