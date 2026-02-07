import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Gamepad2, Sparkles, Trophy, Zap } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-primary/30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
        <div className="container relative z-10 py-24 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              <span>Plateforme de jeu premium</span>
            </div>
            
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground md:text-7xl">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Fail Frenzy
              </span>
            </h1>
            
            <p className="mb-8 text-xl text-muted-foreground md:text-2xl">
              Le jeu d'arcade néon où chaque échec vous rapproche de la victoire. 
              Défie la gravité, esquive les obstacles, et deviens une légende.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              {isAuthenticated ? (
                <Link href="/game">
                  <Button size="lg" className="gap-2 text-lg">
                    <Gamepad2 className="h-5 w-5" />
                    Jouer maintenant
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button size="lg" className="gap-2 text-lg">
                    <Gamepad2 className="h-5 w-5" />
                    Commencer gratuitement
                  </Button>
                </a>
              )}
              
              <Link href="/leaderboard">
                <Button size="lg" variant="outline" className="gap-2 text-lg">
                  <Trophy className="h-5 w-5" />
                  Classements
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-4xl font-bold text-foreground">
            Pourquoi Fail Frenzy ?
          </h2>
          
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-primary/30 bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20 text-primary">
                  <Zap className="h-6 w-6" />
                </div>
                <CardTitle>4 Modes de Jeu</CardTitle>
                <CardDescription>
                  Classic, Time Trial, Infinite et Seeds - chaque mode offre un défi unique
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-secondary/30 bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/20 text-secondary">
                  <Trophy className="h-6 w-6" />
                </div>
                <CardTitle>Leaderboards Globaux</CardTitle>
                <CardDescription>
                  Affronte les meilleurs joueurs du monde et grimpe dans les classements
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-accent/30 bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20 text-accent">
                  <Sparkles className="h-6 w-6" />
                </div>
                <CardTitle>Skins & Achievements</CardTitle>
                <CardDescription>
                  Débloque des skins exclusifs et collectionne des achievements épiques
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Premium Section */}
      <section className="border-y border-primary/30 bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-24">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-4xl font-bold text-foreground">
              Passe en Premium
            </h2>
            <p className="mb-8 text-xl text-muted-foreground">
              Débloque tous les modes, retire les pubs, et accède aux leaderboards globaux
            </p>
            
            <div className="grid gap-8 md:grid-cols-2">
              <Card className="border-muted bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-2xl">Gratuit</CardTitle>
                  <div className="text-4xl font-bold text-foreground">€0</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-left text-muted-foreground">
                    <li>✓ Mode Classic</li>
                    <li>✓ 5 parties par jour</li>
                    <li>✓ Leaderboard local</li>
                    <li>✓ 2 skins de base</li>
                    <li className="text-destructive">✗ Publicités</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-primary bg-primary/10 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">Premium</CardTitle>
                  <div className="text-4xl font-bold text-foreground">
                    €4.99<span className="text-lg text-muted-foreground">/mois</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-left text-foreground">
                    <li className="text-primary">✓ Tous les modes illimités</li>
                    <li className="text-primary">✓ Parties illimitées</li>
                    <li className="text-primary">✓ Leaderboards globaux</li>
                    <li className="text-primary">✓ Tous les skins</li>
                    <li className="text-primary">✓ Sans publicités</li>
                  </ul>
                  <Link href="/premium">
                    <Button className="mt-6 w-full" size="lg">
                      Devenir Premium
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-4xl font-bold text-foreground">
            Prêt à relever le défi ?
          </h2>
          <p className="mb-8 text-xl text-muted-foreground">
            Rejoins des milliers de joueurs et prouve que tu es le meilleur
          </p>
          {isAuthenticated ? (
            <Link href="/game">
              <Button size="lg" className="gap-2 text-lg">
                <Gamepad2 className="h-5 w-5" />
                Jouer maintenant
              </Button>
            </Link>
          ) : (
            <a href={getLoginUrl()}>
              <Button size="lg" className="gap-2 text-lg">
                <Gamepad2 className="h-5 w-5" />
                Créer un compte gratuit
              </Button>
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
