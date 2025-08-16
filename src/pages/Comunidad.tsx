import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, MessageCircle, Share2, Camera, MapPin, Users, Calendar, Flame, ImagePlus, Send } from "lucide-react";

const Comunidad = () => {
  const [activeTab, setActiveTab] = useState("feed");
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const posts = [
    {
      id: 1,
      user: {
        name: "Carlos Fanático",
        username: "@carlosfan",
        avatar: "/placeholder-avatar.jpg",
        country: "🇲🇽"
      },
      content: "¡Increíble ambiente en el Azteca! México vs Argentina, partido histórico. La energía de la afición es indescriptible 🔥⚽",
      image: "/placeholder-stadium.jpg",
      location: "Estadio Azteca, Ciudad de México",
      match: "México vs Argentina",
      timestamp: "hace 2h",
      likes: 245,
      comments: 18,
      shares: 12,
      liked: false
    },
    {
      id: 2,
      user: {
        name: "Ana Prediction",
        username: "@anapredicts",
        avatar: "/placeholder-avatar.jpg",
        country: "🇧🇷"
      },
      content: "Pre-partido en el MetLife Stadium. Brasil viene con todo, pero España no se queda atrás. ¿Quién creen que gane? 🤔",
      image: "/placeholder-stadium2.jpg",
      location: "MetLife Stadium, Nueva Jersey",
      match: "Brasil vs España",
      timestamp: "hace 4h",
      likes: 189,
      comments: 32,
      shares: 8,
      liked: true
    },
    {
      id: 3,
      user: {
        name: "Mundial Expert",
        username: "@mundialexpert",
        avatar: "/placeholder-avatar.jpg",
        country: "🇦🇷"
      },
      content: "La hinchada argentina se prepara para el partido más importante. Rosario en el alma, mundial en el corazón 💙🤍💙",
      image: "/placeholder-fans.jpg",
      location: "Buenos Aires, Argentina",
      match: "Concentración Argentina",
      timestamp: "hace 6h",
      likes: 312,
      comments: 45,
      shares: 23,
      liked: false
    }
  ];

  const trendingEvents = [
    {
      name: "México vs Argentina",
      location: "Estadio Azteca",
      date: "15 Jun 2026",
      attendees: 1245,
      posts: 89
    },
    {
      name: "Brasil vs España",
      location: "MetLife Stadium",
      date: "16 Jun 2026",
      attendees: 967,
      posts: 67
    },
    {
      name: "Fan Fest Ciudad de México",
      location: "Zócalo CDMX",
      date: "Todo el mes",
      attendees: 2890,
      posts: 234
    }
  ];

  const topUsers = [
    { name: "Football King", country: "🇧🇷", posts: 156, followers: "12.5K" },
    { name: "Predictor Elite", country: "🇦🇷", posts: 134, followers: "9.8K" },
    { name: "Stadium Hunter", country: "🇲🇽", posts: 98, followers: "7.2K" },
    { name: "Goal Seeker", country: "🇪🇸", posts: 87, followers: "6.1K" }
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
                    Comunidad Mundial
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                  Comparte tus experiencias en los partidos y conecta con otros fanáticos del fútbol
                </p>
              </div>
              
              <Dialog open={isPostModalOpen} onOpenChange={setIsPostModalOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-trophy mt-4 md:mt-0">
                    <Camera className="mr-2 h-5 w-5" />
                    Subir Foto
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Compartir Experiencia</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <ImagePlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium mb-2">Sube una foto del partido</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Comparte el ambiente del estadio con la comunidad
                      </p>
                      <Button variant="outline">
                        Seleccionar Imagen
                      </Button>
                    </div>
                    
                    <div>
                      <Label htmlFor="caption">Descripción</Label>
                      <Textarea 
                        id="caption"
                        placeholder="Cuéntanos sobre tu experiencia en el partido..."
                        className="mt-2"
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="match">Partido</Label>
                        <Input 
                          id="match"
                          placeholder="Ej: México vs Argentina"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Ubicación</Label>
                        <Input 
                          id="location"
                          placeholder="Ej: Estadio Azteca"
                          className="mt-2"
                        />
                      </div>
                    </div>
                    
                    <div className="flex space-x-4">
                      <Button variant="outline" onClick={() => setIsPostModalOpen(false)}>
                        Cancelar
                      </Button>
                      <Button className="btn-hero flex-1">
                        <Send className="mr-2 h-4 w-4" />
                        Publicar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="feed" className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Feed Principal</span>
                  </TabsTrigger>
                  <TabsTrigger value="eventos" className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Eventos</span>
                  </TabsTrigger>
                </TabsList>

                {/* Main Feed */}
                <TabsContent value="feed" className="space-y-6">
                  {posts.map((post) => (
                    <Card key={post.id} className="p-6">
                      {/* Post Header */}
                      <div className="flex items-start space-x-4 mb-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={post.user.avatar} />
                          <AvatarFallback>
                            {post.user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{post.user.name}</h3>
                            <span className="text-xl">{post.user.country}</span>
                            <span className="text-sm text-muted-foreground">{post.user.username}</span>
                            <span className="text-sm text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">{post.timestamp}</span>
                          </div>
                          
                          {post.match && (
                            <Badge variant="outline" className="mt-1">
                              {post.match}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Post Content */}
                      <p className="mb-4 text-foreground">{post.content}</p>
                      
                      {/* Post Image */}
                      {post.image && (
                        <div className="mb-4 rounded-lg overflow-hidden">
                          <img 
                            src={post.image} 
                            alt="Post image" 
                            className="w-full h-64 object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Location */}
                      {post.location && (
                        <div className="flex items-center space-x-2 mb-4 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{post.location}</span>
                        </div>
                      )}
                      
                      {/* Post Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center space-x-6">
                          <button className={`flex items-center space-x-2 text-sm hover:text-primary transition-colors ${
                            post.liked ? 'text-primary' : 'text-muted-foreground'
                          }`}>
                            <Heart className={`h-5 w-5 ${post.liked ? 'fill-current' : ''}`} />
                            <span>{post.likes}</span>
                          </button>
                          
                          <button className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                            <MessageCircle className="h-5 w-5" />
                            <span>{post.comments}</span>
                          </button>
                          
                          <button className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                            <Share2 className="h-5 w-5" />
                            <span>{post.shares}</span>
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                  
                  <div className="text-center">
                    <Button variant="outline" size="lg">
                      Cargar Más Publicaciones
                    </Button>
                  </div>
                </TabsContent>

                {/* Events */}
                <TabsContent value="eventos" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {trendingEvents.map((event, index) => (
                      <Card key={index} className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold mb-2">{event.name}</h3>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4" />
                                <span>{event.location}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>{event.date}</span>
                              </div>
                            </div>
                          </div>
                          <Badge className="bg-secondary text-secondary-foreground">
                            <Flame className="h-3 w-3 mr-1" />
                            Trending
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                          <div className="text-center">
                            <p className="text-muted-foreground">Asistentes</p>
                            <p className="font-bold text-primary">{event.attendees.toLocaleString()}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-muted-foreground">Posts</p>
                            <p className="font-bold text-secondary">{event.posts}</p>
                          </div>
                        </div>
                        
                        <Button className="w-full btn-hero">
                          Ver Evento
                        </Button>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Top Contributors */}
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  Top Contribuidores
                </h3>
                
                <div className="space-y-4">
                  {topUsers.map((user, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500 text-yellow-900' :
                        index === 1 ? 'bg-gray-400 text-gray-900' :
                        index === 2 ? 'bg-amber-600 text-amber-100' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-lg">{user.country}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user.posts} posts • {user.followers} seguidores
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" size="sm" className="w-full mt-4">
                  Ver Ranking Completo
                </Button>
              </Card>

              {/* Quick Stats */}
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Estadísticas de Hoy</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nuevas fotos:</span>
                    <span className="font-semibold">234</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Usuarios activos:</span>
                    <span className="font-semibold">1,567</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Eventos en vivo:</span>
                    <span className="font-semibold text-primary">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total interactions:</span>
                    <span className="font-semibold">8,945</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comunidad;