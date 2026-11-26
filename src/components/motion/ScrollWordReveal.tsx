/**
 * Plain, fully readable paragraph (the old word-by-word scroll reveal hid most of the text).
 * Words wrapped in *asterisks* are shown in the brand colour.
 */
export default function ScrollWordReveal({ text, className }: { text: string; className?: string }) {
  return (
    <p className={className}>
      {text.split(" ").map((w, i) =>
        w.startsWith("*") ? (
          <span key={i}>
            <span className="text-brand">{w.replace(/\*/g, "")}</span>{" "}
          </span>
        ) : (
          <span key={i}>{w} </span>
        ),
      )}
    </p>
  );
}
