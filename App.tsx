import React, { useState, useEffect } from 'react';
import { getInitialState } from './services/mockDatabase';
import { AppState, User } from './types';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { DataEntry } from './pages/DataEntry';
import { Admin } from './pages/Admin';

const App: React.FC = () => {
  // Initialize state from localStorage if available, otherwise use default
  const [appState, setAppState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem('manutech_state');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load state", e);
    }
    return getInitialState();
  });

  const [currentView, setCurrentView] = useState('dashboard');

  // Persistence Effect
  useEffect(() => {
    localStorage.setItem('manutech_state', JSON.stringify(appState));
  }, [appState]);

  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    // Authenticate against current state users (allows newly created users to log in)
    const user = appState.users.find(u => u.username === username && u.password === password);
    if (user) {
      setAppState(prev => ({ ...prev, currentUser: user }));
      setCurrentView('dashboard');
      return true;
    } 
    return false;
  };

  const handleLogout = () => {
    setAppState(prev => ({ ...prev, currentUser: null }));
  };

  // --- Transactional Data Handlers ---
  
  const handleAddEntry = (type: string, data: any) => {
    setAppState(prev => {
      const newState = { ...prev };
      if (type === 'machine') newState.machineLogs = [data, ...prev.machineLogs];
      if (type === 'input') newState.inputLogs = [data, ...prev.inputLogs];
      if (type === 'output') newState.outputLogs = [data, ...prev.outputLogs];
      if (type === 'qc') newState.qcLogs = [data, ...prev.qcLogs];
      if (type === 'attendance') newState.attendanceLogs = [data, ...prev.attendanceLogs];
      return newState;
    });
  };

  const handleDeleteEntry = (type: string, id: string) => {
    setAppState(prev => {
      const newState = { ...prev };
      if (type === 'machine') newState.machineLogs = prev.machineLogs.filter(l => l.id !== id);
      if (type === 'input') newState.inputLogs = prev.inputLogs.filter(l => l.id !== id);
      if (type === 'output') newState.outputLogs = prev.outputLogs.filter(l => l.id !== id);
      if (type === 'qc') newState.qcLogs = prev.qcLogs.filter(l => l.id !== id);
      if (type === 'attendance') newState.attendanceLogs = prev.attendanceLogs.filter(l => l.id !== id);
      return newState;
    });
  };

  const handleEditEntry = (type: string, data: any) => {
     setAppState(prev => {
        const newState = { ...prev };
        const numVal = parseFloat(data.value);
        
        if (isNaN(numVal)) return prev; // Guard against invalid number input

        if (type === 'machine_entry') {
            newState.machineLogs = prev.machineLogs.map(l => l.id === data.id ? {...l, itemsProduced: numVal} : l);
        }
        if (type === 'input_entry') {
            newState.inputLogs = prev.inputLogs.map(l => l.id === data.id ? {...l, weight: numVal} : l);
        }
        if (type === 'output_entry') {
            newState.outputLogs = prev.outputLogs.map(l => l.id === data.id ? {...l, weight: numVal} : l);
        }
        if (type === 'qc_entry') {
            // Complex logic: Re-evaluate status if value changes
            newState.qcLogs = prev.qcLogs.map(l => {
                if (l.id === data.id) {
                    // Find size constraints to check pass/fail
                    const size = prev.qcSizes.find(s => s.id === l.qcSizeId);
                    let newStatus = l.status;
                    if (size) {
                        newStatus = (numVal >= size.minVal && numVal <= size.maxVal) ? 'CORRECT' : 'WRONG';
                    }
                    return {...l, measuredValue: numVal, status: newStatus};
                }
                return l;
            });
        }
        if (type === 'attendance_entry') {
            newState.attendanceLogs = prev.attendanceLogs.map(l => l.id === data.id ? {...l, hoursWorked: numVal} : l);
        }
        return newState;
     })
  };

  // --- Master Data Handlers ---

  // Create/Update
  const handleUpdateMachines = (machines: any) => setAppState(p => ({ ...p, machines }));
  const handleUpdateWorkers = (workers: any) => setAppState(p => ({ ...p, workers }));
  const handleUpdateInputItems = (items: any) => setAppState(p => ({ ...p, inputItems: items }));
  const handleUpdateOutputItems = (items: any) => setAppState(p => ({ ...p, outputItems: items }));
  const handleUpdateQCItems = (items: any) => setAppState(p => ({ ...p, qcItems: items }));
  const handleUpdateQCSizes = (sizes: any) => setAppState(p => ({ ...p, qcSizes: sizes }));
  const handleUpdateUsers = (users: any) => setAppState(p => ({ ...p, users }));
  
  // Delete Handlers
  
  const handleDeleteMachine = (id: string) => {
    const dependentLogs = appState.machineLogs.filter(l => l.machineId === id).length;
    
    // Check if machine has dependencies
    if (dependentLogs > 0) {
      // Allow user to Force Delete (Cascade)
      if (window.confirm(`⚠️ WARNING: This machine is associated with ${dependentLogs} production records.\n\nDeleting it will PERMANENTLY DELETE all those records too.\n\nDo you want to proceed?`)) {
         setAppState(p => ({ 
             ...p, 
             machineLogs: p.machineLogs.filter(l => l.machineId !== id), // Cascade delete logs
             machines: p.machines.filter(m => m.id !== id) 
         }));
      }
      return;
    }
    
    // No dependencies, clean delete
    setAppState(p => ({ ...p, machines: p.machines.filter(m => m.id !== id) }));
  };

  const handleDeleteWorker = (id: string) => {
    const prodCount = appState.machineLogs.filter(l => l.workerId === id).length;
    const attCount = appState.attendanceLogs.filter(l => l.workerId === id).length;
    
    if (prodCount > 0 || attCount > 0) {
      if (window.confirm(`⚠️ WARNING: This worker is associated with ${prodCount} production logs and ${attCount} attendance records.\n\nDeleting them will remove ALL associated history.\n\nProceed?`)) {
        setAppState(p => ({ 
            ...p, 
            workers: p.workers.filter(w => w.id !== id),
            machineLogs: p.machineLogs.filter(l => l.workerId !== id),
            attendanceLogs: p.attendanceLogs.filter(l => l.workerId !== id)
        }));
      }
      return;
    }
    setAppState(p => ({ ...p, workers: p.workers.filter(w => w.id !== id) }));
  };

  const handleDeleteUser = (id: string) => {
    const hasHistory = 
      appState.machineLogs.some(l => l.userId === id) ||
      appState.inputLogs.some(l => l.userId === id) ||
      appState.outputLogs.some(l => l.userId === id) ||
      appState.qcLogs.some(l => l.userId === id) ||
      appState.attendanceLogs.some(l => l.userId === id);

    if (hasHistory) {
      alert("Cannot delete user: This user has created data entries in the system. Please change their role to inactive/user instead to preserve audit trails.");
      return;
    }
    setAppState(p => ({ ...p, users: p.users.filter(u => u.id !== id) }));
  };

  const handleDeleteInputItem = (id: string) => {
    const usageCount = appState.inputLogs.filter(l => l.inputItemId === id).length;
    if (usageCount > 0) {
      if(window.confirm(`This item is used in ${usageCount} records. Delete item and all its history?`)) {
          setAppState(p => ({
              ...p,
              inputItems: p.inputItems.filter(i => i.id !== id),
              inputLogs: p.inputLogs.filter(l => l.inputItemId !== id)
          }));
      }
      return;
    }
    setAppState(p => ({ ...p, inputItems: p.inputItems.filter(i => i.id !== id) }));
  };

  const handleDeleteOutputItem = (id: string) => {
    const usageCount = appState.outputLogs.filter(l => l.outputItemId === id).length;
    if (usageCount > 0) {
      if(window.confirm(`This item is used in ${usageCount} records. Delete item and all its history?`)) {
          setAppState(p => ({
              ...p,
              outputItems: p.outputItems.filter(i => i.id !== id),
              outputLogs: p.outputLogs.filter(l => l.outputItemId !== id)
          }));
      }
      return;
    }
    setAppState(p => ({ ...p, outputItems: p.outputItems.filter(i => i.id !== id) }));
  };

  const handleDeleteQCSize = (id: string) => {
    const usageCount = appState.qcLogs.filter(l => l.qcSizeId === id).length;
    if (usageCount > 0) {
      alert(`Cannot delete size: Used in ${usageCount} quality checks. Delete the checks first or archive this item.`);
      return;
    }
    setAppState(p => ({ ...p, qcSizes: p.qcSizes.filter(s => s.id !== id) }));
  };
  
  const handleDeleteQCItem = (id: string) => {
    const usageCount = appState.qcLogs.filter(l => l.qcItemId === id).length;
    if (usageCount > 0) {
       alert(`Cannot delete QC Item: Used in ${usageCount} quality checks. Archive it instead.`);
       return;
    }

    setAppState(p => ({ 
        ...p, 
        qcItems: p.qcItems.filter(i => i.id !== id),
        qcSizes: p.qcSizes.filter(s => s.qcItemId !== id) // Remove associated sizes
    }));
  };

  // Reports
  const handleAddReport = (report: any) => setAppState(p => ({ ...p, savedReports: [report, ...p.savedReports] }));
  const handleDeleteReport = (id: string) => setAppState(p => ({ ...p, savedReports: p.savedReports.filter(r => r.id !== id) }));
  
  const handleSaveFilter = (filter: any) => setAppState(p => ({ ...p, savedFilters: [...p.savedFilters, filter] }));


  if (!appState.currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <>
      <style>{`
        .label { display: block; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #6b7280; margin-bottom: 0.25rem; }
        .input { width: 100%; border: 1px solid #d1d5db; border-radius: 0.5rem; padding: 0.5rem; font-size: 0.875rem; outline: none; transition: all 0.15s; }
        .input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
        .btn-primary { background-color: #2563eb; color: white; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; transition: background-color 0.15s; }
        .btn-primary:hover { background-color: #1d4ed8; }
        .btn-xs { padding: 0.25rem 0.75rem; font-size: 0.75rem; background-color: #2563eb; color: white; border-radius: 0.25rem; display: flex; align-items: center; gap: 0.25rem; font-weight: 600; }
        .manager-card { background: white; border: 1px solid #e5e7eb; border-radius: 0.75rem; overflow: hidden; height: 100%; display: flex; flex-direction: column; }
        .manager-header { background: #f9fafb; padding: 0.75rem 1rem; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; font-weight: 600; color: #1f2937; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 2px; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <Layout 
        user={appState.currentUser} 
        currentView={currentView}
        onNavigate={setCurrentView}
        onLogout={handleLogout}
      >
        {currentView === 'dashboard' && <Dashboard state={appState} />}
        
        {['machine_entry', 'input_entry', 'output_entry', 'qc_entry', 'attendance_entry'].includes(currentView) && (
          <DataEntry 
            view={currentView}
            state={appState} 
            user={appState.currentUser} 
            onAddEntry={handleAddEntry}
            onDeleteEntry={handleDeleteEntry}
            onEditEntry={handleEditEntry}
            onSaveFilter={handleSaveFilter}
          />
        )}

        {currentView.startsWith('admin') && appState.currentUser.role === 'ADMIN' && (
          <Admin 
            state={appState} 
            onUpdateMachines={handleUpdateMachines}
            onUpdateWorkers={handleUpdateWorkers}
            onUpdateInputItems={handleUpdateInputItems}
            onUpdateOutputItems={handleUpdateOutputItems}
            onUpdateQCItems={handleUpdateQCItems}
            onUpdateQCSizes={handleUpdateQCSizes}
            onUpdateUsers={handleUpdateUsers}
            // Pass Delete Handlers
            onDeleteMachine={handleDeleteMachine}
            onDeleteWorker={handleDeleteWorker}
            onDeleteInputItem={handleDeleteInputItem}
            onDeleteOutputItem={handleDeleteOutputItem}
            onDeleteQCItem={handleDeleteQCItem}
            onDeleteQCSize={handleDeleteQCSize}
            onDeleteUser={handleDeleteUser}
            // Reports
            onAddReport={handleAddReport}
            onDeleteReport={handleDeleteReport}
          />
        )}
        
        {currentView.startsWith('admin') && appState.currentUser.role !== 'ADMIN' && (
          <div className="flex flex-col items-center justify-center h-96 text-industrial-400">
             <h3 className="text-xl font-bold mb-2">Access Denied</h3>
             <p>You do not have permission to view this area.</p>
          </div>
        )}
      </Layout>
    </>
  );
};

export default App;