export const metadata = {
  title: "Bookshelf — Sneak Peek",
  description: "A little taste of what's to come.",
};

export default function MockupSneakPeek() {
  return (
    <main className="px-4 py-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-3">Bookshelf — Sneak Peek</h1>
      <p className="text-muted mb-6">
        Here’s a little taste of what’s to come. I’m building a calm, cozy reading tracker that feels like your own library.
      </p>

      <figure className="panel p-2">
        <img src="/home.png" alt="Bookshelf app home screen" className="w-full h-auto rounded" />
        <figcaption className="text-xs text-muted px-2 py-2">
          Work-in-progress — design and copy subject to change.
        </figcaption>
      </figure>

      <div className="mt-8">
        <a href="/world" className="underline text-muted">← Back to The Cozy House</a>
      </div>
    </main>
  );
}
