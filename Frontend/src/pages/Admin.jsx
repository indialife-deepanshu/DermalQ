import React, { useEffect, useState, useMemo } from 'react';
import { getAdminDashboard } from '../api/auth_api'; 
import { 
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Legend 
} from 'recharts';
import { 
    MdDashboard, MdPeople, MdAssignment, MdFeedback, 
    MdTrendingUp, MdLocationOn, MdWc, MdCake, MdMenu, MdClose, MdMemory
} from 'react-icons/md'; // Using react-icons as per your dependencies
import './Admin.css';

const Admin = () => {
    const [data, setData] = useState({ users: [], feedback: [], reports: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const response = await getAdminDashboard();
                if (response.data.success) setData(response.data.data);
            } catch (err) { 
                console.error("Fetch Error:", err); 
            } finally { 
                setLoading(false); 
            }
        };
        fetchAdminData();
    }, []);

    const getUserName = (userId) => {
        const user = data.users.find(u => u.id === userId);
        return user ? user.name : "Unknown User";
    };

    // 1. Condition Distribution Logic
    const conditionStats = useMemo(() => {
        const stats = {};
        data.reports.forEach(report => {
            const label = report.analysisResult?.topMatch?.name || 'Unknown';
            stats[label] = (stats[label] || 0) + 1;
        });
        return Object.keys(stats).map(key => ({ name: key, value: stats[key] }));
    }, [data.reports]);

    // 2. Localization Stats
    const localizationStats = useMemo(() => {
        const stats = {};
        data.reports.forEach(report => {
            const loc = report.localization || 'Unknown';
            stats[loc] = (stats[loc] || 0) + 1;
        });
        return Object.keys(stats).map(key => ({ name: key, count: stats[key] }));
    }, [data.reports]);

    // 3. Gender Distribution (New)
    const genderStats = useMemo(() => {
        const stats = {};
        data.reports.forEach(r => {
            const g = r.gender || "Unknown";
            stats[g] = (stats[g] || 0) + 1;
        });
        return Object.keys(stats).map(key => ({ name: key, value: stats[key] }));
    }, [data.reports]);

    // 4. Age Range Distribution (New - Bucketed)
    const ageStats = useMemo(() => {
        const buckets = { "0-18": 0, "19-30": 0, "31-45": 0, "46-60": 0, "60+": 0 };
        data.reports.forEach(r => {
            const age = r.age;
            if (!age) return;
            if (age <= 18) buckets["0-18"]++;
            else if (age <= 30) buckets["19-30"]++;
            else if (age <= 45) buckets["31-45"]++;
            else if (age <= 60) buckets["46-60"]++;
            else buckets["60+"]++;
        });
        return Object.keys(buckets).map(key => ({ range: key, count: buckets[key] }));
    }, [data.reports]);

    // --- NEW: Model Usage Stats ---
    const modelStats = useMemo(() => {
        const stats = {};
        data.reports.forEach(r => {
            const model = r.modelName || r.modelId || "Unknown Model";
            stats[model] = (stats[model] || 0) + 1;
        });
        return Object.keys(stats).map(key => ({ name: key, count: stats[key] }));
    }, [data.reports]);

    // 6. Activity Tracking
    const activityStats = useMemo(() => {
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        return last7Days.map(date => ({
            date: date.slice(5), 
            Reports: data.reports.filter(r => r.createdAt.startsWith(date)).length,
            Users: data.users.filter(u => u.createdAt.startsWith(date)).length
        }));
    }, [data.reports, data.users]);

    if (loading) return (
        <div className="admin-loading-screen">
            <div className="spinner"></div>
            <p>Gathering Dashboard Insights...</p>
        </div>
    );

    const COLORS = ['#0082f3', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <div className="admin-layout">
            {/* MOBILE HEADER */}
            <div className="mobile-top-bar">
                <div className="sidebar-brand">
                    <div className="logo-box">S</div>
                    <h2 style={{color: '#0082f3', margin: 0}}>SkinAdmin</h2>
                </div>
                <button className="menu-toggle" onClick={toggleSidebar}>
                    {sidebarOpen ? <MdClose /> : <MdMenu />}
                </button>
            </div>

            {/* SIDEBAR OVERLAY */}
            {sidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

            {/* SIDEBAR */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-brand desktop-only">
                    <div className="logo-box">S</div>
                    <h2 style={{color: '#0082f3'}}>SkinAdmin</h2>
                </div>
                <nav className="sidebar-nav">
                    <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
                        <MdDashboard /> Overview
                    </button>
                    <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
                        <MdPeople /> Users ({data.users.length})
                    </button>
                    <button className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab('reports')}>
                        <MdAssignment /> Reports ({data.reports.length})
                    </button>
                    <button className={activeTab === 'feedback' ? 'active' : ''} onClick={() => setActiveTab('feedback')}>
                        <MdFeedback /> Feedback ({data.feedback.length})
                    </button>
                </nav>
            </aside>

            {/* MAIN AREA */}
            <main className="admin-content">
                <header className="content-header">
                    <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Dashboard</h1>
                </header>

                {activeTab === 'overview' && (
                    <div className="overview-container">
                        <div className="stats-grid">
                            <div className="stat-item">
                                <div className="stat-icon blue"><MdPeople /></div>
                                <div className="stat-info"><span>Total Users</span><strong>{data.users.length}</strong></div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-icon green"><MdTrendingUp /></div>
                                <div className="stat-info"><span>Total Reports</span><strong>{data.reports.length}</strong></div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-icon yellow"><MdFeedback /></div>
                                <div className="stat-info"><span>Total Feedback</span><strong>{data.feedback.length}</strong></div>
                            </div>
                        </div>

                        <div className="charts-main-row">
                            <div className="chart-card large">
                                <h3>Platform Activity (Last 7 Days)</h3>
                                <div className="chart-wrapper">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={activityStats}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="Reports" stroke="#0082f3" strokeWidth={3} dot={{r: 4}} />
                                            <Line type="monotone" dataKey="Users" stroke="#10b981" strokeWidth={3} dot={{r: 4}} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* NEW: Model Distribution Chart */}
                            <div className="chart-card">
                                <h3><MdMemory /> AI Model Performance</h3>
                                <div className="chart-wrapper">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={modelStats} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#eee" />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" width={100} fontSize={12} />
                                            <Tooltip cursor={{fill: '#f8fafc'}} />
                                            <Bar dataKey="count" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Gender Distribution */}
                            <div className="chart-card">
                                <h3><MdWc /> Gender Breakdown</h3>
                                <div className="chart-wrapper">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={genderStats} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                                {genderStats.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Age Distribution */}
                            <div className="chart-card">
                                <h3><MdCake /> Age Demographics</h3>
                                <div className="chart-wrapper">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={ageStats}>
                                            <XAxis dataKey="range" />
                                            <YAxis />
                                            <Tooltip cursor={{fill: 'transparent'}} />
                                            <Bar dataKey="count" fill="#ec4899" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="chart-card">
                                <h3>Condition Distribution</h3>
                                <div className="chart-wrapper">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={conditionStats} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                                {conditionStats.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="chart-card">
                                <h3>Scan Localization</h3>
                                <div className="chart-wrapper">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={localizationStats}>
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip cursor={{fill: 'transparent'}} />
                                            <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead><tr><th>Name/ID</th><th>Email</th><th>Role</th><th>Date</th></tr></thead>
                            <tbody>
                                {data.users.map(u => (
                                    <tr key={u.id}>
                                        <td><strong>{u.name}</strong><br/><small>{u.id}</small></td>
                                        <td>{u.email}</td>
                                        <td><span className={u.isAdmin ? 'tag admin' : 'tag'}>{u.isAdmin ? 'Admin' : 'User'}</span></td>
                                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'reports' && (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead><tr><th>Report ID</th><th>Name/ID</th><th>Location</th><th>Diagnosis</th><th>Date</th></tr></thead>
                            <tbody>
                                {data.reports.map(r => (
                                    <tr key={r.id}>
                                        <td>{r.id}</td>
                                        <td><strong>{getUserName(r.userId)}</strong><br/><small>{r.userId}</small></td>
                                        <td><MdLocationOn /> {r.localization}</td>
                                        <td>{r.analysisResult?.topMatch?.name}</td>
                                        <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'feedback' && (
                    <div className="feedback-grid">
                        {data.feedback.map(f => (
                            <div key={f.id} className="feedback-card">
                                <div className="feedback-header">
                                    <div>
                                        <strong>User: {getUserName(f.userId)}</strong><br/>
                                        <small>Id: {f.userId}</small>
                                    </div>
                                    <span>{new Date(f.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p style={{color: 'black'}}>"{f.message}"</p>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Admin;