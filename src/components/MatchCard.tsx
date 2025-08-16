import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CalendarDays, MapPin, TrendingUp, Zap, Trophy } from "lucide-react";

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
    <Card className="match-card bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-700 hover:border-orange-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10 group">
      <div className="flex flex-col space-y-6 p-6">
        {/* Match Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 bg-slate-800/50 px-3 py-2 rounded-full border border-slate-600">
            <CalendarDays className="h-4 w-4 text-blue-400" />
            <span className="font-sports text-sm text-slate-200 font-semibold">{date}</span>
            <span className="font-sports text-sm text-orange-400 font-bold">{time}</span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-800/50 px-3 py-2 rounded-full border border-slate-600">
            <MapPin className="h-4 w-4 text-emerald-400" />
            <span className="font-primary text-sm text-slate-200 font-medium truncate max-w-[120px]">{venue}</span>
          </div>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between py-4">
          <div className="flex flex-col items-center space-y-2 flex-1">
            <div className="text-4xl drop-shadow-lg">{homeFlag}</div>
            <div className="font-sports text-lg font-bold text-white text-center group-hover:text-orange-300 transition-colors">{homeTeam}</div>
          </div>
          
          <div className="flex flex-col items-center space-y-2 px-6">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 p-3 rounded-full shadow-lg">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div className="font-display text-sm font-bold text-orange-400 tracking-wider">VS</div>
          </div>
          
          <div className="flex flex-col items-center space-y-2 flex-1">
            <div className="text-4xl drop-shadow-lg">{awayFlag}</div>
            <div className="font-sports text-lg font-bold text-white text-center group-hover:text-orange-300 transition-colors">{awayTeam}</div>
          </div>
        </div>

        {/* Odds */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 cursor-pointer border border-slate-600 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/20 group/odd">
            <div className="font-sports text-xs text-slate-400 mb-2 group-hover/odd:text-white font-semibold tracking-wide">LOCAL</div>
            <div className="font-display text-xl font-bold text-white group-hover/odd:text-green-100">{odds.home}</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 cursor-pointer border border-slate-600 hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-500/20 group/odd">
            <div className="font-sports text-xs text-slate-400 mb-2 group-hover/odd:text-white font-semibold tracking-wide">EMPATE</div>
            <div className="font-display text-xl font-bold text-white group-hover/odd:text-yellow-100">{odds.draw}</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 cursor-pointer border border-slate-600 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/20 group/odd">
            <div className="font-sports text-xs text-slate-400 mb-2 group-hover/odd:text-white font-semibold tracking-wide">VISITANTE</div>
            <div className="font-display text-xl font-bold text-white group-hover/odd:text-blue-100">{odds.away}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-4 pt-2">
          <Button 
            variant="outline" 
            className="flex-1 font-sports font-semibold border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500 transition-all duration-300"
          >
            Ver Detalles
          </Button>
          <Button className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-sports font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <Zap className="mr-2 h-4 w-4" />
            Hacer Predicción
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default MatchCard;