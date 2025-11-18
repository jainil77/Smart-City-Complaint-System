import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { FaCalendarAlt, FaCheckCircle, FaExclamationTriangle, FaClock, FaFilter, FaMap } from 'react-icons/fa';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

// --- COLORS ---
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const STATUS_COLORS = {
  'Pending': '#ef4444',
  'In Process': '#3b82f6',
  'Resolved': '#22c55e',
  'Rejected': '#6b7280'
};

function SuperAdminStats() {
  const [complaints, setComplaints] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- FILTERS ---
  const [timeRange, setTimeRange] = useState('30');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [zoneFilter, setZoneFilter] = useState('All');

  const CATEGORIES = ['All', 'Hygiene', 'Roads', 'Electricity', 'Water', 'Other'];

  // 1. Fetch Zones
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/zones');
        setZones(res.data || []);
      } catch (err) {
        console.error("Error loading zones", err);
      }
    };
    fetchZones();
  }, []);

  // 2. Fetch Complaints
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:8080/api/superadmin/complaints?zone=${zoneFilter}`, { 
          withCredentials: true 
        });
        setComplaints(res.data || []);
      } catch (err) {
        console.error("Error loading stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [zoneFilter]);

  // --- FILTERING ---
  const filteredData = useMemo(() => {
    const now = new Date();
    const cutoffDate = new Date();
    
    if (timeRange !== 'all') {
      cutoffDate.setDate(now.getDate() - parseInt(timeRange));
    }

    return complaints.filter(c => {
      const created = new Date(c.createdAt);
      const matchesTime = timeRange === 'all' || created >= cutoffDate;
      const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
      return matchesTime && matchesCategory;
    });
  }, [complaints, timeRange, categoryFilter]);

  // --- KPI CALCULATIONS ---
  const stats = useMemo(() => {
    const total = filteredData.length;
    const resolved = filteredData.filter(c => c.status === 'Resolved').length;
    
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    const resolvedComplaints = filteredData.filter(c => c.status === 'Resolved' && c.resolvedAt);
    let totalTime = 0;
    resolvedComplaints.forEach(c => {
      totalTime += (new Date(c.resolvedAt) - new Date(c.createdAt));
    });
    const avgTimeDays = resolvedComplaints.length > 0 ? (totalTime / resolvedComplaints.length / (1000 * 60 * 60 * 24)).toFixed(1) : "0.0";

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const criticalBacklog = complaints.filter(c => c.status === 'Pending' && new Date(c.createdAt) < sevenDaysAgo).length;

    return { total, resolutionRate, avgTimeDays, criticalBacklog };
  }, [filteredData, complaints]);

  // --- CHART DATA ---
  const categoryData = useMemo(() => {
    const counts = {};
    filteredData.forEach(c => {
      if (!c.category || c.category === 'Pending Classification' || c.category === 'Other' || c.category === 'other') return;
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({ name: key, count: counts[key] }));
  }, [filteredData]);

  const statusData = useMemo(() => {
    const counts = { 'Pending': 0, 'In Process': 0, 'Resolved': 0, 'Rejected': 0 };
    filteredData.forEach(c => {
      if (counts[c.status] !== undefined) counts[c.status]++;
      else if (c.status === 'Assigned') counts['In Process']++; 
      else if (c.status === 'Admin Accepted') counts['Pending']++;
      else if (c.status === 'In Progress') counts['In Process']++; // Normalize In Progress
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [filteredData]);

  // --- PARTNER LEADERBOARD ---
  const partnerStats = useMemo(() => {
    const map = {};
    filteredData.forEach(c => {
        if (!c.assignedTo) return;
        const id = typeof c.assignedTo === 'object' ? c.assignedTo._id : c.assignedTo;
        const name = typeof c.assignedTo === 'object' ? (c.assignedTo.name || c.assignedTo.email) : 'Unknown Partner';
        
        if (!map[id]) map[id] = { name, resolved: 0, active: 0 };
        if (c.status === 'Resolved') map[id].resolved++;
        if (['Assigned', 'In Process', 'In Progress'].includes(c.status)) map[id].active++;
    });
    return Object.values(map).sort((a, b) => b.resolved - a.resolved).slice(0, 5);
  }, [filteredData]);

  if (loading) return <div className="p-8 text-zinc-400 text-center">Loading City Analytics...</div>;

  return (
    <div className="p-8 pb-24">
      {/* Header & Filters */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">City Health Monitor</h1>
          <p className="text-zinc-400">Super Admin Overview</p>
        </div>
        
        <div className="flex flex-wrap gap-3 bg-zinc-900 p-2 rounded-lg border border-zinc-800">
          {/* Zone Filter */}
          <div className="flex items-center px-2 gap-2 border-r border-zinc-700">
            <FaMap className="text-green-500" />
            <select value={zoneFilter} onChange={(e) => setZoneFilter(e.target.value)} className="bg-transparent text-white text-sm focus:outline-none cursor-pointer">
              <option value="All" className="bg-zinc-900">All Zones</option>
              {zones.map(z => <option key={z._id} value={z._id} className="bg-zinc-900">{z.name}</option>)}
            </select>
          </div>
          {/* Time Filter */}
          <div className="flex items-center px-2 gap-2 border-r border-zinc-700">
            <FaCalendarAlt className="text-purple-500" />
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="bg-transparent text-white text-sm focus:outline-none cursor-pointer">
              <option value="7" className="bg-zinc-900">Last 7 Days</option>
              <option value="30" className="bg-zinc-900">Last 30 Days</option>
              <option value="all" className="bg-zinc-900">All Time</option>
            </select>
          </div>
          {/* Category Filter */}
          <div className="flex items-center px-2 gap-2">
            <FaFilter className="text-blue-500" />
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-transparent text-white text-sm focus:outline-none cursor-pointer">
              {CATEGORIES.map(c => <option key={c} value={c} className="bg-zinc-900">{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 shadow-lg">
            <p className="text-zinc-400 text-xs uppercase font-bold">Total Complaints</p>
            <h3 className="text-3xl font-bold text-white mt-1">{stats.total}</h3>
        </div>
        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 shadow-lg">
            <p className="text-zinc-400 text-xs uppercase font-bold">Resolution Rate</p>
            <h3 className="text-3xl font-bold text-white mt-1">{stats.resolutionRate}%</h3>
            <div className="w-full bg-zinc-700 h-1.5 mt-2 rounded-full"><div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${stats.resolutionRate}%` }}></div></div>
        </div>
        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 shadow-lg">
            <p className="text-zinc-400 text-xs uppercase font-bold">Avg. Resolution Time</p>
            <h3 className="text-3xl font-bold text-white mt-1">{stats.avgTimeDays} <span className="text-sm text-zinc-500 font-normal">Days</span></h3>
        </div>
        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 shadow-lg">
            <p className="text-zinc-400 text-xs uppercase font-bold">Critical Backlog</p>
            <h3 className="text-3xl font-bold text-red-500 mt-1">{stats.criticalBacklog}</h3>
            <p className="text-xs text-zinc-500">Pending &gt; 7 Days</p>
        </div>
      </div>

      {/* --- EQUAL HEIGHT CHARTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Chart 1: Bar Chart */}
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 h-96 flex flex-col">
          <h3 className="text-white font-bold mb-4">Complaints by Category</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }} cursor={{fill: '#27272a'}} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Pie Chart */}
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 h-96 flex flex-col">
          <h3 className="text-white font-bold mb-2">Current Status Distribution</h3>
          
          <div className="flex-1 w-full min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Legend fixed at bottom of container */}
          <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2">
            {statusData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: STATUS_COLORS[entry.name] || COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-sm text-zinc-300 font-medium">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Leaderboard Table */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-zinc-800"><h3 className="text-white font-bold">Top Performing Partners</h3></div>
        <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-950">
              <tr>
                <th className="px-6 py-3">Partner Name</th>
                <th className="px-6 py-3">Resolved</th>
                <th className="px-6 py-3">Active Load</th>
                <th className="px-6 py-3">Efficiency</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              {partnerStats.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-4 text-center text-zinc-500">No active partners found in filter range.</td></tr>
              ) : (
                partnerStats.map((p, index) => (
                  <tr key={index} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                    <td className="px-6 py-4 font-medium text-white">{p.name}</td>
                    <td className="px-6 py-4 text-green-400 font-bold">{p.resolved}</td>
                    <td className="px-6 py-4 text-blue-400">{p.active}</td>
                    <td className="px-6 py-4">
                      <div className="w-24 bg-zinc-700 rounded-full h-1.5">
                        <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${(p.resolved / (p.resolved + p.active + 0.1)) * 100}%` }}></div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
        </table>
      </div>
    </div>
  );
}

export default SuperAdminStats;