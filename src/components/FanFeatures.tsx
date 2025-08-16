import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Gamepad2, 
  Coins, 
  Brain, 
  Users, 
  Trophy, 
  Target, 
  Sparkles, 
  TrendingUp,
  Heart,
  Globe,
  Zap,
  Star
} from "lucide-react";

const FanFeatures = () => {
  const features = [
    {
      icon: <Gamepad2 className="h-8 w-8" />,
      title: "Fan-First Gaming",
      description: "Immersive prediction markets, fantasy leagues, and achievement systems designed for passionate football fans.",
      highlights: ["Real-time Prediction Markets", "Fantasy Team Management", "Achievement NFTs", "Global Leaderboards"],
      color: "text-sports-orange",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20"
    },
    {
      icon: <Coins className="h-8 w-8" />,
      title: "Tokenized Assets",
      description: "Own, trade, and collect unique digital assets that represent real football value and fan experiences.",
      highlights: ["Fan Tokens", "Player Cards NFTs", "Stadium Experiences", "Merchandise Rights"],
      color: "text-sports-yellow",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20"
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI-Powered Tools",
      description: "Advanced analytics and intelligent recommendations to enhance your football prediction experience.",
      highlights: ["Smart Predictions", "Performance Analytics", "Market Intelligence", "Personalized Content"],
      color: "text-sports-blue",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Social Platform",
      description: "Connect with millions of fans worldwide, share insights, and build lasting football communities.",
      highlights: ["Fan Communities", "Live Commentary", "Content Creation", "Social Trading"],
      color: "text-sports-green",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20"
    }
  ];

  const impactMetrics = [
    {
      icon: <Globe className="h-6 w-6" />,
      value: "10M+",
      label: "Target Active Fans",
      description: "Building the world's largest football fan community"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      value: "$100M+",
      label: "Daily Token Volume",
      description: "Sustainable economic ecosystem for fans"
    },
    {
      icon: <Heart className="h-6 w-6" />,
      value: "50+",
      label: "Team Partnerships",
      description: "Official collaborations with major clubs"
    },
    {
      icon: <Star className="h-6 w-6" />,
      value: "2026",
      label: "World Cup Impact",
      description: "Ready for the biggest football event"
    }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-slate-900/50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-sports-orange/20 text-sports-orange border-sports-orange/30">
            <Zap className="h-4 w-4 mr-2" />
            Fan Empowerment Platform
          </Badge>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 text-white">
            Built for <span className="text-sports-orange">Passionate</span> Fans
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Mundial Buzz combines cutting-edge blockchain technology with fan-first design to create 
            the ultimate football experience. Every feature is designed to empower fans and amplify their voice.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className={`${feature.bgColor} ${feature.borderColor} border-2 hover:border-opacity-50 transition-all duration-300 group hover:scale-105`}
            >
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`${feature.color} p-3 rounded-xl bg-white/10`}>
                    {feature.icon}
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-white">
                      {feature.title}
                    </CardTitle>
                  </div>
                </div>
                <CardDescription className="text-gray-300 text-lg leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {feature.highlights.map((highlight, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-2 text-sm text-gray-400 group-hover:text-gray-300 transition-colors"
                    >
                      <Target className="h-4 w-4 text-sports-orange" />
                      {highlight}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Impact Metrics */}
        <div className="text-center mb-12">
          <h3 className="font-display text-3xl font-bold text-white mb-4">
            Our <span className="text-sports-yellow">2026 Vision</span>
          </h3>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Ambitious goals that will transform how millions of fans experience football
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {impactMetrics.map((metric, index) => (
            <Card 
              key={index} 
              className="bg-card-gradient border border-white/10 hover:border-sports-orange/30 transition-all duration-300 group text-center"
            >
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-sports-orange/20 text-sports-orange group-hover:bg-sports-orange/30 transition-colors">
                    {metric.icon}
                  </div>
                </div>
                <div className="font-display text-3xl font-bold text-white mb-2 group-hover:text-sports-orange transition-colors">
                  {metric.value}
                </div>
                <div className="font-sports text-sports-yellow font-semibold mb-2">
                  {metric.label}
                </div>
                <div className="text-sm text-gray-400 leading-relaxed">
                  {metric.description}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-sports-orange/20 to-sports-yellow/20 rounded-2xl p-8 border border-sports-orange/30">
            <Trophy className="h-12 w-12 text-sports-orange mx-auto mb-4" />
            <h3 className="font-display text-2xl font-bold text-white mb-4">
              Ready to Shape the Future of Football?
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Join the revolution that puts fans first. Connect your wallet and become part of 
              the community that's building the next generation of sports engagement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/mercados" 
                className="inline-flex items-center px-8 py-3 bg-action-gradient hover:shadow-premium font-sports font-bold text-white rounded-lg transition-all duration-300 hover:scale-105"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Start Predicting
              </a>
              <a 
                href="/comunidad" 
                className="inline-flex items-center px-8 py-3 border-2 border-sports-orange text-sports-orange hover:bg-sports-orange hover:text-white font-sports font-bold rounded-lg transition-all duration-300"
              >
                <Users className="mr-2 h-5 w-5" />
                Join Community
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FanFeatures;