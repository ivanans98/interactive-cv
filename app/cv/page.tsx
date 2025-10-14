export default function CV() {
  return (
    <main className="min-h-dvh">
      <object data="/cv.pdf#view=FitH" type="application/pdf" className="w-full h-[90dvh]">
        <iframe src="/cv.pdf#view=FitH" className="w-full h-[90dvh]" />
      </object>
      <div className="px-6 py-3 text-sm">
        Can’t see the PDF? <a href="/cv.pdf" className="underline">Download it</a>.
      </div>
    </main>
  );
}
