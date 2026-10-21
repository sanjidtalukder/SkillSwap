import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { AuthForm } from "@/features/auth/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-950 text-foreground selection:bg-primary/20 selection:text-primary-200">
      {/* Ambient background glow orbs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-600/15 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-cyan-600/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <Header />
      <main className="container relative z-10 flex flex-1 items-center justify-center px-4 py-16">
        <AuthForm mode="login" />
      </main>
      <Footer />
    </div>
  );
}
