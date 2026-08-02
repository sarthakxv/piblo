import type { Metadata } from "next";
import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export const metadata: Metadata = {
    title: {
        default: "Piblo",
        template: "%s · Piblo",
    },
    description: "A learning space that thinks with you.",
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
