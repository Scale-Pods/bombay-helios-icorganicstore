'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useAppContext } from '../ClientWrapper';
import {
  LayoutDashboard,
  Package,
  Bot,
  DollarSign,
  Users,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import { isWithinDateRange } from '@/lib/dateRangeFilter';

export default function MasterDashboard() {
  const { inventory, supportCases, receivables, reviews, contentDrafts, salonLeads, dateRange } = useAppContext();

  // B2B leads pipeline (mock) — no date field on leads, so these are totals, not date-filtered.
  const leadsTotal = salonLeads.length;
  const leadsWon = salonLeads.filter((l) => l.stage === 'Won').length;
  const leadsActive = salonLeads.filter((l) => l.stage !== 'Won').length;

  // Receivables (mock) — filtered by invoice date, since that's the only real date field present
  const dateReceivables = useMemo(
    () =>
      receivables
        .map((r) => ({
          ...r,
          invoices: r.invoices.filter((inv) => isWithinDateRange(inv.date, dateRange)),
        }))
        .filter((r) => dateRange?.from || dateRange?.to ? r.invoices.length > 0 : true),
    [receivables, dateRange]
  );
  const totalOutstanding = dateReceivables.reduce((acc, r) => acc + r.outstanding, 0);
  const overdueCount = dateReceivables.filter((r) => r.overdueDays > 0).length;

  // Inventory (mock)
  const lowStockCount = inventory.filter((p) => {
    const totalStock = p.warehouse + p.amazon + p.blinkit + p.myntra + p.flipkart + p.instamart + p.nykaa + p.shopify;
    const daysLeft = p.avgMonthlySales > 0 ? Math.round((totalStock / p.avgMonthlySales) * 30) : 100;
    return daysLeft <= 15;
  }).length;
  const totalInventoryValue = inventory.reduce((acc, p) => {
    const totalStock = p.warehouse + p.amazon + p.blinkit + p.myntra + p.flipkart + p.instamart + p.nykaa + p.shopify;
    return acc + totalStock * p.cost;
  }, 0);

  // Customer Care (mock)
  const activeCases = supportCases.filter((c) => c.status === 'Open').length;
  const negativeReviews = reviews.filter((r) => r.rating <= 3).length;

  // Content OS (mock)
  const contentInReview = contentDrafts.filter((c) => c.status === 'review').length;

  const channels = [
    {
      id: 'executive',
      name: 'Executive Board',
      href: '/dashboard',
      icon: LayoutDashboard,
      color: 'var(--blue)',
      stat: `₹${(totalOutstanding / 100000).toFixed(1)}L`,
      statLabel: 'Founder overview',
    },
    {
      id: 'inventory',
      name: 'Inventory Intel',
      href: '/inventory',
      icon: Package,
      color: 'var(--orange)',
      stat: `${lowStockCount} SKUs`,
      statLabel: 'Low stock alerts',
    },
    {
      id: 'customer-care',
      name: 'Customer Care',
      href: '/customer-care',
      icon: Bot,
      color: 'var(--green)',
      stat: `${activeCases} open`,
      statLabel: 'Active support cases',
    },
    {
      id: 'content-os',
      name: 'Content OS',
      href: '/marketing',
      icon: Sparkles,
      color: 'var(--pink)',
      stat: `${contentInReview} in review`,
      statLabel: 'Content pipeline',
    },
    {
      id: 'salon-crm',
      name: 'B2B Leads CRM',
      href: '/salon-crm/dashboard',
      icon: Users,
      color: 'var(--purple)',
      stat: `${leadsTotal} leads`,
      statLabel: 'Wholesale pipeline',
    },
    {
      id: 'receivables',
      name: 'Receivables Recovery',
      href: '/accounts-receivable/dashboard',
      icon: DollarSign,
      color: 'var(--red)',
      stat: `${overdueCount} overdue`,
      statLabel: 'AR collections',
    },
  ];

  return (
    <div style={{ animation: 'fadeIn 300ms ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--label-primary)', margin: 0 }}>Master Dashboard</h2>
          <p style={{ fontSize: '13px', color: 'var(--label-secondary)', marginTop: '4px', marginBottom: 0 }}>
            Combined metrics across every channel. Pick a channel below to drill in.
          </p>
        </div>
      </div>

      <div className="metrics-grid mb-24">
        <div className="metric-tile liquid-card" style={{ '--tile-accent-color': 'var(--purple)' } as React.CSSProperties}>
          <span className="label">B2B Leads</span>
          <span className="value">{leadsTotal}</span>
          <span className="trend up" style={{ color: 'var(--purple)' }}><Users size={12} /> {leadsActive} active, {leadsWon} won</span>
        </div>
        <div className="metric-tile liquid-card" style={{ '--tile-accent-color': 'var(--red)' } as React.CSSProperties}>
          <span className="label">Receivables Outstanding</span>
          <span className="value">₹{(totalOutstanding / 100000).toFixed(1)}L</span>
          <span className="trend down" style={{ color: 'var(--red)' }}><Clock size={12} /> {overdueCount} invoices overdue</span>
        </div>
        <div className="metric-tile liquid-card" style={{ '--tile-accent-color': 'var(--orange)' } as React.CSSProperties}>
          <span className="label">Inventory Value</span>
          <span className="value">₹{(totalInventoryValue / 100000).toFixed(1)}L</span>
          <span className="trend down" style={{ color: 'var(--red)' }}><AlertTriangle size={12} /> {lowStockCount} low stock SKUs</span>
        </div>
        <div className="metric-tile liquid-card" style={{ '--tile-accent-color': 'var(--green)' } as React.CSSProperties}>
          <span className="label">Reviews Needing Reply</span>
          <span className="value">{negativeReviews}</span>
          <span className="trend up" style={{ color: 'var(--green)' }}><TrendingUp size={12} /> 3★ and below, across channels</span>
        </div>
      </div>

      <div className="liquid-card mb-24" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>Support & Content Snapshot</h3>
        <p style={{ fontSize: '12px', color: 'var(--label-secondary)', marginBottom: '16px' }}>Quick pulse on customer care and marketing pipeline</p>
        <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div style={{ background: 'var(--fill-quaternary)', padding: '14px', borderRadius: '12px' }}>
            <span style={{ fontSize: '11px', color: 'var(--label-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>Open Support Cases</span>
            <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--green)', marginTop: '4px' }}>{activeCases}</div>
          </div>
          <div style={{ background: 'var(--fill-quaternary)', padding: '14px', borderRadius: '12px' }}>
            <span style={{ fontSize: '11px', color: 'var(--label-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>Negative Reviews Intercepted</span>
            <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--orange)', marginTop: '4px' }}>{negativeReviews}</div>
          </div>
          <div style={{ background: 'var(--fill-quaternary)', padding: '14px', borderRadius: '12px' }}>
            <span style={{ fontSize: '11px', color: 'var(--label-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>Content Awaiting Review</span>
            <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--pink)', marginTop: '4px' }}>{contentInReview}</div>
          </div>
        </div>
      </div>

      <div className="liquid-card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Channels</h3>
        <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {channels.map((c) => {
            const Icon = c.icon;
            return (
              <Link key={c.id} href={c.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div
                  style={{
                    background: 'var(--fill-quaternary)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '14px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    cursor: 'pointer',
                    transition: 'transform 150ms ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${c.color}1a`, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={18} />
                    </div>
                    <ArrowUpRight size={14} style={{ color: 'var(--label-tertiary)' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--label-primary)' }}>{c.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--label-tertiary)', marginTop: '2px' }}>{c.statLabel}</div>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: c.color }}>{c.stat}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
