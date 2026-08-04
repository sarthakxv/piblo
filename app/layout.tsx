import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
    PROFILE_PRESENT_COOKIE,
    PROFILE_STORAGE_KEY,
} from "@/features/learner-profile/profile-schema.ts";
import "./globals.css";

const SITE_URL = "https://piblo-app.vercel.app";
const SITE_DESCRIPTION = "A learning companion designed to nurture curiosity";

const PROFILE_ROUTE_BOOTSTRAP = `(function(){try{if(location.pathname!=="/")return;if(!localStorage.getItem(${JSON.stringify(PROFILE_STORAGE_KEY)}))return;var secure=location.protocol==="https:"?"; Secure":"";document.cookie=${JSON.stringify(`${PROFILE_PRESENT_COOKIE}=1; path=/; max-age=31536000; SameSite=Lax`)}+secure;location.replace("/library");}catch{}})();`;

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: "Piblo",
        template: "%s · Piblo",
    },
    description: SITE_DESCRIPTION,
    applicationName: "Piblo",
    icons: {
        icon: [
            { url: "/favicon.ico", sizes: "any" },
            { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
            { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        ],
        apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    manifest: "/site.webmanifest",
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "/",
        siteName: "Piblo",
        title: "Piblo",
        description: SITE_DESCRIPTION,
        images: [
            {
                url: "/og_image.png",
                width: 1536,
                height: 1024,
                alt: "Piblo — a learning companion designed to nurture curiosity",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Piblo",
        description: SITE_DESCRIPTION,
        images: ["/og_image.png"],
    },
    robots: {
        index: false,
        follow: false,
        googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
        },
    },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <html lang="en">
            <body>
                <Script id="profile-route-bootstrap" strategy="beforeInteractive">
                    {PROFILE_ROUTE_BOOTSTRAP}
                </Script>
                <TooltipProvider>{children}</TooltipProvider>
            </body>
        </html>
    );
}
