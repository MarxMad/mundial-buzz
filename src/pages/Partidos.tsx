import { useState } from "react";
import Navbar from "@/components/Navbar";
import MatchCard from "@/components/MatchCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Trophy, Clock } from "lucide-react";

const Partidos = () => {
  const [activeTab, setActiveTab] = useState("upcoming");

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
    },
    {
      homeTeam: "Inglaterra",
      awayTeam: "Italia",
      homeFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
      awayFlag: "🇮🇹",
      date: "18 Jun 2026",
      time: "16:00",
      venue: "SoFi Stadium",
      odds: { home: 2.2, draw: 3.4, away: 3.1 }
    }
  ];

  const groupStandings = [
    { group: "A", teams: [
      { name: "Qatar", flag: "🇶🇦", played: 3, won: 2, drawn: 1, lost: 0, gf: 5, ga: 2, points: 7 },
      { name: "Ecuador", flag: "🇪🇨", played: 3, won: 1, drawn: 2, lost: 0, gf: 4, ga: 3, points: 5 },
      { name: "Senegal", flag: "🇸🇳", played: 3, won: 1, drawn: 1, lost: 1, gf: 3, ga: 3, points: 4 },
      { name: "Netherlands", flag: "🇳🇱", played: 3, won: 0, drawn: 0, lost: 3, gf: 2, ga: 6, points: 0 }
    ]},
    { group: "B", teams: [
      { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", played: 3, won: 2, drawn: 1, lost: 0, gf: 6, ga: 2, points: 7 },
      { name: "United States", flag: "🇺🇸", played: 3, won: 1, drawn: 2, lost: 0, gf: 3, ga: 2, points: 5 },
      { name: "Iran", flag: "🇮🇷", played: 3, won: 1, drawn: 0, lost: 2, gf: 2, ga: 4, points: 3 },
      { name: "Wales", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", played: 3, won: 0, drawn: 1, lost: 2, gf: 1, ga: 4, points: 1 }
    ]}
  ];

  const liveMatches = [
    {
      homeTeam: "Portugal",
      awayTeam: "Uruguay",
      homeFlag: "🇵🇹",
      awayFlag: "🇺🇾",
      score: "2-1",
      minute: "78'",
      venue: "Lusail Stadium",
      status: "live"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-32 md:pb-0">
      <Navbar />
      
      <div className="pt-20 pb-10 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-hero bg-clip-text text-transparent">
                FIFA 2026 Matches
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Follow all World Cup matches in real time
            </p>
          </div>

          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upcoming" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Upcoming</span>
              </TabsTrigger>
              <TabsTrigger value="live" className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Live</span>
              </TabsTrigger>
              <TabsTrigger value="standings" className="flex items-center space-x-2">
                <Trophy className="h-4 w-4" />
                <span>Standings</span>
              </TabsTrigger>
            </TabsList>

            {/* Upcoming Matches */}
            <TabsContent value="upcoming" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {upcomingMatches.map((match, index) => (
                  <MatchCard key={index} {...match} />
                ))}
              </div>
              
              <div className="text-center">
                <Button variant="outline" size="lg">
                  Load More Matches
                </Button>
              </div>
            </TabsContent>

            {/* Live Matches */}
            <TabsContent value="live" className="space-y-6">
              {liveMatches.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {liveMatches.map((match, index) => (
                    <Card key={index} className="match-card relative">
                      <Badge className="absolute top-4 right-4 bg-destructive text-destructive-foreground animate-pulse">
                        LIVE
                      </Badge>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-3xl">{match.homeFlag}</span>
                            <div>
                              <p className="font-semibold">{match.homeTeam}</p>
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <p className="text-2xl font-bold">{match.score}</p>
                            <p className="text-primary font-semibold">{match.minute}</p>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <p className="font-semibold">{match.awayTeam}</p>
                            </div>
                            <span className="text-3xl">{match.awayFlag}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-1" />
                          {match.venue}
                        </div>
                        
                        <Button className="w-full btn-hero">
                          Watch Live Match
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No live matches</h3>
                  <p className="text-muted-foreground">
                    Live matches will appear here when they start
                  </p>
                </Card>
              )}
            </TabsContent>

            {/* Group Standings */}
            <TabsContent value="standings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {groupStandings.map((group) => (
                  <Card key={group.group} className="p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                      <Trophy className="h-5 w-5 mr-2 text-secondary" />
                      Group {group.group}
                    </h3>
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-8">#</TableHead>
                          <TableHead>Team</TableHead>
                          <TableHead className="text-center">PJ</TableHead>
                          <TableHead className="text-center">G</TableHead>
                          <TableHead className="text-center">E</TableHead>
                          <TableHead className="text-center">P</TableHead>
                          <TableHead className="text-center">GF</TableHead>
                          <TableHead className="text-center">GC</TableHead>
                          <TableHead className="text-center">Pts</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.teams.map((team, index) => (
                          <TableRow key={team.name}>
                            <TableCell className="font-medium">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                index < 2 ? 'bg-primary text-primary-foreground' : 
                                index === 2 ? 'bg-secondary text-secondary-foreground' : 
                                'bg-muted text-muted-foreground'
                              }`}>
                                {index + 1}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{team.flag}</span>
                                <span className="font-medium">{team.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">{team.played}</TableCell>
                            <TableCell className="text-center">{team.won}</TableCell>
                            <TableCell className="text-center">{team.drawn}</TableCell>
                            <TableCell className="text-center">{team.lost}</TableCell>
                            <TableCell className="text-center">{team.gf}</TableCell>
                            <TableCell className="text-center">{team.ga}</TableCell>
                            <TableCell className="text-center font-bold">{team.points}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Partidos;