import { AppState, User } from '../types';
import { 
  INITIAL_MACHINES, 
  INITIAL_QC_ITEMS, 
  INITIAL_QC_SIZES,
  INITIAL_MACHINE_LOGS, 
  MOCK_USERS,
  INITIAL_WORKERS,
  INITIAL_INPUT_ITEMS,
  INITIAL_OUTPUT_ITEMS
} from '../constants';

export const getInitialState = (): AppState => {
  return {
    currentUser: null,
    users: MOCK_USERS,
    machines: INITIAL_MACHINES,
    workers: INITIAL_WORKERS,
    inputItems: INITIAL_INPUT_ITEMS,
    outputItems: INITIAL_OUTPUT_ITEMS,
    qcItems: INITIAL_QC_ITEMS,
    qcSizes: INITIAL_QC_SIZES,
    machineLogs: INITIAL_MACHINE_LOGS,
    inputLogs: [],
    outputLogs: [],
    qcLogs: [],
    attendanceLogs: [],
    savedReports: [],
    savedFilters: []
  };
};

export const authenticate = (username: string, role: string): User | null => {
  const user = MOCK_USERS.find(u => u.username === username && u.role === role);
  return user || { id: 'temp', username, role: role as any, fullName: username === 'admin' ? 'Admin User' : 'Operator User' };
};

export const generateId = () => Math.random().toString(36).substr(2, 9);