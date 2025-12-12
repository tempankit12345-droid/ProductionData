import React, { useState } from 'react';
import { AppState, Machine, QCItem, QCSize, Worker, InputItem, OutputItem, SavedReport, User } from '../types';
import { Settings, FileSpreadsheet, Download, Plus, Trash2, Database, Users, Ruler, ArrowRight, Archive, UserCheck, Lock, Save, X, Key } from 'lucide-react';
import { generateId } from '../services/mockDatabase';

interface AdminProps {
  state: AppState;
  onUpdateMachines: (machines: Machine[]) => void;
  onUpdateQCItems: (items: QCItem[]) => void;
  onUpdateQCSizes: (sizes: QCSize[]) => void;
  onUpdateWorkers: (workers: Worker[]) => void;
  onUpdateInputItems: (items: InputItem[]) => void;
  onUpdateOutputItems: (items: OutputItem[]) => void;
  onUpdateUsers: (users: User[]) => void;
  
  // Delete Handlers
  onDeleteMachine: (id: string) => void;
  onDeleteWorker: (id: string) => void;
  onDeleteInputItem: (id: string) => void;
  onDeleteOutputItem: (id: string) => void;
  onDeleteQCItem: (id: string) => void;
  onDeleteQCSize: (id: string) => void;
  onDeleteUser: (id: string) => void;

  onAddReport: (report: SavedReport) => void;
  onDeleteReport: (id: string) => void;
}

export const Admin: React.FC<AdminProps> = (props) => {
  const [activeTab, setActiveTab] = useState('machines');

  return (
    <div className="space-y-6">
       <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center border-b border-industrial-200 pb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-industrial-900">Admin Console</h2>
          <p className="text-industrial-500">Master Data & Reports</p>
        </div>
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 w-full xl:w-auto scrollbar-hide">
            {[
              {id: 'machines', icon: Settings, label: 'Machines'},
              {id: 'workers', icon: UserCheck, label: 'Workers'},
              {id: 'items', icon: Archive, label: 'Items'},
              {id: 'qc', icon: Ruler, label: 'Quality'},
              {id: 'users', icon: Users, label: 'Users'},
              {id: 'reports', icon: FileSpreadsheet, label: 'Reports'}
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-industrial-800 text-white' : 'bg-white text-industrial-600 hover:bg-industrial-100 border border-industrial-200'}`}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
        </div>
      </header>

      {activeTab === 'machines' && (
        <MachineManager 
          machines={props.state.machines} 
          onUpdate={props.onUpdateMachines} 
          onDelete={props.onDeleteMachine} 
        />
      )}
      
      {activeTab === 'workers' && (
        <WorkerManager 
          workers={props.state.workers} 
          onUpdate={props.onUpdateWorkers} 
          onDelete={props.onDeleteWorker} 
        />
      )}
      
      {activeTab === 'items' && (
        <ItemManager 
          inputItems={props.state.inputItems} 
          outputItems={props.state.outputItems} 
          onUpdateIn={props.onUpdateInputItems} 
          onUpdateOut={props.onUpdateOutputItems} 
          onDeleteIn={props.onDeleteInputItem}
          onDeleteOut={props.onDeleteOutputItem}
        />
      )}
      
      {activeTab === 'qc' && (
        <QCManager 
          items={props.state.qcItems} 
          sizes={props.state.qcSizes} 
          onUpdateItems={props.onUpdateQCItems} 
          onUpdateSizes={props.onUpdateQCSizes} 
          onDeleteQCItem={props.onDeleteQCItem}
          onDeleteQCSize={props.onDeleteQCSize}
        />
      )}
      
      {activeTab === 'users' && (
        <UserManager 
          users={props.state.users} 
          onUpdate={props.onUpdateUsers} 
          onDelete={props.onDeleteUser}
          currentUser={props.state.currentUser} 
        />
      )}
      
      {activeTab === 'reports' && (
        <ReportManager 
          state={props.state} 
          onAddReport={props.onAddReport} 
          onDeleteReport={props.onDeleteReport} 
        />
      )}
    </div>
  );
};

// --- Sub Managers (Inline Forms) ---

const MachineManager = ({ machines, onUpdate, onDelete }: { machines: Machine[], onUpdate: (m: Machine[]) => void, onDelete: (id: string) => void }) => {
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('');

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName) {
      onUpdate([...machines, { id: generateId(), name: newName, type: newType || 'General', status: 'active' }]);
      setNewName('');
      setNewType('');
    }
  };

  const remove = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if(window.confirm('Are you sure you want to delete this machine?')) {
        onDelete(id);
    }
  };

  return (
    <div className="manager-card">
       <div className="manager-header">
         <h3>Machines</h3>
       </div>
       <div className="p-4 bg-industrial-50 border-b border-industrial-100">
          <form onSubmit={add} className="flex flex-col md:flex-row gap-2">
            <input 
              type="text" placeholder="Machine Name (e.g. CNC-99)" 
              className="input flex-1" value={newName} onChange={e => setNewName(e.target.value)} required 
            />
            <input 
              type="text" placeholder="Type (e.g. Lathe)" 
              className="input flex-1" value={newType} onChange={e => setNewType(e.target.value)} 
            />
            <button type="submit" className="btn-primary flex items-center justify-center gap-1"><Plus size={16}/> Add</button>
          </form>
       </div>
       <div className="overflow-x-auto">
        <ul className="divide-y divide-industrial-100">
            {machines.map(m => (
            <li key={m.id} className="p-4 flex justify-between items-center hover:bg-industrial-50 transition-colors">
                <div>
                <span className="font-semibold text-industrial-900">{m.name}</span>
                <span className="ml-2 text-xs bg-industrial-200 text-industrial-700 px-2 py-0.5 rounded">{m.type}</span>
                <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">{m.status}</span>
                </div>
                <button type="button" onClick={(e) => remove(m.id, e)} className="text-industrial-400 hover:text-red-600 p-2 pointer-events-auto relative z-10"><Trash2 size={16}/></button>
            </li>
            ))}
            {machines.length === 0 && <li className="p-4 text-center text-industrial-400 italic">No machines found.</li>}
        </ul>
       </div>
    </div>
  );
};

