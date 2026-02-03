import Dexie, { Table } from 'dexie';
import { Expense } from '../models/expense.model';
import { Settings } from '../models/settings.model';

export class AppDatabase extends Dexie {
  expenses!: Table<Expense, string>;
  settings!: Table<Settings, 'settings'>;
  users!: Table<{ username: string; password: string }, string>;

  constructor() {
    super('expense_tracker_db');

    this.version(2).stores({
      expenses: 'id, date, category, amount, createdAt',
      settings: 'id',
      users: 'username'
    });

    this.on('populate', () => {
      this.users.add({
        username: 'Ahmed',
        password: this.hashPassword('Ahmed123')
      });
    });
  }

  private hashPassword(password: string): string {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }
}

export const db = new AppDatabase();
