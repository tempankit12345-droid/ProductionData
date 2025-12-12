import React, { useState } from 'react';
import { AppState, User, MachineEntry, InputEntry, OutputEntry, QCEntry, AttendanceEntry, SavedFilter } from '../types';
import { Save, AlertCircle, Check, Filter, Search, Trash2, Calendar, Clock, Bookmark, X, CheckCircle, XCircle, Edit } from 'lucide-react';
import { generateId } from '../services/mockDatabase';

interface DataEntryProps {
  view: string;
  state: AppState;
  user: User;
  onAddEntry: (type: string, data: any) => void;
  onEditEntry: (type: string, data: any) => void;
  onDeleteEntry: (type: string, id: string) => void;
  onSaveFilter: (filter: SavedFilter) => void;
}

export const DataEntry: React.FC<DataEntryProps> = ({ view, state, user, onAddEntry, onDeleteEntry, onEditEntry, onSaveFilter }) => {
  const [activeMode, setActiveMode] = useState<'entry' | 'list'>('entry');
  
  const getTitle = () => {
    switch(view) {
      case 'machine_entry': return 'Machine Production';
      case 'input_entry': return 'Raw Material Input';
      case 'output_entry': return 'Finished Output';
      case 'qc_entry': return 'Quality Control';
      case 'attendance_entry': return 'Worker Attendance';
      default: return 'Data Entry';
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-industrial-900">{getTitle()}</h2>
          <p className="text-industrial-500 text-sm">Module Access: {user.role === 'ADMIN' ? 'Full Control' : 'Collaborative Access'}</p>
        </div>
        <div className="bg-white rounded-lg p-1 shadow-sm border border-industrial-200 flex w-full md:w-auto">
          <button
            onClick={() => setActiveMode('entry')}
            className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeMode === 'entry' 
                ? 'bg-brand-600 text-white shadow-sm' 
                : 'text-industrial-500 hover:text-industrial-900'
            }`}
          >
            New Entry
          </button>
          <button
            onClick={() => setActiveMode('list')}
            className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeMode === 'list' 
                ? 'bg-brand-600 text-white shadow-sm' 
                : 'text-industrial-500 hover:text-industrial-900'
            }`}
          >
            View History
          </button>
        </div>
      </header>

      {activeMode === 'entry' ? (
        <div className="max-w-3xl mx-auto">
          {view === 'machine_entry' && <MachineForm state={state} user={user} onSubmit={(d) => onAddEntry('machine', d)} />}
          {view === 'input_entry' && <InputForm state={state} user={user} onSubmit={(d) => onAddEntry('input', d)} />}
          {view === 'output_entry' && <OutputForm state={state} user={user} onSubmit={(d) => onAddEntry('output', d)} />}
          {view === 'qc_entry' && <QCForm state={state} user={user} onSubmit={(d) => onAddEntry('qc', d)} />}
          {view === 'attendance_entry' && <AttendanceForm state={state} user={user} onSubmit={(d) => onAddEntry('attendance', d)} />}
        </div>
      ) : (
        <FilterableList view={view} state={state} user={user} onDelete={onDeleteEntry} onEdit={onEditEntry} onSaveFilter={onSaveFilter} />
      )}
    </div>
  );
};

// --- FORMS ---

const getCurrentDate = () => new Date().toISOString().split('T')[0];
const getCurrentTime = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

const MachineForm = ({ state, user, onSubmit }: { state: AppState, user: User, onSubmit: (d: any) => void }) => {
  const [formData, setFormData] = useState({ 
    machineId: '', 
    workerId: '', 
    detail: '', 
    itemsProduced: '',
    date: getCurrentDate(),
    time: getCurrentTime()
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      itemsProduced: Number(formData.itemsProduced),
      id: generateId(),
      userId: user.id,
      username: user.username,
      timestamp: new Date().toISOString()
    });
    setFormData({ ...formData, itemsProduced: '', detail: '' }); // Reset partial
    alert("Production Saved");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-industrial-200 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Select Machine</label>
          <select required className="input" value={formData.machineId} onChange={e => setFormData({...formData, machineId: e.target.value})}>
            <option value="">-- Choose Machine --</option>
            {state.machines.filter(m => m.status === 'active').map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Select Worker</label>
          <select required className="input" value={formData.workerId} onChange={e => setFormData({...formData, workerId: e.target.value})}>
             <option value="">-- Choose Worker --</option>
            {state.workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="label">Details / Batch No.</label>
        <input required type="text" className="input" value={formData.detail} onChange={e => setFormData({...formData, detail: e.target.value})} />
      </div>
      <div>
        <label className="label">Quantity Produced (Pcs)</label>
        <input required type="number" min="1" className="input" value={formData.itemsProduced} onChange={e => setFormData({...formData, itemsProduced: e.target.value})} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Date</label><input type="date" className="input" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
        <div><label className="label">Time</label><input type="time" className="input" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} /></div>
      </div>
      <button type="submit" className="btn-primary w-full">Save Production Log</button>
    </form>
  );
};

