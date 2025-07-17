
export type HabitType = 'yesno' | 'measurable';
export type TargetType = 'at-least' | 'exactly' | 'at-most';
export type FrequencyType = 'daily' | 'weekly' | 'monthly';

export interface HabitFormData {
  name: string;
  question?: string;
  type: HabitType;
  color: string;
  frequency: FrequencyType;
  reminder: string;
  notes?: string;
  
  // For measurable habits
  unit?: string;
  target?: number;
  targetType?: TargetType;
  
  // Legacy fields for compatibility
  description?: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  streakTarget?: number;
}
