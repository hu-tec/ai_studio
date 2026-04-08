import { useState, useEffect, useMemo } from 'react';

/** 업무일지 Task에서 업무 총괄과 연결된 진행 상황 집계 */
export interface TaskProgress {
  hubPostId: string;
  totalTasks: number;
  doneTasks: number;
  progressTasks: number;
  avgAchievement: number;  // 0-5
  assignees: string[];      // 작업한 사람들
  lastWorked?: string;      // 마지막 작업 날짜
  totalHours: number;       // 총 작업 시간
}

export function useWorkLogSync() {
  const [workLogs, setWorkLogs] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/worklogs')
      .then(r => r.json())
      .then(data => setWorkLogs(data || {}))
      .catch(() => setWorkLogs({}))
      .finally(() => setLoading(false));
  }, []);

  /** hubPostId별 진행 상황 집계 */
  const progressMap = useMemo(() => {
    const map = new Map<string, TaskProgress>();

    Object.entries(workLogs).forEach(([logKey, log]: [string, any]) => {
      if (!log || !log.tasks) return;
      const employeeId = log.employeeId || logKey.split('_')[0] || '';
      const date = log.date || logKey.split('_').slice(1).join('_') || '';

      (log.tasks as any[]).forEach(task => {
        if (!task.hubPostId) return;
        const pid = task.hubPostId;

        let entry = map.get(pid);
        if (!entry) {
          entry = { hubPostId: pid, totalTasks: 0, doneTasks: 0, progressTasks: 0, avgAchievement: 0, assignees: [], lastWorked: undefined, totalHours: 0 };
          map.set(pid, entry);
        }

        entry.totalTasks++;
        if (task.status === 'done') entry.doneTasks++;
        if (task.status === 'progress') entry.progressTasks++;

        // 달성률 누적
        if (task.achievement) {
          entry.avgAchievement = ((entry.avgAchievement * (entry.totalTasks - 1)) + task.achievement) / entry.totalTasks;
        }

        // 담당자
        if (employeeId && !entry.assignees.includes(employeeId)) {
          entry.assignees.push(employeeId);
        }

        // 마지막 작업일
        if (!entry.lastWorked || date > entry.lastWorked) {
          entry.lastWorked = date;
        }

        // 작업 시간 계산
        if (task.startTime && task.endTime) {
          const [sh, sm] = task.startTime.split(':').map(Number);
          const [eh, em] = task.endTime.split(':').map(Number);
          const hours = (eh * 60 + em - sh * 60 - sm) / 60;
          if (hours > 0) entry.totalHours += hours;
        }

        // 서브태스크도 포함
        if (task.children) {
          task.children.forEach((sub: any) => {
            if (sub.status === 'done') entry!.doneTasks++;
            if (sub.status === 'progress') entry!.progressTasks++;
            entry!.totalTasks++;
          });
        }
      });
    });

    return map;
  }, [workLogs]);

  const getProgress = (hubPostId: string): TaskProgress | undefined => progressMap.get(hubPostId);

  return { workLogs, loading, progressMap, getProgress };
}
