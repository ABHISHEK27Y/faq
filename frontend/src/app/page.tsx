"use client";
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const CATEGORY_STYLES = [
  { bg: '#FFF7ED', iconBg: '#F97316', color: '#C2410C', icon: 'bi-book' },
  { bg: '#F0FDF4', iconBg: '#22C55E', color: '#15803D', icon: 'bi-mortarboard' },
  { bg: '#FAF5FF', iconBg: '#A855F7', color: '#7E22CE', icon: 'bi-gear' },
  { bg: '#EFF6FF', iconBg: '#3B82F6', color: '#1D4ED8', icon: 'bi-wallet2' },
  { bg: '#FDF2F8', iconBg: '#EC4899', color: '#BE185D', icon: 'bi-house' },
  { bg: '#F0FDFA', iconBg: '#14B8A6', color: '#0F766E', icon: 'bi-people' },
];

const FAQ_DOT_COLORS = ['#F97316', '#A855F7', '#22C55E', '#3B82F6', '#EC4899', '#14B8A6'];

export default function Home() {
  const [faqs, setFaqs]             = useState<any[]>([]);
  const [categories, setCategories]  = useState<any[]>([]);
  const [analytics, setAnalytics]    = useState<any>({ totalFaqs: 0, totalQuestions: 0 });

  useEffect(() => {
    Promise.allSettled([
      axios.get(`${API}/api/faqs`),
      axios.get(`${API}/api/faqs/categories`),
      axios.get(`${API}/api/analytics/dashboard`),
    ])
      .then(([faqRes, catRes, analyticsRes]) => {
        if (faqRes.status === 'fulfilled') setFaqs(faqRes.value.data.faqs ?? faqRes.value.data.data ?? faqRes.value.data ?? []);
        if (catRes.status === 'fulfilled') setCategories(catRes.value.data ?? []);
        if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data ?? {});
      })
      .catch(console.error);
  }, []);

  const popularFaqs = [...faqs]
    .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
    .slice(0, 6);

  return (
    <>
      {/* ── Hero ── */}
      <div className="hero-section">
        <p className="eyebrow">Knowledge Base</p>
        <h1 className="hero-title">How can we help? 👋</h1>

        <form className="hero-search-form" action="/faqs" method="get">
          <i className="bi bi-search" />
          <input
            className="hero-search-input"
            type="search"
            name="q"
            placeholder="Search FAQs, topics, guides…"
            autoComplete="off"
          />
          <button type="submit" className="hero-search-btn">Search</button>
        </form>

        <p className="hero-sub">
          {analytics.totalFaqs ?? faqs.length} articles &nbsp;·&nbsp; {categories.length} categories
        </p>
      </div>

      {/* ── Main content ── */}
      <div className="page-shell">

        {/* Category cards */}
        <div className="section-header" style={{ marginBottom: '1rem' }}>
          <h2 className="section-title">Browse by Category</h2>
          <Link href="/faqs" className="btn-ghost" style={{ fontSize: '0.78rem', minHeight: 32, padding: '0 12px' }}>
            All FAQs
          </Link>
        </div>

        <div className="category-grid">
          {categories.length > 0 ? categories.map((cat, i) => {
            const s = CATEGORY_STYLES[i % CATEGORY_STYLES.length];
            const count = faqs.filter(f =>
              f.category?._id === cat._id || f.category === cat._id
            ).length;
            return (
              <Link
                key={cat._id}
                href={`/faqs?categorySlug=${cat.slug}`}
                className="category-card"
                style={{ background: s.bg, borderColor: s.bg }}
              >
                <div
                  className="category-icon-wrap"
                  style={{ background: s.iconBg }}
                >
                  <i className={`bi ${s.icon}`} />
                </div>
                <div className="category-body">
                  <div className="category-name" style={{ color: s.color }}>{cat.name}</div>
                  <div className="category-count" style={{ color: s.color }}>{count || cat.faqCount || 0} articles</div>
                </div>
                <i className="bi bi-arrow-right category-arrow" style={{ color: s.color }} />
              </Link>
            );
          }) : (
            <p style={{ gridColumn: '1/-1', color: 'var(--graphite)', fontSize: '0.875rem', padding: '1rem 0' }}>
              No categories yet.
            </p>
          )}
        </div>

        {/* Popular questions */}
        <div className="section-header" style={{ marginTop: '2rem', marginBottom: '1rem' }}>
          <h2 className="section-title">Popular Questions</h2>
          <Link href="/faqs" className="btn-ghost" style={{ fontSize: '0.78rem', minHeight: 32, padding: '0 12px' }}>
            View all
          </Link>
        </div>

        <div className="faq-list">
          {popularFaqs.length > 0 ? popularFaqs.map((faq, i) => (
            <Link key={faq._id} href={`/faqs/${faq.slug}`} className="faq-list-item">
              <i
                className="bi bi-question-circle-fill faq-list-q"
                style={{ color: FAQ_DOT_COLORS[i % FAQ_DOT_COLORS.length] }}
              />
              <div className="faq-list-body">
                <span className="faq-list-title">{faq.title}</span>
                <span className="faq-list-meta">
                  {faq.category?.name ?? 'General'}&nbsp;·&nbsp;{(faq.viewCount ?? 0).toLocaleString()} views
                </span>
              </div>
              <i className="bi bi-chevron-right faq-list-chevron" />
            </Link>
          )) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--graphite)', fontSize: '0.875rem' }}>
              No FAQs published yet.
            </div>
          )}
        </div>

        {/* Ask CTA */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '22px 28px',
            background: 'linear-gradient(135deg, #FFF7ED 0%, #FAF5FF 100%)',
            border: '1.5px solid #EDD9FF',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '2rem',
            gap: '1rem',
          }}
        >
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--ink)', marginBottom: 4 }}>
              Can&apos;t find what you&apos;re looking for? 🤔
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--graphite)' }}>
              Ask a question and the community will help.
            </p>
          </div>
          <Link
            href="/qa/ask"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #F97316 0%, #A855F7 100%)',
              color: '#fff',
              borderRadius: '99px',
              fontSize: '0.85rem',
              fontWeight: 700,
              textDecoration: 'none',
              flexShrink: 0,
              boxShadow: '0 4px 14px rgba(168,85,247,0.3)',
            }}
          >
            <i className="bi bi-plus-circle" /> Ask a Question
          </Link>
        </div>

        {/* Stats strip */}
        <div className="stats-strip">
          <span>✦ {analytics.totalFaqs ?? faqs.length} published FAQs</span>
          <span>·</span>
          <span>{categories.length} categories</span>
          <span>·</span>
          <span>{analytics.totalQuestions ?? 0} community questions</span>
        </div>

      </div>
    </>
  );
}