const WorkerManager = ({ workers, onUpdate, onDelete }: { workers: Worker[], onUpdate: (w: Worker[]) => void, onDelete: (id: string) => void }) => {
  const [newName, setNewName] = useState('');

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName) {
      onUpdate([...workers, { id: generateId(), name: newName, role: 'Operator' }]);
      setNewName('');
    }
  };

  const remove = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if(window.confirm('Are you sure you want to delete this worker?')) {
        onDelete(id);
    }
  };

  return (
    <div className="manager-card">
       <div className="manager-header">
         <h3>Workers</h3>
       </div>
       <div className="p-4 bg-industrial-50 border-b border-industrial-100">
          <form onSubmit={add} className="flex gap-2">
            <input 
              type="text" placeholder="Worker Name" 
              className="input flex-1" value={newName} onChange={e => setNewName(e.target.value)} required 
            />
            <button type="submit" className="btn-primary flex items-center justify-center gap-1"><Plus size={16}/> Add</button>
          </form>
       </div>
       <ul className="divide-y divide-industrial-100">
         {workers.map(w => (
           <li key={w.id} className="p-4 flex justify-between items-center hover:bg-industrial-50 transition-colors">
             <span className="font-medium text-industrial-900">{w.name}</span>
             <button type="button" onClick={(e) => remove(w.id, e)} className="text-industrial-400 hover:text-red-600 p-2 pointer-events-auto relative z-10"><Trash2 size={16}/></button>
           </li>
         ))}
         {workers.length === 0 && <li className="p-4 text-center text-industrial-400 italic">No workers found.</li>}
       </ul>
    </div>
  );
};

