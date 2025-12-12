import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { AppState } from '../types';
import { Activity, AlertTriangle, CheckCircle, Package } from 'lucide-react';

interface DashboardProps {
  state: AppState;
}

export const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const { machines, machineLogs: productionLogs, qcLogs } = state;

  // Compute stats
  const totalProduction = productionLogs.reduce((acc, curr) => acc + curr.itemsProduced, 0);
  const totalQC = qcLogs.length;
  const passedQC = qcLogs.filter(q => q.status === 'CORRECT').length;
  const passRate = totalQC > 0 ? ((passedQC / totalQC) * 100).toFixed(1) : 100;

  // Chart Data Preparation
  const productionByMachine = machines.map(m => {
    const total = productionLogs
      .filter(l => l.machineId === m.id)
      .reduce((acc, curr) => acc + curr.itemsProduced, 0);
    return { name: m.name, production: total };
  });

  const qcStatusData = [
    { name: 'Pass', value: passedQC },
    { name: 'Fail', value: totalQC - passedQC },
  ];

  const COLORS = ['#10b981', '#ef4444'];

  const StatCard = ({ title, value, sub, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-industrial-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-industrial-500">{title}</p>
          <h3 className="text-2xl font-bold text-industrial-900 mt-1">{value}</h3>
          <p className="text-xs text-industrial-400 mt-1">{sub}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-industrial-900">Plant Dashboard</h2>
        <p className="text-industrial-500">Real-time production and quality metrics</p>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Production" 
          value={totalProduction.toLocaleString()} 
          sub="Items produced this session"
          icon={Package}
          color="bg-blue-500"
        />
        <StatCard 
          title="Quality Pass Rate" 
          value={`${passRate}%`} 
          sub={`${passedQC}/${totalQC} items passed`}
          icon={CheckCircle}
          color="bg-green-500"
        />
        <StatCard 
          title="Active Machines" 
          value={machines.filter(m => m.status === 'active').length} 
          sub={`Out of ${machines.length} total`}
          icon={Activity}
          color="bg-purple-500"
        />
        <StatCard 
          title="QC Issues" 
          value={totalQC - passedQC} 
          sub="Failed inspections"
          icon={AlertTriangle}
          color="bg-red-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-industrial-200">
          <h3 className="text-lg font-semibold text-industrial-800 mb-4">Production by Machine</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productionByMachine}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="production" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-industrial-200">
          <h3 className="text-lg font-semibold text-industrial-800 mb-4">Quality Control Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={qcStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {qcStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};