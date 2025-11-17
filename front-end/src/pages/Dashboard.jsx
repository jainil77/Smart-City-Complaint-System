import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { FaCalendarAlt, FaCheckCircle, FaExclamationTriangle, FaClock, FaFilter } from 'react-icons/fa';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

// --- COLORS FOR CHARTS ---
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const STATUS_COLORS = {
  'Pending': '#ef4444',    // Red
  'In Process': '#3b82f6', // Blue
  'Resolved': '#22c55e',   // Green
  'Rejected': '#6b7280'    // Gray
};

function Dashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- FILTERS STATE ---
  const [timeRange, setTimeRange] = useState('30'); // '7', '30', 'all'
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  const CATEGORIES = ['All', 'Hygiene', 'Roads', 'Electricity', 'Water', 'Other'];

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch ALL data once, then filter locally for speed
        const res = await axios.get('http://localhost:8080/api/admin/complaints/all', { withCredentials: true });
        setComplaints(res.data || []);
      } catch (err) {
        console.error("Error loading dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- FILTERING LOGIC ---
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
    const pending = filteredData.filter(c => c.status === 'Pending').length;
    
    // 1. Resolution Rate
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    // 2. Avg Resolution Time (in Days)
    const resolvedComplaints = filteredData.filter(c => c.status === 'Resolved' && c.resolvedAt);
    let totalTime = 0;
    resolvedComplaints.forEach(c => {
      const start = new Date(c.createdAt);
      const end = new Date(c.resolvedAt);
      totalTime += (end - start);
    });
    const avgTimeMs = resolvedComplaints.length > 0 ? totalTime / resolvedComplaints.length : 0;
    const avgTimeDays = (avgTimeMs / (1000 * 60 * 60 * 24)).toFixed(1);

    // 3. Critical Backlog (Pending > 7 Days)
    const criticalBacklog = complaints.filter(c => {
      const created = new Date(c.createdAt);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return c.status === 'Pending' && created < sevenDaysAgo;
    }).length;

    return { total, resolutionRate, avgTimeDays, criticalBacklog };
  }, [filteredData, complaints]); // Note: criticalBacklog checks global complaints usually

  // --- CHART DATA PREPARATION ---
  
 // Chart A: Category Distribution
  const categoryData = useMemo(() => {
    const counts = {};
    filteredData.forEach(c => {
      // --- FILTER: Exclude missing categories, 'Pending Classification', and 'Other' ---
      if (
        !c.category || 
        c.category === 'Pending Classification' || 
        c.category === 'Other' || 
        c.category === 'other' // Case safety just in case
      ) {
        return;
      }

      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({ name: key, count: counts[key] }));
  }, [filteredData]);

  // Chart B: Status Distribution
  const statusData = useMemo(() => {
    const counts = { 'Pending': 0, 'In Process': 0, 'Resolved': 0, 'Rejected': 0 };
    filteredData.forEach(c => {
      // Group diverse statuses if needed, or map directly
      if (counts[c.status] !== undefined) counts[c.status]++;
      else if (c.status === 'Assigned') counts['In Process']++; // Group Assigned with In Process
      else if (c.status === 'Admin Accepted') counts['Pending']++;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [filteredData]);

  // --- PARTNER LEADERBOARD ---
  // --- PARTNER LEADERBOARD ---
  const partnerStats = useMemo(() => {
    const map = {};
    
    complaints.forEach(c => {
      // Skip if no partner is assigned
      if (!c.assignedTo) return;

      // Handle cases where assignedTo might be just an ID string (backend issue)
      // or an object (correct behavior)
      const id = typeof c.assignedTo === 'object' ? c.assignedTo._id : c.assignedTo;
      const name = typeof c.assignedTo === 'object' ? (c.assignedTo.name || c.assignedTo.email) : 'Unknown Partner';

      if (!map[id]) {
        map[id] = { 
          name: name || 'Unknown Partner', 
          resolved: 0, 
          active: 0 
        };
      }
      
      if (c.status === 'Resolved') map[id].resolved++;
      if (['Assigned', 'In Process'].includes(c.status)) map[id].active++;
    });

    // Convert to array and sort by Resolved count
    return Object.values(map)
      .sort((a, b) => b.resolved - a.resolved)
      .slice(0, 5); // Show Top 5
  }, [complaints]);

  if (loading) return <div className="p-8 text-zinc-400">Loading dashboard analytics...</div>;

  return (
    <div className="p-8 pb-24">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">City Health Monitor</h1>
          <p className="text-zinc-400">Real-time overview of complaint resolution metrics.</p>
        </div>
        
        {/* --- FILTER BAR --- */}
        <div className="mt-4 md:mt-0 flex gap-3 bg-zinc-900 p-2 rounded-lg border border-zinc-800">
          <div className="flex items-center px-2 gap-2 border-r border-zinc-700">
            <FaCalendarAlt className="text-purple-500" />
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-transparent text-white text-sm focus:outline-none cursor-pointer"
            >
              {/* Added 'bg-zinc-900' to options to fix the white background issue */}
              <option value="7" className="bg-zinc-900 text-white">Last 7 Days</option>
              <option value="30" className="bg-zinc-900 text-white">Last 30 Days</option>
              <option value="all" className="bg-zinc-900 text-white">All Time</option>
            </select>
          </div>
          <div className="flex items-center px-2 gap-2">
            <FaFilter className="text-blue-500" />
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-white text-sm focus:outline-none"
            >
              {CATEGORIES.map(c => <option key={c} value={c} className="bg-zinc-900 text-white">{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* --- KPI CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total */}
        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-zinc-400 text-xs uppercase font-bold tracking-wider">Total Complaints</p>
              <h3 className="text-3xl font-bold text-white mt-1">{stats.total}</h3>
            </div>
            <div className="p-2 bg-purple-900/30 rounded-lg text-purple-400"><FaFilter /></div>
          </div>
          <p className="text-xs text-zinc-500 mt-2">In selected period</p>
        </div>

        {/* Resolution Rate */}
        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-zinc-400 text-xs uppercase font-bold tracking-wider">Resolution Rate</p>
              <h3 className="text-3xl font-bold text-white mt-1">{stats.resolutionRate}%</h3>
            </div>
            <div className="p-2 bg-green-900/30 rounded-lg text-green-400"><FaCheckCircle /></div>
          </div>
          <div className="w-full bg-zinc-700 h-1.5 mt-3 rounded-full">
            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${stats.resolutionRate}%` }}></div>
          </div>
        </div>

        {/* Avg Time */}
        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-zinc-400 text-xs uppercase font-bold tracking-wider">Avg. Resolution Time</p>
              <h3 className="text-3xl font-bold text-white mt-1">{stats.avgTimeDays} <span className="text-sm font-normal text-zinc-400">Days</span></h3>
            </div>
            <div className="p-2 bg-blue-900/30 rounded-lg text-blue-400"><FaClock /></div>
          </div>
          <p className="text-xs text-zinc-500 mt-2">From submission to completion</p>
        </div>

        {/* Critical Backlog */}
        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-zinc-400 text-xs uppercase font-bold tracking-wider">Critical Backlog</p>
              <h3 className="text-3xl font-bold text-red-500 mt-1">{stats.criticalBacklog}</h3>
            </div>
            <div className="p-2 bg-red-900/30 rounded-lg text-red-400"><FaExclamationTriangle /></div>
          </div>
          <p className="text-xs text-red-900/70 mt-2">Pending &gt; 7 Days</p>
        </div>
      </div>

      {/* --- CHARTS SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Chart 1: Bar Chart (Category) */}
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <h3 className="text-white font-bold mb-6">Complaints by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }} 
                  itemStyle={{ color: '#fff' }}
                  cursor={{ fill: '#27272a' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Pie Chart (Status) */}
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 flex flex-col">
          <h3 className="text-white font-bold mb-4">Current Status Distribution</h3>
          <div className="flex-1 min-h-[250px] relative">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- PARTNER LEADERBOARD --- */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-zinc-800">
          <h3 className="text-white font-bold">Top Performing Partners</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-950">
              <tr>
                <th className="px-6 py-3">Partner Name</th>
                <th className="px-6 py-3">Tasks Resolved</th>
                <th className="px-6 py-3">Current Load (Active)</th>
                <th className="px-6 py-3">Efficiency</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              {partnerStats.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-4 text-center text-zinc-500">No partner data available</td></tr>
              ) : (
                partnerStats.map((p, index) => (
                  <tr key={index} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                    <td className="px-6 py-4 font-medium text-white">{p.name}</td>
                    <td className="px-6 py-4 text-green-400 font-bold">{p.resolved}</td>
                    <td className="px-6 py-4 text-blue-400">{p.active}</td>
                    <td className="px-6 py-4">
                      {/* Simple calculation for efficiency bar based on resolved vs total */}
                      <div className="w-24 bg-zinc-700 rounded-full h-1.5">
                        <div 
                          className="bg-purple-500 h-1.5 rounded-full" 
                          style={{ width: `${(p.resolved / (p.resolved + p.active + 0.1)) * 100}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;