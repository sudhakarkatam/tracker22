
import { ArrowLeft, Download, Upload, Trash2, Moon, Sun, Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface AppSettingsProps {
  onBack: () => void;
}

export function AppSettings({ onBack }: AppSettingsProps) {
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const exportData = async () => {
    try {
      // Get all data from localStorage
      const allData = {
        tasks: JSON.parse(localStorage.getItem('tasks') || '[]'),
        habits: JSON.parse(localStorage.getItem('habits') || '[]'),
        habitsEnhanced: JSON.parse(localStorage.getItem('habitsEnhanced') || '[]'),
        focusSessions: JSON.parse(localStorage.getItem('focusSessions') || '[]'),
        expenses: JSON.parse(localStorage.getItem('expenses') || '[]'),
        books: JSON.parse(localStorage.getItem('books') || '[]'),
        wellness: JSON.parse(localStorage.getItem('wellness') || '[]'),
        notes: JSON.parse(localStorage.getItem('notes') || '[]'),
        events: JSON.parse(localStorage.getItem('events') || '[]'),
        ideas: JSON.parse(localStorage.getItem('ideas') || '[]'),
        learning: JSON.parse(localStorage.getItem('learning') || '[]'),
        recipes: JSON.parse(localStorage.getItem('recipes') || '[]'),
        gym: JSON.parse(localStorage.getItem('gym') || '[]'),
        exportDate: new Date().toISOString()
      };

      const dataStr = JSON.stringify(allData, null, 2);
      const fileName = `personal-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;

      // Check if we're on mobile and have Web Share API
      if (navigator.share && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        try {
          const file = new File([dataStr], fileName, { type: 'application/json' });
          await navigator.share({
            files: [file],
            title: 'Personal Tracker Backup',
            text: 'Your personal tracker data backup'
          });
          
          toast({
            title: "Data shared successfully!",
            description: "Your backup file has been shared.",
          });
          return;
        } catch (shareError) {
          console.log('Web Share failed, falling back to download');
        }
      }

      // Fallback: Traditional download
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      // Create a hidden link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      
      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      setTimeout(() => URL.revokeObjectURL(url), 100);

      toast({
        title: "Data exported successfully!",
        description: `Your backup file "${fileName}" has been downloaded.`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export failed",
        description: "There was an error exporting your data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Restore data to localStorage
        Object.keys(data).forEach(key => {
          if (key !== 'exportDate' && data[key]) {
            localStorage.setItem(key, JSON.stringify(data[key]));
          }
        });

        // Trigger data update event
        window.dispatchEvent(new Event('dataUpdated'));

        toast({
          title: "Data imported successfully!",
          description: "Your data has been restored. Please refresh the page.",
        });
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Invalid backup file. Please check the file and try again.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      const keys = ['tasks', 'habits', 'habitsEnhanced', 'focusSessions', 'expenses', 'books', 'wellness', 'notes', 'events', 'ideas', 'learning', 'recipes', 'gym'];
      keys.forEach(key => localStorage.removeItem(key));
      
      // Trigger data update event
      window.dispatchEvent(new Event('dataUpdated'));
      
      toast({
        title: "All data cleared",
        description: "Your data has been permanently deleted.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="touch-manipulation">
          <ArrowLeft size={16} />
        </Button>
        <h2 className="text-2xl font-bold text-gray-800 flex-1">Settings</h2>
      </div>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={exportData} className="flex-1 touch-manipulation">
              <Download size={16} className="mr-2" />
              Export Data
            </Button>
            <div className="flex-1">
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
                id="import-file"
              />
              <Button 
                onClick={() => document.getElementById('import-file')?.click()}
                variant="outline" 
                className="w-full touch-manipulation"
              >
                <Upload size={16} className="mr-2" />
                Import Data
              </Button>
            </div>
          </div>
          <Button 
            onClick={clearAllData} 
            variant="destructive" 
            className="w-full touch-manipulation"
          >
            <Trash2 size={16} className="mr-2" />
            Clear All Data
          </Button>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon size={16} /> : <Sun size={16} />}
              <Label htmlFor="dark-mode">Dark Mode</Label>
            </div>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {notifications ? <Bell size={16} /> : <BellOff size={16} />}
              <Label htmlFor="notifications">Notifications</Label>
            </div>
            <Switch
              id="notifications"
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* App Information */}
      <Card>
        <CardHeader>
          <CardTitle>App Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Version:</strong> 2.0.0</p>
            <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
            <p><strong>Storage Used:</strong> {Math.round(JSON.stringify(localStorage).length / 1024)} KB</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

