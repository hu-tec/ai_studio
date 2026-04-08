export interface TranslationRequest {
  id: string;
  title: string;
  sourceLanguage: string;
  targetLanguage: string;
  documentType: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  deadline: string;
  specialInstructions?: string;
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
  price?: number;
}

export interface Translator {
  id: string;
  name: string;
  languages: string[];
  specialties: string[];
  rating: number;
  completedJobs: number;
  avatarUrl?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'translator' | 'admin';
  avatarUrl?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  requestId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  method: string;
  createdAt: string;
}
