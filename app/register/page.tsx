import Link from "next/link";
import { RegisterForm } from "./register-form";

export const metadata = {
  title: "ShipDev — Create Account",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-bg p-12 relative overflow-hidden">
        {/* Subtle radial glow */}
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
            Ship protocols,
            <br />
            <span className="text-accent italic">not pitches.</span>
          </h1>
          <p className="text-[15px] text-text-secondary max-w-[360px] leading-[1.6]">
            Describe your protocol. We fork audited code, configure it to your
            vision, and deploy to testnet in minutes.
          </p>
        </div>

        <div className="text-[11px] text-text-muted relative z-10">
          &copy; 2026 ShipDev. All rights reserved.
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center bg-surface p-8">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Link
              href="/"
              className="text-[18px] font-bold tracking-[-0.5px]"
            >
              ship<span className="text-accent">dev</span>
            </Link>
          </div>

          <h2 className="text-[24px] font-bold text-text-primary text-center mb-1">
            Create account
          </h2>
          <p className="text-[13px] text-text-muted text-center mb-8">
            Fill in your details to start building with ShipDev
          </p>

          <RegisterForm />

          <p className="text-[12px] text-text-muted text-center mt-6">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="text-accent hover:text-accent-hover font-medium"
            >
              Sign in
            </Link>
          </p>

          <p className="text-[10px] text-text-muted text-center mt-4">
            By creating an account, you agree to our{" "}
            <span className="underline cursor-pointer">Terms of Service</span>{" "}
            and{" "}
            <span className="underline cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
