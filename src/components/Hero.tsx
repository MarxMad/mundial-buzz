import { Button } from "@/components/ui/button";
import { Eye, Trophy, AlertCircle } from "lucide-react";
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { DynamicWidget } from '@dynamic-labs/sdk-react-core';
import heroStadium from "@/assets/hero-stadium.jpg";

const Hero = () => {
  const { user } = useDynamicContext();
  const isConnected = !!user;

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroStadium})` }}
      >
        <div className="absolute inset-0 bg-black/60" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="animate-bounce-in">
          <Trophy className="mx-auto mb-6 w-16 h-16 text-secondary animate-glow" />
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
            <span className="gradient-hero bg-clip-text text-transparent">
              MundialPredict
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto">
            Predice, gana y vibra con el Mundial FIFA 2026
          </p>
          
          <p className="text-lg mb-12 text-gray-300 max-w-xl mx-auto">
            El primer mercado de predicciones deportivas on-chain del Mundial. 
            Conecta tu wallet y comienza a predecir los resultados.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-float">
          {!isConnected ? (
             <>
               <DynamicWidget />
              
              <Button variant="outline" className="px-8 py-6 text-lg border-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground" asChild>
                <a href="/partidos">
                  <Eye className="mr-2 h-5 w-5" />
                  Explorar como Invitado
                </a>
              </Button>
            </>
          ) : (
            <>
              <Button className="btn-hero px-8 py-6 text-lg" asChild>
                <a href="/mercados">
                  <Trophy className="mr-2 h-5 w-5" />
                  Comenzar a Predecir
                </a>
              </Button>
              
              <Button variant="outline" className="px-8 py-6 text-lg border-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground" asChild>
                <a href="/perfil">
                  <Eye className="mr-2 h-5 w-5" />
                  Ver Mi Perfil
                </a>
              </Button>
            </>
          )}
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="animate-bounce-in" style={{ animationDelay: '0.2s' }}>
            <div className="text-3xl font-bold text-secondary mb-2">$2.5M+</div>
            <div className="text-gray-300">En predicciones activas</div>
          </div>
          
          <div className="animate-bounce-in" style={{ animationDelay: '0.4s' }}>
            <div className="text-3xl font-bold text-secondary mb-2">50K+</div>
            <div className="text-gray-300">Usuarios registrados</div>
          </div>
          
          <div className="animate-bounce-in" style={{ animationDelay: '0.6s' }}>
            <div className="text-3xl font-bold text-secondary mb-2">96%</div>
            <div className="text-gray-300">Precisión de oráculos</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;