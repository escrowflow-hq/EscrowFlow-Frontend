"use client";

import { useEffect, useRef, useState } from "react";
import { APPLE_CLIENT_ID, APPLE_REDIRECT_URI } from "@/lib/config";

interface AppleAuthResponse {
  authorization: { id_token: string; code: string; state?: string };
  user?: { name?: { firstName?: string; lastName?: string } };
}

declare global {
  interface Window {
    AppleID?: {
      auth: {
        init: (config: { clientId: string; scope: string; redirectURI: string; usePopup: boolean }) => void;
        signIn: () => Promise<AppleAuthResponse>;
      };
    };
  }
}

const SCRIPT_ID = "apple-id-auth";
const SCRIPT_SRC = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";

function loadAppleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.AppleID?.auth) {
      resolve();
      return;
    }
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Sign in with Apple")));
      return;
    }
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Sign in with Apple"));
    document.head.appendChild(script);
  });
}

export function AppleButton({
  onCredential,
  disabled,
}: {
  // Apple's ID token never carries a name (unlike Google's) — it's only
  // handed back once, in this response, the very first time someone
  // authorizes the app. onCredential's second argument carries that hint.
  onCredential: (idToken: string, nameHint?: string) => void;
  disabled?: boolean;
}) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onCredentialRef = useRef(onCredential);
  onCredentialRef.current = onCredential;

  const configured = Boolean(APPLE_CLIENT_ID && APPLE_REDIRECT_URI);

  useEffect(() => {
    if (!configured || disabled) return;
    let cancelled = false;

    loadAppleScript()
      .then(() => {
        if (cancelled || !window.AppleID) return;
        window.AppleID.auth.init({
          clientId: APPLE_CLIENT_ID,
          scope: "name email",
          redirectURI: APPLE_REDIRECT_URI,
          usePopup: true,
        });
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setError("Apple sign-in is unavailable right now.");
      });

    return () => {
      cancelled = true;
    };
  }, [configured, disabled]);

  async function handleClick() {
    if (!window.AppleID) return;
    setError(null);
    try {
      const response = await window.AppleID.auth.signIn();
      const first = response.user?.name?.firstName ?? "";
      const last = response.user?.name?.lastName ?? "";
      const nameHint = [first, last].filter(Boolean).join(" ") || undefined;
      onCredentialRef.current(response.authorization.id_token, nameHint);
    } catch {
      setError("Apple sign-in was cancelled or failed.");
    }
  }

  if (!configured) {
    return (
      <button
        type="button"
        disabled
        title="Apple sign-in isn't configured yet — set NEXT_PUBLIC_APPLE_CLIENT_ID / NEXT_PUBLIC_APPLE_REDIRECT_URI. Apple also rejects localhost outright, so this only works once deployed."
        className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-line bg-black text-sm font-medium text-white opacity-50"
      >
        Continue with Apple
      </button>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={!ready || disabled}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-black text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        Continue with Apple
      </button>
      {error && <p className="mt-1.5 text-center text-xs text-danger">{error}</p>}
    </div>
  );
}
