import { Salary } from './salary.model';

export interface Settings {
  id: 'settings';
  dailyLimit: number;
  weeklyLimit: number;
  alertsEnabled: boolean;
  salaries: Salary[];
  updatedAt: string;
}
