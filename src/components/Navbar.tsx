import { Button } from "@/components/ui/button";
import { Trophy, Menu, Wallet, User } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            <Button variant="outline" size="sm">
              <User className="mr-2 h-4 w-4" />
              Perfil
            </Button>
            <Button className="btn-hero">
              <Wallet className="mr-2 h-4 w-4" />
              Conectar Wallet
            </Button>
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
                <Button variant="outline" size="sm">
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </Button>
                <Button className="btn-hero">
                  <Wallet className="mr-2 h-4 w-4" />
                  Conectar Wallet
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;