const UserManager = ({ users, onUpdate, onDelete, currentUser }: { users: User[], onUpdate: (u: User[]) => void, onDelete: (id: string) => void, currentUser: User | null }) => {
  const [newUser, setNewUser] = useState({ username: '', fullName: '', role: 'USER', password: '' });

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUser.username && newUser.fullName && newUser.password) {
      // Check for duplicate username
      if (users.find(u => u.username === newUser.username)) {
          alert('Username already exists');
          return;
      }

      onUpdate([...users, { 
        id: generateId(), 
        username: newUser.username, 
        fullName: newUser.fullName, 
        role: newUser.role as 'ADMIN' | 'USER',
        password: newUser.password
      }]);
      setNewUser({ username: '', fullName: '', role: 'USER', password: '' });
      alert('User created successfully');
    }
  };

  const remove = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if(window.confirm('Are you sure you want to delete this user?')) {
        onDelete(id);
    }
  };

  return (
    <div className="manager-card">
       <div className="manager-header">
         <h3>System Users</h3>
       </div>
       <div className="p-4 bg-industrial-50 border-b border-industrial-100">
          <form onSubmit={add} className="space-y-3">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input 
                    type="text" placeholder="Username (Login ID)" 
                    className="input" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} required 
                />
                 <input 
                    type="text" placeholder="Full Name" 
                    className="input" value={newUser.fullName} onChange={e => setNewUser({...newUser, fullName: e.target.value})} required 
                />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                     <Lock size={16} className="text-industrial-400" />
                     <input 
                        type="password" placeholder="Password" 
                        className="input" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required 
                    />
                </div>
                <div className="flex gap-2">
                    <select 
                        className="input flex-1" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}
                    >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                    <button type="submit" className="btn-primary flex items-center justify-center gap-1 w-24">
                        <Plus size={16}/> Add
                    </button>
                </div>
             </div>
          </form>
       </div>
       <ul className="divide-y divide-industrial-100">
         {users.map(u => (
           <li key={u.id} className="p-4 flex justify-between items-center hover:bg-industrial-50 transition-colors">
             <div className="flex items-center gap-3">
               <div className={`p-2 rounded-full ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                 {u.role === 'ADMIN' ? <Key size={16}/> : <Users size={16}/>}
               </div>
               <div>
                 <p className="font-medium text-industrial-900">{u.fullName}</p>
                 <p className="text-xs text-industrial-500">Username: {u.username} • Role: {u.role}</p>
               </div>
             </div>
             {u.id !== currentUser?.id && u.username !== 'admin' && (
                <button type="button" onClick={(e) => remove(u.id, e)} className="text-industrial-400 hover:text-red-600 p-2 pointer-events-auto relative z-10"><Trash2 size={16}/></button>
             )}
             {(u.id === currentUser?.id || u.username === 'admin') && (
                 <span className="text-xs text-industrial-400 italic px-2">Protected</span>
             )}
           </li>
         ))}
       </ul>
    </div>
  );
};

const ItemManager = ({ inputItems, outputItems, onUpdateIn, onUpdateOut, onDeleteIn, onDeleteOut }: any) => {
  const [newInput, setNewInput] = useState({ name: '', unit: 'kg' });
  const [newOutput, setNewOutput] = useState({ name: '', unit: 'pcs' });

  const addInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (newInput.name) {
      onUpdateIn([...inputItems, { id: generateId(), ...newInput }]);
      setNewInput({ name: '', unit: 'kg' });
    }
  };

  const addOutput = (e: React.FormEvent) => {
      e.preventDefault();
      if (newOutput.name) {
        onUpdateOut([...outputItems, { id: generateId(), ...newOutput }]);
        setNewOutput({ name: '', unit: 'pcs' });
      }
    };

  const removeInput = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if(window.confirm('Are you sure you want to delete this input item?')) {
        onDeleteIn(id);
    }
  };

  const removeOutput = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if(window.confirm('Are you sure you want to delete this output item?')) {
        onDeleteOut(id);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="manager-card flex flex-col h-[500px]">
        <div className="manager-header"><h3>Input Items (Raw)</h3></div>
        <div className="p-3 bg-industrial-50 border-b border-industrial-100">
            <form onSubmit={addInput} className="flex flex-col sm:flex-row gap-2">
                <input className="input flex-1" placeholder="Item Name" value={newInput.name} onChange={e => setNewInput({...newInput, name: e.target.value})} required />
                <div className="flex gap-2 w-full sm:w-auto">
                    <input className="input w-full sm:w-24" placeholder="Unit" value={newInput.unit} onChange={e => setNewInput({...newInput, unit: e.target.value})} required />
                    <button type="submit" className="btn-primary flex items-center justify-center px-3"><Plus size={16}/></button>
                </div>
            </form>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            <ul className="divide-y divide-industrial-100">
            {inputItems.map((i:any) => <li key={i.id} className="p-3 flex justify-between items-center hover:bg-industrial-50"><span>{i.name} <span className="text-xs text-industrial-400">({i.unit})</span></span><button type="button" onClick={(e)=>removeInput(i.id, e)} className="text-industrial-400 hover:text-red-600 pointer-events-auto relative z-10"><Trash2 size={16}/></button></li>)}
            {inputItems.length === 0 && <li className="p-3 text-industrial-400 italic text-center">No items.</li>}
            </ul>
        </div>
      </div>

      <div className="manager-card flex flex-col h-[500px]">
        <div className="manager-header"><h3>Output Items (Finished)</h3></div>
        <div className="p-3 bg-industrial-50 border-b border-industrial-100">
            <form onSubmit={addOutput} className="flex flex-col sm:flex-row gap-2">
                <input className="input flex-1" placeholder="Item Name" value={newOutput.name} onChange={e => setNewOutput({...newOutput, name: e.target.value})} required />
                <div className="flex gap-2 w-full sm:w-auto">
                    <input className="input w-full sm:w-24" placeholder="Unit" value={newOutput.unit} onChange={e => setNewOutput({...newOutput, unit: e.target.value})} required />
                    <button type="submit" className="btn-primary flex items-center justify-center px-3"><Plus size={16}/></button>
                </div>
            </form>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            <ul className="divide-y divide-industrial-100">
            {outputItems.map((i:any) => <li key={i.id} className="p-3 flex justify-between items-center hover:bg-industrial-50"><span>{i.name} <span className="text-xs text-industrial-400">({i.unit})</span></span><button type="button" onClick={(e)=>removeOutput(i.id, e)} className="text-industrial-400 hover:text-red-600 pointer-events-auto relative z-10"><Trash2 size={16}/></button></li>)}
            {outputItems.length === 0 && <li className="p-3 text-industrial-400 italic text-center">No items.</li>}
            </ul>
        </div>
      </div>
    </div>
  );
}

const QCManager = ({ items, sizes, onUpdateItems, onUpdateSizes, onDeleteQCItem, onDeleteQCSize }: any) => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newSize, setNewSize] = useState({ name: '', minVal: '', maxVal: '' });

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if(newItemName) {
        onUpdateItems([...items, { id: generateId(), name: newItemName }]);
        setNewItemName('');
    }
  };

  const addSize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !newSize.name || !newSize.minVal || !newSize.maxVal) return;
    onUpdateSizes([...sizes, { 
        id: generateId(), 
        qcItemId: selectedItem, 
        name: newSize.name, 
        minVal: parseFloat(newSize.minVal), 
        maxVal: parseFloat(newSize.maxVal) 
    }]);
    setNewSize({ name: '', minVal: '', maxVal: '' });
  };

  const removeItem = (id: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if(window.confirm('Are you sure you want to delete this Quality Control Item? All associated sizes will be lost.')) {
        onDeleteQCItem(id);
        if (selectedItem === id) setSelectedItem(null);
      }
  };

  const removeSize = (id: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if(window.confirm('Delete this size specification?')) {
        onDeleteQCSize(id);
      }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[500px]">
      <div className="col-span-1 manager-card flex flex-col">
         <div className="manager-header"><h3>QC Items</h3></div>
         <div className="p-3 bg-industrial-50 border-b border-industrial-100">
            <form onSubmit={addItem} className="flex gap-2">
                <input className="input flex-1" placeholder="New Item Name" value={newItemName} onChange={e => setNewItemName(e.target.value)} required />
                <button type="submit" className="btn-primary flex items-center justify-center"><Plus size={16}/></button>
            </form>
         </div>
         <ul className="divide-y divide-industrial-100 overflow-y-auto custom-scrollbar flex-1">
           {items.map((i:any) => (
             <li key={i.id} onClick={() => setSelectedItem(i.id)} className={`p-4 cursor-pointer hover:bg-industrial-50 flex justify-between items-center transition-colors ${selectedItem === i.id ? 'bg-brand-50 border-l-4 border-brand-500' : 'border-l-4 border-transparent'}`}>
               <span className="font-medium">{i.name}</span>
               <div className="flex items-center gap-2">
                 <button type="button" onClick={(e) => removeItem(i.id, e)} className="text-industrial-300 hover:text-red-500 pointer-events-auto relative z-10"><Trash2 size={14}/></button>
                 <ArrowRight size={14} className="text-industrial-300"/>
               </div>
             </li>
           ))}
           {items.length === 0 && <li className="p-4 text-center text-industrial-400 italic">No QC items defined.</li>}
         </ul>
      </div>

      <div className="col-span-2 manager-card bg-industrial-50 flex flex-col">
         <div className="manager-header">
           <h3>{selectedItem ? 'Manage Sizes & Ranges' : 'Select an Item'}</h3>
         </div>
         {selectedItem ? (
           <>
            <div className="p-3 bg-white border-b border-industrial-200">
                <form onSubmit={addSize} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <input className="input md:col-span-2" placeholder="Size Name (e.g. 10mm)" value={newSize.name} onChange={e => setNewSize({...newSize, name: e.target.value})} required />
                    <input type="number" step="0.01" className="input" placeholder="Min" value={newSize.minVal} onChange={e => setNewSize({...newSize, minVal: e.target.value})} required />
                    <div className="flex gap-2">
                        <input type="number" step="0.01" className="input" placeholder="Max" value={newSize.maxVal} onChange={e => setNewSize({...newSize, maxVal: e.target.value})} required />
                        <button type="submit" className="btn-primary flex items-center justify-center"><Plus size={16}/></button>
                    </div>
                </form>
            </div>
            <div className="overflow-y-auto custom-scrollbar flex-1 p-0">
                <table className="w-full text-sm text-left">
                    <thead className="sticky top-0 bg-industrial-100 z-10"><tr className="text-industrial-500 text-xs uppercase"><th className="p-3">Size Name</th><th className="p-3">Min</th><th className="p-3">Max</th><th className="p-3 text-right">Action</th></tr></thead>
                    <tbody className="bg-white">
                    {sizes.filter((s:any) => s.qcItemId === selectedItem).map((s:any) => (
                        <tr key={s.id} className="border-t border-industrial-100 hover:bg-industrial-50">
                        <td className="p-3 font-medium">{s.name}</td>
                        <td className="p-3 font-mono text-green-600 font-bold">{s.minVal}</td>
                        <td className="p-3 font-mono text-red-600 font-bold">{s.maxVal}</td>
                        <td className="p-3 text-right"><button type="button" onClick={(e)=>removeSize(s.id, e)} className="text-industrial-400 hover:text-red-600 pointer-events-auto relative z-10"><Trash2 size={16}/></button></td>
                        </tr>
                    ))}
                    {sizes.filter((s:any) => s.qcItemId === selectedItem).length === 0 && (
                        <tr><td colSpan={4} className="p-6 text-center text-industrial-400 italic">No sizes defined yet. Add one above.</td></tr>
                    )}
                    </tbody>
                </table>
            </div>
           </>
         ) : <div className="flex-1 flex items-center justify-center text-industrial-400">Select an item on the left to manage its specific sizes and acceptable ranges.</div>}
      </div>
    </div>
  );
}

const ReportManager = ({ state, onAddReport, onDeleteReport }: { state: AppState, onAddReport: (r: SavedReport) => void, onDeleteReport: (id: string) => void }) => {
  const [selectedModule, setSelectedModule] = useState('machine_entry');

  const handleGenerateReport = () => {
    // Determine which logs to export
    let logs: any[] = [];
    let sectionName = "";
    
    switch(selectedModule) {
      case 'machine_entry': logs = state.machineLogs; sectionName="MachineProduction"; break;
      case 'input_entry': logs = state.inputLogs; sectionName="InputMaterials"; break;
      case 'output_entry': logs = state.outputLogs; sectionName="OutputGoods"; break;
      case 'qc_entry': logs = state.qcLogs; sectionName="QualityControl"; break;
      case 'attendance_entry': logs = state.attendanceLogs; sectionName="WorkerAttendance"; break;
    }

    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g,'');
    const adminName = state.currentUser?.username || 'Admin';
    const reportName = `${sectionName}_${dateStr}_${adminName}.xlsx`; // Mocking .xlsx extension
    
    // Convert logs to CSV string
    if (logs.length === 0) {
      alert("No data available for this module.");
      return;
    }

    const headers = Object.keys(logs[0]).join(",");
    const rows = logs.map(row => Object.values(row).map(val => `"${val}"`).join(",")).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;

    const newReport: SavedReport = {
      id: generateId(),
      name: reportName,
      generatedAt: new Date().toISOString(),
      generatedBy: adminName,
      module: sectionName,
      filterSummary: 'All Records', // Simplified for prototype
      downloadUrl: encodeURI(csvContent)
    };

    onAddReport(newReport);
  };

  const remove = (id: string, e: React.MouseEvent) => {
      e.preventDefault();
      onDeleteReport(id);
  }

  return (
    <div className="space-y-6">
       <div className="bg-white p-6 rounded-xl shadow-sm border border-industrial-200">
         <h3 className="font-bold text-lg mb-4">Generate Excel Report</h3>
         <div className="flex flex-col md:flex-row gap-4 items-end">
           <div className="flex-1 w-full">
             <label className="block text-sm font-medium text-industrial-700 mb-1">Select Module</label>
             <select 
               className="w-full border-industrial-300 rounded-lg p-2 border"
               value={selectedModule}
               onChange={e => setSelectedModule(e.target.value)}
             >
               <option value="machine_entry">Machine Production</option>
               <option value="input_entry">Input Materials</option>
               <option value="output_entry">Output Goods</option>
               <option value="qc_entry">Quality Control</option>
               <option value="attendance_entry">Worker Attendance</option>
             </select>
           </div>
           <button onClick={handleGenerateReport} className="btn-primary flex items-center justify-center gap-2 h-10 px-6 w-full md:w-auto">
             <FileSpreadsheet size={18} /> Generate Report
           </button>
         </div>
       </div>

       <div className="bg-white rounded-xl shadow-sm border border-industrial-200 overflow-hidden">
         <div className="p-4 bg-industrial-50 border-b border-industrial-100">
           <h3 className="font-semibold text-industrial-800">Saved Reports (History)</h3>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-industrial-50 text-industrial-500 uppercase text-xs">
                <tr>
                    <th className="px-6 py-3">Report Name</th>
                    <th className="px-6 py-3">Module</th>
                    <th className="px-6 py-3">Date Generated</th>
                    <th className="px-6 py-3">Admin</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-industrial-100">
                {state.savedReports.length === 0 && (
                    <tr><td colSpan={5} className="p-6 text-center text-industrial-400">No reports generated yet.</td></tr>
                )}
                {state.savedReports.map(r => (
                    <tr key={r.id} className="hover:bg-industrial-50">
                    <td className="px-6 py-3 font-medium text-industrial-900 whitespace-nowrap">{r.name}</td>
                    <td className="px-6 py-3 text-xs uppercase tracking-wide text-industrial-500">{r.module}</td>
                    <td className="px-6 py-3 text-industrial-500 whitespace-nowrap">{new Date(r.generatedAt).toLocaleString()}</td>
                    <td className="px-6 py-3">{r.generatedBy}</td>
                    <td className="px-6 py-3 text-right flex justify-end gap-2">
                        <a href={r.downloadUrl} download={r.name} className="text-green-600 hover:underline flex items-center gap-1 text-xs font-bold"><Download size={14}/> DOWNLOAD</a>
                        <button type="button" onClick={(e) => remove(r.id, e)} className="text-industrial-300 hover:text-red-500"><Trash2 size={16}/></button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
         </div>
       </div>
    </div>
  );
};