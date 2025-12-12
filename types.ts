export type Role = 'ADMIN' | 'USER';

export interface User {
  id: string;
  username: string;
  role: Role;
  fullName: string;
  password?: string; // Simulated
}

// Master Data Types
export interface Machine {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'maintenance' | 'offline';
}

export interface Worker {
  id: string;
  name: string;
  role: string;
}

export interface InputItem {
  id: string;
  name: string;
  unit: string;
}

export interface OutputItem {
  id: string;
  name: string;
  unit: string;
}

export interface QCItem {
  id: string;
  name: string;
}

export interface QCSize {
  id: string;
  qcItemId: string;
  name: string; // e.g., "Size 10mm"
  minVal: number;
  maxVal: number;
}

// Transactional Data Types
export interface BaseEntry {
  id: string;
  userId: string; // Who entered it
  username: string; // Snapshot of username
  timestamp: string; // ISO String
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  notes?: string;
}

export interface MachineEntry extends BaseEntry {
  machineId: string;
  workerId: string;
  detail: string;
  itemsProduced: number; // Quantity
}

export interface InputEntry extends BaseEntry {
  inputItemId: string;
  detail: string;
  weight: number;
}

export interface OutputEntry extends BaseEntry {
  outputItemId: string;
  detail: string;
  weight: number;
}

export interface QCEntry extends BaseEntry {
  qcItemId: string;
  qcSizeId: string;
  measuredValue: number;
  status: 'CORRECT' | 'WRONG';
}

export interface AttendanceEntry extends BaseEntry {
  workerId: string;
  hoursWorked: number;
  workDate: string; // The date they worked
}

export interface SavedReport {
  id: string;
  name: string;
  generatedBy: string;
  generatedAt: string;
  module: string;
  filterSummary: string;
  downloadUrl: string; 
}

export interface SavedFilter {
  id: string;
  name: string;
  criteria: any;
}

// State Types
export interface AppState {
  currentUser: User | null;
  // Master Data
  users: User[];
  machines: Machine[];
  workers: Worker[];
  inputItems: InputItem[];
  outputItems: OutputItem[];
  qcItems: QCItem[];
  qcSizes: QCSize[];
  // Logs
  machineLogs: MachineEntry[];
  inputLogs: InputEntry[];
  outputLogs: OutputEntry[];
  qcLogs: QCEntry[];
  attendanceLogs: AttendanceEntry[];
  // Reports & Filters
  savedReports: SavedReport[];
  savedFilters: SavedFilter[];
}