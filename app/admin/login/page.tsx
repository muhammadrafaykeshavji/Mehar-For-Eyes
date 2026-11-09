"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        token?: string;
      };

      if (!res.ok) {
        setError(body.error ?? "Login failed. Check your email and password.");
        setLoading(false);
        return;
      }

      if (body.token && typeof window !== "undefined") {
        window.localStorage.setItem("mehar_admin_token", body.token);
      }

      router.replace("/admin");
    } catch {
      setError("Could not reach the server. Check your connection.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-14 sm:py-20">
      <div className="rounded-2xl border border-foreground/15 bg-surface p-6 shadow-xl sm:p-8">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-semibold tracking-wider text-accent uppercase">
          Optical Studio OS
        </span>
        <h1 className="mt-3 font-display text-3xl tracking-tight text-foreground">
          Admin Sign In
        </h1>
        <p className="mt-1.5 text-sm text-foreground/65">
          Sign in to manage eyewear inventory, storefront themes, and optical
          widgets.
        </p>

        {error ? (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-foreground"
          >
            {error}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs font-medium tracking-wider text-foreground/75 uppercase"
            >
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 block min-h-11 w-full rounded-lg border border-foreground/20 bg-background px-4 text-sm text-foreground focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-medium tracking-wider text-foreground/75 uppercase"
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 block min-h-11 w-full rounded-lg border border-foreground/20 bg-background px-4 text-sm text-foreground focus:border-accent focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white shadow-sm transition-opacity duration-200 hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in to Studio Console"}
          </button>
        </form>
      </div>
    </div>
  );
}
