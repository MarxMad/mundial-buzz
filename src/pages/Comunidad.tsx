import { useState } from "react";
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
      content: "Incredible atmosphere at the Azteca! Mexico vs Argentina, historic match. The energy of the fans is indescribable 🔥⚽",
      image: "/placeholder-stadium.jpg",
      location: "Azteca Stadium, Mexico City",
      match: "Mexico vs Argentina",
      timestamp: "2h ago",
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
      content: "Pre-match at MetLife Stadium. Brazil comes with everything, but Spain doesn't stay behind. Who do you think will win? 🤔",
      image: "/placeholder-stadium2.jpg",
      location: "MetLife Stadium, New Jersey",
      match: "Brazil vs Spain",
      timestamp: "4h ago",
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
      content: "The Argentine fans prepare for the most important match. Rosario in the soul, World Cup in the heart 💙🤍💙",
      image: "/placeholder-fans.jpg",
      location: "Buenos Aires, Argentina",
      match: "Argentina Concentration",
      timestamp: "6h ago",
      likes: 312,
      comments: 45,
      shares: 23,
      liked: false
    }
  ];

  const trendingEvents = [
    {
      name: "Mexico vs Argentina",
      location: "Azteca Stadium",
      date: "15 Jun 2026",
      attendees: 1245,
      posts: 89
    },
    {
      name: "Brazil vs Spain",
      location: "MetLife Stadium",
      date: "16 Jun 2026",
      attendees: 967,
      posts: 67
    },
    {
      name: "Mexico City Fan Fest",
      location: "Zócalo CDMX",
      date: "All month",
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
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="pt-20 pb-10 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  <span className="gradient-hero bg-clip-text text-transparent">
                    World Community
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                  Share your match experiences and connect with other football fans
                </p>
              </div>
              
              <Dialog open={isPostModalOpen} onOpenChange={setIsPostModalOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-trophy mt-4 md:mt-0">
                    <Camera className="mr-2 h-5 w-5" />
                    Upload Photo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Share Experience</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <ImagePlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium mb-2">Upload a match photo</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Share the stadium atmosphere with the community
                      </p>
                      <Button variant="outline">
                        Select Image
                      </Button>
                    </div>
                    
                    <div>
                      <Label htmlFor="caption">Description</Label>
                      <Textarea 
                        id="caption"
                        placeholder="Tell us about your match experience..."
                        className="mt-2"
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="match">Match</Label>
                        <Input 
                          id="match"
                          placeholder="e.g: Mexico vs Argentina"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input 
                          id="location"
                          placeholder="e.g: Azteca Stadium"
                          className="mt-2"
                        />
                      </div>
                    </div>
                    
                    <div className="flex space-x-4">
                      <Button variant="outline" onClick={() => setIsPostModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button className="btn-hero flex-1">
                        <Send className="mr-2 h-4 w-4" />
                        Post
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
                    <span>Main Feed</span>
                  </TabsTrigger>
                  <TabsTrigger value="eventos" className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Events</span>
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
                      Load More Posts
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
                            <p className="text-muted-foreground">Attendees</p>
                            <p className="font-bold text-primary">{event.attendees.toLocaleString()}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-muted-foreground">Posts</p>
                            <p className="font-bold text-secondary">{event.posts}</p>
                          </div>
                        </div>
                        
                        <Button className="w-full btn-hero">
                          View Event
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
                  Top Contributors
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
                          {user.posts} posts • {user.followers} followers
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" size="sm" className="w-full mt-4">
                  View Full Ranking
                </Button>
              </Card>

              {/* Quick Stats */}
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Today's Statistics</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">New photos:</span>
                    <span className="font-semibold">234</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active users:</span>
                    <span className="font-semibold">1,567</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Live events:</span>
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