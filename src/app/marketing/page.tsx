'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useAppContext } from '../ClientWrapper';
import {
  Sparkles,
  Calendar,
  FileText,
  Send,
  CheckCircle2,
  Clock,
  MessageSquare,
  Plus,
  Share2,
  Trash,
  X,
  RefreshCw,
  Eye,
  AlertTriangle,
  History,
  ArrowRight,
  Layers,
  BarChart2,
  Maximize2
} from 'lucide-react';

// ─── Custom SVG Icons ─────────────────────────────────────────────────────────

interface IconProps extends React.SVGProps<SVGSVGElement> { size?: number; }

const InstagramIcon = ({ size = 16, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const YoutubeIcon = ({ size = 16, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);
const LinkedinIcon = ({ size = 16, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
  </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContentDraft {
  id: string;
  title: string;
  type: string;
  platform: string;
  product: string;
  status: string;
  scriptText: string;
  author?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  scheduleDate?: string;
  scheduleTime?: string;
  comments?: { author: string; text: string; time: string }[];
  version?: number;
  history?: { status: string; by: string; time: string; note: string }[];
}

interface CalendarPost {
  id: string; date: number; platform: string; title: string; time: string; status: string; img: string; description: string;
}

// ─── Stage Config ─────────────────────────────────────────────────────────────

const STAGES = [
  { key: 'draft',    label: 'AI Drafts',       color: 'var(--label-tertiary)', badge: 'badge-grey' },
  { key: 'review',   label: 'In Review',        color: 'var(--orange)',         badge: 'badge-orange' },
  { key: 'revision', label: 'Needs Revision',   color: 'var(--red)',            badge: 'badge-red' },
  { key: 'approved', label: 'Approved',         color: 'var(--green)',          badge: 'badge-green' },
  { key: 'live',     label: 'Published Live',   color: 'var(--blue)',           badge: 'badge-blue' },
];

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  'Instagram Reels': <InstagramIcon size={11} style={{ color: '#E1306C' }} />,
  'TikTok': <Share2 size={11} style={{ color: '#69C9D0' }} />,
  'Youtube Shorts': <YoutubeIcon size={11} style={{ color: '#FF0000' }} />,
  'Pinterest': <Share2 size={11} style={{ color: '#E60023' }} />,
  'Facebook Ads': <Share2 size={11} style={{ color: '#1877F2' }} />,
  'LinkedIn': <LinkedinIcon size={11} style={{ color: '#0A66C2' }} />,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function MarketingPage() {
  const { contentDrafts, setContentDrafts, showToast, business } = useAppContext();

  // ── Page State ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'maker-checker' | 'calendar' | 'ugc' | 'analytics'>('maker-checker');
  const [activePlatformFilter, setActivePlatformFilter] = useState('all');
  const [selectedDraft, setSelectedDraft] = useState<ContentDraft | null>(null);
  const [detailMode, setDetailMode] = useState<'view' | 'comment' | 'reject' | 'schedule'>('view');
  const [commentInput, setCommentInput] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [scheduleDate, setScheduleDate] = useState('2026-06-24');
  const [scheduleTime, setScheduleTime] = useState('12:00');

  // Drag-and-drop
  const dragId = useRef<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, draftId: string) => {
    dragId.current = draftId;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stageKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stageKey);
  };

  const handleDrop = (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    setDragOverStage(null);
    const id = dragId.current;
    if (!id) return;
    const draft = (contentDrafts as ContentDraft[]).find(d => d.id === id);
    if (!draft || draft.status === targetStage) return;
    const stageLabel = STAGES.find(s => s.key === targetStage)?.label ?? targetStage;
    updateDraftStatus(id, targetStage);
    if (selectedDraft?.id === id) setSelectedDraft(prev => prev ? { ...prev, status: targetStage } : null);
    showToast(`"${draft.title}" moved to ${stageLabel}.`, 'success');
    dragId.current = null;
  };

  const handleDragEnd = () => {
    setDragOverStage(null);
    dragId.current = null;
  };

  // UGC Generator (consumer product demos for IC Organic; B2B content briefs for Bombay Helios)
  const [ugcProduct, setUgcProduct] = useState(business === 'helios' ? 'Freestanding LED Billboard Install' : 'Cold-Pressed Groundnut Oil');
  const [ugcPlatform, setUgcPlatform] = useState('Instagram Reels');
  const [ugcVibe, setUgcVibe] = useState('Aesthetic & clean');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUgc, setGeneratedUgc] = useState<null | { product: string; platform: string; hooks: string[]; shots: string[]; script: string; videos: string[] }>(null);
  const [fullscreenVideo, setFullscreenVideo] = useState<string | null>(null);

  // Calendar
  const HELIOS_CALENDAR: CalendarPost[] = [
    { id: 'cal-1', date: 4,  platform: 'LinkedIn',  title: 'Infinity Mall case study — footfall uplift', time: '11:00 AM', status: 'Published', img: 'https://images.unsplash.com/photo-1540317580384-e5d43867caa6?w=150&q=80', description: 'LinkedIn case study post on the Infinity Mall, Mumbai freestanding billboard install and footfall data.' },
    { id: 'cal-2', date: 9,  platform: 'Instagram', title: 'Time-lapse: Mega billboard install reel',     time: '04:00 PM', status: 'Published', img: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=150&q=80', description: 'Time-lapse reel of a freestanding LED billboard structure going up, from foundation to commissioning.' },
    { id: 'cal-3', date: 15, platform: 'LinkedIn',  title: 'Client testimonial — Eventscape India',       time: '03:00 PM', status: 'Published', img: 'https://images.unsplash.com/photo-1540317580384-e5d43867caa6?w=150&q=80', description: 'Testimonial video brief featuring Neha Sharma on portable event displays for citywide campaigns.' },
    { id: 'cal-4', date: 20, platform: 'Youtube',   title: 'Mobile LED billboard deployment walkthrough', time: '06:00 PM', status: 'Scheduled', img: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=150&q=80', description: 'Project showcase: vehicle-mounted mobile billboard unit deployed for a citywide ad campaign.' },
    { id: 'cal-5', date: 25, platform: 'LinkedIn',  title: 'Bombay Helios: 5,600 hours, 85 happy clients', time: '10:00 AM', status: 'Scheduled', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&q=80', description: 'Founder post on PAN-India maintenance scale, structural certification process, and revenue-sharing model.' },
  ];
  const ICORGANIC_CALENDAR: CalendarPost[] = [
    { id: 'cal-1', date: 4,  platform: 'Instagram', title: 'A2 Ghee cooking hack',               time: '11:00 AM', status: 'Published', img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=150&q=80', description: 'Showing how to use Anveshan A2 ghee for traditional cooking. Meta code: GHEE15' },
    { id: 'cal-2', date: 9,  platform: 'Pinterest', title: 'Organic pantry essentials board',    time: '04:00 PM', status: 'Published', img: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=150&q=80', description: 'Pinterest board showcasing cold-pressed oils and jaggery for a healthy pantry.' },
    { id: 'cal-3', date: 15, platform: 'Instagram', title: 'Cold-pressed oil taste test',        time: '03:00 PM', status: 'Published', img: 'https://images.unsplash.com/photo-1556229174-5e42a09e45af?w=150&q=80', description: 'Comparing wood-pressed groundnut and coconut oil flavor profiles.' },
    { id: 'cal-4', date: 20, platform: 'Youtube',   title: 'Organic rice unboxing & cook test',  time: '06:00 PM', status: 'Scheduled', img: 'https://images.unsplash.com/photo-1632345031435-8797b2d58045?w=150&q=80', description: 'Unboxing Two Brothers Organic Farms rice and a simple cook test. Youtube Shorts.' },
    { id: 'cal-5', date: 25, platform: 'LinkedIn',  title: 'IC Organic Store quick-commerce scale', time: '10:00 AM', status: 'Scheduled', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&q=80', description: 'Founder post discussing direct B2B sourcing and Borivali West quick-commerce logistics.' },
  ];
  const [calendarPosts, setCalendarPosts] = useState<CalendarPost[]>(business === 'helios' ? HELIOS_CALENDAR : ICORGANIC_CALENDAR);
  const [selectedCalItem, setSelectedCalItem] = useState<CalendarPost | null>(null);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const draftsByStage = useMemo(() => {
    const map: Record<string, ContentDraft[]> = {};
    STAGES.forEach(s => { map[s.key] = []; });
    (contentDrafts as ContentDraft[]).forEach(d => {
      if (map[d.status]) map[d.status].push(d);
      else map['draft'].push(d);
    });
    return map;
  }, [contentDrafts]);

  const totalDrafts = contentDrafts.length;
  const pendingReview = (contentDrafts as ContentDraft[]).filter(d => d.status === 'review').length;
  const approvedCount = (contentDrafts as ContentDraft[]).filter(d => d.status === 'approved' || d.status === 'live').length;
  const revisionCount = (contentDrafts as ContentDraft[]).filter(d => d.status === 'revision').length;

  // ── Maker-Checker Actions ────────────────────────────────────────────────────

  const updateDraftStatus = (id: string, status: string, extra: Partial<ContentDraft> = {}) => {
    setContentDrafts(prev => (prev as ContentDraft[]).map(d => {
      if (d.id !== id) return d;
      const historyEntry = { status, by: 'Reviewer', time: 'Just now', note: extra.rejectionReason || '' };
      return { ...d, status, ...extra, history: [...(d.history || []), historyEntry] };
    }));
  };

  const handleSubmitForReview = (id: string) => {
    updateDraftStatus(id, 'review');
    showToast('Draft submitted for review. Reviewer notified via WhatsApp.', 'success');
  };

  const handleApprove = (id: string, title: string) => {
    updateDraftStatus(id, 'approved', { reviewedBy: 'Reviewer' });
    showToast(`"${title}" approved. Ready to schedule & publish.`, 'success');
  };

  const handleRequestRevision = (id: string) => {
    if (!rejectionReason.trim()) { showToast('Please enter a revision note.', 'error'); return; }
    updateDraftStatus(id, 'revision', { rejectionReason, reviewedBy: 'Reviewer' });
    showToast('Revision requested. Creator notified with your notes.', 'info');
    setRejectionReason('');
    setDetailMode('view');
  };

  const handleSchedulePublish = (id: string, title: string) => {
    updateDraftStatus(id, 'approved', { scheduleDate, scheduleTime });
    showToast(`"${title}" scheduled for ${scheduleDate} at ${scheduleTime}. Auto-post queued.`, 'success');
    setDetailMode('view');
  };

  const handlePublishNow = (draft: ContentDraft) => {
    const newCal: CalendarPost = {
      id: `cal-${Date.now()}`,
      date: new Date().getDate(),
      platform: draft.platform.includes('Instagram') ? 'Instagram' : draft.platform.includes('Youtube') ? 'Youtube' : draft.platform.includes('LinkedIn') ? 'LinkedIn' : 'Pinterest',
      title: draft.title,
      time: '12:00 PM',
      status: 'Published',
      img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=150&q=80',
      description: draft.scriptText,
    };
    setCalendarPosts(prev => [newCal, ...prev]);
    updateDraftStatus(draft.id, 'live');
    setSelectedDraft(null);
    showToast(`"${draft.title}" published live on ${newCal.platform}!`, 'success');
  };

  const handleAddComment = (id: string) => {
    if (!commentInput.trim()) return;
    setContentDrafts(prev => (prev as ContentDraft[]).map(d => {
      if (d.id !== id) return d;
      const newComment = { author: 'Reviewer', text: commentInput, time: 'Just now' };
      return { ...d, comments: [...(d.comments || []), newComment] };
    }));
    setCommentInput('');
    showToast('Comment added.', 'success');
  };

  const handleDeleteDraft = (id: string) => {
    setContentDrafts(prev => (prev as ContentDraft[]).filter(d => d.id !== id));
    if (selectedDraft?.id === id) setSelectedDraft(null);
    showToast('Draft deleted.', 'info');
  };

  // ── UGC Generator ────────────────────────────────────────────────────────────

  const handleGenerateUgc = () => {
    setIsGenerating(true);
    setGeneratedUgc(null);

    const ctaSuffix = ugcPlatform === 'TikTok' ? 'Tap the link in bio!'
      : ugcPlatform === 'Pinterest' ? 'Save this pin and shop the link!'
      : ugcPlatform === 'Facebook Ads' ? 'Click Shop Now below!'
      : ugcPlatform === 'Youtube Shorts' ? 'Check the description link!'
      : 'Link in bio!';

    const HELIOS_CONTENT_DATA: Record<string, { hooks: string[]; shots: string[]; script: string }> = {
      'Freestanding LED Billboard Install': {
        hooks: [
          `"This mall's footfall jumped 18% after one billboard went up."`,
          `"From empty plot to a landmark LED billboard in 3 weeks — here's how."`,
        ],
        shots: [
          'Shot 1: Drone establishing shot of the site before install.',
          'Shot 2: Time-lapse of the structural steel frame and LED panel mounting.',
          'Shot 3: Night shot of the fully lit billboard with mall signage in frame.',
        ],
        script: `For facility managers tired of underused frontage: Bombay Helios designed, licensed and installed a freestanding LED billboard at this site in under a month — structural stability certificate included, PAN-India maintenance covered. Revenue-sharing model means zero upfront cost. ${ctaSuffix}`,
      },
      'Mobile LED Billboard Deployment': {
        hooks: [
          `"Why event companies are ditching static hoardings for mobile LED units."`,
          `"One vehicle-mounted screen covered 6 localities in a single weekend."`,
        ],
        shots: [
          'Shot 1: Mobile billboard unit rolling out of the depot at dawn.',
          'Shot 2: Close-up of the LED panel running a client ad through city traffic.',
          'Shot 3: Interview clip with the event/ad agency client on reach and recall.',
        ],
        script: `Need citywide reach without fixed-site permissions? Bombay Helios's mobile LED billboards go wherever the campaign needs — RTO liaising handled, routing optimized, PAN-India support. Built for event companies and ad agencies running short, high-impact bursts. ${ctaSuffix}`,
      },
      'Nano-Coating Protection Service': {
        hooks: [
          `"Mumbai monsoons destroy LED structures. Here's what stops it."`,
          `"Anti-rust, anti-moisture coating that extends billboard life by years."`,
        ],
        shots: [
          'Shot 1: Close-up of corrosion on an untreated outdoor structure.',
          'Shot 2: Technician applying the nano-coating to a steel frame.',
          'Shot 3: Side-by-side — coated vs uncoated panel after a monsoon season.',
        ],
        script: `Outdoor LED structures take a beating from humidity and salt air. Our nano-technology surface coating protects against moisture and corrosion, backed by structural audits and annual maintenance. Built for mall developers and retail chains who can't afford downtime. ${ctaSuffix}`,
      },
      'Client Testimonial — Case Study': {
        hooks: [
          `"85 happy clients, 5,600 working hours — hear it from them directly."`,
          `"A marketing head explains why they switched billboard vendors."`,
        ],
        shots: [
          'Shot 1: Talking-head interview with the client (facility/marketing head).',
          'Shot 2: B-roll of the finished installation in daylight and at night.',
          'Shot 3: Before/after footfall or campaign-reach data overlay.',
        ],
        script: `We asked our clients what changed after working with Bombay Helios. From Urban Retail Group's national campaign to Visionary Media Co.'s landmark billboard — the story is the same: faster licensing, reliable maintenance, real revenue uplift. ${ctaSuffix}`,
      },
    };

    const ICORGANIC_CONTENT_DATA: Record<string, { hooks: string[]; shots: string[]; script: string }> = {
      'Cold-Pressed Groundnut Oil': {
        hooks: [
          `"If you're still cooking with refined oil, stop scrolling."`,
          `"Wood-pressed groundnut oil — the way my grandmother cooked."`,
        ],
        shots: [
          'Shot 1: Close-up of the cold-press extraction process.',
          'Shot 2: Pouring the oil into a pan, visible aroma/sizzle.',
          'Shot 3: Finished dish on the table. Show the IC Organic Store delivery bag arriving.',
        ],
        script: `Hey guys! I switched to cold-pressed groundnut oil and the difference in taste is real. IC Organic Store delivers it straight to your door in Mumbai. No chemical extraction, just the traditional ghani method. Use code OIL10. ${ctaSuffix}`,
      },
      'A2 Ghee': {
        hooks: [
          `"This ghee smells like my childhood kitchen."`,
          `"Anveshan A2 ghee that actually tastes different — here's why."`,
        ],
        shots: [
          'Shot 1: Spoon of golden ghee melting over warm rice or roti.',
          'Shot 2: Slow pour shot — texture and aroma close-up.',
          'Shot 3: Jar on the kitchen counter with promo code overlay.',
        ],
        script: `Midday craving? One spoon of A2 ghee changes the whole dish. IC Organic Store's ghee is made the traditional bilona way — no shortcuts, no additives. Use code GHEE10. ${ctaSuffix}`,
      },
      'Organic Jaggery': {
        hooks: [
          `"I replaced sugar with this and nobody noticed — except my energy levels."`,
          `"Chemical-free jaggery that actually dissolves properly in chai."`,
        ],
        shots: [
          'Shot 1: Block of jaggery being grated into a pan.',
          'Shot 2: Time-lapse of jaggery dissolving into hot chai.',
          'Shot 3: Product packaging on the vanity — shop link overlay.',
        ],
        script: `Tired of overly processed sugar? Organic jaggery from IC Organic Store — chemical-free, slow-cooked the traditional way. I use it in my morning chai every day. Get 15% off your first order. ${ctaSuffix}`,
      },
      'Herbal Cleanser': {
        hooks: [
          `"A face cleanser with ingredients I can actually pronounce."`,
          `"My skin stopped reacting once I switched to this herbal cleanser."`,
        ],
        shots: [
          'Shot 1: Close-up of the herbal cleanser texture on skin.',
          'Shot 2: Rinse-off shot — clean, calm skin close-up.',
          'Shot 3: Product on the bathroom shelf with the IC Organic Store box.',
        ],
        script: `Switched to Herbal Strategi's cleanser a week ago and my skin has calmed down so much. No parabens, no sulfates — just herbal actives. Delivered from IC Organic Store. ${ctaSuffix}`,
      },
    };

    const PRODUCT_DATA = business === 'helios' ? HELIOS_CONTENT_DATA : ICORGANIC_CONTENT_DATA;
    const data = PRODUCT_DATA[ugcProduct] ?? Object.values(PRODUCT_DATA)[0];

    setTimeout(() => {
      setGeneratedUgc({
        product: ugcProduct,
        platform: ugcPlatform,
        hooks: data.hooks,
        shots: data.shots,
        script: data.script,
        videos: business === 'helios' ? ['/billboard1.mp4', '/billboard2.mp4'] : ['/tumeric.mp4', '/oil%20video.mp4'],
      });
      setIsGenerating(false);
      showToast('AI UGC script generated.', 'success');
    }, 1200);
  };

  const saveGeneratedToDraft = () => {
    if (!generatedUgc) return;
    const newDraft: ContentDraft = {
      id: `c-${Date.now()}`,
      title: `AI UGC: ${generatedUgc.product} (${generatedUgc.platform})`,
      type: 'UGC Script',
      platform: generatedUgc.platform,
      product: generatedUgc.product,
      status: 'draft',
      scriptText: `Hooks:\n1. ${generatedUgc.hooks[0]}\n2. ${generatedUgc.hooks[1]}\n\nShots:\n${generatedUgc.shots.join('\n')}\n\nVoiceover:\n"${generatedUgc.script}"`,
      author: 'AI Engine',
      comments: [],
      history: [{ status: 'draft', by: 'AI Engine', time: 'Just now', note: 'Auto-generated' }],
      version: 1,
    };
    setContentDrafts(prev => [newDraft, ...(prev as ContentDraft[])]);
    setGeneratedUgc(null);
    showToast('Draft saved to Maker-Checker pipeline.', 'success');
  };

  // ── Calendar Grid ────────────────────────────────────────────────────────────

  const renderCalendarGrid = () => {
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const grid = [];
    for (let day = 1; day <= 30; day++) {
      const dayPosts = calendarPosts.filter(p => p.date === day && (activePlatformFilter === 'all' || p.platform.toLowerCase() === activePlatformFilter.toLowerCase()));
      grid.push(
        <div key={day} style={{ minHeight: '72px', background: 'var(--bg-layer2)', border: '1px solid var(--separator)', borderRadius: '8px', padding: '6px', display: 'flex', flexDirection: 'column', cursor: dayPosts.length > 0 ? 'pointer' : 'default' }} onClick={() => dayPosts.length > 0 && setSelectedCalItem(dayPosts[0])}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--label-secondary)' }}>{day}</span>
          {dayPosts.map(post => (
            <div key={post.id} style={{ width: '100%', background: post.status === 'Published' ? 'rgba(52,199,89,0.15)' : 'rgba(0,122,255,0.15)', borderLeft: `3px solid ${post.status === 'Published' ? 'var(--green)' : 'var(--blue)'}`, padding: '2px 4px', borderRadius: '3px', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '3px' }} title={post.title}>
              {post.platform === 'Instagram' && <InstagramIcon size={9} style={{ color: '#E1306C', flexShrink: 0 }} />}
              {post.platform === 'Youtube' && <YoutubeIcon size={9} style={{ color: '#FF0000', flexShrink: 0 }} />}
              {post.platform === 'LinkedIn' && <LinkedinIcon size={9} style={{ color: '#0A66C2', flexShrink: 0 }} />}
              {(post.platform === 'Pinterest') && <Share2 size={9} style={{ color: 'var(--orange)', flexShrink: 0 }} />}
              <span style={{ fontSize: '9px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--label-primary)' }}>{post.title}</span>
            </div>
          ))}
        </div>
      );
    }
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '6px', fontWeight: '700', fontSize: '11px', color: 'var(--label-tertiary)' }}>
          {weekdays.map(d => <div key={d}>{d}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>{grid}</div>
      </div>
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div style={{ animation: 'fadeIn 300ms ease' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--label-primary)', margin: 0 }}>Marketing Content OS</h2>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--label-secondary)', marginTop: '4px', marginBottom: 0 }}>
            5-stage Maker-Checker pipeline · Role-based approvals · Revision threads · Scheduled publishing
          </p>
        </div>
        <button className="btn-primary" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => { setActiveTab('ugc'); }}>
          <Plus size={13} /> New Content Draft
        </button>
      </div>

      {/* KPI Cards */}
      <div className="metrics-grid mb-24">
        <div className="metric-tile liquid-card" style={{ '--tile-accent-color': 'var(--blue)' } as React.CSSProperties}>
          <span className="label">Total Drafts in Pipeline</span>
          <span className="value">{totalDrafts}</span>
          <span className="trend up"><FileText size={12} /> All Stages</span>
        </div>
        <div className="metric-tile liquid-card" style={{ '--tile-accent-color': 'var(--orange)' } as React.CSSProperties}>
          <span className="label">Awaiting Review</span>
          <span className="value">{pendingReview}</span>
          <span className="trend down" style={{ color: 'var(--orange)' }}><Clock size={12} /> Action Needed</span>
        </div>
        <div className="metric-tile liquid-card" style={{ '--tile-accent-color': 'var(--red)' } as React.CSSProperties}>
          <span className="label">Needs Revision</span>
          <span className="value">{revisionCount}</span>
          <span className="trend down" style={{ color: 'var(--red)' }}><AlertTriangle size={12} /> Sent Back</span>
        </div>
        <div className="metric-tile liquid-card" style={{ '--tile-accent-color': 'var(--green)' } as React.CSSProperties}>
          <span className="label">Approved / Live</span>
          <span className="value">{approvedCount}</span>
          <span className="trend up"><CheckCircle2 size={12} /> Ready to Publish</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: 'var(--fill-tertiary)', padding: '3px', borderRadius: '10px', width: 'fit-content' }}>
        {[['maker-checker', 'Maker-Checker', Layers], ['calendar', 'Content Calendar', Calendar], ['ugc', 'UGC Generator', Sparkles], ['analytics', 'Analytics', BarChart2]].map(([key, label, Icon]: any) => (
          <button key={key} onClick={() => setActiveTab(key)} style={{ padding: '6px 14px', borderRadius: '7px', border: 'none', fontSize: '12px', fontWeight: '700', background: activeTab === key ? 'var(--bg-layer1)' : 'transparent', color: activeTab === key ? 'var(--blue)' : 'var(--label-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Icon size={13} />{label}
          </button>
        ))}
      </div>

      {/* ── TAB: MAKER-CHECKER ───────────────────────────────────────────────────── */}
      {activeTab === 'maker-checker' && (
        <div className="maker-checker-layout" style={{ display: 'grid', gridTemplateColumns: selectedDraft ? '1fr 380px' : '1fr', gap: '20px', alignItems: 'start' }}>

          {/* Kanban Board */}
          <div>
            {/* Stage pipeline legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px', fontSize: '11px', color: 'var(--label-secondary)', flexWrap: 'wrap' }}>
              {STAGES.map((s, i) => (
                <React.Fragment key={s.key}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color, display: 'inline-block' }} />
                    <span style={{ fontWeight: '600' }}>{s.label}</span>
                    <span style={{ background: 'var(--fill-primary)', borderRadius: '10px', padding: '1px 6px', fontSize: '10px', fontWeight: '700' }}>{draftsByStage[s.key]?.length || 0}</span>
                  </div>
                  {i < STAGES.length - 1 && <ArrowRight size={11} style={{ color: 'var(--separator)' }} />}
                </React.Fragment>
              ))}
            </div>

            <div className="kanban-board" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', alignItems: 'start' }}>
              {STAGES.map(stage => (
                <div
                  key={stage.key}
                  onDragOver={e => handleDragOver(e, stage.key)}
                  onDragLeave={() => setDragOverStage(null)}
                  onDrop={e => handleDrop(e, stage.key)}
                  style={{
                    background: dragOverStage === stage.key ? 'var(--fill-tertiary)' : 'var(--fill-quaternary)',
                    borderRadius: '12px',
                    padding: '12px',
                    minHeight: '320px',
                    borderTop: `3px solid ${stage.color}`,
                    outline: dragOverStage === stage.key ? `2px dashed ${stage.color}` : '2px dashed transparent',
                    transition: 'background 120ms, outline 120ms',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--label-secondary)', textTransform: 'uppercase' }}>{stage.label}</span>
                    <span style={{ fontSize: '10px', background: 'var(--fill-primary)', borderRadius: '10px', padding: '1px 6px', fontWeight: '700' }}>{draftsByStage[stage.key]?.length || 0}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(draftsByStage[stage.key] || []).map((d: ContentDraft) => (
                      <div
                        key={d.id}
                        draggable
                        onDragStart={e => handleDragStart(e, d.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => { setSelectedDraft(d); setDetailMode('view'); }}
                        style={{
                          background: 'var(--bg-layer1)',
                          padding: '10px',
                          borderRadius: '8px',
                          cursor: 'grab',
                          border: selectedDraft?.id === d.id ? '1.5px solid var(--blue)' : '1.5px solid transparent',
                          transition: 'border 150ms, opacity 150ms, box-shadow 150ms',
                          userSelect: 'none',
                        }}
                        onMouseDown={e => { (e.currentTarget as HTMLDivElement).style.cursor = 'grabbing'; }}
                        onMouseUp={e => { (e.currentTarget as HTMLDivElement).style.cursor = 'grab'; }}
                      >
                        <div style={{ fontSize: '11px', fontWeight: '700', marginBottom: '4px', lineHeight: '1.3' }}>{d.title}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                          {PLATFORM_ICONS[d.platform] || <Share2 size={10} />}
                          <span style={{ fontSize: '9px', color: 'var(--label-tertiary)' }}>{d.platform}</span>
                        </div>
                        {d.author && <div style={{ fontSize: '9px', color: 'var(--label-tertiary)' }}>By: {d.author}</div>}
                        {d.rejectionReason && <div style={{ fontSize: '9px', color: 'var(--red)', marginTop: '3px' }}>⚠ {d.rejectionReason}</div>}
                        {d.scheduleDate && stage.key === 'approved' && <div style={{ fontSize: '9px', color: 'var(--blue)', marginTop: '3px' }}>📅 {d.scheduleDate} {d.scheduleTime}</div>}
                        {(d.comments?.length ?? 0) > 0 && <div style={{ fontSize: '9px', color: 'var(--label-tertiary)', marginTop: '3px' }}>💬 {d.comments!.length} comment{d.comments!.length > 1 ? 's' : ''}</div>}

                        {/* Quick action buttons */}
                        <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }} onClick={e => e.stopPropagation()}>
                          {stage.key === 'draft' && (
                            <button className="btn-primary" style={{ fontSize: '9px', padding: '2px 6px', flexGrow: 1 }} onClick={() => handleSubmitForReview(d.id)}>
                              Submit
                            </button>
                          )}
                          {stage.key === 'review' && (
                            <>
                              <button className="btn-primary" style={{ fontSize: '9px', padding: '2px 5px', flexGrow: 1, background: 'var(--green)' }} onClick={() => handleApprove(d.id, d.title)}>
                                ✓ Approve
                              </button>
                              <button className="btn-secondary" style={{ fontSize: '9px', padding: '2px 5px', color: 'var(--red)' }} onClick={() => { setSelectedDraft(d); setDetailMode('reject'); }}>
                                ✗ Revise
                              </button>
                            </>
                          )}
                          {stage.key === 'revision' && (
                            <button className="btn-secondary" style={{ fontSize: '9px', padding: '2px 6px', flexGrow: 1 }} onClick={() => handleSubmitForReview(d.id)}>
                              Resubmit
                            </button>
                          )}
                          {stage.key === 'approved' && (
                            <>
                              <button className="btn-primary" style={{ fontSize: '9px', padding: '2px 5px', flexGrow: 1 }} onClick={() => handlePublishNow(d)}>
                                Publish
                              </button>
                              <button className="btn-secondary" style={{ fontSize: '9px', padding: '2px 5px' }} onClick={() => { setSelectedDraft(d); setDetailMode('schedule'); }}>
                                📅
                              </button>
                            </>
                          )}
                          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--label-tertiary)', padding: '2px' }} onClick={() => handleDeleteDraft(d.id)}>
                            <Trash size={10} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {(draftsByStage[stage.key] || []).length === 0 && (
                      <div style={{ textAlign: 'center', padding: '20px 0', fontSize: '11px', color: dragOverStage === stage.key ? stage.color : 'var(--label-tertiary)', fontStyle: 'italic', transition: 'color 120ms' }}>
                        {dragOverStage === stage.key ? `Drop here → ${stage.label}` : 'No drafts here'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detail Panel */}
          {selectedDraft && (
            <div className="liquid-card draft-detail-panel" style={{ padding: '20px', position: 'sticky', top: '80px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--separator)', paddingBottom: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', margin: '0 0 2px' }}>{selectedDraft.title}</h4>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span className={`badge ${STAGES.find(s => s.key === selectedDraft.status)?.badge || 'badge-grey'}`} style={{ fontSize: '9px' }}>{STAGES.find(s => s.key === selectedDraft.status)?.label}</span>
                    {selectedDraft.version && <span style={{ fontSize: '9px', color: 'var(--label-tertiary)' }}>v{selectedDraft.version}</span>}
                  </div>
                </div>
                <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--label-tertiary)' }} onClick={() => setSelectedDraft(null)}><X size={16} /></button>
              </div>

              {/* Mode tabs */}
              <div style={{ display: 'flex', gap: '4px', marginBottom: '14px', background: 'var(--fill-tertiary)', padding: '2px', borderRadius: '8px' }}>
                {[['view', 'Script', Eye], ['comment', 'Comments', MessageSquare], ['reject', 'Revision', AlertTriangle], ['schedule', 'Schedule', Calendar]].map(([m, l, Icon]: any) => (
                  <button key={m} onClick={() => setDetailMode(m)} style={{ flex: 1, padding: '4px', borderRadius: '6px', border: 'none', fontSize: '10px', fontWeight: '700', background: detailMode === m ? 'var(--bg-layer1)' : 'transparent', color: detailMode === m ? 'var(--blue)' : 'var(--label-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                    <Icon size={11} />{l}
                  </button>
                ))}
              </div>

              {/* View: Script Content */}
              {detailMode === 'view' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '11px', flexWrap: 'wrap' }}>
                    <div><span style={{ color: 'var(--label-tertiary)' }}>Platform: </span><strong>{selectedDraft.platform}</strong></div>
                    <div><span style={{ color: 'var(--label-tertiary)' }}>Type: </span><strong>{selectedDraft.type}</strong></div>
                    <div><span style={{ color: 'var(--label-tertiary)' }}>Author: </span><strong>{selectedDraft.author || 'Team'}</strong></div>
                  </div>
                  <div style={{ background: 'var(--fill-quaternary)', padding: '12px', borderRadius: '8px', fontSize: '12px', lineHeight: '1.6', color: 'var(--label-secondary)', whiteSpace: 'pre-line', maxHeight: '200px', overflowY: 'auto' }}>
                    {selectedDraft.scriptText}
                  </div>
                  {selectedDraft.rejectionReason && (
                    <div style={{ background: 'rgba(255,59,48,0.08)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,59,48,0.2)' }}>
                      <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--red)', marginBottom: '3px' }}>Revision Note from Reviewer</div>
                      <div style={{ fontSize: '11px', color: 'var(--label-secondary)' }}>{selectedDraft.rejectionReason}</div>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {selectedDraft.status === 'draft' && <button className="btn-primary" style={{ fontSize: '11px', flexGrow: 1 }} onClick={() => handleSubmitForReview(selectedDraft.id)}>Submit for Review</button>}
                    {selectedDraft.status === 'review' && <button className="btn-primary" style={{ fontSize: '11px', flexGrow: 1, background: 'var(--green)' }} onClick={() => handleApprove(selectedDraft.id, selectedDraft.title)}>Approve</button>}
                    {selectedDraft.status === 'revision' && <button className="btn-secondary" style={{ fontSize: '11px', flexGrow: 1 }} onClick={() => handleSubmitForReview(selectedDraft.id)}>Resubmit</button>}
                    {selectedDraft.status === 'approved' && <button className="btn-primary" style={{ fontSize: '11px', flexGrow: 1 }} onClick={() => handlePublishNow(selectedDraft)}>Publish Live Now</button>}
                  </div>
                </div>
              )}

              {/* View: Comments Thread */}
              {detailMode === 'comment' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(selectedDraft.comments || []).length === 0 && <div style={{ fontSize: '12px', color: 'var(--label-tertiary)', textAlign: 'center', padding: '20px' }}>No comments yet.</div>}
                    {(selectedDraft.comments || []).map((c, i) => (
                      <div key={i} style={{ background: 'var(--fill-quaternary)', padding: '10px', borderRadius: '8px', fontSize: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                          <span style={{ fontWeight: '700', color: 'var(--blue)' }}>{c.author}</span>
                          <span style={{ fontSize: '10px', color: 'var(--label-tertiary)' }}>{c.time}</span>
                        </div>
                        <div style={{ color: 'var(--label-secondary)' }}>{c.text}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" className="input" placeholder="Add a comment..." value={commentInput} onChange={e => setCommentInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleAddComment(selectedDraft.id); }} style={{ flexGrow: 1, fontSize: '12px', padding: '7px 10px' }} />
                    <button className="btn-primary" onClick={() => handleAddComment(selectedDraft.id)}><Send size={13} /></button>
                  </div>
                </div>
              )}

              {/* View: Request Revision */}
              {detailMode === 'reject' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ background: 'rgba(255,59,48,0.06)', padding: '10px', borderRadius: '8px', fontSize: '11px', color: 'var(--label-secondary)', border: '1px solid rgba(255,59,48,0.15)' }}>
                    <strong style={{ color: 'var(--red)' }}>Request Revision</strong> — The creator will be notified via WhatsApp with your feedback and the draft will move to "Needs Revision" stage.
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: '600', color: 'var(--label-secondary)', display: 'block', marginBottom: '4px' }}>Revision Reason / Specific Feedback</label>
                    <textarea className="input" rows={4} value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} placeholder="e.g. Hook is too generic. Rewrite with a specific pain point. Shot 2 needs to show the UV curing lamp in frame..." style={{ width: '100%', fontSize: '12px', resize: 'none', padding: '8px 10px' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-secondary" style={{ flexGrow: 1, fontSize: '11px' }} onClick={() => setDetailMode('view')}>Cancel</button>
                    <button className="btn-primary" style={{ flexGrow: 1, fontSize: '11px', background: 'var(--red)' }} onClick={() => handleRequestRevision(selectedDraft.id)}>Send Revision Request</button>
                  </div>
                </div>
              )}

              {/* View: Schedule Publish */}
              {detailMode === 'schedule' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ background: 'rgba(0,122,255,0.06)', padding: '10px', borderRadius: '8px', fontSize: '11px', color: 'var(--label-secondary)', border: '1px solid rgba(0,122,255,0.15)' }}>
                    Schedule this post to auto-publish on <strong>{selectedDraft.platform}</strong> via API gateway at the selected date and time.
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: '600', color: 'var(--label-secondary)', display: 'block', marginBottom: '4px' }}>Publish Date</label>
                    <input type="date" className="input" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} style={{ width: '100%', fontSize: '12px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: '600', color: 'var(--label-secondary)', display: 'block', marginBottom: '4px' }}>Publish Time</label>
                    <input type="time" className="input" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} style={{ width: '100%', fontSize: '12px' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-secondary" style={{ flexGrow: 1, fontSize: '11px' }} onClick={() => setDetailMode('view')}>Cancel</button>
                    <button className="btn-primary" style={{ flexGrow: 1, fontSize: '11px' }} onClick={() => handleSchedulePublish(selectedDraft.id, selectedDraft.title)}>Confirm Schedule</button>
                  </div>
                </div>
              )}

              {/* Version History */}
              {(selectedDraft.history || []).length > 0 && (
                <div style={{ marginTop: '14px', borderTop: '1px solid var(--separator)', paddingTop: '12px' }}>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--label-tertiary)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <History size={11} /> Audit Trail
                  </div>
                  {[...(selectedDraft.history || [])].reverse().map((h, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '10px', marginBottom: '5px' }}>
                      <span style={{ color: 'var(--label-tertiary)', whiteSpace: 'nowrap' }}>{h.time}</span>
                      <span><strong>{h.by}</strong> → <span className={`badge ${STAGES.find(s => s.key === h.status)?.badge || 'badge-grey'}`} style={{ fontSize: '8px' }}>{h.status}</span></span>
                      {h.note && <span style={{ color: 'var(--label-tertiary)' }}>"{h.note}"</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: CONTENT CALENDAR ────────────────────────────────────────────────── */}
      {activeTab === 'calendar' && (
        <div className="liquid-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={16} style={{ color: 'var(--blue)' }} />
              <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>Monthly Content Calendar — June 2026</h3>
            </div>
            <div style={{ display: 'flex', gap: '6px', background: 'var(--fill-tertiary)', padding: '2px', borderRadius: '8px' }}>
              {['all', 'Instagram', 'Youtube', 'Pinterest', 'LinkedIn'].map(p => (
                <button key={p} onClick={() => setActivePlatformFilter(p)} style={{ padding: '4px 10px', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '700', background: activePlatformFilter === p ? 'var(--bg-layer1)' : 'transparent', color: activePlatformFilter === p ? 'var(--blue)' : 'var(--label-secondary)', cursor: 'pointer' }}>{p}</button>
              ))}
            </div>
          </div>
          {renderCalendarGrid()}
        </div>
      )}

      {/* ── TAB: UGC GENERATOR ──────────────────────────────────────────────────── */}
      {activeTab === 'ugc' && (
        <div className="split-layout" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', alignItems: 'start' }}>
          <div className="liquid-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={15} style={{ color: 'var(--purple)' }} /> {business === 'helios' ? 'B2B Content Engine' : 'UGC Creator Engine'}
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--label-secondary)', marginBottom: '14px' }}>
              {business === 'helios'
                ? 'AI generates hooks, shot lists, and case-study scripts for project showcases and testimonials.'
                : 'AI generates hooks, shot lists, and voiceover scripts for any product and platform.'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '10px', fontWeight: '600', display: 'block', marginBottom: '4px', color: 'var(--label-secondary)' }}>{business === 'helios' ? 'Content Focus' : 'Product'}</label>
                <select className="input" style={{ width: '100%', padding: '7px 8px', fontSize: '12px' }} value={ugcProduct} onChange={e => setUgcProduct(e.target.value)}>
                  {business === 'helios' ? (
                    <>
                      <option value="Freestanding LED Billboard Install">Freestanding LED Billboard Install</option>
                      <option value="Mobile LED Billboard Deployment">Mobile LED Billboard Deployment</option>
                      <option value="Nano-Coating Protection Service">Nano-Coating Protection Service</option>
                      <option value="Client Testimonial — Case Study">Client Testimonial — Case Study</option>
                    </>
                  ) : (
                    <>
                      <option value="Cold-Pressed Groundnut Oil">Cold-Pressed Groundnut Oil</option>
                      <option value="A2 Ghee">A2 Ghee</option>
                      <option value="Organic Jaggery">Organic Jaggery</option>
                      <option value="Herbal Cleanser">Herbal Cleanser</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '10px', fontWeight: '600', display: 'block', marginBottom: '4px', color: 'var(--label-secondary)' }}>Platform</label>
                <select className="input" style={{ width: '100%', padding: '7px 8px', fontSize: '12px' }} value={ugcPlatform} onChange={e => setUgcPlatform(e.target.value)}>
                  {business === 'helios' ? (
                    <>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Youtube Shorts">Youtube Shorts</option>
                      <option value="Instagram Reels">Instagram Reels</option>
                      <option value="Facebook Ads">Facebook Ads</option>
                    </>
                  ) : (
                    <>
                      <option value="Instagram Reels">Instagram Reels</option>
                      <option value="Youtube Shorts">Youtube Shorts</option>
                      <option value="TikTok">TikTok</option>
                      <option value="Pinterest">Pinterest</option>
                      <option value="Facebook Ads">Facebook Ads</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '10px', fontWeight: '600', display: 'block', marginBottom: '4px', color: 'var(--label-secondary)' }}>Brand Vibe</label>
                <input type="text" className="input" style={{ width: '100%', padding: '7px 10px', fontSize: '12px' }} value={ugcVibe} onChange={e => setUgcVibe(e.target.value)} placeholder="e.g. Aesthetic & dewy skin" />
              </div>
              <button className="btn-primary" onClick={handleGenerateUgc} disabled={isGenerating} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px' }}>
                {isGenerating ? <><RefreshCw size={13} className="animate-spin" /> Generating...</> : <><Sparkles size={13} /> Generate UGC Draft</>}
              </button>
            </div>
          </div>

          {generatedUgc ? (
            <div className="liquid-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 4px' }}>Generated Script — {generatedUgc.product}</h3>
                  <span className="badge badge-blue" style={{ fontSize: '10px' }}>{generatedUgc.platform}</span>
                </div>
                <button className="btn-primary" style={{ fontSize: '12px' }} onClick={saveGeneratedToDraft}>
                  <Send size={12} /> Save to Pipeline
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--label-tertiary)', textTransform: 'uppercase', marginBottom: '8px' }}>UGC Video Previews</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {generatedUgc.videos.map((src, i) => (
                      <div key={i} onClick={() => setFullscreenVideo(src)} style={{ borderRadius: '10px', overflow: 'hidden', background: 'var(--fill-quaternary)', border: '1px solid var(--separator)', position: 'relative', cursor: 'pointer', aspectRatio: '9/16', maxHeight: '280px' }}>
                        <div style={{ fontSize: '9px', fontWeight: '700', color: 'var(--label-tertiary)', textTransform: 'uppercase', padding: '6px 10px 4px', display: 'flex', alignItems: 'center', gap: '4px', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2, background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--red)', display: 'inline-block' }} />
                          Creator {i + 1}
                          <Maximize2 size={10} style={{ marginLeft: 'auto', opacity: 0.6 }} />
                        </div>
                        <video
                          src={src}
                          autoPlay
                          loop
                          muted
                          playsInline
                          preload="auto"
                          style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover', background: '#000' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--label-tertiary)', textTransform: 'uppercase', marginBottom: '6px' }}>Hook Options</div>
                  {generatedUgc.hooks.map((h, i) => (
                    <div key={i} style={{ background: 'var(--fill-quaternary)', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', fontStyle: 'italic', marginBottom: '6px', borderLeft: '3px solid var(--purple)' }}>{h}</div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--label-tertiary)', textTransform: 'uppercase', marginBottom: '6px' }}>Shot List</div>
                  {generatedUgc.shots.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '12px', marginBottom: '5px', alignItems: 'flex-start' }}>
                      <span style={{ background: 'var(--blue)', color: 'white', borderRadius: '4px', padding: '1px 6px', fontSize: '9px', fontWeight: '800', flexShrink: 0, marginTop: '1px' }}>{i + 1}</span>
                      <span style={{ color: 'var(--label-secondary)' }}>{s}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--label-tertiary)', textTransform: 'uppercase', marginBottom: '6px' }}>Voiceover / Caption</div>
                  <div style={{ background: 'var(--fill-quaternary)', padding: '14px', borderRadius: '8px', fontSize: '12px', lineHeight: '1.6', fontStyle: 'italic', color: 'var(--label-secondary)', borderLeft: '3px solid var(--green)' }}>
                    "{generatedUgc.script}"
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="liquid-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--label-tertiary)', minHeight: '300px', gap: '12px' }}>
              <Sparkles size={32} style={{ opacity: 0.3 }} />
              <p style={{ fontSize: '13px', margin: 0 }}>Configure the settings and click Generate to create a UGC script draft.</p>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: ANALYTICS ───────────────────────────────────────────────────────── */}
      {activeTab === 'analytics' && (
        <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="liquid-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Pipeline Throughput — June 2026</h3>
            {[['Drafts Created', 18, 'var(--blue)'], ['Submitted for Review', 14, 'var(--purple)'], ['Approved First Pass', 9, 'var(--green)'], ['Sent for Revision', 5, 'var(--orange)'], ['Published Live', 7, 'var(--teal)']].map(([label, val, color]) => (
              <div key={label as string} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span>{label as string}</span><span style={{ fontWeight: '700', color: color as string }}>{val as number}</span>
                </div>
                <div style={{ height: '5px', background: 'var(--fill-primary)', borderRadius: '3px' }}>
                  <div style={{ width: `${((val as number) / 18) * 100}%`, height: '100%', background: color as string, borderRadius: '3px', transition: 'width 600ms ease' }} />
                </div>
              </div>
            ))}
          </div>
          <div className="liquid-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Content Performance</h3>
            {[['Total Reach', '148.5K', 'var(--blue)', '+12.4%'], ['Avg Engagement Rate', '6.4%', 'var(--purple)', '+0.8%'], ['Sales Attributed', '₹3,84,500', 'var(--green)', '+18%'], ['First-Pass Approval Rate', '64%', 'var(--orange)', 'Target: 70%'], ['Avg Revision Cycles', '1.4', 'var(--teal)', 'Target: <2']].map(([label, val, color, sub]) => (
              <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', marginBottom: '10px', borderBottom: '1px solid var(--separator)' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '600' }}>{label as string}</div>
                  <div style={{ fontSize: '10px', color: 'var(--label-tertiary)' }}>{sub as string}</div>
                </div>
                <span style={{ fontSize: '16px', fontWeight: '800', color: color as string }}>{val as string}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar Item Detail Modal */}
      {selectedCalItem && (
        <div className="spotlight-overlay" style={{ display: 'flex' }} onClick={() => setSelectedCalItem(null)}>
          <div className="spotlight-panel" style={{ maxWidth: '480px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--separator)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar style={{ color: 'var(--blue)' }} /><span style={{ fontWeight: '700', fontSize: '15px' }}>Scheduled Post</span></div>
              <button className="btn-icon" onClick={() => setSelectedCalItem(null)}><X size={14} /></button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <img src={selectedCalItem.img} alt={selectedCalItem.title} style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }} />
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 4px' }}>{selectedCalItem.title}</h4>
                  <span className="badge badge-blue" style={{ fontSize: '10px' }}>{selectedCalItem.platform} · {selectedCalItem.time}</span>
                  <div style={{ fontSize: '11px', color: 'var(--label-secondary)', marginTop: '4px' }}>June {selectedCalItem.date}, 2026</div>
                </div>
              </div>
              <div style={{ background: 'var(--fill-quaternary)', padding: '12px', borderRadius: '8px', fontSize: '12.5px', lineHeight: '1.5', color: 'var(--label-secondary)' }}>{selectedCalItem.description}</div>
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--separator)' }}>
              <button className="btn-secondary" onClick={() => setSelectedCalItem(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── FULLSCREEN VIDEO OVERLAY ──────────────────────────────────────────── */}
      {fullscreenVideo && (
        <div onClick={() => setFullscreenVideo(null)} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '20px' }}>
          <button onClick={() => setFullscreenVideo(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, color: 'white' }}>
            <X size={20} />
          </button>
          <div onClick={(e) => e.stopPropagation()} style={{ maxHeight: 'calc(100vh - 40px)', maxWidth: 'calc(100vw - 40px)', aspectRatio: '9/16', position: 'relative' }}>
            <video
              src={fullscreenVideo}
              controls
              autoPlay
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000', borderRadius: '8px' }}
            />
          </div>
        </div>
      )}

    </div>
  );
}