const InputForm = ({ state, user, onSubmit }: { state: AppState, user: User, onSubmit: (d: any) => void }) => {
  const [formData, setFormData] = useState({ 
    inputItemId: '', 
    detail: '', 
    weight: '', 
    notes: '',
    date: getCurrentDate(),
    time: getCurrentTime()
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      weight: Number(formData.weight),
      id: generateId(),
      userId: user.id,
      username: user.username,
      timestamp: new Date().toISOString()
    });
    setFormData({ ...formData, weight: '', detail: '', notes: '' });
    alert("Input Record Saved");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-industrial-200 space-y-4">
      <div>
        <label className="label">Input Material</label>
        <select required className="input" value={formData.inputItemId} onChange={e => setFormData({...formData, inputItemId: e.target.value})}>
          <option value="">-- Select Material --</option>
          {state.inputItems.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
        </select>
      </div>
      <div>
        <label className="label">Details / Source</label>
        <input required type="text" className="input" value={formData.detail} onChange={e => setFormData({...formData, detail: e.target.value})} />
      </div>
      <div>
        <label className="label">Weight</label>
        <input required type="number" step="0.01" className="input" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Date</label><input type="date" className="input" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
        <div><label className="label">Time</label><input type="time" className="input" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} /></div>
      </div>
      <div>
         <label className="label">Notes (Optional)</label>
         <textarea className="input" rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
      </div>
      <button type="submit" className="btn-primary w-full">Save Input Record</button>
    </form>
  );
};

const OutputForm = ({ state, user, onSubmit }: { state: AppState, user: User, onSubmit: (d: any) => void }) => {
  const [formData, setFormData] = useState({ 
    outputItemId: '', 
    detail: '', 
    weight: '', 
    notes: '',
    date: getCurrentDate(),
    time: getCurrentTime()
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      weight: Number(formData.weight),
      id: generateId(),
      userId: user.id,
      username: user.username,
      timestamp: new Date().toISOString()
    });
    setFormData({ ...formData, weight: '', detail: '', notes: '' });
    alert("Output Record Saved");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-industrial-200 space-y-4">
      <div>
        <label className="label">Output Item</label>
        <select required className="input" value={formData.outputItemId} onChange={e => setFormData({...formData, outputItemId: e.target.value})}>
          <option value="">-- Select Item --</option>
          {state.outputItems.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
        </select>
      </div>
      <div>
        <label className="label">Details / Batch</label>
        <input required type="text" className="input" value={formData.detail} onChange={e => setFormData({...formData, detail: e.target.value})} />
      </div>
      <div>
        <label className="label">Weight / Count</label>
        <input required type="number" step="0.01" className="input" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Date</label><input type="date" className="input" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
        <div><label className="label">Time</label><input type="time" className="input" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} /></div>
      </div>
       <div>
         <label className="label">Notes (Optional)</label>
         <textarea className="input" rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
      </div>
      <button type="submit" className="btn-primary w-full">Save Output Record</button>
    </form>
  );
};

