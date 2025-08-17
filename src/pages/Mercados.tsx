import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Vote, Clock, TrendingUp, Users, ThumbsUp, ThumbsDown, AlertCircle, Lock, ExternalLink } from "lucide-react";
import { useGeminiWallet } from "@/hooks/useGeminiWallet";
import { Link } from "react-router-dom";
import { chilizSpicy } from "@/lib/chains";

const Mercados = () => {
  const { address, isConnected, chainId, isOnCorrectNetwork, chilizSpicy } = useGeminiWallet()
  const [activeTab, setActiveTab] = useState("activos");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Estado simulado de staking (se conectará con el contrato después)
  const [userStaking, setUserStaking] = useState({
    stakedAmount: '0',
    tier: 'None'
  })
  
  // Verificar si el usuario puede crear mercados
  const canCreateMarket = parseFloat(userStaking.stakedAmount) >= 100

  const activeMarkets = [
    {
      id: 1,
      title: "Mexico vs Argentina - Final Result",
      description: "Who will win the Mexico vs Argentina match?",
      creator: "Predictor Pro",
      timeLeft: "2h 30m",
      totalPool: "2,500 CHZ",
      participants: 156,
      options: [
        { name: "Mexico wins", votes: 45, percentage: 45 },
        { name: "Draw", votes: 25, percentage: 25 },
        { name: "Argentina wins", votes: 86, percentage: 55 }
      ],
      status: "voting"
    },
    {
      id: 2,
      title: "Brazil vs Spain - Exact Score",
      description: "Predict the exact score of the Brazil vs Spain match",
      creator: "Futbol Genius",
      timeLeft: "5h 15m",
      totalPool: "1,800 CHZ",
      participants: 89,
      options: [
        { name: "2-1 Brazil", votes: 34, percentage: 38 },
        { name: "1-1 Draw", votes: 28, percentage: 31 },
        { name: "1-2 Spain", votes: 27, percentage: 31 }
      ],
      status: "voting"
    }
  ];

  const proposedMarkets = [
    {
      id: 3,
      title: "France vs Germany - First Goal",
      description: "Which team will score the first goal of the match?",
      creator: "Mundial Expert",
      timeLeft: "18h 45m",
      requiredVotes: 100,
      currentVotes: 67,
      options: [
        { name: "France", votes: 42, percentage: 63 },
        { name: "Germany", votes: 25, percentage: 37 }
      ],
      status: "proposal"
    }
  ];

  const myProposals = [
    {
      id: 4,
      title: "England vs Italy - Total Goals",
      description: "How many goals will there be in total in the match?",
      timeLeft: "12h 20m",
      currentVotes: 23,
      requiredVotes: 100,
      status: "pending",
      myVote: "Over 2.5 goals"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="pt-20 pb-10 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  <span className="gradient-hero bg-clip-text text-transparent">
                    Prediction Markets
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                  Create and vote for sports predictions. The most voted ones are published on the dashboard.
                </p>
              </div>
              
              {!isConnected ? (
                <div className="bg-red-900/20 border border-red-600 rounded-lg p-4 mt-4 md:mt-0">
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Conecta tu wallet para crear mercados</span>
                  </div>
                </div>
              ) : !isOnCorrectNetwork(chilizSpicy.id) ? (
                <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4 mt-4 md:mt-0">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Cambia a Chiliz Spicy Testnet</span>
                  </div>
                </div>
              ) : !canCreateMarket ? (
                <div className="bg-orange-900/20 border border-orange-600 rounded-lg p-4 mt-4 md:mt-0">
                  <div className="flex items-center gap-2 text-orange-400">
                    <Lock className="h-4 w-4" />
                    <span className="text-sm">Necesitas hacer staking de 100+ CHZ</span>
                    <Link to="/staking" className="text-orange-300 hover:text-orange-200 underline">
                      Ir a Staking
                    </Link>
                  </div>
                </div>
              ) : (
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="btn-trophy mt-4 md:mt-0">
                      <PlusCircle className="mr-2 h-5 w-5" />
                      Create Market
                    </Button>
                  </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Prediction</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="match">Match</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a match" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mex-arg">Mexico vs Argentina</SelectItem>
                          <SelectItem value="bra-esp">Brazil vs Spain</SelectItem>
                          <SelectItem value="fra-ale">France vs Germany</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="title">Prediction Title</Label>
                      <Input 
                        id="title"
                        placeholder="e.g: Who will score the first goal?"
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description"
                        placeholder="Describe your prediction in detail..."
                        className="mt-2"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label>Prediction Options</Label>
                      <div className="space-y-2 mt-2">
                        <Input placeholder="Option 1" />
                        <Input placeholder="Option 2" />
                        <Button variant="outline" size="sm" className="w-full">
                          + Add Option
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex space-x-4">
                      <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button className="btn-hero flex-1">
                        Create Proposal
                      </Button>
                    </div>
                  </div>
                </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="activos" className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Active Markets</span>
              </TabsTrigger>
              <TabsTrigger value="propuestas" className="flex items-center space-x-2">
                <Vote className="h-4 w-4" />
                <span>Proposals</span>
              </TabsTrigger>
              <TabsTrigger value="mis-propuestas" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>My Proposals</span>
              </TabsTrigger>
            </TabsList>

            {/* Active Markets */}
            <TabsContent value="activos" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeMarkets.map((market) => (
                  <Card key={market.id} className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold mb-2">{market.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{market.description}</p>
                        <p className="text-xs text-muted-foreground">Por: {market.creator}</p>
                      </div>
                      <Badge className="bg-primary text-primary-foreground">
                        Active
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-muted-foreground">Total Pool</p>
                        <p className="font-bold text-secondary">{market.totalPool}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Participants</p>
                        <p className="font-bold">{market.participants}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Time</p>
                        <p className="font-bold text-destructive">{market.timeLeft}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {market.options.map((option, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{option.name}</span>
                            <span className="font-semibold">{option.votes} votes ({option.percentage}%)</span>
                          </div>
                          <Progress value={option.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                    
                    <Button className="w-full btn-hero">
                      Make Prediction
                    </Button>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Proposed Markets */}
            <TabsContent value="propuestas" className="space-y-6">
              <Card className="p-4 border-secondary bg-secondary/10">
                <div className="flex items-center space-x-2 text-secondary">
                  <AlertCircle className="h-5 w-5" />
                  <p className="text-sm font-medium">
                    Proposals need 100 votes and qualified majority (60%+) to be activated
                  </p>
                </div>
              </Card>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {proposedMarkets.map((market) => (
                  <Card key={market.id} className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold mb-2">{market.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{market.description}</p>
                        <p className="text-xs text-muted-foreground">Por: {market.creator}</p>
                      </div>
                      <Badge variant="outline" className="border-secondary text-secondary">
                        Proposal
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Voting Progress</span>
                        <span className="font-semibold">{market.currentVotes}/{market.requiredVotes} votes</span>
                      </div>
                      <Progress value={(market.currentVotes / market.requiredVotes) * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground">Time remaining: {market.timeLeft}</p>
                    </div>
                    
                    <div className="space-y-3">
                      {market.options.map((option, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="text-sm">{option.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold">{option.percentage}%</span>
                            <div className="flex space-x-1">
                              <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                <ThumbsUp className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                <ThumbsDown className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* My Proposals */}
            <TabsContent value="mis-propuestas" className="space-y-6">
              {myProposals.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {myProposals.map((market) => (
                    <Card key={market.id} className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold mb-2">{market.title}</h3>
                          <p className="text-sm text-muted-foreground mb-4">{market.description}</p>
                        </div>
                        <Badge variant="outline" className="border-muted">
                          Pending
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-semibold">{market.currentVotes}/{market.requiredVotes} votes</span>
                        </div>
                        <Progress value={(market.currentVotes / market.requiredVotes) * 100} className="h-2" />
                        <p className="text-xs text-muted-foreground">Time remaining: {market.timeLeft}</p>
                      </div>
                      
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">My vote:</p>
                        <p className="font-semibold">{market.myVote}</p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          Share
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <Vote className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">You have no proposals</h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first market proposal so other users can vote on it
                  </p>
                  <Button className="btn-trophy" onClick={() => setIsCreateModalOpen(true)}>
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Create My First Proposal
                  </Button>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Mercados;