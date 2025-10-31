import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, Shield, Users, Sparkles } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MessageSquare className="h-5 w-5" />
            </div>
            <span className="text-xl font-semibold">RelateAI</span>
          </div>
          <Button asChild data-testid="button-login-header">
            <a href="/api/login">Log in</a>
          </Button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 py-12 md:py-16">
        {/* Hero Section */}
        <div className="text-center">
          <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <MessageSquare className="h-10 w-10 text-primary" />
          </div>
          <h1 className="mb-4 text-3xl font-semibold md:text-4xl">
            Welcome to RelateAI
          </h1>
          <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
            RelateAI helps you communicate, express yourself, and explore thoughts safely 
            with an intelligent AI assistant.
          </p>
          <Button asChild size="lg" className="px-8" data-testid="button-get-started">
            <a href="/api/login">
              Get Started
            </a>
          </Button>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          <Card className="p-6 hover-elevate">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-medium">Safe & Secure</h3>
            <p className="text-sm text-muted-foreground">
              Age-appropriate AI guidance with teen and adult modes for safe conversations.
            </p>
          </Card>

          <Card className="p-6 hover-elevate">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-medium">Private Vaults</h3>
            <p className="text-sm text-muted-foreground">
              Organize conversations in Normal and Temporary vaults. Family & Friends vaults coming soon!
            </p>
          </Card>

          <Card className="p-6 hover-elevate">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-medium">Smart Features</h3>
            <p className="text-sm text-muted-foreground">
              Mood tracking, personalized recommendations, and emotional insights coming soon.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
