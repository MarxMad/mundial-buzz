import { Button } from "@/components/ui/button";
import { Trophy, Menu, User, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { DynamicWidget } from '@dynamic-labs/sdk-react-core';
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useDynamicContext();
  const isAuthenticated = !!user;
  
  // Placeholder values - these would be replaced with actual Dynamic integration
  const isOnChilizNetwork = true;
  const isOnTestnet = true;
  const networkName = "Chiliz Spicy";
  const balance = "0.00 CHZ";

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-secondary" />
            <span className="text-xl font-bold gradient-hero bg-clip-text text-transparent">
              MundialPredict
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/partidos" className="text-foreground hover:text-primary transition-colors">
              Partidos
            </a>
            <a href="/mercados" className="text-foreground hover:text-primary transition-colors">
              Mercados
            </a>
            <a href="/perfil" className="text-foreground hover:text-primary transition-colors">
              Mi Perfil
            </a>
            <a href="/comunidad" className="text-foreground hover:text-primary transition-colors">
              Comunidad
            </a>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && (
              <>
                {!isOnChilizNetwork && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                      // TODO: Implement network switching with Dynamic
                      console.log('Switch to Chiliz network');
                    }}
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Cambiar a Chiliz
                  </Button>
                )}
                {isOnChilizNetwork && (
                  <div className="flex items-center space-x-2">
                    <Badge variant={isOnTestnet ? "secondary" : "default"}>
                      {isOnTestnet ? "Testnet" : "Mainnet"}
                    </Badge>
                    <span className="text-sm font-medium">
                      {/* TODO: Get balance from Dynamic */}
                      0.00 CHZ
                    </span>
                  </div>
                )}
                <Button variant="outline" size="sm" asChild>
                  <a href="/perfil">
                    <User className="mr-2 h-4 w-4" />
                    {user?.email || user?.alias || 'Usuario'}
                  </a>
                </Button>
              </>
            )}
            <div className="dynamic-widget-container">
              <DynamicWidget />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="outline"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border">
            <div className="flex flex-col space-y-4 pt-4">
              <a href="/partidos" className="text-foreground hover:text-primary transition-colors">
                Partidos
              </a>
              <a href="/mercados" className="text-foreground hover:text-primary transition-colors">
                Mercados
              </a>
              <a href="/perfil" className="text-foreground hover:text-primary transition-colors">
                Mi Perfil
              </a>
              <a href="/comunidad" className="text-foreground hover:text-primary transition-colors">
                Comunidad
              </a>
              <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                {isAuthenticated && (
                  <Button variant="outline" size="sm" asChild>
                    <a href="/perfil">
                      <User className="mr-2 h-4 w-4" />
                      Perfil
                    </a>
                  </Button>
                )}
                <div className="dynamic-widget-container">
                  <DynamicWidget />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;