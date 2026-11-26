import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-[100svh] place-items-center px-6 text-center">
      <div>
        <p className="eyebrow text-brand">404 · Page not found</p>
        <h1 className="display mt-5 text-[clamp(48px,9vw,120px)]">
          Lost the lead.
        </h1>
        <p className="mx-auto mt-5 max-w-[420px] text-muted">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
        <Link href="/" className="mt-9 inline-flex h-12 items-center rounded-full bg-brand px-7 font-medium text-ink">
          Back to home
        </Link>
      </div>
    </main>
  );
}
