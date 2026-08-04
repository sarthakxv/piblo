import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server.ts";
import { SignInPanel } from "@/features/auth/sign-in-panel.tsx";

export default async function HomePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) redirect("/library");

    return (
        <main className="min-h-dvh px-5 py-6 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-6xl">
                <header>
                    <img src="/logo-text.svg" alt="Piblo" className="h-7 w-auto" />
                </header>

                <div className="grid gap-10 py-10 lg:min-h-[calc(100dvh-7rem)] lg:grid-cols-[minmax(0,1fr)_28rem] lg:items-center lg:gap-16 lg:py-16">
                    <section className="max-w-2xl">
                        <p className="text-sm font-bold text-ink">A guided way to work ideas out</p>
                        <h1 className="mt-4 max-w-xl text-balance font-notebook text-4xl font-bold leading-tight text-graphite sm:text-5xl">Bring what you know. Leave with a clearer idea.</h1>
                        <p className="mt-6 max-w-xl text-pretty text-lg leading-8 text-graphite-soft">Piblo gives you evidence, small challenges, and the right amount of help while you build an explanation for yourself.</p>
                        <div className="mt-10 max-w-xl border-l-2 border-ink pl-5">
                            <p className="text-xs font-bold uppercase tracking-wide text-graphite-soft">Your thinking trail</p>
                            <ol className="mt-3 flex flex-wrap items-center gap-2 font-notebook text-lg font-semibold text-graphite">
                                <li>Prediction</li><li aria-hidden="true" className="text-rule-strong">→</li><li>Evidence</li><li aria-hidden="true" className="text-rule-strong">→</li><li>Explanation</li>
                            </ol>
                            <p className="mt-2 text-sm leading-6 text-graphite-soft">Start with your own idea, then make it stronger.</p>
                        </div>
                    </section>

                    <SignInPanel />
                </div>
            </div>
        </main>
    );
}
