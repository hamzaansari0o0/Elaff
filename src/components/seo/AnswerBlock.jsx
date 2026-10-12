// A short, self-contained answer near the top of a page (see lib/answerBlocks.js).
// Plain visible text in the page HTML, so search engines and AI assistants can
// quote it as-is.
export default function AnswerBlock({ children }) {
  return (
    <section className="max-w-4xl mx-auto px-4 py-8 md:py-10">
      <p className="font-bricolage text-base md:text-lg text-gray-700 leading-relaxed text-center">{children}</p>
    </section>
  );
}
