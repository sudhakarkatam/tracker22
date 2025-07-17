
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

interface MeasurableHabitInputProps {
  habit: any;
  onSubmit: (value: number) => void;
  onCancel: () => void;
}

export function MeasurableHabitInput({ habit, onSubmit, onCancel }: MeasurableHabitInputProps) {
  const [value, setValue] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      onSubmit(numValue);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 md:items-center items-end">
      <Card className="w-full max-w-md rounded-t-lg md:rounded-lg rounded-b-none md:rounded-b-lg bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <CardTitle className="text-lg font-semibold">Log Progress</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel} className="h-8 w-8 p-0 touch-manipulation">
            <X size={16} />
          </Button>
        </CardHeader>
        
        <CardContent className="p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div className="text-center">
              <div className="text-2xl mb-2">{habit.icon || '🎯'}</div>
              <h3 className="font-medium text-gray-900 text-base md:text-lg">{habit.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{habit.question || habit.description}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="value" className="text-sm md:text-base">
                {habit.question || `How many ${habit.unit || 'units'}?`}
              </Label>
              <Input
                id="value"
                type="number"
                step="0.1"
                min="0"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={`Enter ${habit.unit || 'value'}`}
                className="text-center text-lg h-12 md:h-10 text-base md:text-lg"
                autoFocus
                required
              />
              {habit.unit && (
                <p className="text-sm text-gray-500 text-center">
                  Unit: {habit.unit}
                </p>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="w-full md:w-auto h-12 md:h-10 text-base md:text-sm touch-manipulation"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!value.trim()}
                className="w-full md:w-auto h-12 md:h-10 text-base md:text-sm touch-manipulation"
              >
                Log Progress
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
