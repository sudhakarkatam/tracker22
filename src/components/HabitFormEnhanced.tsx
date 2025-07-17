
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

interface HabitFormData {
  name: string;
  question?: string;
  type: 'yesno' | 'measurable';
  color: string;
  frequency: string;
  reminder: string;
  notes?: string;
  unit?: string;
  target?: number;
  targetType?: string;
}

interface HabitFormEnhancedProps {
  onSubmit: (habit: HabitFormData) => void;
  onCancel: () => void;
  initialData?: HabitFormData;
}

export function HabitFormEnhanced({ onSubmit, onCancel, initialData }: HabitFormEnhancedProps) {
  const [habitType, setHabitType] = useState<'yesno' | 'measurable'>(initialData?.type || 'yesno');
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    icon: '🎯',
    question: initialData?.question || '',
    unit: initialData?.unit || '',
    target: initialData?.target || 1,
    frequency: initialData?.frequency || 'daily',
    targetType: initialData?.targetType || 'at-least',
    reminderSetting: initialData?.reminder || 'off',
    notes: initialData?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const habitData: HabitFormData = {
      name: formData.name,
      question: formData.question,
      type: habitType,
      color: '#3B82F6',
      frequency: formData.frequency,
      reminder: formData.reminderSetting,
      notes: formData.notes,
      unit: habitType === 'measurable' ? formData.unit : undefined,
      target: formData.target,
      targetType: formData.targetType
    };

    onSubmit(habitData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-0 md:p-4">
      <div className="w-full h-full md:max-w-2xl md:h-auto md:max-h-[95vh] flex flex-col bg-white md:rounded-lg overflow-hidden">
        {/* Fixed Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 md:p-6 border-b bg-white">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">
            {initialData ? 'Edit Habit' : 'Create New Habit'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onCancel} className="h-10 w-10 p-0 touch-manipulation">
            <X size={18} />
          </Button>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-4 md:p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Habit Type Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setHabitType('yesno')}
                  className={`p-4 rounded-lg border-2 text-left transition-all touch-manipulation ${
                    habitType === 'yesno' 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900 text-base">Yes or No</div>
                  <div className="text-sm text-gray-600 mt-1">
                    e.g. Did you wake up early today?
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setHabitType('measurable')}
                  className={`p-4 rounded-lg border-2 text-left transition-all touch-manipulation ${
                    habitType === 'measurable' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900 text-base">Measurable</div>
                  <div className="text-sm text-gray-600 mt-1">
                    e.g. How many miles did you run?
                  </div>
                </button>
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-base">Habit Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter habit name"
                    required
                    className="mt-2 h-12 text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="question" className="text-base">Question/Description</Label>
                  <Input
                    id="question"
                    value={formData.question}
                    onChange={(e) => handleInputChange('question', e.target.value)}
                    placeholder={habitType === 'yesno' ? 'Did you...?' : 'How many...?'}
                    className="mt-2 h-12 text-base"
                  />
                </div>
              </div>

              {/* Measurable Habit Fields */}
              {habitType === 'measurable' && (
                <div>
                  <Label htmlFor="unit" className="text-base">Unit</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                    placeholder="e.g. miles, pages, minutes"
                    className="mt-2 h-12 text-base"
                  />
                </div>
              )}

              {/* Target and Frequency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target" className="text-base">Target</Label>
                  <Input
                    id="target"
                    type="number"
                    min="1"
                    value={formData.target}
                    onChange={(e) => handleInputChange('target', parseInt(e.target.value) || 1)}
                    className="mt-2 h-12 text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="frequency" className="text-base">Frequency</Label>
                  <Select value={formData.frequency} onValueChange={(value) => handleInputChange('frequency', value)}>
                    <SelectTrigger className="mt-2 h-12 text-base">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Every day</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Advanced Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="targetType" className="text-base">Target Type</Label>
                  <Select value={formData.targetType} onValueChange={(value) => handleInputChange('targetType', value)}>
                    <SelectTrigger className="mt-2 h-12 text-base">
                      <SelectValue placeholder="Select target type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="at-least">At least</SelectItem>
                      <SelectItem value="exactly">Exactly</SelectItem>
                      <SelectItem value="at-most">At most</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="reminder" className="text-base">Reminder</Label>
                  <Select value={formData.reminderSetting} onValueChange={(value) => handleInputChange('reminderSetting', value)}>
                    <SelectTrigger className="mt-2 h-12 text-base">
                      <SelectValue placeholder="Select reminder" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="off">Off</SelectItem>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="evening">Evening</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes" className="text-base">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any additional notes about this habit..."
                  className="mt-2 resize-none text-base min-h-[100px]"
                  rows={4}
                />
              </div>

              {/* Extra spacing for better mobile experience */}
              <div className="h-6"></div>
            </form>
          </div>
        </div>

        {/* Fixed Action Buttons */}
        <div className="flex-shrink-0 p-4 md:p-6 border-t bg-white">
          <div className="flex flex-col md:flex-row gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="w-full md:w-auto h-12 text-base touch-manipulation order-2 md:order-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.name.trim()}
              onClick={handleSubmit}
              className="w-full md:w-auto h-12 text-base touch-manipulation order-1 md:order-2"
            >
              {initialData ? 'Update Habit' : 'Create Habit'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

