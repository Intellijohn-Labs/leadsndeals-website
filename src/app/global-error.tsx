"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#09090a", color: "#f4f3ee", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", textAlign: "center", padding: 24 }}>
          <div>
            <h1 style={{ fontSize: 40, letterSpacing: "-0.03em", margin: 0 }}>Something went wrong.</h1>
            <p style={{ color: "#9b9a93", marginTop: 12 }}>Please refresh the page or try again.</p>
            <button
              onClick={() => reset()}
              style={{
                marginTop: 28,
                height: 48,
                padding: "0 28px",
                borderRadius: 999,
                border: 0,
                background: "#f2c21b",
                color: "#09090a",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
