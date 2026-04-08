'use client';

import React, { createContext, useContext, useState } from 'react';

type UrgencyTier = 'normal' | 'urgent1' | 'urgent2';

export interface WorkingRequest {
  id: string;
  title: string;
  language: string;
  field: string;
  wordCount: number;
  deadline: string;
  price: number;
  urgencyTier: UrgencyTier;
  clientName: string;
  createdAt: string;
  startedAt: string;
  progress: number;
  description: string;
}

interface TranslatorContextType {
  workingRequests: WorkingRequest[];
  addWorkingRequest: (request: WorkingRequest) => void;
  removeWorkingRequest: (id: string) => void;
  updateWorkingRequest: (id: string, updates: Partial<WorkingRequest>) => void;
}

const TranslatorContext = createContext<TranslatorContextType | undefined>(undefined);

export function TranslatorProvider({ children }: { children: React.ReactNode }) {
  const [workingRequests, setWorkingRequests] = useState<WorkingRequest[]>([
    {
      id: 'work-001',
      title: '기술 문서 번역',
      language: '한국어 → 영어',
      field: '기술/IT',
      wordCount: 3200,
      deadline: '2024-12-05',
      price: 480000,
      urgencyTier: 'urgent2',
      clientName: '테크회사 A',
      createdAt: '2024-12-04',
      startedAt: '2024-12-04',
      progress: 65,
      description: '소프트웨어 매뉴얼 한영 번역',
    },
    {
      id: 'work-002',
      title: '의료 논문 번역',
      language: '한국어 → 영어',
      field: '의료/제약',
      wordCount: 5000,
      deadline: '2024-12-07',
      price: 750000,
      urgencyTier: 'urgent1',
      clientName: '의료기관 C',
      createdAt: '2024-12-04',
      startedAt: '2024-12-04',
      progress: 30,
      description: '의학 논문 번역 (검수 포함)',
    },
  ]);

  const addWorkingRequest = (request: WorkingRequest) => {
    setWorkingRequests((prev) => [...prev, request]);
  };

  const removeWorkingRequest = (id: string) => {
    setWorkingRequests((prev) => prev.filter((req) => req.id !== id));
  };

  const updateWorkingRequest = (id: string, updates: Partial<WorkingRequest>) => {
    setWorkingRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, ...updates } : req))
    );
  };

  return (
    <TranslatorContext.Provider value={{ workingRequests, addWorkingRequest, removeWorkingRequest, updateWorkingRequest }}>
      {children}
    </TranslatorContext.Provider>
  );
}

export function useTranslator() {
  const context = useContext(TranslatorContext);
  if (!context) {
    throw new Error('useTranslator must be used within TranslatorProvider');
  }
  return context;
}
