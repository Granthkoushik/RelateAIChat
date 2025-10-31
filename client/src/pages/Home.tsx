import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { MessageSquare, Users, BarChart3, Heart, ArrowRight } from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="mx-auto max-w-3xl px-4 py-12">
        {/* Welcome Section */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-semibold" data-testid="text-page-title">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ""}!
          </h1>
          <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
            RelateAI helps you communicate, express yourself, and explore thoughts safely 
            with an intelligent AI assistant.
          </p>
          
          {/* Age Mode Badge */}
          {user?.ageMode && (
            <div className="mb-8 flex justify-center">
              <Badge variant="secondary" className="px-3 py-1 text-xs" data-testid="badge-age-mode">
                {user.ageMode === "teen" ? "Teen Mode" : "Adult Mode"}
              </Badge>
            </div>
          )}

          <Link href="/chat">
            <Button size="lg" className="px-8" data-testid="button-chat-now">
              Start Chatting
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Features Section */}
        <div className="mb-12">
          <h2 className="mb-8 text-center text-xl font-medium">
            Your AI Companion Features
          </h2>
          
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-medium">Active Vaults</h3>
              <p className="text-sm text-muted-foreground">
                Chat in Normal Vault for persistent conversations or Temporary Vault for private, ephemeral chats.
              </p>
            </Card>

            <Card className="p-6 relative opacity-60">
              <Badge className="absolute right-4 top-4 text-xs" variant="secondary">
                Coming Soon
              </Badge>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-muted/50">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-medium">Family & Friends</h3>
              <p className="text-sm text-muted-foreground">
                Dedicated vaults for conversations about family and friendships.
              </p>
            </Card>

            <Card className="p-6 relative opacity-60">
              <Badge className="absolute right-4 top-4 text-xs" variant="secondary">
                Coming Soon
              </Badge>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-muted/50">
                <Heart className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-medium">Mood Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Track your emotional journey and get personalized insights over time.
              </p>
            </Card>
          </div>
        </div>

        {/* Additional Future Features */}
        <div>
          <h2 className="mb-8 text-center text-xl font-medium">
            More Features On The Way
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-4 flex items-start gap-4 opacity-60">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h4 className="mb-1 font-medium">Personalized Recommendations</h4>
                <p className="text-sm text-muted-foreground">
                  Get AI-powered suggestions tailored to your conversations and goals.
                </p>
              </div>
            </Card>

            <Card className="p-4 flex items-start gap-4 opacity-60">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                <Heart className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h4 className="mb-1 font-medium">Emotional Insights</h4>
                <p className="text-sm text-muted-foreground">
                  Understand your emotional patterns and receive supportive guidance.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
