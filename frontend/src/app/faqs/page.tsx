"use client";
import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';

const CARD_ACCENTS = [
  { border: '#F97316', bg: '#FFF7ED', tag: '#C2410C' },
  { border: '#A855F7', bg: '#FAF5FF', tag: '#7E22CE' },
  { border: '#22C55E', bg: '#F0FDF4', tag: '#15803D' },
  { border: '#3B82F6', bg: '#EFF6FF', tag: '#1D4ED8' },
  { border: '#EC4899', bg: '#FDF2F8', tag: '#BE185D' },
  { border: '#14B8A6', bg: '#F0FDFA', tag: '#0F766E' },
];

function FaqContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q            = searchParams.get('q')            || '';
  const categorySlug = searchParams.get('categorySlug') || '';

  const [faqs, setFaqs]                 = useState<any[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading]           = useState(true);
  const [loadingMore, setLoadingMore]   = useState(false);
  const [searchInput, setSearchInput]   = useState(q);
  const [page, setPage]                 = useState(1);
  const [hasMore, setHasMore]           = useState(true);

  const buildUrl = (p: number) => {
    let url = `http://localhost:5000/api/faqs?page=${p}&limit=10`;
    if (q)            url += `&keyword=${encodeURIComponent(q)}`;
    if (categorySlug) url += `&categorySlug=${encodeURIComponent(categorySlug)}`;
    return url;
  };

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoading(true);
        setPage(1);
        setCategoryName('');
        const res = await axios.get(buildUrl(1));
        const data = res.data.faqs ?? res.data.data ?? res.data;
        setFaqs(data);
        setHasMore(res.data.page < res.data.pages);
        if (data.length > 0 && data[0].category?.name) setCategoryName(data[0].category.name);
        if (q) axios.post('http://localhost:5000/api/analytics/log-search', { query: q }).catch(() => {});
      } catch (err) {
        console.error('Failed to fetch FAQs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, [q, categorySlug]);

  useEffect(() => {
    if (page === 1) return;
    const fetchMore = async () => {
      try {
        setLoadingMore(true);
        const res = await axios.get(buildUrl(page));
        const data = res.data.faqs ?? res.data;
        setFaqs(prev => [...prev, ...data]);
        setHasMore(res.data.page < res.data.pages);
      } catch (err) {
        console.error('Failed to fetch more FAQs', err);
      } finally {
        setLoadingMore(false);
      }
    };
    fetchMore();
  }, [page, q, categorySlug]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 1.0 }
    );
    const sentinel = document.getElementById('scroll-sentinel');
    if (sentinel) observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/faqs?q=${encodeURIComponent(searchInput)}`);
  };

  return (
    <div style={{ maxWidth: 860, margin: '2rem auto 0' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>
            {categorySlug && categoryName ? categoryName : 'Browse FAQs'}
          </h1>
          <p style={{ color: 'var(--graphite)', fontSize: '0.9rem' }}>
            {categorySlug && categoryName
              ? `Showing FAQs in "${categoryName}"`
              : 'Find answers to commonly asked questions.'}
          </p>
          {categorySlug && (
            <button
              onClick={() => router.push('/faqs')}
              style={{
                marginTop: 8,
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 12px',
                background: 'var(--hairline)',
                color: 'var(--graphite)',
                border: 'none',
                borderRadius: '99px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <i className="bi bi-x" /> Clear filter
            </button>
          )}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} style={{
          display: 'flex',
          alignItems: 'center',
          border: '1.5px solid var(--hairline-strong)',
          borderRadius: '99px',
          background: 'var(--surface)',
          overflow: 'hidden',
          maxWidth: 520,
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        }}>
          <i className="bi bi-search" style={{ padding: '0 12px 0 18px', color: 'var(--graphite)', fontSize: '1rem', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search FAQs…"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            style={{
              flex: 1,
              height: 44,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              color: 'var(--ink)',
              minWidth: 0,
            }}
          />
          <button type="submit" style={{
            height: 44,
            padding: '0 20px',
            background: 'linear-gradient(135deg, #F97316 0%, #A855F7 100%)',
            color: '#fff',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.82rem',
            cursor: 'pointer',
            borderRadius: '0 99px 99px 0',
          }}>
            Search
          </button>
        </form>
      </div>

      {/* Filter strip */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => router.push('/faqs')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 14px',
            background: 'linear-gradient(135deg, #F97316, #A855F7)',
            color: '#fff',
            border: 'none',
            borderRadius: '99px',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          All Topics
        </button>
      </div>

      {/* FAQ cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {loading && page === 1 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--graphite)', fontSize: '0.875rem' }}>
            Loading FAQs…
          </div>
        ) : faqs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--graphite)', fontSize: '0.875rem' }}>
            No FAQs found{q ? ` for "${q}"` : ''}.
          </div>
        ) : (
          <>
            {faqs.map((faq, i) => {
              const accent = CARD_ACCENTS[i % CARD_ACCENTS.length];
              const score = (faq.upvoteCount ?? 0) - (faq.downvoteCount ?? 0);
              return (
                <Link
                  key={faq.slug}
                  href={`/faqs/${faq.slug}`}
                  style={{
                    display: 'block',
                    background: 'var(--surface)',
                    border: `1.5px solid var(--hairline)`,
                    borderLeft: `4px solid ${accent.border}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '18px 20px',
                    textDecoration: 'none',
                    transition: 'box-shadow 140ms ease, transform 140ms ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 18px rgba(0,0,0,0.09)`; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ minWidth: 0 }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>
                        {faq.title}
                      </h3>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center',
                        padding: '3px 10px',
                        background: accent.bg,
                        color: accent.tag,
                        borderRadius: '99px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                      }}>
                        {faq.category?.name || 'General'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--graphite)', fontFamily: 'var(--font-mono)' }}>
                        <i className="bi bi-eye" /> {faq.viewCount ?? 0}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: score >= 0 ? '#16a34a' : '#dc2626', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        <i className={`bi bi-hand-thumbs-${score >= 0 ? 'up' : 'down'}`} /> {score >= 0 ? '+' : ''}{score}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
            <div id="scroll-sentinel" style={{ height: 16 }} />
            {loadingMore && <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--graphite)', fontSize: '0.85rem' }}>Loading more…</div>}
            {!hasMore && faqs.length > 0 && <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--graphite)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>✦ End of list</div>}
          </>
        )}
      </div>
    </div>
  );
}

export default function FaqsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '3rem', textAlign: 'center', color: 'var(--graphite)' }}>Loading FAQs…</div>}>
      <FaqContent />
    </Suspense>
  );
}
