import { cn } from "@/lib/utils";

interface TabsProps {
  activeTab: 'user' | 'admin';
  onTabChange: (tab: 'user' | 'admin') => void;
}

export const Tabs = ({ activeTab, onTabChange }: TabsProps) => {
  return (
    <div className="flex gap-2 p-1 bg-muted rounded-lg">
      <button
        onClick={() => onTabChange('user')}
        className={cn(
          "flex-1 px-6 py-3 rounded-md font-medium transition-all duration-200",
          activeTab === 'user'
            ? "bg-primary text-primary-foreground shadow-md"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        🎓 Student Portal
      </button>
      <button
        onClick={() => onTabChange('admin')}
        className={cn(
          "flex-1 px-6 py-3 rounded-md font-medium transition-all duration-200",
          activeTab === 'admin'
            ? "bg-primary text-primary-foreground shadow-md"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        👨‍💼 Admin Portal
      </button>
    </div>
  );
};
