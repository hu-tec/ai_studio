export type CoursePlanId = 'A' | 'B' | 'C';
export type HoursMode = '10h' | '40h';
export type TabKey = CoursePlanId | 'compare';

export interface CourseSection {
  num: number;
  title: string;
  description: string;
  A: string[];
  B: string[];
  C: string[];
}

export interface VersionMeta {
  id: CoursePlanId;
  name: string;
  framing: string;
}

export interface PlanMeta {
  hours: HoursMode;
  label: string;
  duration: string;
  unitLabel: string;
}

export interface AxisChip {
  group: string;
  items: string[];
}
