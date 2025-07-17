import { useState } from 'react';
import { Plus, Check, Flame, Target, TrendingUp, Edit2, Trash2, Search, Filter, Download, Upload } from 'lucide-react';
import { Habit, HabitCompletion } from '@/types';
import { HabitFormData } from '@/types/habitTypes';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HabitFormEnhanced } from '@/components/HabitFormEnhanced';
import { MeasurableHabitInput } from '@/components/MeasurableHabitInput';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';

export function HabitTrackerEnhanced() {
  const [habits, setHabits] = useLocalStorage<Habit[]>('habitsEnhanced', []);
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingHabitId, setDeletingHabitId] = useState<string | null>(null);
  const [selectedHabits, setSelectedHabits] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [measurableInputHabit, setMeasurableInputHabit] = useState<Habit | null>(null);

  const categories = ['health', 'fitness', 'learning', 'productivity', 'personal', 'other'];

  const convertFormDataToHabit = (formData: any): Habit => {
    return {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.question || '',
      target: formData.target || 1,
      unit: formData.unit || 'times',
      color: formData.color || '#3B82F6',
      type: formData.type === 'yesno' ? 'boolean' : 'numeric',
      category: 'other',
      difficulty: 'medium',
      frequency: 'daily',
      isActive: true,
      reminderTime: formData.reminder !== 'off' ? formData.reminder : null,
      createdAt: new Date(),
      completions: [],
      icon: '🎯',
      streakTarget: 7,
      // Store additional enhanced fields
      habitType: formData.type,
      question: formData.question,
      targetType: formData.targetType,
      notes: formData.notes,
      reminderSetting: formData.reminder
    };
  };

  const addHabit = (formData: HabitFormData) => {
    const habit = convertFormDataToHabit(formData);
    setHabits(prev => [...prev, habit]);
    setIsAddingHabit(false);
    
    // Trigger data update event
    window.dispatchEvent(new Event('dataUpdated'));
  };

  const updateHabit = (formData: HabitFormData) => {
    if (!editingHabit) return;

    const updatedHabit: Habit = {
      ...editingHabit,
      name: formData.name,
      description: formData.question || '',
      target: formData.target || 1,
      unit: formData.unit || 'times',
      color: formData.color,
      type: formData.type === 'yesno' ? 'boolean' : 'numeric',
      reminderTime: formData.reminder !== 'off' ? formData.reminder : null,
      // Store additional enhanced fields
      habitType: formData.type,
      question: formData.question,
      targetType: formData.targetType,
      notes: formData.notes,
      reminderSetting: formData.reminder
    };

    setHabits(prev =>
      prev.map(habit =>
        habit.id === editingHabit.id ? updatedHabit : habit
      )
    );
    setEditingHabit(null);
    
    // Trigger data update event
    window.dispatchEvent(new Event('dataUpdated'));
  };

  const confirmDeleteHabit = (habitId: string) => {
    setDeletingHabitId(habitId);
    setShowDeleteConfirm(true);
  };

  const deleteHabit = () => {
    if (!deletingHabitId) return;
    
    setHabits(prev => prev.filter(habit => habit.id !== deletingHabitId));
    setShowDeleteConfirm(false);
    setDeletingHabitId(null);
    
    // Trigger data update event
    window.dispatchEvent(new Event('dataUpdated'));
  };

  const bulkDelete = () => {
    setHabits(prev => prev.filter(habit => !selectedHabits.has(habit.id)));
    setSelectedHabits(new Set());
    setShowBulkActions(false);
    
    // Trigger data update event
    window.dispatchEvent(new Event('dataUpdated'));
  };

  const exportData = () => {
    const dataStr = JSON.stringify(habits, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `habits-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
  };

  const toggleHabitCompletion = (habitId: string, customValue?: number) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    setHabits(prev =>
      prev.map(habit => {
        if (habit.id !== habitId) return habit;
        
        const existingCompletion = habit.completions.find(c => c.date === today);
        const isYesNoHabit = habit.habitType === 'yesno' || habit.type === 'boolean';
        
        if (isYesNoHabit) {
          // For yes/no habits, just toggle completion
          const updatedCompletions = existingCompletion
            ? habit.completions.map(c =>
                c.date === today
                  ? { ...c, count: c.completed ? 0 : 1, completed: !c.completed }
                  : c
              )
            : [...habit.completions, { date: today, count: 1, completed: true }];
          
          return { ...habit, completions: updatedCompletions };
        } else {
          // For measurable habits, use custom value or increment by 1
          const valueToAdd = customValue || 1;
          const updatedCompletions = existingCompletion
            ? habit.completions.map(c =>
                c.date === today
                  ? { 
                      ...c, 
                      count: c.count + valueToAdd,
                      completed: c.count + valueToAdd >= (habit.target || 1)
                    }
                  : c
              )
            : [...habit.completions, { 
                date: today, 
                count: valueToAdd, 
                completed: valueToAdd >= (habit.target || 1)
              }];
          
          return { ...habit, completions: updatedCompletions };
        }
      })
    );
  };

  const handleHabitClick = (habit: Habit) => {
    const isYesNoHabit = habit.habitType === 'yesno' || habit.type === 'boolean';
    
    if (isYesNoHabit) {
      // For yes/no habits, directly toggle
      toggleHabitCompletion(habit.id);
    } else {
      // For measurable habits, show input dialog
      setMeasurableInputHabit(habit);
    }
  };

  const handleMeasurableSubmit = (value: number) => {
    if (measurableInputHabit) {
      toggleHabitCompletion(measurableInputHabit.id, value);
      setMeasurableInputHabit(null);
    }
  };

  const getStreakCount = (habit: Habit) => {
    let streak = 0;
    let currentDate = new Date();
    
    while (true) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const completion = habit.completions.find(c => c.date === dateStr);
      
      if (completion && completion.completed) {
        streak++;
        currentDate = addDays(currentDate, -1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getTodayCompletion = (habit: Habit) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return habit.completions.find(c => c.date === today) || { date: today, count: 0, completed: false };
  };

  const getWeekProgress = (habit: Habit) => {
    const startOfThisWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfThisWeek, i));
    
    return weekDays.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const completion = habit.completions.find(c => c.date === dateStr);
      return {
        date: day,
        completed: completion?.completed || false,
        count: completion?.count || 0
      };
    });
  };

  const filteredHabits = habits.filter(habit => {
    const matchesSearch = habit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (habit.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || habit.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleSelectHabit = (habitId: string) => {
    const newSelected = new Set(selectedHabits);
    if (newSelected.has(habitId)) {
      newSelected.delete(habitId);
    } else {
      newSelected.add(habitId);
    }
    setSelectedHabits(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const selectAll = () => {
    if (selectedHabits.size === filteredHabits.length) {
      setSelectedHabits(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedHabits(new Set(filteredHabits.map(h => h.id)));
      setShowBulkActions(true);
    }
  };

  const getEditFormData = (habit: Habit): any => {
    return {
      name: habit.name,
      question: habit.question || habit.description || '',
      type: habit.habitType || (habit.type === 'boolean' ? 'yesno' : 'measurable'),
      color: habit.color || '#3B82F6',
      frequency: 'daily',
      reminder: habit.reminderSetting || (habit.reminderTime ? habit.reminderTime : 'off'),
      notes: habit.notes || '',
      unit: habit.unit || '',
      target: habit.target || 1,
      targetType: habit.targetType || 'at-least'
    };
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Enhanced Habit Tracker</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportData} className="hidden md:flex">
            <Download size={16} className="mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsAddingHabit(true)} className="bg-purple-600 hover:bg-purple-700 h-12 md:h-10 px-4 md:px-4 text-base md:text-sm touch-manipulation">
            <Plus size={16} className="mr-2" />
            Add Habit
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search habits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 md:h-10 text-base md:text-sm"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48 h-12 md:h-10 text-base md:text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {showBulkActions && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedHabits.size} habit{selectedHabits.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedHabits(new Set())} className="touch-manipulation">
                Clear Selection
              </Button>
              <Button variant="destructive" size="sm" onClick={bulkDelete} className="touch-manipulation">
                Delete Selected
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {habits.length} habits • {habits.reduce((sum, h) => sum + h.completions.length, 0)} total completions
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll} className="touch-manipulation">
                {selectedHabits.size === filteredHabits.length ? 'Deselect All' : 'Select All'}
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => setHabits([])}
                disabled={habits.length === 0}
                className="touch-manipulation"
              >
                Clear All Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {habits.length === 0 ? (
        <div className="text-center py-12">
          <Target size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No habits yet</h3>
          <p className="text-gray-500">Start building better habits by adding your first one!</p>
        </div>
      ) : (
        <div className="space-y-4 overflow-hidden">
          {filteredHabits.map((habit) => {
            const todayCompletion = getTodayCompletion(habit);
            const streak = getStreakCount(habit);
            const weekProgress = getWeekProgress(habit);
            const isYesNoHabit = habit.habitType === 'yesno' || habit.type === 'boolean';
            const progressPercentage = isYesNoHabit 
              ? (todayCompletion.completed ? 100 : 0)
              : (todayCompletion.count / (habit.target || 1)) * 100;

            return (
              <div key={habit.id} className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Checkbox
                      checked={selectedHabits.has(habit.id)}
                      onCheckedChange={() => toggleSelectHabit(habit.id)}
                      className="mt-1 touch-manipulation"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-lg font-semibold text-gray-800 truncate">{habit.name}</h3>
                      {(habit.question || habit.description) && (
                        <p className="text-sm text-gray-600 line-clamp-2">{habit.question || habit.description}</p>
                      )}
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <Badge variant="secondary" className="text-xs">{habit.category}</Badge>
                        <Badge variant="outline" className="text-xs">
                          {habit.habitType === 'yesno' || habit.type === 'boolean' ? 'Yes/No' : 'Measurable'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => setEditingHabit(habit)} className="touch-manipulation">
                      <Edit2 size={12} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => confirmDeleteHabit(habit.id)} className="touch-manipulation">
                      <Trash2 size={12} className="text-red-500" />
                    </Button>
                    <button
                      onClick={() => handleHabitClick(habit)}
                      className={cn(
                        "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors touch-manipulation flex-shrink-0",
                        todayCompletion.completed
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-gray-300 hover:border-green-500"
                      )}
                    >
                      {todayCompletion.completed ? <Check size={20} /> : <Plus size={20} />}
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span className="truncate">
                      {isYesNoHabit 
                        ? `Status: ${todayCompletion.completed ? 'Completed' : 'Not completed'}`
                        : `Progress: ${todayCompletion.count} / ${habit.target || 1} ${habit.unit || 'times'}`
                      }
                    </span>
                    <span className="flex-shrink-0 ml-2">{Math.round(progressPercentage)}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>

                <div className="flex items-center justify-between text-sm mb-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Flame size={16} className="text-orange-500 flex-shrink-0" />
                      <span className="text-gray-600">{streak} day streak</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp size={16} className="text-blue-500 flex-shrink-0" />
                      <span className="text-gray-600">
                        {Math.round((habit.completions.filter(c => c.completed).length / Math.max(habit.completions.length, 1)) * 100)}% success
                      </span>
                    </div>
                  </div>
                </div>

                {/* Week Progress */}
                <div className="overflow-x-auto">
                  <p className="text-xs text-gray-500 mb-2">This Week</p>
                  <div className="flex gap-1 min-w-max">
                    {weekProgress.map((day, index) => (
                      <div key={index} className="flex-1 text-center min-w-[40px]">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium mx-auto mb-1",
                          day.completed 
                            ? "bg-green-500 text-white" 
                            : isSameDay(day.date, new Date())
                            ? "bg-purple-100 text-purple-600 border-2 border-purple-300"
                            : "bg-gray-100 text-gray-400"
                        )}>
                          {format(day.date, 'd')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(day.date, 'EEE')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Habit - Using plain conditional rendering instead of Dialog */}
      {isAddingHabit && (
        <div className="fixed inset-0 z-50">
          <HabitFormEnhanced
            onSubmit={addHabit}
            onCancel={() => setIsAddingHabit(false)}
          />
        </div>
      )}

      {/* Edit Habit - Using plain conditional rendering instead of Dialog */}
      {editingHabit && (
        <div className="fixed inset-0 z-50">
          <HabitFormEnhanced
            onSubmit={updateHabit}
            onCancel={() => setEditingHabit(null)}
            initialData={getEditFormData(editingHabit)}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to delete this habit? This action cannot be undone and will remove all completion data.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="touch-manipulation">
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteHabit} className="touch-manipulation">
              Delete Habit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Measurable Habit Input */}
      {measurableInputHabit && (
        <MeasurableHabitInput
          habit={measurableInputHabit}
          onSubmit={handleMeasurableSubmit}
          onCancel={() => setMeasurableInputHabit(null)}
        />
      )}
    </div>
  );
}
