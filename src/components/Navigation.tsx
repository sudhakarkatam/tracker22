
import { Home, CheckSquare, Target, Clock, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const isMobile = useIsMobile();
  
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'habits', label: 'Habits', icon: Target },
    { id: 'focus', label: 'Focus', icon: Clock },
    { id: 'more', label: 'More', icon: MoreHorizontal },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-pb">
      <div className={`flex justify-around items-center ${isMobile ? 'py-2 px-2' : 'py-3'}`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center rounded-lg transition-all duration-200 min-w-0 flex-1",
                isMobile ? "p-2 mx-1" : "p-3",
                isActive 
                  ? "text-purple-600 bg-purple-50" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              <Icon size={isMobile ? 18 : 20} className="flex-shrink-0" />
              <span className={cn(
                "font-medium mt-1 truncate w-full text-center",
                isMobile ? "text-xs" : "text-sm"
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
