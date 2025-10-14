export default function Home() {
  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <section className="text-center max-w-3xl">
        <h1 className="text-4xl font-semibold mb-3">Welcome to my world!</h1>
        <p className="text-[var(--muted)] mb-8">
          Get to know me, my projects, and skills in a lovely cozy space ☕
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          {}
          <a
            href="/world"
            className="px-5 py-3 rounded-xl border"
            style={{ borderColor: "var(--border)" }}
          >
            Start exploring
          </a>
          <a
            href="/cv"
            className="px-5 py-3 rounded-xl border"
            style={{ borderColor: "var(--border)" }}
          >
            Classic CV
          </a>
        </div>
      </section>
    </main>
  );
}
