"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useCountUp } from '@/hooks/useCountUp';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/* ── Stat card with count-up ── */
function StatCard({ label, value, featured = false }: { label: string; value: number; featured?: boolean }) {
  const count = useCountUp(value);
  return (
    <div className={`metric-cell${featured ? ' featured' : ''}`}>
      <div className="metric-number">{count.toLocaleString()}</div>
      <div className="metric-label">{label}</div>
    </div>
  );
}

/* ── Mini bar chart (pure CSS) ── */
const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function MiniBarChart({ faqs }: { faqs: any[] }) {
  const data = DAYS.map((label, i) => ({ label, value: faqs[i]?.viewCount ?? 0 }));
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="bar-chart-wrap">
      <div className="bar-chart">
        {data.map(({ label, value }) => (
          <div key={label} className="bar-col">
            <div className="bar-fill" style={{ height: `${Math.round((value / max) * 60)}px` }} />
            <span className="bar-label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Dot colors cycling ── */
const DOT_COLORS = ['var(--clay)', 'var(--sage)', 'var(--coral-dot)', 'var(--clay)', 'var(--sage)'];

export default function Home() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({ totalFaqs: 0, totalQuestions: 0, mostViewed: [] });

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/api/faqs`),
      axios.get(`${API}/api/faqs/categories`),
      axios.get(`${API}/api/analytics/dashboard`),
    ])
      .then(([faqRes, catRes, analyticsRes]) => {
        setFaqs(faqRes.data.faqs ?? []);
        setCategories(catRes.data ?? []);
        setAnalytics(analyticsRes.data ?? {});
      })
      .catch(console.error);
  }, []);

  const totalViews = faqs.reduce((s, f) => s + (f.viewCount ?? 0), 0);
  const maxViews   = Math.max(...faqs.map(f => f.viewCount ?? 0), 1);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  }).toUpperCase();

  return (
    <div className="dash-canvas">

      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <p className="eyebrow" style={{ marginBottom: 6 }}>{today}</p>
          <h1 className="page-title">Knowledge Base</h1>
        </div>
        <div className="page-header-actions">
          <Link href="/faqs" className="btn-ghost">
            <i className="bi bi-search" /> Browse
          </Link>
          <Link href="/qa/ask" className="btn-primary">
            <i className="bi bi-plus" /> Ask Question
          </Link>
        </div>
      </div>

      {/* ── Metrics row ── */}
      <div className="metrics-row">
        <StatCard label="Published FAQs"      value={analytics.totalFaqs     ?? 0} featured />
        <StatCard label="Community Questions" value={analytics.totalQuestions ?? 0} />
        <StatCard label="Categories"          value={categories.length} />
        <StatCard label="Total Views"         value={totalViews} />
      </div>

      {/* ── Two-column content grid ── */}
      <div className="content-grid">

        {/* Left — FAQ table */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Trending FAQs</span>
            <Link
              href="/faqs"
              className="btn-ghost"
              style={{ fontSize: '0.72rem', padding: '3px 10px', minHeight: 'auto' }}
            >
              View all
            </Link>
          </div>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Views</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {faqs.map(faq => (
                  <tr key={faq._id}>
                    <td style={{ maxWidth: 220 }}>
                      <Link
                        href={`/faqs/${faq.slug}`}
                        style={{ fontWeight: 500, color: 'var(--ink)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {faq.title}
                      </Link>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: 'var(--graphite)' }}>
                        {faq.category?.name ?? '—'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar-wrap">
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${Math.round(((faq.viewCount ?? 0) / maxViews) * 100)}%` }}
                          />
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--graphite)', fontFamily: 'var(--font-mono)' }}>
                          {faq.viewCount ?? 0}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${faq.status ?? 'draft'}`}>
                        {faq.status ?? 'draft'}
                      </span>
                    </td>
                  </tr>
                ))}
                {faqs.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--graphite)', padding: '2rem', fontSize: '0.875rem' }}>
                      No FAQs yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right — Activity + Bar chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>

          {/* Most viewed activity feed */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Most Viewed</span>
            </div>
            {analytics.mostViewed?.length > 0 ? (
              analytics.mostViewed.slice(0, 5).map((item: any, i: number) => (
                <div key={item._id} className="activity-item">
                  <div className="activity-dot" style={{ background: DOT_COLORS[i % DOT_COLORS.length] }} />
                  <div style={{ minWidth: 0 }}>
                    <Link href={`/faqs/${item.slug}`} className="activity-lead" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                      {item.title}
                    </Link>
                    <div className="activity-time">{(item.viewCount ?? 0).toLocaleString()} views</div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ padding: '1.25rem 20px', fontSize: '0.85rem', color: 'var(--graphite)' }}>
                No data yet.
              </p>
            )}
          </div>

          {/* View distribution bar chart */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">View Distribution</span>
            </div>
            <MiniBarChart faqs={faqs} />
          </div>

        </div>
      </div>
    </div>
  );
}
