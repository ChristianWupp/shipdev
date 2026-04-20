"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleOAuth = (provider: string) => {
    // For V1a, OAuth redirects to builder with wallet connect
    // Full OAuth implementation in V1b with NextAuth providers
    if (provider === "wallet") {
      router.push("/builder");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For V1a, email registration stores locally and redirects to builder
    // Full implementation with Supabase in V1b
    router.push("/builder");
  };

  return (
    <div>
      {/* OAuth buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => handleOAuth("google")}
          className="flex-1 flex items-center justify-center gap-2 bg-surface-elevated border border-border rounded-[8px] py-[10px] text-[13px] text-text-primary hover:border-accent/30 transition-colors cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google
        </button>
        <button
          onClick={() => handleOAuth("github")}
          className="flex-1 flex items-center justify-center gap-2 bg-surface-elevated border border-border rounded-[8px] py-[10px] text-[13px] text-text-primary hover:border-accent/30 transition-colors cursor-pointer"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          GitHub
        </button>
        <button
          onClick={() => handleOAuth("wallet")}
          className="flex-1 flex items-center justify-center gap-2 bg-surface-elevated border border-border rounded-[8px] py-[10px] text-[13px] text-text-primary hover:border-accent/30 transition-colors cursor-pointer"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="2" y="6" width="20" height="14" rx="2" />
            <path d="M16 14h.01" />
            <path d="M2 10h20" />
          </svg>
          Wallet
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[11px] text-text-muted uppercase tracking-[1px]">
          or with email
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-[11px] text-text-secondary font-medium mb-1 block">
              First name
            </label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) =>
                setForm((f) => ({ ...f, firstName: e.target.value }))
              }
              placeholder="John"
              className="w-full bg-surface-elevated border border-border rounded-[8px] px-3 py-[10px] text-[13px] text-text-primary placeholder:text-text-muted outline-none focus:border-accent transition-colors"
            />
          </div>
          <div className="flex-1">
            <label className="text-[11px] text-text-secondary font-medium mb-1 block">
              Last name
            </label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) =>
                setForm((f) => ({ ...f, lastName: e.target.value }))
              }
              placeholder="Doe"
              className="w-full bg-surface-elevated border border-border rounded-[8px] px-3 py-[10px] text-[13px] text-text-primary placeholder:text-text-muted outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] text-text-secondary font-medium mb-1 block">
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm((f) => ({ ...f, email: e.target.value }))
            }
            placeholder="john@example.com"
            className="w-full bg-surface-elevated border border-border rounded-[8px] px-3 py-[10px] text-[13px] text-text-primary placeholder:text-text-muted outline-none focus:border-accent transition-colors"
          />
        </div>

        <div>
          <label className="text-[11px] text-text-secondary font-medium mb-1 block">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              placeholder="Minimum 8 characters"
              className="w-full bg-surface-elevated border border-border rounded-[8px] px-3 py-[10px] pr-10 text-[13px] text-text-primary placeholder:text-text-muted outline-none focus:border-accent transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary cursor-pointer"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                {showPassword ? (
                  <>
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </>
                ) : (
                  <>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        <div>
          <label className="text-[11px] text-text-secondary font-medium mb-1 block">
            Confirm password
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={form.confirmPassword}
              onChange={(e) =>
                setForm((f) => ({ ...f, confirmPassword: e.target.value }))
              }
              placeholder="Repeat your password"
              className="w-full bg-surface-elevated border border-border rounded-[8px] px-3 py-[10px] pr-10 text-[13px] text-text-primary placeholder:text-text-muted outline-none focus:border-accent transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary cursor-pointer"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                {showConfirm ? (
                  <>
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </>
                ) : (
                  <>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-[8px] text-[14px] font-semibold text-black cursor-pointer transition-all"
          style={{
            background:
              "linear-gradient(135deg, #00d4ff 0%, #00b8e6 50%, #0090b3 100%)",
          }}
        >
          Create account
        </button>
      </form>
    </div>
  );
}
