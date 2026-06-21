"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/analytics/dashboard`)
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));

    if (user?.token) {
      axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/users`, { headers: { Authorization: `Bearer ${user.token}` } })
        .then(res => setUsers(res.data))
        .catch(console.error)
        .finally(() => setUsersLoading(false));
    }
  }, [user]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/users/${userId}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  if (loading) return <div className="p-10 text-center animate-pulse text-slate-500">Loading Analytics...</div>;
  if (!data) return <div className="p-10 text-center text-slate-500">Failed to load analytics.</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="mb-8">
        <p className="eyebrow mb-2">Workspace</p>
        <h1 className="page-title">Analytics</h1>
        <p className="mt-2 text-slate-500">Platform health and content performance at a glance.</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="stat-card">
          <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
            <i className="bi bi-question-circle"></i>
          </div>
          <div className="stat-value">{data.totalFaqs}</div>
          <div className="stat-label">Published FAQs</div>
        </div>
        <div className="stat-card">
          <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
            <i className="bi bi-chat-dots"></i>
          </div>
          <div className="stat-value">{data.totalQuestions}</div>
          <div className="stat-label">Community Questions</div>
        </div>
        <div className="stat-card">
          <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-amber-50 text-amber-600">
            <i className="bi bi-search"></i>
          </div>
          <div className="stat-value">{data.topSearches.length}</div>
          <div className="stat-label">Search Keywords</div>
        </div>
        <div className="stat-card">
          <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-red-50 text-red-600">
            <i className="bi bi-question"></i>
          </div>
          <div className="stat-value">{data.unanswered.length}</div>
          <div className="stat-label">Unanswered</div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="card-modern overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="section-title">Most Viewed FAQs</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {data.mostViewed.length === 0 ? <p className="px-6 py-4 text-sm text-slate-500">No data yet.</p> : data.mostViewed.map((f: any) => (
              <Link key={f._id} href={`/faqs/${f.slug}`} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition">
                <p className="text-sm font-semibold text-slate-800 truncate pr-4">{f.title}</p>
                <span className="text-xs font-bold text-slate-500 flex-shrink-0"><i className="bi bi-eye mr-1"></i>{f.viewCount || 0}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="card-modern overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="section-title">Top Search Keywords</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {data.topSearches.length === 0 ? <p className="px-6 py-4 text-sm text-slate-500">No searches logged yet.</p> : data.topSearches.map((s: any) => (
              <div key={s._id} className="flex items-center justify-between px-6 py-4">
                <p className="text-sm font-semibold text-slate-800">{s.query}</p>
                <span className="badge-soft">{s.count} searches</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card-modern overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="section-title">Unanswered Questions</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {data.unanswered.length === 0 ? <p className="px-6 py-4 text-sm text-slate-500">All questions have been answered!</p> : data.unanswered.map((q: any) => (
              <Link key={q._id} href={`/qa/${q._id}`} className="block px-6 py-4 hover:bg-slate-50 transition">
                <p className="text-sm font-semibold text-slate-800">{q.title}</p>
                <p className="text-xs text-slate-500 mt-1">{new Date(q.createdAt).toLocaleDateString()}</p>
              </Link>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="card-modern overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="section-title">Trending Tags</h2>
            </div>
            <div className="flex flex-wrap gap-2 p-5">
              {data.trendingTags.length === 0 ? <p className="text-sm text-slate-500">No tags yet.</p> : data.trendingTags.map((t: any) => (
                <span key={t.tag} className="tag-pill">{t.tag} <strong className="ml-1">{t.count}</strong></span>
              ))}
            </div>
          </section>

          <section className="card-modern overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="section-title">Active Contributors</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {data.activeContributors.length === 0 ? <p className="px-6 py-4 text-sm text-slate-500">No contributors yet.</p> : data.activeContributors.map((c: any) => (
                <div key={c._id} className="flex items-center justify-between px-6 py-3">
                  <span className="text-sm font-semibold text-slate-800">{c.username}</span>
                  <span className="text-xs text-slate-500">{c.answerCount} answers</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* User Management Section */}
      {(user?.role === 'admin' || user?.role === 'legacy_account') && (
        <section className="card-modern mt-8 overflow-hidden animate-slide-up border-t-4 border-t-indigo-500">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="section-title text-indigo-900">User Role Management</h2>
            <p className="text-slate-500 text-sm mt-1">View all registered users and assign administrative privileges.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50">
                <tr className="border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Username</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Joined</th>
                  <th className="py-4 px-6">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersLoading ? (
                  <tr><td colSpan={4} className="text-center py-6 text-slate-500 animate-pulse font-medium">Loading users...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-6 text-slate-500">No users found.</td></tr>
                ) : users.map((u: any) => (
                  <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900">@{u.username}</td>
                    <td className="py-4 px-6 text-sm text-slate-500">{u.email}</td>
                    <td className="py-4 px-6 text-sm text-slate-500 font-mono">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 px-6">
                      <select 
                        value={u.role || 'user'}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        disabled={u._id === user._id}
                        className={`text-sm font-bold rounded-lg px-3 py-1.5 outline-none cursor-pointer border shadow-sm transition-colors ${
                          u.role === 'admin' || u.role === 'legacy_account' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 
                          u.role === 'moderator' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 
                          'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                        style={{ opacity: u._id === user._id ? 0.6 : 1 }}
                      >
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
