export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-16">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-10 shadow-xl shadow-slate-950/40">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">NZR / Panel</p>
          <h1 className="mt-4 text-3xl font-semibold">Witaj w panelu</h1>
          <p className="mt-3 text-sm text-slate-400">
            Twoje konto jest aktywne. Wkrótce dodamy więcej funkcji.
          </p>
        </div>
      </section>
    </main>
  );
}
