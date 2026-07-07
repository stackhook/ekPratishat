export function PropertyPortfolioSummarySkeleton() {
    return (
        <div className="rounded-xl border bg-white dark:bg-zinc-900 shadow-sm p-6 animate-pulse">

            <div className="h-6 w-56 rounded bg-gray-200 dark:bg-zinc-800" />
            <div className="mt-2 h-4 w-40 rounded bg-gray-200 dark:bg-zinc-800" />

            <div className="mt-6 grid gap-4 md:grid-cols-2">

                {[1, 2].map((i) => (
                    <div
                        key={i}
                        className="rounded-lg border p-5"
                    >
                        <div className="h-5 w-36 rounded bg-gray-200 dark:bg-zinc-800" />

                        <div className="mt-5 h-9 w-40 rounded bg-gray-200 dark:bg-zinc-800" />

                        <div className="mt-4 h-4 w-24 rounded bg-gray-200 dark:bg-zinc-800" />
                    </div>
                ))}

            </div>

            <div className="mt-6 rounded-xl border p-6">

                <div className="h-5 w-44 rounded bg-gray-200 dark:bg-zinc-800" />

                <div className="mt-5 h-10 w-52 rounded bg-gray-200 dark:bg-zinc-800" />

                <div className="mt-6 space-y-4">

                    <div className="flex justify-between">
                        <div className="h-4 w-40 rounded bg-gray-200 dark:bg-zinc-800" />
                        <div className="h-4 w-24 rounded bg-gray-200 dark:bg-zinc-800" />
                    </div>

                    <div className="flex justify-between">
                        <div className="h-4 w-40 rounded bg-gray-200 dark:bg-zinc-800" />
                        <div className="h-4 w-24 rounded bg-gray-200 dark:bg-zinc-800" />
                    </div>

                </div>

            </div>

        </div>
    );
}