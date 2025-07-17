
import { Badge } from '@/components/ui/badge';
import { Zap } from 'lucide-react';
import { format } from 'date-fns';

export function TaskSummary({ tasks }: { tasks: any[] }) {
  const today = new Date().toDateString();
  const todayTasks = tasks.filter((task: any) => {
    if (!task.dueDate) return false;
    try {
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === today;
    } catch {
      return false;
    }
  });
  const completedTasks = todayTasks.filter((task: any) => task.completed);
  const overdueTasks = tasks.filter((task: any) => {
    if (!task.dueDate || task.completed) return false;
    try {
      const taskDate = new Date(task.dueDate);
      return taskDate < new Date() && taskDate.toDateString() !== today;
    } catch {
      return false;
    }
  });

  if (todayTasks.length === 0 && overdueTasks.length === 0) {
    return <p className="text-gray-500 text-center py-4">No tasks due today</p>;
  }

  return (
    <div className="space-y-4">
      {/* Today's Tasks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">
            {completedTasks.length} of {todayTasks.length} completed
          </span>
          <span className="text-sm font-medium text-purple-600">
            {todayTasks.length > 0 ? Math.round((completedTasks.length / todayTasks.length) * 100) : 0}%
          </span>
        </div>
        <div className="space-y-2">
          {todayTasks.slice(0, 3).map((task: any) => (
            <div key={task.id} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${task.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                {task.title}
              </span>
              {task.priority && (
                <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}>
                  {task.priority}
                </Badge>
              )}
            </div>
          ))}
          {todayTasks.length > 3 && (
            <p className="text-xs text-gray-500 mt-2">
              +{todayTasks.length - 3} more tasks
            </p>
          )}
        </div>
      </div>

      {/* Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <div className="border-t pt-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-red-600">Overdue Tasks</span>
            <Badge variant="destructive">{overdueTasks.length}</Badge>
          </div>
          <div className="space-y-1">
            {overdueTasks.slice(0, 2).map((task: any) => (
              <div key={task.id} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm text-red-700">{task.title}</span>
              </div>
            ))}
            {overdueTasks.length > 2 && (
              <p className="text-xs text-red-500">+{overdueTasks.length - 2} more overdue</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function HabitSummary({ habits, habitsEnhanced }: { habits: any[], habitsEnhanced: any[] }) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const allHabits = [...habits, ...habitsEnhanced.filter(h => h.isActive !== false)];
  
  if (allHabits.length === 0) {
    return <p className="text-gray-500 text-center py-4">No habits to track</p>;
  }

  const completedHabits = allHabits.filter(habit => {
    if (!habit.completions || !Array.isArray(habit.completions)) return false;
    const completion = habit.completions.find((c: any) => c.date === today);
    return completion?.completed === true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          {completedHabits.length} of {allHabits.length} completed
        </span>
        <span className="text-sm font-medium text-purple-600">
          {allHabits.length > 0 ? Math.round((completedHabits.length / allHabits.length) * 100) : 0}%
        </span>
      </div>
      
      <div className="space-y-3">
        {allHabits.slice(0, 4).map((habit: any) => {
          const todayCompletion = habit.completions?.find((c: any) => c.date === today);
          const progress = todayCompletion ? (todayCompletion.count / (habit.target || 1)) * 100 : 0;
          const streak = calculateHabitStreak(habit);
          
          return (
            <div key={habit.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{habit.icon || '🎯'}</span>
                <div>
                  <span className="text-sm text-gray-700">{habit.name}</span>
                  {streak > 0 && (
                    <div className="flex items-center gap-1 text-xs text-orange-600">
                      <Zap size={12} />
                      <span>{streak} day streak</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 transition-all duration-300"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-8">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
          );
        })}
        {allHabits.length > 4 && (
          <p className="text-xs text-gray-500 mt-2">
            +{allHabits.length - 4} more habits
          </p>
        )}
      </div>
    </div>
  );
}

export function WeeklyOverview({ tasks, habits, wellness, focus }: any) {
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - 6 + i);
    return date;
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayTasks = tasks.filter((t: any) => {
            if (!t.dueDate) return false;
            try {
              const taskDate = new Date(t.dueDate);
              return taskDate.toDateString() === day.toDateString();
            } catch {
              return false;
            }
          });
          const completedTasks = dayTasks.filter((t: any) => t.completed);
          const dayHabits = habits.filter((h: any) => {
            if (!h.completions || !Array.isArray(h.completions)) return false;
            const completion = h.completions.find((c: any) => c.date === dateStr);
            return completion?.completed === true;
          });
          const dayWellness = wellness.find((w: any) => w.date === dateStr);
          const dayFocus = focus.filter((f: any) => {
            if (!f.createdAt && !f.date) return false;
            try {
              const sessionDate = new Date(f.createdAt || f.date).toDateString();
              return sessionDate === day.toDateString();
            } catch {
              return false;
            }
          });

          const taskScore = dayTasks.length > 0 ? (completedTasks.length / dayTasks.length) * 100 : 0;
          const habitScore = habits.length > 0 ? (dayHabits.length / habits.length) * 100 : 0;
          const wellnessScore = dayWellness && typeof dayWellness.mood === 'number' ? 
            ((dayWellness.mood || 0) / 10) * 100 : 0;
          const focusScore = dayFocus.length > 0 ? 
            (dayFocus.reduce((sum: number, f: any) => sum + (typeof f.quality === 'number' ? f.quality : 5), 0) / (dayFocus.length * 5)) * 100 : 0;
          
          const scores = [taskScore, habitScore, wellnessScore, focusScore].filter(s => !isNaN(s) && s > 0);
          const overallDayScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

          return (
            <div key={index} className="text-center">
              <div className="text-xs text-gray-500 mb-1">
                {format(day, 'EEE')}
              </div>
              <div className="text-xs text-gray-400 mb-2">
                {format(day, 'MMM d')}
              </div>
              <div className={`w-full h-16 rounded-lg flex flex-col items-center justify-center text-xs font-medium
                ${overallDayScore >= 80 ? 'bg-green-100 text-green-800' :
                  overallDayScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                  overallDayScore >= 40 ? 'bg-orange-100 text-orange-800' :
                  overallDayScore > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-500'}`}
              >
                <div className="text-lg font-bold">{overallDayScore}%</div>
                <div className="flex gap-1 mt-1">
                  {dayTasks.length > 0 && <div className="w-1 h-1 bg-blue-500 rounded-full" />}
                  {dayHabits.length > 0 && <div className="w-1 h-1 bg-purple-500 rounded-full" />}
                  {dayWellness && <div className="w-1 h-1 bg-pink-500 rounded-full" />}
                  {dayFocus.length > 0 && <div className="w-1 h-1 bg-green-500 rounded-full" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="flex justify-center gap-6 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
          <span>Tasks</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-purple-500 rounded-full" />
          <span>Habits</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-pink-500 rounded-full" />
          <span>Wellness</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span>Focus</span>
        </div>
      </div>
    </div>
  );
}

export function calculateHabitStreak(habit: any) {
  if (!habit.completions || !Array.isArray(habit.completions)) return 0;
  
  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    const completion = habit.completions.find((c: any) => c.date === dateStr);
    if (completion?.completed === true) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}
