import MatchCard from "./MatchCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Crown, Target, Globe } from "lucide-react";

const Dashboard = () => {
  // Mock data for matches
  const upcomingMatches = [
    {
      homeTeam: "México",
      awayTeam: "Argentina",
      homeFlag: "🇲🇽",
      awayFlag: "🇦🇷",
      date: "15 Jun 2026",
      time: "20:00",
      venue: "Azteca Stadium",
      odds: { home: 2.8, draw: 3.2, away: 2.1 }
    },
    {
      homeTeam: "Brasil",
      awayTeam: "España",
      homeFlag: "🇧🇷",
      awayFlag: "🇪🇸",
      date: "16 Jun 2026",
      time: "17:00",
      venue: "MetLife Stadium",
      odds: { home: 2.4, draw: 3.0, away: 2.9 }
    },
    {
      homeTeam: "Francia",
      awayTeam: "Alemania",
      homeFlag: "🇫🇷",
      awayFlag: "🇩🇪",
      date: "17 Jun 2026",
      time: "19:00",
      venue: "Rose Bowl",
      odds: { home: 2.6, draw: 3.1, away: 2.5 }
    }
  ];

  const specialMarkets = [
    {
      title: "Campeón del Mundial",
      description: "Predice quién levantará la copa",
      icon: <Trophy className="h-8 w-8 text-secondary" />,
      topPick: "Brasil (3.5x)"
    },
    {
      title: "Máximo Goleador",
      description: "El jugador con más goles",
      icon: <Target className="h-8 w-8 text-secondary" />,
      topPick: "Mbappé (4.2x)"
    },
    {
      title: "Mejor Sede",
      description: "Ciudad con más goles totales",
      icon: <Globe className="h-8 w-8 text-secondary" />,
      topPick: "Ciudad de México (2.8x)"
    }
  ];

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="container mx-auto">
        {/* Welcome Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-hero bg-clip-text text-transparent">
              Dashboard de Predicciones
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explora los próximos partidos del Mundial FIFA 2026 y haz tus predicciones on-chain
          </p>
        </div>

        {/* Special Markets */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <Crown className="h-6 w-6 text-secondary mr-2" />
            <h2 className="text-2xl font-bold">Mercados Especiales</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {specialMarkets.map((market, index) => (
              <Card key={index} className="match-card">
                <div className="flex flex-col items-center text-center space-y-4">
                  {market.icon}
                  <div>
                    <h3 className="font-bold text-lg mb-2">{market.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{market.description}</p>
                    <div className="text-secondary font-semibold mb-4">
                      Favorito: {market.topPick}
                    </div>
                    <Button className="btn-trophy">
                      Ver Mercado
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Upcoming Matches */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Próximos Partidos</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {upcomingMatches.map((match, index) => (
              <MatchCard key={index} {...match} />
            ))}
          </div>
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Cargar Más Partidos
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;