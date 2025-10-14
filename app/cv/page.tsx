export default function CV() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold mb-4">Curriculum Vitae</h1>
      <p className="text-gray-400 mb-6">
        This opens a PDF version of my résumé.
      </p>

      <div className="flex gap-3">
        <a
          href="/cv.pdf"
          className="px-5 py-3 rounded-xl border border-gray-700 hover:border-gray-500"
          target="_blank" rel="noreferrer"
        >
          View PDF
        </a>
        <a
          href="/cv.pdf" download
          className="px-5 py-3 rounded-xl border border-gray-700 hover:border-gray-500"
        >
          Download
        </a>
      </div>
    </main>
  );
}
