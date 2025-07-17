
import { QuoteCard } from './QuoteCard';
import { TaskManager } from './TaskManager';
import { HabitTracker } from './HabitTracker';
import { WellnessWidget } from './WellnessWidget';
import { FocusWidget } from './FocusWidget';
import { TaskSummary, HabitSummary, WeeklyOverview } from './HomePageHelpers';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, Zap, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export function HomePage() {
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [habitsEnhanced, setHabitsEnhanced] = useState([]);
  const [focusSessions, setFocusSessions] = useState([]);
  const [wellness, setWellness] = useState([]);
  const [overallScore, setOverallScore] = useState(0);

  // Auto-refresh data when component mounts or localStorage changes
  useEffect(() => {
    const loadData = () => {
      try {
        const storedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const storedHabits = JSON.parse(localStorage.getItem('habits') || '[]');
        const storedHabitsEnhanced = JSON.parse(localStorage.getItem('habitsEnhanced') || '[]');
        const storedFocusSessions = JSON.parse(localStorage.getItem('focusSessions') || '[]');
        const storedWellness = JSON.parse(localStorage.getItem('wellness') || '[]');
        
        setTasks(storedTasks);
        setHabits(storedHabits);
        setHabitsEnhanced(storedHabitsEnhanced);
        setFocusSessions(storedFocusSessions);
        setWellness(storedWellness);
        
        // Calculate overall life score
        calculateOverallScore(storedTasks, storedHabitsEnhanced, storedWellness, storedFocusSessions);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };

    loadData();

    // Listen for storage changes
    const handleStorageChange = () => {
      loadData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('dataUpdated', handleStorageChange);

    // Reduce polling frequency to save battery - check every 30 seconds instead of 5
    const interval = setInterval(loadData, 30000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('dataUpdated', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const calculateOverallScore = (tasks: any[], habits: any[], wellness: any[], focus: any[]) => {
    const today = new Date().toDateString();
    
    // Task completion score with null checks
    const todayTasks = tasks.filter((task: any) => {
      if (!task.dueDate) return false;
      try {
        const taskDate = new Date(task.dueDate);
        return taskDate.toDateString() === today;
      } catch {
        return false;
      }
    });
    const completedTasks = todayTasks.filter((t: any) => t.completed);
    const taskScore = todayTasks.length > 0 ? (completedTasks.length / todayTasks.length) * 100 : 50; // Default to 50% when no tasks
    
    // Habit completion score with null checks
    const activeHabits = habits.filter((h: any) => h.isActive !== false); // Default to active if not specified
    const todayDate = format(new Date(), 'yyyy-MM-dd');
    const completedHabits = activeHabits.filter((h: any) => {
      if (!h.completions || !Array.isArray(h.completions)) return false;
      const completion = h.completions.find((c: any) => c.date === todayDate);
      return completion?.completed === true;
    });
    const habitScore = activeHabits.length > 0 ? (completedHabits.length / activeHabits.length) * 100 : 50; // Default to 50% when no habits
    
    // Wellness score with null checks
    const todayWellness = wellness.find((w: any) => w.date === todayDate);
    const wellnessScore = todayWellness && typeof todayWellness.mood === 'number' ? 
      ((todayWellness.mood || 5) / 10) * 100 : 50; // Default to 50% when no wellness data
    
    // Focus score with null checks
    const todayFocus = focus.filter((f: any) => {
      if (!f.createdAt && !f.date) return false;
      try {
        const sessionDate = new Date(f.createdAt || f.date).toDateString();
        return sessionDate === today;
      } catch {
        return false;
      }
    });
    const focusScore = todayFocus.length > 0 ? 
      (todayFocus.reduce((sum: number, f: any) => sum + (typeof f.quality === 'number' ? f.quality : 5), 0) / (todayFocus.length * 5)) * 100 : 50; // Default to 50% when no focus data
    
    // Ensure all scores are valid numbers
    const validTaskScore = isNaN(taskScore) ? 50 : Math.max(0, Math.min(100, taskScore));
    const validHabitScore = isNaN(habitScore) ? 50 : Math.max(0, Math.min(100, habitScore));
    const validWellnessScore = isNaN(wellnessScore) ? 50 : Math.max(0, Math.min(100, wellnessScore));
    const validFocusScore = isNaN(focusScore) ? 50 : Math.max(0, Math.min(100, focusScore));
    
    const overall = Math.round((validTaskScore + validHabitScore + validWellnessScore + validFocusScore) / 4);
    const finalScore = isNaN(overall) ? 50 : overall; // Final fallback
    
    console.log('Life Score Calculation:', {
      taskScore: validTaskScore,
      habitScore: validHabitScore,
      wellnessScore: validWellnessScore,
      focusScore: validFocusScore,
      overall: finalScore
    });
    
    setOverallScore(finalScore);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Overall Life Score */}
      <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target size={24} />
            Today's Life Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold">{overallScore}%</div>
            <div className="flex-1">
              <Progress value={overallScore} className="h-3" />
              <p className="text-sm mt-1 opacity-90">
                {overallScore >= 80 ? 'Excellent day!' : 
                 overallScore >= 60 ? 'Good progress!' : 
                 'Keep pushing forward!'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <QuoteCard />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WellnessWidget />
        <FocusWidget />
      </div>
      
      {/* Enhanced Task Summary */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <CheckCircle size={20} />
          Today's Tasks
        </h3>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <TaskSummary tasks={tasks} />
        </div>
      </div>

      {/* Enhanced Habit Summary */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <Zap size={20} />
          Habit Progress
        </h3>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <HabitSummary habits={habits} habitsEnhanced={habitsEnhanced} />
        </div>
      </div>

      {/* Weekly Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp size={20} />
            Weekly Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WeeklyOverview 
            tasks={tasks} 
            habits={[...habits, ...habitsEnhanced.filter(h => h.isActive)]} 
            wellness={wellness}
            focus={focusSessions}
          />
        </CardContent>
      </Card>
    </div>
  );
}
