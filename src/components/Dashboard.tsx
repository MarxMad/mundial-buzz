import MatchCard from "./MatchCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Crown, Target, Globe, TrendingUp, Users, Calendar, Star } from "lucide-react";
import SportsPattern from "./SportsPattern";

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
      title: "World Cup Champion",
      description: "Predict who will lift the cup",
      icon: <Trophy className="h-8 w-8 text-secondary" />,
      topPick: "Brasil (3.5x)"
    },
    {
      title: "Top Scorer",
      description: "The player with most goals",
      icon: <Target className="h-8 w-8 text-secondary" />,
      topPick: "Mbappé (4.2x)"
    },
    {
      title: "Best Venue",
      description: "City with most total goals",
      icon: <Globe className="h-8 w-8 text-secondary" />,
      topPick: "Ciudad de México (2.8x)"
    }
  ];

  return (
    <div className="min-h-screen pt-20 pb-24 md:pb-10 px-4 relative overflow-hidden">
      <SportsPattern className="fixed inset-0" opacity={0.05} />
      <div className="container mx-auto relative z-10">
        {/* Welcome Section */}
        <div className="mb-16 text-center animate-fade-in relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-600/10 rounded-3xl blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex justify-center mb-8">
              <div className="bg-action-gradient p-6 rounded-full shadow-premium animate-bounce glow-orange">
                <Trophy className="h-16 w-16 text-white" />
              </div>
            </div>
            <h1 className="text-6xl md:text-7xl font-display font-bold text-white mb-6">
              Predictions <span className="bg-sports-gradient bg-clip-text text-transparent"></span>
            </h1>
            <p className="text-2xl font-primary text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed">
              🏆 Explore upcoming FIFA World Cup 2026 matches and make your on-chain predictions
            </p>
          </div>
          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-card-gradient p-8 rounded-2xl border-2 border-sports-green/30 hover:border-sports-green shadow-premium hover:shadow-card-hover transition-all duration-300 animate-slide-up group">
              <div className="flex items-center justify-between mb-6">
                <TrendingUp className="h-10 w-10 text-sports-green group-hover:scale-110 transition-transform" />
                <span className="font-display text-3xl font-bold text-sports-green">+15%</span>
              </div>
              <h3 className="font-sports text-xl font-bold text-white mb-3">Accuracy</h3>
              <p className="font-primary text-gray-300 font-medium">Your success rate</p>
            </div>
            
            <div className="bg-card-gradient p-8 rounded-2xl border-2 border-sports-blue/30 hover:border-sports-blue shadow-premium hover:shadow-card-hover transition-all duration-300 animate-slide-up animate-slide-up-delay group">
              <div className="flex items-center justify-between mb-6">
                <Users className="h-10 w-10 text-sports-blue group-hover:scale-110 transition-transform" />
                <span className="font-display text-3xl font-bold text-sports-blue">#247</span>
              </div>
              <h3 className="font-sports text-xl font-bold text-white mb-3">Ranking</h3>
              <p className="font-primary text-gray-300 font-medium">Global position</p>
            </div>
            
            <div className="bg-card-gradient p-8 rounded-2xl border-2 border-sports-yellow/30 hover:border-sports-yellow shadow-premium hover:shadow-card-hover transition-all duration-300 animate-slide-up animate-fade-in-delay group">
              <div className="flex items-center justify-between mb-6">
                <Star className="h-10 w-10 text-sports-yellow group-hover:scale-110 transition-transform" />
                <span className="font-display text-3xl font-bold text-sports-yellow">1,250</span>
              </div>
              <h3 className="font-sports text-xl font-bold text-white mb-3">Points</h3>
              <p className="font-primary text-gray-300 font-medium">Total accumulated</p>
            </div>
          </div>
        </div>

        {/* Special Markets */}
        <div className="mb-16">
          <div className="flex items-center justify-center mb-8">
             <div className="flex items-center bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 px-8 py-4 rounded-2xl shadow-2xl border border-purple-500/20">
               <Crown className="h-7 w-7 text-yellow-300 mr-4" />
               <h2 className="text-3xl font-display font-bold text-white tracking-wide">Special Markets</h2>
             </div>
           </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {specialMarkets.map((market, index) => (
              <Card key={index} className="match-card hover:scale-105 transition-all duration-300 hover:shadow-2xl border-2 hover:border-orange-500 group">
                <div className="flex flex-col items-center text-center space-y-6 p-6">
                  <div className="bg-gradient-to-br from-orange-400 to-red-500 p-4 rounded-full shadow-lg group-hover:shadow-xl transition-all duration-300">
                    {market.icon}
                  </div>
                  <div>
                    <h3 className="font-sports text-xl font-bold mb-3 group-hover:text-orange-400 transition-colors tracking-wide">{market.title}</h3>
                     <p className="font-primary text-slate-400 mb-4 leading-relaxed">{market.description}</p>
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-md">
                      🏆 Favorite: {market.topPick}
                    </div>
                    <Button className="btn-trophy w-full group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-red-600 transition-all duration-300">
                      <Target className="h-4 w-4 mr-2" />
                      View Market
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Upcoming Matches */}
        <div>
          <div className="flex items-center justify-center mb-8">
             <div className="flex items-center bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 px-8 py-4 rounded-2xl shadow-2xl border border-blue-500/20">
               <Calendar className="h-7 w-7 text-blue-200 mr-4" />
               <h2 className="text-3xl font-display font-bold text-white tracking-wide">Upcoming Matches</h2>
             </div>
           </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {upcomingMatches.map((match, index) => (
              <div key={index} className="animate-fade-in-up" style={{animationDelay: `${index * 0.1}s`}}>
                <MatchCard {...match} />
              </div>
            ))}
          </div>
        </div>

        {/* Load More */}
        <div className="text-center mt-16 mb-24 md:mb-8">
          <Button 
            variant="outline" 
            size="lg" 
            className="bg-gradient-to-r from-orange-500 to-red-600 text-white border-none hover:from-orange-600 hover:to-red-700 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <TrendingUp className="h-5 w-5 mr-2" />
            Load More Matches
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;