import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="grid min-h-svh place-items-center px-6 text-center">
      <div className="max-w-sm">
        <div className="mx-auto grid size-16 place-items-center rounded-[1.4rem] bg-neutral-950 text-white shadow-2xl shadow-black/20 dark:bg-white dark:text-neutral-950">
          AI
        </div>
        <h1 className="mt-6 text-3xl font-black tracking-tight">Вы офлайн</h1>
        <p className="mt-3 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
          Галерея откроется из кэша, как только появится соединение. Сохранённые промпты останутся на устройстве.
        </p>
        <Link
          className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-neutral-950 px-6 text-sm font-bold text-white dark:bg-white dark:text-neutral-950"
          href="/"
        >
          Вернуться в галерею
        </Link>
      </div>
    </main>
  );
}
