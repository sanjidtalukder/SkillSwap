import Link from "next/link";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ROUTES } from "@/constants";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          {/* Subtle Ambient Background Glow */}
          <div className="pointer-events-none absolute left-1/2 top-1/4 -z-10 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 blur-[120px]" />

          <div className="container mx-auto flex max-w-5xl flex-col items-center px-4 text-center">
            <Badge variant="primary" className="mb-6 px-3.5 py-1 text-xs uppercase tracking-wider">
              Student Collaboration Platform
            </Badge>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
              Swap Skills. Build Projects. <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Grow Together.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Connect with fellow students, exchange skills, collaborate on real-world projects, and
              build an impressive portfolio.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href={ROUTES.PROJECTS}>
                <Button variant="primary" size="lg">
                  Explore Projects
                </Button>
              </Link>
              <Link href={ROUTES.SKILLS}>
                <Button variant="outline" size="lg">
                  Find Skill Matches
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Showcase Section */}
        <section className="border-t border-border/40 bg-card/10 py-16 md:py-24">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Engineered for Student Success
              </h2>
              <p className="mt-3 text-base text-muted-foreground">
                Clean architecture powering seamless collaboration, matchmaker, and real-time chat.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="hover:border-primary/40">
                <CardHeader>
                  <Badge variant="success" className="mb-2 w-fit">
                    Firestore Realtime
                  </Badge>
                  <CardTitle>Skill Matchmaker</CardTitle>
                  <CardDescription>
                    Intelligent algorithm comparing skills offered vs skills needed to compute
                    instant compatibility.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Badge variant="outline">React</Badge>
                    <Badge variant="outline">Python</Badge>
                    <Badge variant="outline">UI/UX</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:border-primary/40">
                <CardHeader>
                  <Badge variant="primary" className="mb-2 w-fit">
                    Owner Controls
                  </Badge>
                  <CardTitle>Project Collaboration</CardTitle>
                  <CardDescription>
                    Manage project progress (0-100%), invite team members, assign tasks, and track
                    status.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Badge variant="outline">Progress Tracker</Badge>
                    <Badge variant="outline">Team Invites</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:border-primary/40">
                <CardHeader>
                  <Badge variant="warning" className="mb-2 w-fit">
                    Live Messaging
                  </Badge>
                  <CardTitle>One-to-One Chat</CardTitle>
                  <CardDescription>
                    Real-time messaging with typing indicators, read receipts, unread count alerts,
                    and attachments.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Badge variant="outline">Realtime Listener</Badge>
                    <Badge variant="outline">Read Status</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
