import { Machine, QCItem, QCSize, User, Worker, InputItem, OutputItem, MachineEntry } from './types';

// Default Users with Passwords
export const MOCK_USERS: User[] = [
  { id: 'u1', username: 'admin', role: 'ADMIN', fullName: 'System Administrator', password: 'admin' },
  { id: 'u2', username: 'operator', role: 'USER', fullName: 'Line Operator', password: 'user' },
];

export const INITIAL_MACHINES: Machine[] = [
  { id: 'm1', name: 'CNC-01', type: 'Milling', status: 'active' },
  { id: 'm2', name: 'PRESS-A', type: 'Hydraulic Press', status: 'active' },
];

export const INITIAL_WORKERS: Worker[] = [
  { id: 'w1', name: 'Mike Worker', role: 'Operator' },
  { id: 'w2', name: 'Sarah Staff', role: 'Operator' },
];

export const INITIAL_INPUT_ITEMS: InputItem[] = [
  { id: 'in1', name: 'Raw Steel Bar', unit: 'kg' },
  { id: 'in2', name: 'Plastic Pellets', unit: 'kg' },
];

export const INITIAL_OUTPUT_ITEMS: OutputItem[] = [
  { id: 'out1', name: 'Finished Gear', unit: 'pcs' },
  { id: 'out2', name: 'Scrap Metal', unit: 'kg' },
];

export const INITIAL_QC_ITEMS: QCItem[] = [
  { id: 'qc1', name: 'Gear Diameter Check' },
  { id: 'qc2', name: 'Surface Hardness' },
];

export const INITIAL_QC_SIZES: QCSize[] = [
  { id: 'sz1', qcItemId: 'qc1', name: 'Small Gear (10mm)', minVal: 9.8, maxVal: 10.2 },
  { id: 'sz2', qcItemId: 'qc1', name: 'Large Gear (50mm)', minVal: 49.5, maxVal: 50.5 },
  { id: 'sz3', qcItemId: 'qc2', name: 'Standard Hardness', minVal: 55, maxVal: 65 },
];

// Seed some initial data
export const INITIAL_MACHINE_LOGS: MachineEntry[] = [
  { 
    id: 'p1', 
    machineId: 'm1', 
    workerId: 'w1',
    userId: 'u2', 
    username: 'operator',
    timestamp: new Date().toISOString(), 
    date: new Date().toISOString().split('T')[0],
    time: '08:00',
    itemsProduced: 120, 
    detail: 'Batch A-100'
  },
];