import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { AuthForm } from "@/features/auth/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <AuthForm mode="login" />
      </main>
      <Footer />
    </div>
  );
}
