import { Footer } from "@/components/common/Footer";
import { Header } from "@/components/common/Header";
import { CompleteProfileForm } from "@/features/profiles/components/CompleteProfileForm";

export default function CompleteProfilePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="container mx-auto flex-1 px-4 py-8 md:py-12">
        <CompleteProfileForm />
      </main>
      <Footer />
    </div>
  );
}