const AttendanceForm = ({ state, user, onSubmit }: { state: AppState, user: User, onSubmit: (d: any) => void }) => {
  const [formData, setFormData] = useState({ 
    workerId: '', 
    workDate: getCurrentDate(), 
    hoursWorked: '',
    notes: '',
    time: getCurrentTime() // Capture time of entry
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      hoursWorked: Number(formData.hoursWorked),
      id: generateId(),
      userId: user.id,
      username: user.username,
      timestamp: new Date().toISOString(),
      date: formData.workDate // Explicit field for attendance
    });
    setFormData({ ...formData, workerId: '', hoursWorked: '' });
    alert("Attendance Saved");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-industrial-200 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Select Worker</label>
          <select required className="input" value={formData.workerId} onChange={e => setFormData({...formData, workerId: e.target.value})}>
            <option value="">-- Choose Worker --</option>
            {state.workers.map(w => <option key={w.id} value={w.id}>{w.name} ({w.role})</option>)}
          </select>
        </div>
        <div>
          <label className="label">Work Date (Can be past)</label>
          <input required type="date" className="input" value={formData.workDate} onChange={e => setFormData({...formData, workDate: e.target.value})} />
        </div>
      </div>
      <div>
        <label className="label">Hours Worked</label>
        <input required type="number" min="0" max="24" step="0.5" className="input" value={formData.hoursWorked} onChange={e => setFormData({...formData, hoursWorked: e.target.value})} />
      </div>
       <div>
         <label className="label">Notes</label>
         <textarea className="input" rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
      </div>
      <button type="submit" className="btn-primary w-full">Save Attendance</button>
    </form>
  );
};

// --- QUALITY CONTROL COMPLEX FORM ---
const QCForm = ({ state, user, onSubmit }: { state: AppState, user: User, onSubmit: (d: any) => void }) => {
  const [selectedQCItem, setSelectedQCItem] = useState('');
  const [measurements, setMeasurements] = useState<{[key: string]: string}>({}); // sizeId -> value
  const [notes, setNotes] = useState<{[key: string]: string}>({}); // sizeId -> note
  const [date, setDate] = useState(getCurrentDate());
  const [time, setTime] = useState(getCurrentTime());

  const handleValueChange = (sizeId: string, val: string) => {
    setMeasurements(prev => ({ ...prev, [sizeId]: val }));
  };

  const adjustValue = (sizeId: string, delta: number) => {
    const current = parseFloat(measurements[sizeId] || '0');
    setMeasurements(prev => ({ ...prev, [sizeId]: (current + delta).toFixed(2) }));
  };

  const getStatus = (size: any, valStr: string): 'CORRECT' | 'WRONG' | 'PENDING' => {
    if (!valStr || valStr === '') return 'PENDING';
    const val = parseFloat(valStr);
    if (isNaN(val)) return 'PENDING';
    return (val >= size.minVal && val <= size.maxVal) ? 'CORRECT' : 'WRONG';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeSizes = state.qcSizes.filter(s => s.qcItemId === selectedQCItem);
    let count = 0;
    activeSizes.forEach(size => {
      const valStr = measurements[size.id];
      if (valStr) {
        const status = getStatus(size, valStr);
        if (status !== 'PENDING') {
           onSubmit({
              id: generateId(),
              qcItemId: selectedQCItem,
              qcSizeId: size.id,
              measuredValue: parseFloat(valStr),
              status: status,
              notes: notes[size.id] || '',
              userId: user.id,
              username: user.username,
              timestamp: new Date().toISOString(),
              date: date,
              time: time
           });
           count++;
        }
      }
    });
    
    // Reset
    if(count > 0) {
        setMeasurements({});
        setNotes({});
        setSelectedQCItem('');
        alert(`${count} Checks Submitted Successfully`);
    } else {
        alert("Please enter at least one measurement.");
    }
  };

  const sizes = state.qcSizes.filter(s => s.qcItemId === selectedQCItem);

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-industrial-200 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-3">
            <label className="label">Select Quality Check Item</label>
            <select required className="input" value={selectedQCItem} onChange={e => {setSelectedQCItem(e.target.value); setMeasurements({});}}>
            <option value="">-- Choose Inspection Type --</option>
            {state.qcItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
        </div>
      </div>

      {selectedQCItem && sizes.length > 0 && (
        <div className="space-y-6 border-t border-industrial-100 pt-4">
          <div className="flex gap-4">
            <div><label className="label">Date</label><input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} /></div>
            <div><label className="label">Time</label><input type="time" className="input" value={time} onChange={e => setTime(e.target.value)} /></div>
          </div>

          {sizes.map(size => {
             const status = getStatus(size, measurements[size.id]);
             return (
              <div key={size.id} className="p-4 bg-industrial-50 rounded-lg border border-industrial-200 transition-colors hover:border-industrial-300">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3">
                  <span className="font-bold text-lg text-industrial-800">{size.name}</span>
                  {/* Min/Max hidden from User editing, but used for validation */}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={() => adjustValue(size.id, -0.1)} className="w-12 h-12 bg-white border border-industrial-300 rounded-lg hover:bg-industrial-100 font-bold text-xl text-industrial-600">-</button>
                            <input 
                                type="number" step="0.01" placeholder="Value"
                                className="w-full h-12 text-center font-bold text-lg border-industrial-300 rounded-lg border shadow-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                value={measurements[size.id] || ''}
                                onChange={e => handleValueChange(size.id, e.target.value)}
                            />
                            <button type="button" onClick={() => adjustValue(size.id, 0.1)} className="w-12 h-12 bg-white border border-industrial-300 rounded-lg hover:bg-industrial-100 font-bold text-xl text-industrial-600">+</button>
                        </div>
                        <input 
                            type="text" placeholder="Optional Notes" className="input mt-2 text-xs"
                            value={notes[size.id] || ''} onChange={e => setNotes({...notes, [size.id]: e.target.value})}
                        />
                    </div>

                    <div className="flex items-center justify-center md:justify-start bg-white rounded-lg border border-industrial-100 p-2">
                        {status === 'CORRECT' && (
                            <div className="flex items-center gap-2 text-green-600 font-bold text-lg">
                            <Check size={24} strokeWidth={3} />
                            <span>CORRECT / OK</span>
                            </div>
                        )}
                        {status === 'WRONG' && (
                            <div className="flex items-center gap-2 text-red-600 font-bold text-lg">
                            <AlertCircle size={24} strokeWidth={3} />
                            <span>WRONG / REJECTED</span>
                            </div>
                        )}
                        {status === 'PENDING' && (
                            <div className="text-industrial-400 italic text-sm">Waiting for input...</div>
                        )}
                    </div>
                </div>
              </div>
             );
          })}
          <button type="submit" className="btn-primary w-full py-4 text-lg shadow-md">Submit All Measurements</button>
        </div>
      )}
      {selectedQCItem && sizes.length === 0 && (
        <p className="text-center text-industrial-400 italic">No sizes defined for this item by Admin.</p>
      )}
    </form>
  );
};


