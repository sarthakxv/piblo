import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <main className="grid min-h-dvh place-items-center px-5">
            <section className="max-w-lg text-center">
                <p className="text-sm font-bold text-ink">Page not found</p>
                <h1 className="mt-3 font-notebook text-4xl font-bold text-graphite">This learning path is not available yet.</h1>
                <Button render={<Link href="/library" />} className="mt-6 bg-graphite text-paper-raised">Return to the library</Button>
            </section>
        </main>
    );
}
