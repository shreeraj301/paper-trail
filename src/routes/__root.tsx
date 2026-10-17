import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { getRequest } from "@tanstack/react-start/server";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { QuietState } from "@/components/wall/QuietState";
import appCss from "../styles.css?url";

/** Same host guard the injector uses for og:image. Vercel system hosts are rejected. */
function publicAppHost(hostHeader: string | undefined): string {
  const host = String(hostHeader ?? "")
    .split(",")[0]
    .trim()
    .split(":")[0]
    .toLowerCase();
  if (!host || !/^[a-z0-9.-]+$/.test(host) || !host.includes(".")) return "";
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) return "";
  if (
    host === "vercel.app" ||
    host.endsWith(".vercel.app") ||
    host === "vercel.com" ||
    host.endsWith(".vercel.com")
  ) {
    return "";
  }
  return host;
}

function shareHost(): string {
  const fromEnv = publicAppHost(import.meta.env.VITE_PUBLIC_HOSTNAME);
  if (fromEnv) return fromEnv;
  if (!import.meta.env.SSR) return "";
  try {
    const request = getRequest();
    const forwarded = request.headers.get("x-forwarded-host") ?? "";
    return publicAppHost(forwarded) || publicAppHost(request.headers.get("host") ?? "");
  } catch {
    return "";
  }
}

export const Route = createRootRoute({
  head: () => {
    const host = shareHost();
    const xBanner = host ? `https://${host}/x-banner.jpg` : "";
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: "Paper Trail" },
        {
          name: "description",
          content:
            "Paper Trail, poems by Shreeraj Narwade. Drag the space to explore. Select a note to read.",
        },
        { name: "theme-color", content: "#ffffff" },
        ...(xBanner ? [{ property: "x:game:image", content: xBanner }] : []),
      ],
      links: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "stylesheet", href: appCss },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap",
        },
        { rel: "manifest", href: "/__grok/manifest.webmanifest" },
        { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      ],
    };
  },
  component: RootComponent,
  notFoundComponent: NotFound,
});

function RootComponent() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}

function NotFound() {
  return (
    <QuietState
      layout="page"
      title="This page is quiet"
      body="That poem is not on the wall, or the address drifted."
      actionLabel="Return to the wall"
      onAction={() => {
        window.location.assign("/");
      }}
    />
  );
}
