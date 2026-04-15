export type CoursePlanId = 'A' | 'B' | 'C';
export type HoursMode = '40h' | '10h';
export type TabKey = CoursePlanId | 'compare';

export interface CourseModule {
  num: number;
  title: string;
  subtitle?: string;
}

export interface CoursePlan {
  id: CoursePlanId;
  name: string;
  axis: string;
  audience: string[];
  concept: string;
  strengths: string[];
  modules40h: CourseModule[];
  modules10h: CourseModule[];
}

export interface ComparisonRow {
  label: string;
  A: string;
  B: string;
  C: string;
  highlight?: CoursePlanId;
}

export interface AxisChip {
  group: string;
  items: string[];
}
