import { useState } from "react";
import Navbar from "@/components/Navbar";
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
import { PlusCircle, Vote, Clock, TrendingUp, Users, ThumbsUp, ThumbsDown, AlertCircle } from "lucide-react";

const Mercados = () => {
  const [activeTab, setActiveTab] = useState("activos");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const activeMarkets = [
    {
      id: 1,
      title: "México vs Argentina - Resultado Final",
      description: "¿Quién ganará el partido México vs Argentina?",
      creator: "Predictor Pro",
      timeLeft: "2h 30m",
      totalPool: "2,500 CHZ",
      participants: 156,
      options: [
        { name: "México gana", votes: 45, percentage: 45 },
        { name: "Empate", votes: 25, percentage: 25 },
        { name: "Argentina gana", votes: 86, percentage: 55 }
      ],
      status: "voting"
    },
    {
      id: 2,
      title: "Brasil vs España - Marcador Exacto",
      description: "Predice el marcador exacto del partido Brasil vs España",
      creator: "Futbol Genius",
      timeLeft: "5h 15m",
      totalPool: "1,800 CHZ",
      participants: 89,
      options: [
        { name: "2-1 Brasil", votes: 34, percentage: 38 },
        { name: "1-1 Empate", votes: 28, percentage: 31 },
        { name: "1-2 España", votes: 27, percentage: 31 }
      ],
      status: "voting"
    }
  ];

  const proposedMarkets = [
    {
      id: 3,
      title: "Francia vs Alemania - Primer Gol",
      description: "¿Qué equipo anotará el primer gol del partido?",
      creator: "Mundial Expert",
      timeLeft: "18h 45m",
      requiredVotes: 100,
      currentVotes: 67,
      options: [
        { name: "Francia", votes: 42, percentage: 63 },
        { name: "Alemania", votes: 25, percentage: 37 }
      ],
      status: "proposal"
    }
  ];

  const myProposals = [
    {
      id: 4,
      title: "Inglaterra vs Italia - Total de Goles",
      description: "¿Cuántos goles habrá en total en el partido?",
      timeLeft: "12h 20m",
      currentVotes: 23,
      requiredVotes: 100,
      status: "pending",
      myVote: "Más de 2.5 goles"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 pb-10 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  <span className="gradient-hero bg-clip-text text-transparent">
                    Mercados de Predicciones
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                  Crea y vota por predicciones deportivas. Las más votadas se publican en el dashboard.
                </p>
              </div>
              
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-trophy mt-4 md:mt-0">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Crear Mercado
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Crear Nueva Predicción</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="match">Partido</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un partido" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mex-arg">México vs Argentina</SelectItem>
                          <SelectItem value="bra-esp">Brasil vs España</SelectItem>
                          <SelectItem value="fra-ale">Francia vs Alemania</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="title">Título de la Predicción</Label>
                      <Input 
                        id="title"
                        placeholder="Ej: ¿Quién anotará el primer gol?"
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea 
                        id="description"
                        placeholder="Describe tu predicción en detalle..."
                        className="mt-2"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label>Opciones de Predicción</Label>
                      <div className="space-y-2 mt-2">
                        <Input placeholder="Opción 1" />
                        <Input placeholder="Opción 2" />
                        <Button variant="outline" size="sm" className="w-full">
                          + Agregar Opción
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex space-x-4">
                      <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                        Cancelar
                      </Button>
                      <Button className="btn-hero flex-1">
                        Crear Propuesta
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="activos" className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Mercados Activos</span>
              </TabsTrigger>
              <TabsTrigger value="propuestas" className="flex items-center space-x-2">
                <Vote className="h-4 w-4" />
                <span>Propuestas</span>
              </TabsTrigger>
              <TabsTrigger value="mis-propuestas" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Mis Propuestas</span>
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
                        Activo
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-muted-foreground">Pool Total</p>
                        <p className="font-bold text-secondary">{market.totalPool}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Participantes</p>
                        <p className="font-bold">{market.participants}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Tiempo</p>
                        <p className="font-bold text-destructive">{market.timeLeft}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {market.options.map((option, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{option.name}</span>
                            <span className="font-semibold">{option.votes} votos ({option.percentage}%)</span>
                          </div>
                          <Progress value={option.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                    
                    <Button className="w-full btn-hero">
                      Hacer Predicción
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
                    Las propuestas necesitan 100 votos y mayoría calificada (60%+) para activarse
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
                        Propuesta
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progreso de Votación</span>
                        <span className="font-semibold">{market.currentVotes}/{market.requiredVotes} votos</span>
                      </div>
                      <Progress value={(market.currentVotes / market.requiredVotes) * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground">Tiempo restante: {market.timeLeft}</p>
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
                          Pendiente
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progreso</span>
                          <span className="font-semibold">{market.currentVotes}/{market.requiredVotes} votos</span>
                        </div>
                        <Progress value={(market.currentVotes / market.requiredVotes) * 100} className="h-2" />
                        <p className="text-xs text-muted-foreground">Tiempo restante: {market.timeLeft}</p>
                      </div>
                      
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Mi voto:</p>
                        <p className="font-semibold">{market.myVote}</p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          Editar
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          Compartir
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <Vote className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No tienes propuestas</h3>
                  <p className="text-muted-foreground mb-6">
                    Crea tu primera propuesta de mercado para que otros usuarios puedan votarla
                  </p>
                  <Button className="btn-trophy" onClick={() => setIsCreateModalOpen(true)}>
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Crear Mi Primera Propuesta
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