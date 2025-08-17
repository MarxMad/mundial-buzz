import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Users, TrendingUp, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const MobileNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      id: 'matches',
      label: 'Matches',
      icon: Calendar,
      path: '/partidos',
      color: 'text-primary'
    },
    {
      id: 'community',
      label: 'Community',
      icon: Users,
      path: '/comunidad',
      color: 'text-secondary'
    },
    {
      id: 'markets',
      label: 'Markets',
      icon: TrendingUp,
      path: '/mercados',
      color: 'text-accent'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/perfil',
      color: 'text-muted-foreground'
    }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 z-40 block shadow-lg min-h-[60px] md:min-h-[50px]">
      <div className="flex items-center justify-around py-1 px-2 md:py-1 md:px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={cn(
                "flex flex-col items-center justify-center p-1 md:p-2 rounded-lg transition-all duration-200 min-w-[50px] md:min-w-[60px] relative",
                isActive 
                  ? "bg-sports-orange/20 text-sports-orange" 
                  : "text-gray-400 hover:text-white hover:bg-slate-800/50"
              )}
            >
              <Icon 
                className={cn(
                  "h-5 w-5 md:h-6 md:w-6 mb-1 transition-all duration-200",
                  isActive ? "scale-110 text-sports-orange" : "scale-100"
                )} 
              />
              <span className={cn(
                "text-[10px] md:text-xs font-medium transition-all duration-200 leading-tight",
                isActive ? "text-sports-orange" : "text-gray-400"
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-0.5 md:w-2 md:h-1 bg-sports-orange rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNavigation;