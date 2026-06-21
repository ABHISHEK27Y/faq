"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import md5 from 'md5';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { unreadNotifications } = useSocket();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    if (!user) { setNotifications([]); return; }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    axios
      .get(`${apiUrl}/api/notifications`, { headers: { Authorization: `Bearer ${(user as any).token}` } })
      .then(res => setNotifications(res.data))
      .catch(console.error);
  }, [user]);

  const markAsRead = async (id: string, link: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      await axios.patch(`${apiUrl}/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${(user as any)?.token}` },
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      if (link && link.startsWith('/')) window.location.href = link;
    } catch (err) { console.error(err); }
  };

  const markAllAsRead = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      await axios.post(`${apiUrl}/api/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${(user as any)?.token}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) { console.error(err); }
  };

  const avatarSrc = (user as any)?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'U')}&background=1C1B19&color=FAFAF8&size=64`;

  return (
    <header className="top-bar">
      {/* Search */}
      <form className="relative flex-1 max-w-lg" action="/faqs" method="get">
        <i className="bi bi-search pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--graphite)] text-sm" />
        <input
          className="search-input"
          type="search"
          name="q"
          placeholder="Search FAQs…"
          aria-label="Search"
        />
      </form>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => { setShowDropdown(v => !v); setShowProfileDropdown(false); }}
          className="icon-btn relative"
          aria-label="Notifications"
        >
          <i className="bi bi-bell text-sm" />
          {unreadNotifications > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--coral-dot)]" />
          )}
        </button>

        {showDropdown && (
          <div
            className="absolute right-0 mt-2 w-80 z-50 overflow-hidden"
            style={{ border: '1px solid var(--hairline)', borderRadius: 'var(--radius-md)', background: 'var(--surface)' }}
          >
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid var(--hairline)', background: 'var(--paper)' }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--graphite)' }}>
                Notifications
              </span>
              {unreadNotifications > 0 && (
                <button
                  onClick={markAllAsRead}
                  style={{ fontSize: '0.75rem', color: 'var(--clay)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Mark all read
                </button>
              )}
            </div>
            <div style={{ maxHeight: 340, overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <p style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--graphite)' }}>
                  No new notifications
                </p>
              ) : (
                notifications.map(n => (
                  <button
                    key={n._id}
                    onClick={() => markAsRead(n._id, n.link)}
                    className="flex gap-3 w-full text-left cursor-pointer hover:bg-[var(--clay-soft)] p-3 transition-colors border-b border-[var(--hairline)]"
                    style={{ background: !n.isRead ? 'var(--clay-soft)' : 'var(--surface)' }}
                  >
                    <div className="flex-1">
                      <p style={{ fontSize: '0.82rem', fontWeight: n.isRead ? 400 : 600, color: 'var(--ink)', marginBottom: 2 }}>
                        {n.message}
                      </p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--graphite)', fontFamily: 'var(--font-mono)' }}>
                        {new Date(n.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Profile */}
      <div className="relative">
        {user ? (
          <>
            <button
              onClick={() => { setShowProfileDropdown(v => !v); setShowDropdown(false); }}
              className="flex items-center gap-2"
              style={{
                background: 'none',
                border: '1px solid var(--hairline)',
                borderRadius: 'var(--radius-sm)',
                padding: '5px 10px',
                cursor: 'pointer',
                transition: 'border-color 140ms ease',
              }}
            >
              <img src={avatarSrc} alt={user.username} style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink)' }} className="hidden sm:block">
                {user.username}
              </span>
              <i className={`bi bi-chevron-down text-[10px] text-[var(--graphite)] transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showProfileDropdown && (
              <div
                className="absolute right-0 mt-2 w-52 z-50 overflow-hidden"
                style={{ border: '1px solid var(--hairline)', borderRadius: 'var(--radius-md)', background: 'var(--surface)' }}
              >
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--hairline)', background: 'var(--paper)' }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.username}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--graphite)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                </div>
                <div style={{ padding: '6px' }}>
                  {(user.role === 'admin' || user.role === 'moderator') && (
                    <>
                      <Link
                        href="/moderation"
                        onClick={() => setShowProfileDropdown(false)}
                        className="flex items-center gap-2"
                        style={{ padding: '8px 10px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--coral-dot)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: 8 }}
                      >
                        <i className="bi bi-shield-check" /> Admin
                      </Link>
                      <Link
                        href="/analytics"
                        onClick={() => setShowProfileDropdown(false)}
                        className="flex items-center gap-2"
                        style={{ padding: '8px 10px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--coral-dot)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: 8 }}
                      >
                        <i className="bi bi-graph-up" /> Analytics
                      </Link>
                    </>
                  )}
                  <Link
                    href="/profile"
                    onClick={() => setShowProfileDropdown(false)}
                    style={{ padding: '8px 10px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <i className="bi bi-person" /> My Profile
                  </Link>
                </div>
                <div style={{ padding: '6px', borderTop: '1px solid var(--hairline)' }}>
                  <button
                    onClick={logout}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--coral-dot)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, borderRadius: 'var(--radius-sm)' }}
                  >
                    <i className="bi bi-box-arrow-right" /> Sign out
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <Link href="/login" className="btn-primary" style={{ fontSize: '0.8rem' }}>Sign in</Link>
        )}
      </div>
    </header>
  );
}
