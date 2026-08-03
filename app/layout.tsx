import type { Metadata } from "next";
import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const SITE_URL = "https://piblo-app.vercel.app";
const SITE_DESCRIPTION = "A learning companion designed to nurture curiosity";

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
                <TooltipProvider>{children}</TooltipProvider>
            </body>
        </html>
    );
}
