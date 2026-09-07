'use client';

/**
 * Calendar UI is intentionally NOT embedded in docs MDX.
 * Wallet / Keplr / cosmes must not mount on documentation routes.
 *
 * If a page accidentally renders this, show a static notice instead of
 * requesting extension permissions.
 */
export function ConnectCalendar() {
  return (
    <div className="not-prose my-6 rounded-xl border border-fd-border bg-fd-card/60 p-5 text-sm text-fd-muted-foreground">
      <p className="font-medium text-fd-foreground">Community calendar</p>
      <p className="mt-1">
        Live calendar + wallet connect is not hosted inside the docs (avoids
        browser extension and third-party access prompts). Use community
        channels under{' '}
        <a
          href="/docs/resources/get-involved"
          className="font-medium text-fd-primary underline-offset-2 hover:underline"
        >
          Get involved
        </a>
        .
      </p>
    </div>
  );
}
