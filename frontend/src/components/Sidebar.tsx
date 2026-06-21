"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const NAV = [
  { href: '/',            icon: 'bi-grid-1x2',         label: 'Dashboard' },
  { href: '/faqs',        icon: 'bi-question-circle',  label: 'FAQs' },
  { href: '/faqs/submit', icon: 'bi-journal-plus',     label: 'Propose FAQ' },
  { href: '/qa',          icon: 'bi-chat-dots',        label: 'Questions' },
  { href: '/qa/ask',      icon: 'bi-plus-circle',      label: 'Ask' },
  { href: '/bookmarks',   icon: 'bi-bookmark',         label: 'Bookmarks' },
  { href: '/leaderboard', icon: 'bi-trophy',           label: 'Leaderboard' },
  { href: '/profile',     icon: 'bi-sliders2',         label: 'Settings' },
];

const ADMIN_NAV = [
  { href: '/moderation', icon: 'bi-shield-check', label: 'Admin' },
  { href: '/analytics',  icon: 'bi-graph-up',     label: 'Analytics' },
];

function isActive(href: string, pathname: string) {
  if (href === '/') return pathname === '/';
  if (href === '/qa' && pathname.startsWith('/qa/ask')) return false;
  return pathname === href || pathname.startsWith(href + '/');
}

function RailItem({ href, icon, label, pathname }: { href: string; icon: string; label: string; pathname: string }) {
  const active = isActive(href, pathname);
  return (
    <Link href={href} className={`rail-item${active ? ' active' : ''}`} aria-label={label}>
      <i className={`bi ${icon}`} />
      <span className="rail-tooltip">{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const avatarSrc = user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'U')}&background=1C1B19&color=FAFAF8&size=64`;

  return (
    <>
      {/* ── Desktop 72 px rail ── */}
      <aside className="rail">
        <Link href="/" className="rail-logo" aria-label="Home">N</Link>

        <nav className="rail-nav">
          {NAV.map(item => (
            <RailItem key={item.href} {...item} pathname={pathname} />
          ))}
          {(user?.role === 'admin' || user?.role === 'moderator') &&
            ADMIN_NAV.map(item => (
              <RailItem key={item.href} {...item} pathname={pathname} />
            ))
          }
        </nav>

        <div className="rail-bottom">
          {user ? (
            <Link href="/profile" className="rail-avatar" aria-label="My profile">
              <img src={avatarSrc} alt={user.username} />
            </Link>
          ) : (
            <Link href="/login" className="rail-login" aria-label="Sign in">
              <i className="bi bi-box-arrow-in-right" />
            </Link>
          )}
        </div>
      </aside>

      {/* ── Mobile horizontal top bar ── */}
      <div className="mobile-rail">
        <Link href="/" className="mobile-logo" aria-label="Home">N</Link>

        <nav className="mobile-nav">
          {NAV.slice(0, 5).map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-nav-item${isActive(item.href, pathname) ? ' active' : ''}`}
              aria-label={item.label}
            >
              <i className={`bi ${item.icon}`} />
            </Link>
          ))}
        </nav>

        <Link href={user ? '/profile' : '/login'} className="mobile-avatar" aria-label="Profile">
          {user
            ? <img src={avatarSrc} alt={user.username} />
            : <i className="bi bi-person" />
          }
        </Link>
      </div>
    </>
  );
}
