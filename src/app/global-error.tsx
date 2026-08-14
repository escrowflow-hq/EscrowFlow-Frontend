"use client";

import { useEffect } from "react";
import { logError } from "@/lib/errors";

// Only fires if the root layout itself throws, so it can't rely on that
// layout's providers or styles being mounted — keep this self-contained.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    logError(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "1rem",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Something went wrong</h1>
        <p style={{ maxWidth: "24rem", color: "#6b7280" }}>
          EscrowFlow hit an unexpected error loading this page. Please try again.
        </p>
        <button
          onClick={reset}
          style={{
            borderRadius: "0.75rem",
            padding: "0.5rem 1.25rem",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "white",
            backgroundColor: "#3B6DF5",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
