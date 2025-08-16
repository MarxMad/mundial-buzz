import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CalendarDays, MapPin, TrendingUp } from "lucide-react";

interface MatchCardProps {
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  date: string;
  time: string;
  venue: string;
  odds: {
    home: number;
    draw: number;
    away: number;
  };
}

const MatchCard = ({
  homeTeam,
  awayTeam,
  homeFlag,
  awayFlag,
  date,
  time,
  venue,
  odds
}: MatchCardProps) => {
  return (
    <Card className="match-card">
      <div className="flex flex-col space-y-4">
        {/* Match Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>{date}</span>
            <span>{time}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{venue}</span>
          </div>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{homeFlag}</div>
            <div className="font-semibold text-foreground">{homeTeam}</div>
          </div>
          
          <div className="text-2xl font-bold text-muted-foreground">VS</div>
          
          <div className="flex items-center space-x-3">
            <div className="font-semibold text-foreground">{awayTeam}</div>
            <div className="text-2xl">{awayFlag}</div>
          </div>
        </div>

        {/* Odds */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-muted rounded-lg hover:bg-primary/10 transition-colors cursor-pointer">
            <div className="text-xs text-muted-foreground mb-1">Local</div>
            <div className="font-bold text-foreground">{odds.home}</div>
          </div>
          
          <div className="text-center p-3 bg-muted rounded-lg hover:bg-primary/10 transition-colors cursor-pointer">
            <div className="text-xs text-muted-foreground mb-1">Empate</div>
            <div className="font-bold text-foreground">{odds.draw}</div>
          </div>
          
          <div className="text-center p-3 bg-muted rounded-lg hover:bg-primary/10 transition-colors cursor-pointer">
            <div className="text-xs text-muted-foreground mb-1">Visitante</div>
            <div className="font-bold text-foreground">{odds.away}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <Button variant="outline" className="flex-1">
            Ver Detalles
          </Button>
          <Button className="btn-hero flex-1">
            <TrendingUp className="mr-2 h-4 w-4" />
            Hacer Predicción
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default MatchCard;