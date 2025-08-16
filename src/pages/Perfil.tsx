import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp, Target, Award, Calendar, DollarSign, Users, Medal, Star, Zap } from "lucide-react";

const Perfil = () => {
  const [activeTab, setActiveTab] = useState("estadisticas");

  const userStats = {
    name: "Predictor Pro",
    username: "@predictor_pro",
    level: 12,
    experience: 2450,
    nextLevelExp: 3000,
    totalBets: 156,
    wonBets: 89,
    winRate: 57,
    totalEarnings: "12,500 CHZ",
    currentBalance: "3,200 CHZ",
    globalRank: 42,
    countryRank: 8,
    badges: [
      { name: "Master Predictor", icon: "🏆", description: "50+ correct predictions" },
      { name: "Golden Streak", icon: "🔥", description: "10 consecutive predictions" },
      { name: "Mexico Fan", icon: "🇲🇽", description: "Supported Mexico 20 times" },
      { name: "Early Adopter", icon: "⭐", description: "First hour user" }
    ]
  };

  const betHistory = [
    {
      id: 1,
      match: "Mexico vs Argentina",
      prediction: "Mexico wins",
      amount: "100 CHZ",
      odds: "2.8x",
      result: "Won",
      profit: "+180 CHZ",
      date: "15 Jun 2026",
      status: "won"
    },
    {
      id: 2,
      match: "Brazil vs Spain",
      prediction: "Draw",
      amount: "150 CHZ",
      odds: "3.0x",
      result: "Lost",
      profit: "-150 CHZ",
      date: "14 Jun 2026",
      status: "lost"
    },
    {
      id: 3,
      match: "France vs Germany",
      prediction: "France wins",
      amount: "200 CHZ",
      odds: "2.6x",
      result: "Ganada",
      profit: "+320 CHZ",
      date: "13 Jun 2026",
      status: "won"
    },
    {
      id: 4,
      match: "England vs Italy",
      prediction: "Over 2.5 goals",
      amount: "75 CHZ",
      odds: "1.9x",
      result: "Pending",
      profit: "--",
      date: "16 Jun 2026",
      status: "pending"
    }
  ];

  const globalRanking = [
    { rank: 1, name: "Mundial King", country: "🇧🇷", winRate: 89, earnings: "45,200 CHZ" },
    { rank: 2, name: "Predictor Elite", country: "🇦🇷", winRate: 86, earnings: "38,900 CHZ" },
    { rank: 3, name: "Football Oracle", country: "🇪🇸", winRate: 84, earnings: "35,100 CHZ" },
    { rank: 4, name: "Goal Prophet", country: "🇫🇷", winRate: 82, earnings: "32,800 CHZ" },
    { rank: 42, name: "Predictor Pro (You)", country: "🇲🇽", winRate: 57, earnings: "12,500 CHZ", isCurrentUser: true }
  ];

  return (
    <div className="min-h-screen bg-background pb-32 md:pb-0">
      <Navbar />
      
      <div className="pt-20 pb-10 px-4">
        <div className="container mx-auto">
          {/* Profile Header */}
          <Card className="p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
              <div className="flex items-center space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                    PP
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h1 className="text-3xl font-bold">{userStats.name}</h1>
                  <p className="text-muted-foreground text-lg">{userStats.username}</p>
                  
                  <div className="flex items-center space-x-4 mt-4">
                    <Badge className="bg-secondary text-secondary-foreground">
                      <Star className="h-4 w-4 mr-1" />
                      Level {userStats.level}
                    </Badge>
                    <Badge variant="outline">
                      <Trophy className="h-4 w-4 mr-1" />
                      Top {userStats.globalRank} Global
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Experience</span>
                    <span>{userStats.experience} / {userStats.nextLevelExp} XP</span>
                  </div>
                  <Progress value={(userStats.experience / userStats.nextLevelExp) * 100} className="h-3" />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{userStats.winRate}%</p>
                    <p className="text-sm text-muted-foreground">Win Rate</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-secondary">{userStats.totalBets}</p>
                    <p className="text-sm text-muted-foreground">Predictions</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-accent">{userStats.totalEarnings}</p>
                    <p className="text-sm text-muted-foreground">Total Earnings</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{userStats.currentBalance}</p>
                    <p className="text-sm text-muted-foreground">Current Balance</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="estadisticas" className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Statistics</span>
              </TabsTrigger>
              <TabsTrigger value="historial" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>History</span>
              </TabsTrigger>
              <TabsTrigger value="ranking" className="flex items-center space-x-2">
                <Medal className="h-4 w-4" />
                <span>Ranking</span>
              </TabsTrigger>
              <TabsTrigger value="logros" className="flex items-center space-x-2">
                <Award className="h-4 w-4" />
                <span>Achievements</span>
              </TabsTrigger>
            </TabsList>

            {/* Statistics */}
            <TabsContent value="estadisticas" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Betting Summary</h3>
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-semibold">{userStats.totalBets}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Won:</span>
                      <span className="font-semibold text-primary">{userStats.wonBets}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lost:</span>
                      <span className="font-semibold text-destructive">{userStats.totalBets - userStats.wonBets}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Performance</h3>
                    <TrendingUp className="h-5 w-5 text-secondary" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current streak:</span>
                      <span className="font-semibold text-primary">+3</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Best streak:</span>
                      <span className="font-semibold">+12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ROI:</span>
                      <span className="font-semibold text-primary">+24.5%</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Position</h3>
                    <Trophy className="h-5 w-5 text-secondary" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Global:</span>
                      <span className="font-semibold">#{userStats.globalRank}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Country:</span>
                      <span className="font-semibold">#{userStats.countryRank}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">League:</span>
                      <span className="font-semibold text-secondary">Gold</span>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Bet History */}
            <TabsContent value="historial" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-6">Betting History</h3>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Match</TableHead>
                      <TableHead>Prediction</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Odds</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Profit</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {betHistory.map((bet) => (
                      <TableRow key={bet.id}>
                        <TableCell className="font-medium">{bet.match}</TableCell>
                        <TableCell>{bet.prediction}</TableCell>
                        <TableCell>{bet.amount}</TableCell>
                        <TableCell>{bet.odds}</TableCell>
                        <TableCell>
                          <Badge className={
                            bet.status === 'won' ? 'bg-primary text-primary-foreground' :
                            bet.status === 'lost' ? 'bg-destructive text-destructive-foreground' :
                            'bg-secondary text-secondary-foreground'
                          }>
                            {bet.result}
                          </Badge>
                        </TableCell>
                        <TableCell className={
                          bet.status === 'won' ? 'text-primary font-semibold' :
                          bet.status === 'lost' ? 'text-destructive font-semibold' :
                          'text-muted-foreground'
                        }>
                          {bet.profit}
                        </TableCell>
                        <TableCell>{bet.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <div className="text-center mt-6">
                  <Button variant="outline">Load More</Button>
                </div>
              </Card>
            </TabsContent>

            {/* Ranking */}
            <TabsContent value="ranking" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <Medal className="h-6 w-6 mr-2 text-secondary" />
                  World Ranking
                </h3>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">#</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>País</TableHead>
                      <TableHead className="text-center">Win Rate</TableHead>
                      <TableHead className="text-right">Earnings</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {globalRanking.map((user) => (
                      <TableRow key={user.rank} className={user.isCurrentUser ? 'bg-primary/10 border-primary' : ''}>
                        <TableCell>
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                            user.rank === 1 ? 'bg-yellow-500 text-yellow-900' :
                            user.rank === 2 ? 'bg-gray-400 text-gray-900' :
                            user.rank === 3 ? 'bg-amber-600 text-amber-100' :
                            user.isCurrentUser ? 'bg-primary text-primary-foreground' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {user.rank}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {user.name}
                          {user.isCurrentUser && <span className="ml-2 text-primary">(You)</span>}
                        </TableCell>
                        <TableCell>
                          <span className="text-2xl">{user.country}</span>
                        </TableCell>
                        <TableCell className="text-center font-semibold">{user.winRate}%</TableCell>
                        <TableCell className="text-right font-semibold text-secondary">{user.earnings}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            {/* Achievements */}
            <TabsContent value="logros" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userStats.badges.map((badge, index) => (
                  <Card key={index} className="p-6 text-center">
                    <div className="text-6xl mb-4">{badge.icon}</div>
                    <h3 className="text-lg font-bold mb-2">{badge.name}</h3>
                    <p className="text-sm text-muted-foreground">{badge.description}</p>
                  </Card>
                ))}
                
                {/* Locked Achievements */}
                <Card className="p-6 text-center opacity-50 border-dashed">
                  <div className="text-6xl mb-4">🔒</div>
                  <h3 className="text-lg font-bold mb-2">CHZ Millionaire</h3>
                  <p className="text-sm text-muted-foreground">Earn 1,000,000 CHZ in total</p>
                  <Progress value={12.5} className="mt-4" />
                  <p className="text-xs text-muted-foreground mt-2">125,000 / 1,000,000 CHZ</p>
                </Card>
                
                <Card className="p-6 text-center opacity-50 border-dashed">
                  <div className="text-6xl mb-4">🔒</div>
                  <h3 className="text-lg font-bold mb-2">Centurion</h3>
                  <p className="text-sm text-muted-foreground">Win 100 consecutive predictions</p>
                  <Progress value={3} className="mt-4" />
                  <p className="text-xs text-muted-foreground mt-2">3 / 100 consecutive</p>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Perfil;