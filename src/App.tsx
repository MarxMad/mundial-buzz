import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Web3Provider from "@/components/Web3Provider";
import MobileNavigation from "@/components/MobileNavigation";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Partidos from "./pages/Partidos";
import Mercados from "./pages/Mercados";
import Perfil from "./pages/Perfil";
import Comunidad from "./pages/Comunidad";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const showMobileNav = ['/', '/partidos', '/comunidad', '/mercados', '/perfil'].includes(location.pathname);

  return (
    <div className="relative">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/partidos" element={<Partidos />} />
        <Route path="/mercados" element={<Mercados />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/comunidad" element={<Comunidad />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {showMobileNav && <MobileNavigation />}
    </div>
  );
};

const App = () => (
  <Web3Provider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Web3Provider>
);

export default App;
