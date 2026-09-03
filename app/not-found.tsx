import "./globals.css";
import NotFoundScene from "./components/NotFoundScene";

/**
 * Root-level 404. There is no root `app/layout.tsx` in this app — every real
 * page lives under `app/[locale]/layout.tsx`, which owns the `<html>`/`<body>`
 * tags — so this is the ONE place a genuinely-unmatched URL (anything the
 * router can't route into a `[locale]` segment at all, e.g. a bare typo with
 * no locale prefix) actually lands, and it has to bring its own `<html>`/
 * `<body>`. `app/[locale]/not-found.tsx` handles the localized case instead
 * (an explicit `notFound()` call from within a real locale page).
 *
 * No locale is known here, so this stays English-only and links to `/` —
 * the i18n middleware in proxy.ts redirects that to the visitor's locale.
 */
export default function RootNotFound() {
  return (
    <html lang="en">
      <body>
        <NotFoundScene
          copy={{
            eyebrow: "404",
            heading: "You've wandered off the trail",
            description:
              "This path doesn't lead anywhere — the page may have moved, or the URL took a wrong turn somewhere in the mountains.",
            cta: "Back to base camp",
          }}
          homeHref="/"
        />
      </body>
    </html>
  );
}
