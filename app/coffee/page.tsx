export default function Coffee() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold mb-2">Coffee Break ☕</h1>
      <p className="mb-6" style={{color:"var(--muted)"}}>
        A small corner for non-work things. We’re all human after all. :)
      </p>

      <section className="space-y-6">
        <div>
          <h2 className="text-xl mb-2">Currently reading</h2>
          <ul className="list-disc pl-5 space-y-1 text-[var(--fg)]">
            <li>The Pumpkin Spice Cafe</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl mb-2">Favorites</h2>
          <ul className="list-disc pl-5 space-y-1 text-[var(--fg)]">
            <li>Books: Fourth Wing</li>
            <li>Shows/Movies: Harry Potter</li>
            <li>Music: Taylor Swift + Imagine Dragons</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl mb-2">Hobbies</h2>
          <p className="text-[var(--fg)]">I absolutely love staying home with a good book, my two cats, and a delicious cup of coffee.</p>
        </div>
      </section>
    </main>
  );
}
