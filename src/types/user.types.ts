export type UserRole = 'admin' | 'manager' | 'cashier';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  lastLogin?: Date;
}
