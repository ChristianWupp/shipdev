import Link from "next/link";
import { SignInForm } from "./sign-in-form";

export const metadata = {
  title: "ShipDev — Sign In",
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-bg p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 30% 50%, #00d4ff06 0%, transparent 60%)",
          }}
        />
        <Link
          href="/"
          className="text-[18px] font-bold tracking-[-0.5px] relative z-10"
        >
          ship<span className="text-accent">dev</span>
        </Link>
        <div className="relative z-10">
          <h1 className="font-serif text-[36px] leading-[1.2] text-text-primary mb-2">
            Welcome back.
          </h1>
          <p className="text-[15px] text-text-secondary max-w-[360px] leading-[1.6]">
            Pick up where you left off. Your protocols are waiting.
          </p>
        </div>
        <div className="text-[11px] text-text-muted relative z-10">
          &copy; 2026 ShipDev. All rights reserved.
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center bg-surface p-8">
        <div className="w-full max-w-[420px]">
          <div className="lg:hidden mb-8">
            <Link
              href="/"
              className="text-[18px] font-bold tracking-[-0.5px]"
            >
              ship<span className="text-accent">dev</span>
            </Link>
          </div>

          <h2 className="text-[24px] font-bold text-text-primary text-center mb-1">
            Sign in
          </h2>
          <p className="text-[13px] text-text-muted text-center mb-8">
            Sign in to continue building
          </p>

          <SignInForm />

          <p className="text-[12px] text-text-muted text-center mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-accent hover:text-accent-hover font-medium"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