// --- FILTERING & LIST SYSTEM ---

const FilterableList = ({ view, state, user, onDelete, onEdit, onSaveFilter }: { view: string, state: AppState, user: User, onDelete: (t: string, id: string) => void, onEdit: (t: string, data: any) => void, onSaveFilter: (f: SavedFilter) => void }) => {
  const [filters, setFilters] = useState({
    dateStart: '',
    dateEnd: '',
    timeStart: '',
    timeEnd: '',
    username: '',
    keyword: '',
    weightMin: '',
    weightMax: ''
  });

  const getList = (): (MachineEntry | InputEntry | OutputEntry | QCEntry | AttendanceEntry)[] => {
     switch(view) {
       case 'machine_entry': return state.machineLogs;
       case 'input_entry': return state.inputLogs;
       case 'output_entry': return state.outputLogs;
       case 'qc_entry': return state.qcLogs;
       case 'attendance_entry': return state.attendanceLogs;
       default: return [];
     }
  };

  const rawList = getList();
  
  // Filtering Logic
  const filteredList = rawList.filter((item: any) => {
    // 2. Date Range
    if (filters.dateStart && item.date < filters.dateStart) return false;
    if (filters.dateEnd && item.date > filters.dateEnd) return false;

    // 3. Time Range (Simple string compare works for HH:mm if format consistent)
    if (filters.timeStart && item.time < filters.timeStart) return false;
    if (filters.timeEnd && item.time > filters.timeEnd) return false;

    // 4. Username Filter
    if (filters.username && !item.username.toLowerCase().includes(filters.username.toLowerCase())) return false;

    // 5. Weight/Value Range (applies to weight, itemsProduced, measuredValue)
    const val = item.weight || item.itemsProduced || item.measuredValue;
    if (filters.weightMin && val < Number(filters.weightMin)) return false;
    if (filters.weightMax && val > Number(filters.weightMax)) return false;

    // 6. Keyword (Generic search)
    if (filters.keyword) {
      const s = filters.keyword.toLowerCase();
      const combined = `${item.detail || ''} ${item.notes || ''} ${item.id} ${item.machineId || ''} ${item.workerId || ''}`.toLowerCase();
      if (!combined.includes(s)) return false;
    }

    return true;
  });

  // Simplified List for Display (Removed QC Grouping for full functionality)
  const displayList: any[] = filteredList.sort((a: any, b: any) => {
      // Sort by Date then Time desc
      return b.date.localeCompare(a.date) || b.time.localeCompare(a.time);
  });

  const setPreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setFilters({
      ...filters,
      dateEnd: end.toISOString().split('T')[0],
      dateStart: start.toISOString().split('T')[0]
    });
  };

  const saveCurrentFilter = () => {
      const name = prompt("Name this filter preset:");
      if(name) {
          onSaveFilter({ id: generateId(), name, criteria: filters });
          alert("Filter Saved");
      }
  };

  const handleDelete = (item: any) => {
      if(confirm('Are you sure you want to delete this entry?')) {
          const typeMap: any = { 'machine_entry': 'machine', 'input_entry': 'input', 'output_entry': 'output', 'qc_entry': 'qc', 'attendance_entry': 'attendance' };
          onDelete(typeMap[view], item.id);
      }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-industrial-200 flex flex-col h-full overflow-hidden">
      {/* Filter Bar */}
      <div className="p-4 border-b border-industrial-100 bg-industrial-50 space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
           <span className="text-xs font-bold text-industrial-400 uppercase mr-2">Presets:</span>
           <button onClick={() => setPreset(0)} className="px-3 py-1 bg-white border rounded text-xs hover:bg-industrial-100 transition-colors">Today</button>
           <button onClick={() => setPreset(1)} className="px-3 py-1 bg-white border rounded text-xs hover:bg-industrial-100 transition-colors">Yesterday</button>
           <button onClick={() => setPreset(7)} className="px-3 py-1 bg-white border rounded text-xs hover:bg-industrial-100 transition-colors">This Week</button>
           <button onClick={() => setPreset(30)} className="px-3 py-1 bg-white border rounded text-xs hover:bg-industrial-100 transition-colors">This Month</button>
           
           {user.role === 'ADMIN' && (
               <button onClick={saveCurrentFilter} className="ml-auto px-3 py-1 bg-industrial-800 text-white rounded text-xs flex items-center gap-1 hover:bg-industrial-700">
                   <Bookmark size={12} /> Save Preset
               </button>
           )}
           <button onClick={() => setFilters({dateStart:'', dateEnd:'', timeStart: '', timeEnd: '', username:'', keyword:'', weightMin: '', weightMax: ''})} className="px-3 py-1 text-red-600 text-xs hover:underline flex items-center gap-1">
               <X size={12} /> Clear
           </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
           <div>
             <label className="text-xs text-industrial-500 font-semibold uppercase">From Date</label>
             <input type="date" className="input text-xs py-1" value={filters.dateStart} onChange={e => setFilters({...filters, dateStart: e.target.value})} />
           </div>
           <div>
             <label className="text-xs text-industrial-500 font-semibold uppercase">To Date</label>
             <input type="date" className="input text-xs py-1" value={filters.dateEnd} onChange={e => setFilters({...filters, dateEnd: e.target.value})} />
           </div>
           <div>
             <label className="text-xs text-industrial-500 font-semibold uppercase">User</label>
             <input type="text" placeholder="User..." className="input text-xs py-1" value={filters.username} onChange={e => setFilters({...filters, username: e.target.value})} />
           </div>
           <div>
             <label className="text-xs text-industrial-500 font-semibold uppercase">Keyword</label>
             <input type="text" placeholder="Search..." className="input text-xs py-1" value={filters.keyword} onChange={e => setFilters({...filters, keyword: e.target.value})} />
           </div>
           <div>
             <label className="text-xs text-industrial-500 font-semibold uppercase">Min Val/Wt</label>
             <input type="number" placeholder="0.00" className="input text-xs py-1" value={filters.weightMin} onChange={e => setFilters({...filters, weightMin: e.target.value})} />
           </div>
            <div>
             <label className="text-xs text-industrial-500 font-semibold uppercase">Max Val/Wt</label>
             <input type="number" placeholder="0.00" className="input text-xs py-1" value={filters.weightMax} onChange={e => setFilters({...filters, weightMax: e.target.value})} />
           </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left">
          <thead className="bg-industrial-50 text-industrial-500 text-xs uppercase font-semibold sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 bg-industrial-50">Date / Time</th>
              
              {/* Conditional Headers for QC View vs Standard View */}
              {view === 'qc_entry' ? (
                  <>
                    <th className="px-6 py-3 bg-industrial-50">Item (Spec)</th>
                    <th className="px-6 py-3 bg-industrial-50">Measurement</th>
                    <th className="px-6 py-3 bg-industrial-50">Status</th>
                  </>
              ) : (
                  <>
                    <th className="px-6 py-3 bg-industrial-50">User</th>
                    <th className="px-6 py-3 bg-industrial-50">Details</th>
                    <th className="px-6 py-3 bg-industrial-50 text-right">Value</th>
                  </>
              )}
              
              {view === 'qc_entry' && <th className="px-6 py-3 bg-industrial-50">User</th>}
              <th className="px-6 py-3 bg-industrial-50 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-industrial-100">
            {displayList.length === 0 ? (
              <tr><td colSpan={view === 'qc_entry' ? 6 : 5} className="text-center py-8 text-industrial-400">No records found matching filters.</td></tr>
            ) : displayList.map((item: any) => (
              <tr key={item.id} className="hover:bg-industrial-50">
                
                {/* 1. Date / Time */}
                <td className="px-6 py-3 whitespace-nowrap">
                   <div className="flex flex-col">
                     <span className="font-medium text-industrial-900">{item.date}</span>
                     <span className="text-xs text-industrial-400">{item.time || new Date(item.timestamp).toLocaleTimeString()}</span>
                   </div>
                </td>

                {/* VIEW: QC ENTRY */}
                {view === 'qc_entry' ? (
                    <>
                        {/* 2. Item Name & Size */}
                        <td className="px-6 py-3 font-medium text-industrial-900">
                           <div className="flex flex-col">
                                <span>{state.qcItems.find(i => i.id === item.qcItemId)?.name || 'Unknown Item'}</span>
                                <span className="text-xs text-industrial-500">{state.qcSizes.find(s => s.id === item.qcSizeId)?.name || 'Size?'}</span>
                           </div>
                        </td>
                        
                        {/* 3. Measurement */}
                        <td className="px-6 py-3 font-mono font-bold text-industrial-700">
                           {item.measuredValue}
                        </td>

                        {/* 4. Status */}
                        <td className="px-6 py-3">
                             {item.status === 'CORRECT' ? (
                                <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded text-xs font-bold border border-green-200">
                                    <CheckCircle size={12}/> PASS
                                </span>
                             ) : (
                                <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded text-xs font-bold border border-red-200">
                                    <XCircle size={12}/> FAIL
                                </span>
                             )}
                        </td>

                        {/* 5. User */}
                         <td className="px-6 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${item.username === user.username ? 'bg-brand-100 text-brand-800' : 'bg-gray-100 text-gray-800'}`}>
                                {item.username}
                            </span>
                        </td>
                    </>
                ) : (
                /* VIEW: STANDARD ENTRY */
                    <>
                        <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${item.username === user.username ? 'bg-brand-100 text-brand-800' : 'bg-gray-100 text-gray-800'}`}>
                            {item.username}
                        </span>
                        </td>
                        <td className="px-6 py-3">
                        <div className="flex flex-col">
                            <span className="font-medium text-industrial-900">
                                {item.detail || (state.workers.find(w => w.id === item.workerId)?.name)}
                            </span>
                            <span className="text-xs text-industrial-500">
                            {item.notes && ` • ${item.notes}`}
                            </span>
                        </div>
                        </td>
                        <td className="px-6 py-3 text-right font-mono font-medium">
                        {item.itemsProduced || item.weight || item.measuredValue || item.hoursWorked}
                        </td>
                    </>
                )}

                {/* Action */}
                <td className="px-6 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                       <button 
                        onClick={() => {
                            const val = prompt('Enter new value:', item.itemsProduced || item.weight || item.measuredValue || item.hoursWorked);
                            if(val) onEdit(view, {...item, value: val});
                        }}
                        className="text-industrial-400 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50"
                        title="Edit Entry"
                       >
                         <Edit size={16} />
                       </button>

                       <button 
                        onClick={() => handleDelete(item)}
                        className="text-industrial-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
                        title="Delete Entry"
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};