'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Bot,
  DollarSign,
  Users,
  Sparkles,
  Settings as SettingsIcon,
  Sun,
  Moon,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  Calendar,
  Bell,
  CheckCircle,
  X,
  AlertTriangle,
  CheckCircle2,
  Info,
  UserCheck,
  Activity,
  Building2,
  MapPin,
  MessageSquare,
  Mail,
  Phone,
  Check,
  UploadCloud,
  Send,
  Inbox,
  BarChart3
} from 'lucide-react';
import { DateRangePicker, type DateRange } from '@/components/shared/DateRangePicker';
import { subDays, startOfDay, endOfDay } from 'date-fns';
import { rebaseRecordsToRecentWindow } from '@/lib/rebaseMockDates';

// Logo aspect ratios baked into their filenames (width x height).
const BOMBAY_HELIOS_LOGO_RATIO = 2048 / 587;
const IC_ORGANIC_LOGO_RATIO = 218 / 73;

/** The three-way "Bombay Helios × IC Organic × ScalePods" co-brand lockup used on the landing/sign-in screens. */
function BrandLockup({ logoHeight, fontSize, gap }: { logoHeight: number; fontSize: number; gap: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap, flexWrap: 'wrap', justifyContent: 'center' }}>
      <img
        src="/bombay-logo-03-scaled-e1751622724338-2048x587.png"
        alt="Bombay Helios"
        style={{ height: logoHeight, width: logoHeight * BOMBAY_HELIOS_LOGO_RATIO, objectFit: 'contain' }}
      />
      <span style={{ fontSize, fontWeight: 700, color: 'var(--label-tertiary)' }}>×</span>
      <img
        src="/cropped-icorganic-logo-218x73.png"
        alt="IC Organic Store"
        style={{ height: logoHeight, width: logoHeight * IC_ORGANIC_LOGO_RATIO, objectFit: 'contain', borderRadius: 4 }}
      />
      <span style={{ fontSize, fontWeight: 700, color: 'var(--label-tertiary)' }}>×</span>
      <span style={{ fontSize: fontSize + 2, fontWeight: 800, color: 'var(--blue)', letterSpacing: '-0.01em' }}>ScalePods</span>
    </div>
  );
}

// Interfaces for our state elements to ensure type safety
interface Invoice {
  invNo: string;
  amount: number;
  date: string;
}

interface Receivable {
  id: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  outstanding: number;
  overdueDays: number;
  lastReminder: string;
  stage: string;
  invoices: Invoice[];
}

interface Product {
  id: string;
  name: string;
  sku: string;
  warehouse: number;
  amazon: number;
  blinkit: number;
  myntra: number;
  flipkart: number;
  instamart: number;
  nykaa: number;
  shopify: number;
  avgMonthlySales: number;
  cost: number;
  price: number;
  leadTime: number;
}

interface SupportThread {
  sender: string;
  msg: string;
  time: string;
}

interface SupportCase {
  id: string;
  customer: string;
  channel: string;
  msg: string;
  status: string;
  escalation: string;
  time: string;
  thread: SupportThread[];
}

interface Review {
  id: string;
  customer: string;
  rating: number;
  platform: string;
  text: string;
  date: string;
  sentiment: string;
  reply: string | null;
}

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  website: string;
  stage: string;
  notes: string;
}

interface ContentDraft {
  id: string;
  title: string;
  type: string;
  platform: string;
  product: string;
  status: string;
  scriptText: string;
}

interface WhatsappAlert {
  id: string;
  type: string;
  message: string;
  time: string;
  active: boolean;
}

interface Toast {
  id: number;
  message: string;
  type: string;
}

export type BusinessId = 'helios' | 'icorganic';

export interface BusinessProfile {
  id: BusinessId;
  name: string;
  domain: string;
  tagline: string;
  color: string;
}

export const BUSINESSES: BusinessProfile[] = [
  { id: 'helios', name: 'Bombay Helios', domain: 'bombayhelios.in', tagline: 'LED billboards & digital signage', color: 'var(--purple)' },
  { id: 'icorganic', name: 'IC Organic Store', domain: 'icorganicstore.com', tagline: 'Organic grocery & wellness', color: 'var(--green)' },
];

interface AppContextProps {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  business: BusinessId;
  setBusiness: React.Dispatch<React.SetStateAction<BusinessId>>;
  businesses: BusinessProfile[];
  theme: string;
  setTheme: React.Dispatch<React.SetStateAction<string>>;
  dateFilter: string;
  setDateFilter: React.Dispatch<React.SetStateAction<string>>;
  dateRange: DateRange | undefined;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
  dateLabel: string | undefined;
  setDateLabel: React.Dispatch<React.SetStateAction<string | undefined>>;
  toasts: Toast[];
  showToast: (message: string, type?: string) => void;
  spotlightOpen: boolean;
  setSpotlightOpen: React.Dispatch<React.SetStateAction<boolean>>;
  inspectorOpen: boolean;
  setInspectorOpen: React.Dispatch<React.SetStateAction<boolean>>;
  inspectorType: string;
  setInspectorType: React.Dispatch<React.SetStateAction<string>>;
  inspectorData: any;
  setInspectorData: React.Dispatch<React.SetStateAction<any>>;
  inventory: Product[];
  setInventory: React.Dispatch<React.SetStateAction<Product[]>>;
  supportCases: SupportCase[];
  setSupportCases: React.Dispatch<React.SetStateAction<SupportCase[]>>;
  reviews: Review[];
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  receivables: Receivable[];
  setReceivables: React.Dispatch<React.SetStateAction<Receivable[]>>;
  salonLeads: Lead[];
  setSalonLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  contentDrafts: ContentDraft[];
  setContentDrafts: React.Dispatch<React.SetStateAction<ContentDraft[]>>;
  whatsappAlerts: WhatsappAlert[];
  setWhatsappAlerts: React.Dispatch<React.SetStateAction<WhatsappAlert[]>>;
}

// Hard session lifetime. 30 minutes after sign-in the user is logged out and
// must authenticate again (security: an unattended tab can't stay open).
const SESSION_MAX_MS = 30 * 60 * 1000;

/** "ScalePods Admin" -> "SA", "info@scalepods.co" -> "IN". */
function initialsFromName(value: string): string {
  const name = value.includes('@') ? value.split('@')[0] : value;
  const parts = name.trim().split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Create Global Context with default undefined state
const AppContext = createContext<AppContextProps | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// ---------------------------------------------------------------------------
// Dummy data — two businesses:
//   helios:    Bombay Helios (bombayhelios.in) — B2B LED billboards & digital signage
//   icorganic: IC Organic Store (icorganicstore.com) — organic grocery, Mumbai
// Every module reads a business-keyed dataset below and the sidebar/header
// business switcher controls which business's records are shown.
// ---------------------------------------------------------------------------

// Bombay Helios is a B2B LED-display/digital-signage company (freestanding,
// wall-mounted, mobile and outdoor/indoor LED billboards, plus nano-coating
// services) — not a retail SKU brand, so it doesn't sell on marketplace
// channels. `warehouse` holds deployable/rental unit stock; the marketplace
// channel fields stay 0 since those channels don't apply to this business.
const HELIOS_INVENTORY: Product[] = [
  { id: 'inv-1', name: 'Freestanding LED Billboard — P10 Outdoor, 20x10ft', sku: 'BH-LED-FS-P10', warehouse: 6, amazon: 0, blinkit: 0, myntra: 0, flipkart: 0, instamart: 0, nykaa: 0, shopify: 0, avgMonthlySales: 3, cost: 850000, price: 1450000, leadTime: 35 },
  { id: 'inv-2', name: 'Wall-Mounted LED Screen — P6 Indoor, 10x6ft', sku: 'BH-LED-WM-P6', warehouse: 10, amazon: 0, blinkit: 0, myntra: 0, flipkart: 0, instamart: 0, nykaa: 0, shopify: 0, avgMonthlySales: 5, cost: 320000, price: 575000, leadTime: 21 },
  { id: 'inv-3', name: 'Mobile LED Billboard Unit (Vehicle-Mounted)', sku: 'BH-LED-MOB-01', warehouse: 3, amazon: 0, blinkit: 0, myntra: 0, flipkart: 0, instamart: 0, nykaa: 0, shopify: 0, avgMonthlySales: 2, cost: 1100000, price: 1850000, leadTime: 45 },
  { id: 'inv-4', name: 'Outdoor LED Screen — Weatherproof P8, 16x9ft', sku: 'BH-LED-OUT-P8', warehouse: 4, amazon: 0, blinkit: 0, myntra: 0, flipkart: 0, instamart: 0, nykaa: 0, shopify: 0, avgMonthlySales: 2, cost: 680000, price: 1150000, leadTime: 30 },
  { id: 'inv-5', name: 'Nano-Coating Service Kit (Anti-Moisture + Anti-Rust)', sku: 'BH-COAT-NANO-KIT', warehouse: 18, amazon: 0, blinkit: 0, myntra: 0, flipkart: 0, instamart: 0, nykaa: 0, shopify: 0, avgMonthlySales: 9, cost: 24000, price: 45000, leadTime: 7 }
];

const ICORGANIC_INVENTORY: Product[] = [
  { id: 'inv-1', name: 'Organic Anveshan A2 Cow Ghee 500ml', sku: 'IC-GHEE-A2-500', warehouse: 180, amazon: 60, blinkit: 40, myntra: 0, flipkart: 20, instamart: 35, nykaa: 0, shopify: 90, avgMonthlySales: 210, cost: 480, price: 899, leadTime: 15 },
  { id: 'inv-2', name: 'Organic Basmati Rice 5kg', sku: 'IC-RICE-BAS-5K', warehouse: 320, amazon: 90, blinkit: 55, myntra: 0, flipkart: 30, instamart: 60, nykaa: 0, shopify: 110, avgMonthlySales: 340, cost: 420, price: 699, leadTime: 20 },
  { id: 'inv-3', name: 'Praakritik Cold-Pressed Groundnut Oil 1L', sku: 'IC-OIL-GNUT-1L', warehouse: 150, amazon: 40, blinkit: 20, myntra: 0, flipkart: 15, instamart: 18, nykaa: 0, shopify: 55, avgMonthlySales: 160, cost: 260, price: 449, leadTime: 20 },
  { id: 'inv-4', name: 'Organic Jaggery Powder 1kg', sku: 'IC-JAGG-PWD-1K', warehouse: 10, amazon: 12, blinkit: 4, myntra: 0, flipkart: 5, instamart: 3, nykaa: 0, shopify: 14, avgMonthlySales: 220, cost: 95, price: 199, leadTime: 10 },
  { id: 'inv-5', name: 'Herbal Strategi Multi-Surface Cleaner 500ml', sku: 'IC-CLN-MS-500', warehouse: 400, amazon: 70, blinkit: 50, myntra: 0, flipkart: 25, instamart: 30, nykaa: 0, shopify: 80, avgMonthlySales: 190, cost: 140, price: 299, leadTime: 15 }
];

const HELIOS_SUPPORT_CASES: SupportCase[] = [
  { id: 'case-1', customer: 'Rahul Mehra', channel: 'email', msg: 'Our freestanding billboard at the Infinity Mall site has a flickering panel on the bottom-left row. Can we get a technician out this week?', status: 'Open', escalation: 'Maintenance Escalation', time: '10m ago', thread: [
    { sender: 'customer', msg: 'Our freestanding billboard at the Infinity Mall site has a flickering panel on the bottom-left row. Can we get a technician out this week?', time: '16:42' },
    { sender: 'ai', msg: 'Apologies for the disruption, Rahul. I have logged a priority maintenance ticket for the Infinity Mall freestanding unit and flagged it to our PAN-India maintenance team. A technician will be on-site within 48 hours under your AMC.', time: '16:43' }
  ]},
  { id: 'case-2', customer: 'Neha Sharma', channel: 'whatsapp', msg: 'We need the mobile LED billboard rerouted for tomorrow’s event — the venue changed from Bandra to Lower Parel.', status: 'Open', escalation: 'Logistics Change', time: '1h ago', thread: [
    { sender: 'customer', msg: 'We need the mobile LED billboard rerouted for tomorrow’s event — the venue changed from Bandra to Lower Parel.', time: '15:30' },
    { sender: 'ai', msg: 'Noted, Neha — I have updated the mobile unit’s route to Lower Parel and confirmed with the driver. Your deployment window stays the same, 9 AM–9 PM.', time: '15:32' }
  ]},
  { id: 'case-3', customer: 'Ajay Kulkarni', channel: 'website', msg: 'Can I get the structural stability certificate for our wall-mounted screen? Our building society is asking for it.', status: 'Resolved', escalation: 'None', time: '4h ago', thread: [
    { sender: 'customer', msg: 'Can I get the structural stability certificate for our wall-mounted screen? Our building society is asking for it.', time: '12:15' },
    { sender: 'ai', msg: 'The structural stability certificate for your wall-mounted LED screen has been emailed to you, along with the latest audit report.', time: '12:17' }
  ]}
];

const ICORGANIC_SUPPORT_CASES: SupportCase[] = [
  { id: 'case-1', customer: 'Kavita Rao', channel: 'website', msg: 'My preorder for organic fruits & vegetables did not arrive on the Borivali slot. Can you reschedule?', status: 'Open', escalation: 'Delivery Reschedule', time: '20m ago', thread: [
    { sender: 'customer', msg: 'My preorder for organic fruits & vegetables did not arrive on the Borivali slot. Can you reschedule?', time: '09:10' },
    { sender: 'ai', msg: 'Sorry about that, Kavita! Our Borivali West store had a delivery delay today. I have rescheduled your order for tomorrow’s morning slot and added a free punnet of cherry tomatoes.', time: '09:12' }
  ]},
  { id: 'case-2', customer: 'Farhan Shaikh', channel: 'whatsapp', msg: 'The Anveshan ghee jar I received was only half full — looks like a packaging leak.', status: 'Open', escalation: 'Refund Requested', time: '2h ago', thread: [
    { sender: 'customer', msg: 'The Anveshan ghee jar I received was only half full — looks like a packaging leak.', time: '14:02' },
    { sender: 'ai', msg: 'Apologies, Farhan — that should not happen with our ghee packaging. I am dispatching a replacement jar today and refunding the delivery charge.', time: '14:05' }
  ]},
  { id: 'case-3', customer: 'Priya Deshmukh', channel: 'shopify', msg: 'Can I use the free shipping coupon for orders above Rs 2000 on a repeat order?', status: 'Resolved', escalation: 'None', time: '5h ago', thread: [
    { sender: 'customer', msg: 'Can I use the free shipping coupon for orders above Rs 2000 on a repeat order?', time: '11:00' },
    { sender: 'ai', msg: 'Yes! The free shipping coupon applies to any order above Rs 2000, including repeat orders. I have applied it to your cart.', time: '11:02' }
  ]}
];

const RAW_HELIOS_REVIEWS: Review[] = [
  { id: 'rev-1', customer: 'Sonia Verma', rating: 5, platform: 'Google', text: 'Our freestanding billboard has become a local landmark — the install crew was professional and the panel quality is outstanding even in direct monsoon rain.', date: '2026-09-25', sentiment: 'positive', reply: 'Thank you Sonia! We are thrilled the nano-coating is holding up through the monsoon.' },
  { id: 'rev-2', customer: 'Rahul Mehra', rating: 2, platform: 'Google', text: 'Good panel quality but the licensing and BMC permission process for our mall site took much longer than quoted.', date: '2026-09-23', sentiment: 'negative', reply: 'Apologies for the delay, Rahul — we are tightening our municipal liaising timelines and will update you directly on the next milestone.' },
  { id: 'rev-3', customer: 'Ajay Kulkarni', rating: 4, platform: 'Google', text: 'Mobile billboard units were deployed quickly for our pop-up campaign across three venues in one week. Very responsive team.', date: '2026-09-23', sentiment: 'positive', reply: null },
  { id: 'rev-4', customer: 'Vikram Oza', rating: 3, platform: 'Google', text: 'Screen brightness is great but we had one panel outage within the first month — resolved under AMC, just slower than expected.', date: '2026-09-22', sentiment: 'negative', reply: 'Thanks for flagging this, Vikram — our maintenance SLA is being reviewed and a technician has already been assigned to your site.' }
];

const RAW_ICORGANIC_REVIEWS: Review[] = [
  { id: 'rev-1', customer: 'Sunita Iyer', rating: 5, platform: 'Google', text: 'The Anveshan A2 ghee is pure and aromatic — tastes like what my grandmother used to make at home. Will reorder monthly.', date: '2026-09-25', sentiment: 'positive', reply: 'Thank you Sunita! So happy the A2 ghee reminded you of home-made ghee.' },
  { id: 'rev-2', customer: 'Rahul Mehta', rating: 2, platform: 'Amazon', text: 'Organic basmati rice bag arrived with a torn corner and some rice had spilled out in transit.', date: '2026-09-23', sentiment: 'negative', reply: 'Sorry about that Rahul — we are sending a fresh 5kg bag and will flag this with our packing team.' },
  { id: 'rev-3', customer: 'Anjali Nair', rating: 4, platform: 'Website', text: 'Praakritik cold-pressed groundnut oil has a lovely natural aroma, much better than refined oil. A bit pricier but worth it.', date: '2026-09-23', sentiment: 'positive', reply: null },
  { id: 'rev-4', customer: 'Devesh Kulkarni', rating: 1, platform: 'Website', text: 'Ordered organic jaggery powder but received the solid block jaggery instead. Need an exchange.', date: '2026-09-22', sentiment: 'negative', reply: 'Apologies for the mixup Devesh — our team is arranging a pickup and sending the correct jaggery powder.' }
];

const RAW_HELIOS_RECEIVABLES: Receivable[] = [
  { id: 'rec-1', name: 'Urban Retail Group', owner: 'Rahul Mehra', email: 'rahul.mehra@urbanretailgroup.in', phone: '+91 98765 43210', outstanding: 1450000, overdueDays: 37, lastReminder: '2026-09-19', stage: 'Reminder #3', invoices: [{ invNo: 'INV-2026-092', amount: 950000, date: '2026-08-19' }, { invNo: 'INV-2026-104', amount: 500000, date: '2026-09-01' }] },
  { id: 'rec-2', name: 'Eventscape India', owner: 'Neha Sharma', email: 'billing@eventscapeindia.com', phone: '+91 99112 23344', outstanding: 575000, overdueDays: 24, lastReminder: '2026-09-22', stage: 'Reminder #2', invoices: [{ invNo: 'INV-2026-110', amount: 575000, date: '2026-09-02' }] },
  { id: 'rec-3', name: 'FastTrack Promotions', owner: 'Ajay Kulkarni', email: 'ajay@fasttrackpromotions.in', phone: '+91 98100 98100', outstanding: 185000, overdueDays: 8, lastReminder: '2026-09-25', stage: 'Reminder #1', invoices: [{ invNo: 'INV-2026-124', amount: 185000, date: '2026-09-18' }] },
  { id: 'rec-4', name: 'Visionary Media Co.', owner: 'Sonia Verma', email: 'finance@visionarymedia.in', phone: '+91 92123 45678', outstanding: 1150000, overdueDays: 45, lastReminder: '2026-09-15', stage: 'Escalation', invoices: [{ invNo: 'INV-2026-084', amount: 1150000, date: '2026-08-12' }] },
  { id: 'rec-5', name: 'Infinity Mall Mumbai', owner: 'Vikram Oza', email: 'facilities@infinitymall.in', phone: '+91 95600 12345', outstanding: 45000, overdueDays: 0, lastReminder: 'None', stage: 'Invoice Issued', invoices: [{ invNo: 'INV-2026-135', amount: 45000, date: '2026-09-26' }] }
];

const RAW_ICORGANIC_RECEIVABLES: Receivable[] = [
  { id: 'rec-1', name: 'Green Leaf Retail Stores', owner: 'Mahesh Patil', email: 'mahesh@greenleafretail.in', phone: '+91 98765 11223', outstanding: 85000, overdueDays: 30, lastReminder: '2026-09-18', stage: 'Reminder #3', invoices: [{ invNo: 'INV-2026-061', amount: 55000, date: '2026-08-17' }, { invNo: 'INV-2026-073', amount: 30000, date: '2026-08-29' }] },
  { id: 'rec-2', name: 'Borivali Fresh Mart', owner: 'Sunil Jadhav', email: 'accounts@borivalifresh.com', phone: '+91 99223 44556', outstanding: 210000, overdueDays: 18, lastReminder: '2026-09-21', stage: 'Reminder #2', invoices: [{ invNo: 'INV-2026-082', amount: 210000, date: '2026-09-04' }] },
  { id: 'rec-3', name: 'Natural Pantry Co-op', owner: 'Radhika Shetty', email: 'radhika@naturalpantry.in', phone: '+91 98100 55667', outstanding: 62000, overdueDays: 5, lastReminder: '2026-09-24', stage: 'Reminder #1', invoices: [{ invNo: 'INV-2026-098', amount: 62000, date: '2026-09-17' }] },
  { id: 'rec-4', name: 'Healthy Harvest Distributors', owner: 'Ajay Bhatt', email: 'finance@healthyharvest.in', phone: '+91 92123 99887', outstanding: 175000, overdueDays: 40, lastReminder: '2026-09-14', stage: 'Escalation', invoices: [{ invNo: 'INV-2026-055', amount: 175000, date: '2026-08-09' }] },
  { id: 'rec-5', name: 'Pure Earth Grocers', owner: 'Nisha Pillai', email: 'nisha@pureearth.in', phone: '+91 95600 44332', outstanding: 38000, overdueDays: 0, lastReminder: 'None', stage: 'Invoice Issued', invoices: [{ invNo: 'INV-2026-109', amount: 38000, date: '2026-09-26' }] }
];

// Rebase every record independently so its primary activity date always
// falls within the dashboard's default "last 7 days" filter — on every
// page load, regardless of when the app is opened.
function latestInvoiceDate(r: Receivable): string | null {
  return r.invoices.reduce<string | null>(
    (latest, inv) => (!latest || inv.date > latest ? inv.date : latest),
    null
  );
}

const HELIOS_REVIEWS = rebaseRecordsToRecentWindow(RAW_HELIOS_REVIEWS, (r) => r.date, (r) => r.id);
const HELIOS_RECEIVABLES = rebaseRecordsToRecentWindow(RAW_HELIOS_RECEIVABLES, latestInvoiceDate, (r) => r.id);
const ICORGANIC_REVIEWS = rebaseRecordsToRecentWindow(RAW_ICORGANIC_REVIEWS, (r) => r.date, (r) => r.id);
const ICORGANIC_RECEIVABLES = rebaseRecordsToRecentWindow(RAW_ICORGANIC_RECEIVABLES, latestInvoiceDate, (r) => r.id);

const HELIOS_LEADS: Lead[] = [
  { id: 'lead-1', name: 'Phoenix Marketcity Mall', phone: '+91 98711 22334', email: 'facilities@phoenixmarketcity.in', location: 'Kurla, Mumbai', website: 'phoenixmarketcity.com', stage: 'Interested', notes: 'Interested in a freestanding billboard at the main entrance plaza.' },
  { id: 'lead-2', name: 'Spark Ad Agency', phone: '+91 99990 88880', email: 'info@sparkadagency.com', location: 'Indiranagar, Bangalore', website: 'sparkadagency.com', stage: 'Sample Sent', notes: 'Sent portfolio deck and wall-mounted screen case studies on June 15.' },
  { id: 'lead-3', name: 'Bandra Bandstand Promenade Committee', phone: '+91 98123 45690', email: 'secretary@bandstandpromenade.in', location: 'Bandra West, Mumbai', website: 'bandstandpromenade.in', stage: 'Lead', notes: 'Scraped from Maps. Looking at an outdoor LED screen for the promenade.' },
  { id: 'lead-4', name: 'MetroWalk Retail Developers', phone: '+91 95555 44444', email: 'admin@metrowalkretail.com', location: 'Sector 15, Noida', website: 'metrowalkretail.com', stage: 'Negotiation', notes: 'Negotiating pricing for 3 wall-mounted screens across their mall chain.' },
  { id: 'lead-5', name: 'Salt Lake Convention Centre', phone: '+91 98888 77777', email: 'events@saltlakeconvention.in', location: 'Salt Lake, Kolkata', website: 'saltlakeconvention.in', stage: 'Won', notes: 'Closed deal for ₹1.2L outdoor LED screen installation.' }
];

const ICORGANIC_LEADS: Lead[] = [
  { id: 'lead-1', name: 'Green Basket Organic Mart', phone: '+91 98711 33445', email: 'contact@greenbasket.in', location: 'Andheri West, Mumbai', website: 'greenbasket.in', stage: 'Interested', notes: 'Interested in bulk A2 ghee and rice bulk samples.' },
  { id: 'lead-2', name: 'Wholesome Foods Co-op', phone: '+91 99990 66771', email: 'info@wholesomefoods.in', location: 'Koramangala, Bangalore', website: 'wholesomefoods.co.in', stage: 'Sample Sent', notes: 'Sent organic rice & ghee sample kit on June 15.' },
  { id: 'lead-3', name: 'Nature’s Basket Borivali', phone: '+91 98123 55678', email: 'orders@naturesbasket.in', location: 'Borivali West, Mumbai', website: 'naturesbasket.in', stage: 'Lead', notes: 'Scraped from Maps. Active organic retail counter near our store.' },
  { id: 'lead-4', name: 'EcoHarvest Retail Chain', phone: '+91 95555 22233', email: 'procurement@ecoharvest.com', location: 'Sector 18, Noida', website: 'ecoharvestretail.com', stage: 'Negotiation', notes: 'Negotiating pricing for bulk herbal cleanser order.' },
  { id: 'lead-5', name: 'Pure Roots Grocery', phone: '+91 98888 99001', email: 'purerootsgrocery@gmail.com', location: 'Salt Lake, Kolkata', website: 'purerootsgrocery.com', stage: 'Won', notes: 'Closed deal for ₹1.1L organic staples bulk order.' }
];

const HELIOS_CONTENT_DRAFTS: ContentDraft[] = [
  { id: 'c-1', title: 'Infinity Mall Billboard Case Study', type: 'Case Study', platform: 'LinkedIn', product: 'Freestanding LED Billboard — P10 Outdoor', status: 'draft', scriptText: 'Hook: "How one freestanding billboard became a Mumbai landmark."\nShot 1: Drone shot of the Infinity Mall freestanding unit at dusk.\nShot 2: Before/after footfall data from Urban Retail Group.\nCTA: "Book a site survey for your property — link in bio."' },
  { id: 'c-2', title: 'Mobile Billboard Event Reel', type: 'Project Showcase', platform: 'Instagram Reels', product: 'Mobile LED Billboard Unit', status: 'review', scriptText: 'Hook: "We deployed 3 mobile billboards across Mumbai in one week."\nShot 1: Time-lapse of the mobile unit being set up at an event venue.\nShot 2: Crowd reaction footage at Eventscape India’s activation.\nCTA: "Need rapid-deploy advertising for your next event? DM us."' },
  { id: 'c-3', title: 'Nano-Coating Monsoon Durability Ad', type: 'Ad Campaign', platform: 'LinkedIn Ads', product: 'Nano-Coating Service Kit', status: 'approved', scriptText: 'Ad Copy: "Monsoon-proof your LED investment. Our nano-technology coating protects against humidity, salinity, and corrosion — tested across 85+ installs PAN-India.\nGet a free structural audit with your next coating service."' }
];

const ICORGANIC_CONTENT_DRAFTS: ContentDraft[] = [
  { id: 'c-1', title: 'A2 Ghee Kitchen Ritual Hook', type: 'UGC Script', platform: 'Instagram Reels', product: 'Organic Anveshan A2 Cow Ghee 500ml', status: 'draft', scriptText: 'Hook: "This is why your dadi’s ghee smelled different."\nShot 1: Slow pour of golden A2 ghee over hot rice.\nShot 2: Show the bilona-style churning process on farm.\nCTA: "Order traditional A2 ghee, delivered fresh to your door."' },
  { id: 'c-2', title: 'Cold-Pressed Oil Taste Test', type: 'Product Demo', platform: 'YouTube Shorts', product: 'Praakritik Cold-Pressed Groundnut Oil 1L', status: 'review', scriptText: 'Hook: "I switched my cooking oil for 30 days — here is what happened."\nShot 1: Side-by-side aroma comparison with refined oil.\nShot 2: Cooking demo showing natural nutty aroma.\nCTA: "Free shipping on orders above ₹2000 — link in bio!"' },
  { id: 'c-3', title: 'Organic Basmati Rice Festive Copy', type: 'Ad Campaign', platform: 'Facebook Ads', product: 'Organic Basmati Rice 5kg', status: 'approved', scriptText: 'Ad Copy: "Chemical-free, aromatic, and farm-fresh. Our Organic Basmati Rice is grown without pesticides and milled in small batches.\nStock up for the festive season — 10% off your first order!"' }
];

// -------------------------------------------------------
// Workspace definitions — the sidebar dropdown switches
// between these, each with its own nav item list.
// -------------------------------------------------------
interface WorkspaceNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

interface WorkspaceSection {
  label: string;
  items: WorkspaceNavItem[];
}

interface Workspace {
  id: string;
  name: string;
  tagline: string;
  icon: React.ComponentType<{ size?: number }>;
  homePath: string;
  sections: WorkspaceSection[];
}

const WORKSPACES: Workspace[] = [
  {
    id: 'master',
    name: 'Master Dashboard',
    tagline: 'All channels combined',
    icon: LayoutDashboard,
    homePath: '/master',
    sections: [
      { label: 'Overview', items: [{ href: '/master', label: 'Master Dashboard', icon: LayoutDashboard }] },
    ],
  },
  {
    id: 'executive',
    name: 'Executive Board',
    tagline: 'Founder command center',
    icon: LayoutDashboard,
    homePath: '/dashboard',
    sections: [
      { label: 'Founder Core', items: [{ href: '/dashboard', label: 'Executive Board', icon: LayoutDashboard }] },
    ],
  },
  {
    id: 'inventory',
    name: 'Inventory Intel',
    tagline: 'Stock & forecasting',
    icon: Package,
    homePath: '/inventory',
    sections: [
      { label: 'Operations', items: [{ href: '/inventory', label: 'Inventory Intel', icon: Package }] },
    ],
  },
  {
    id: 'customer-care',
    name: 'Customer Care',
    tagline: 'Support & reviews',
    icon: Bot,
    homePath: '/customer-care',
    sections: [
      { label: 'Operations', items: [{ href: '/customer-care', label: 'Customer Care', icon: Bot }] },
    ],
  },
  {
    id: 'content-os',
    name: 'Content OS',
    tagline: 'Marketing content engine',
    icon: Sparkles,
    homePath: '/marketing',
    sections: [
      { label: 'Marketing', items: [{ href: '/marketing', label: 'Content OS', icon: Sparkles }] },
    ],
  },
  {
    id: 'salon-crm',
    name: 'B2B Leads CRM',
    tagline: 'Wholesale lead engine',
    icon: Users,
    homePath: '/salon-crm/dashboard',
    sections: [
      {
        label: 'Lead Generation',
        items: [{ href: '/salon-crm/scraper', label: 'Google Maps Scraper', icon: MapPin }],
      },
      {
        label: 'Pipeline',
        items: [{ href: '/salon-crm/leads', label: 'Leads', icon: Users }],
      },
      {
        label: 'Channels',
        items: [
          { href: '/salon-crm/whatsapp/dashboard', label: 'WhatsApp', icon: MessageSquare },
          { href: '/salon-crm/email/dashboard', label: 'Email', icon: Mail },
          { href: '/salon-crm/voice/dashboard', label: 'Voice', icon: Phone },
        ],
      },
      {
        label: 'Insights',
        items: [{ href: '/salon-crm/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
      },
    ],
  },
  {
    id: 'receivables',
    name: 'Receivables Recovery',
    tagline: 'AR collections engine',
    icon: DollarSign,
    homePath: '/accounts-receivable/dashboard',
    sections: [
      {
        label: 'Overview',
        items: [{ href: '/accounts-receivable/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
      },
      {
        label: 'Invoices',
        items: [{ href: '/accounts-receivable/upload-invoice', label: 'Upload Invoice', icon: UploadCloud }],
      },
      {
        label: 'Channels',
        items: [
          { href: '/accounts-receivable/whatsapp', label: 'WhatsApp', icon: MessageSquare },
          { href: '/accounts-receivable/email', label: 'Email', icon: Mail },
          { href: '/accounts-receivable/voice', label: 'Voice Panel', icon: Phone },
        ],
      },
    ],
  },
];

// Channel sub-navs for Receivables — the sidebar swaps to these while the
// user is inside /accounts-receivable/email/* or /accounts-receivable/whatsapp/*.
const RECEIVABLES_EMAIL_SECTIONS: WorkspaceSection[] = [
  {
    label: 'Email',
    items: [
      { href: '/accounts-receivable/email/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/accounts-receivable/email/sent', label: 'Sent', icon: Send },
      { href: '/accounts-receivable/email/received', label: 'Received', icon: Inbox },
      { href: '/accounts-receivable/email/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Receivables',
    items: [
      { href: '/accounts-receivable/dashboard', label: 'Back to Dashboard', icon: ChevronLeft },
      { href: '/accounts-receivable/whatsapp/dashboard', label: 'WhatsApp', icon: MessageSquare },
      { href: '/accounts-receivable/voice', label: 'Voice Panel', icon: Phone },
    ],
  },
];

const RECEIVABLES_WHATSAPP_SECTIONS: WorkspaceSection[] = [
  {
    label: 'WhatsApp',
    items: [
      { href: '/accounts-receivable/whatsapp/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/accounts-receivable/whatsapp/chats', label: 'Chats', icon: MessageSquare },
      { href: '/accounts-receivable/whatsapp/leads', label: 'Leads', icon: Users },
      { href: '/accounts-receivable/whatsapp/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Receivables',
    items: [
      { href: '/accounts-receivable/dashboard', label: 'Back to Dashboard', icon: ChevronLeft },
      { href: '/accounts-receivable/email/dashboard', label: 'Email', icon: Mail },
      { href: '/accounts-receivable/voice', label: 'Voice Panel', icon: Phone },
    ],
  },
];

// Channel sub-navs for Salon CRM — swapped in while inside
// /salon-crm/email/* or /salon-crm/whatsapp/*.
const SALON_CRM_EMAIL_SECTIONS: WorkspaceSection[] = [
  {
    label: 'Email',
    items: [
      { href: '/salon-crm/email/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/salon-crm/email/inbox', label: 'Inbox', icon: Inbox },
      { href: '/salon-crm/email/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'B2B Leads CRM',
    items: [
      { href: '/salon-crm/dashboard', label: 'Back to Dashboard', icon: ChevronLeft },
      { href: '/salon-crm/leads', label: 'Leads', icon: Users },
      { href: '/salon-crm/whatsapp/dashboard', label: 'WhatsApp', icon: MessageSquare },
      { href: '/salon-crm/voice/dashboard', label: 'Voice', icon: Phone },
    ],
  },
];

const SALON_CRM_WHATSAPP_SECTIONS: WorkspaceSection[] = [
  {
    label: 'WhatsApp',
    items: [
      { href: '/salon-crm/whatsapp/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/salon-crm/whatsapp/chats', label: 'Chats', icon: MessageSquare },
      { href: '/salon-crm/whatsapp/leads', label: 'Leads', icon: Users },
      { href: '/salon-crm/whatsapp/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'B2B Leads CRM',
    items: [
      { href: '/salon-crm/dashboard', label: 'Back to Dashboard', icon: ChevronLeft },
      { href: '/salon-crm/leads', label: 'Leads', icon: Users },
      { href: '/salon-crm/email/dashboard', label: 'Email', icon: Mail },
      { href: '/salon-crm/voice/dashboard', label: 'Voice', icon: Phone },
    ],
  },
];

const SALON_CRM_VOICE_SECTIONS: WorkspaceSection[] = [
  {
    label: 'Voice',
    items: [
      { href: '/salon-crm/voice/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/salon-crm/voice/logs', label: 'Call Logs', icon: Phone },
      { href: '/salon-crm/voice/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'B2B Leads CRM',
    items: [
      { href: '/salon-crm/dashboard', label: 'Back to Dashboard', icon: ChevronLeft },
      { href: '/salon-crm/leads', label: 'Leads', icon: Users },
      { href: '/salon-crm/whatsapp/dashboard', label: 'WhatsApp', icon: MessageSquare },
      { href: '/salon-crm/email/dashboard', label: 'Email', icon: Mail },
    ],
  },
];

/** Returns the workspace for a path, with channel sub-navs swapped in. */
function resolveWorkspace(pathname: string | null): Workspace {
  const base = workspaceForPath(pathname);
  if (!pathname) return base;
  if (base.id === 'receivables') {
    if (pathname.startsWith('/accounts-receivable/email')) {
      return { ...base, sections: RECEIVABLES_EMAIL_SECTIONS };
    }
    if (pathname.startsWith('/accounts-receivable/whatsapp')) {
      return { ...base, sections: RECEIVABLES_WHATSAPP_SECTIONS };
    }
  }
  if (base.id === 'salon-crm') {
    if (pathname.startsWith('/salon-crm/email')) {
      return { ...base, sections: SALON_CRM_EMAIL_SECTIONS };
    }
    if (pathname.startsWith('/salon-crm/whatsapp')) {
      return { ...base, sections: SALON_CRM_WHATSAPP_SECTIONS };
    }
    if (pathname.startsWith('/salon-crm/voice')) {
      return { ...base, sections: SALON_CRM_VOICE_SECTIONS };
    }
  }
  return base;
}

function workspaceForPath(pathname: string | null): Workspace {
  if (!pathname) return WORKSPACES[0];
  if (pathname.startsWith('/salon-crm') || pathname.startsWith('/salon-sales')) {
    return WORKSPACES.find((w) => w.id === 'salon-crm')!;
  }
  if (pathname.startsWith('/accounts-receivable')) {
    return WORKSPACES.find((w) => w.id === 'receivables')!;
  }
  if (pathname.startsWith('/inventory')) return WORKSPACES.find((w) => w.id === 'inventory')!;
  if (pathname.startsWith('/customer-care')) return WORKSPACES.find((w) => w.id === 'customer-care')!;
  if (pathname.startsWith('/marketing')) return WORKSPACES.find((w) => w.id === 'content-os')!;
  if (pathname.startsWith('/dashboard')) return WORKSPACES.find((w) => w.id === 'executive')!;
  if (pathname.startsWith('/master')) return WORKSPACES.find((w) => w.id === 'master')!;
  return WORKSPACES[0];
}

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isPublicSharePage =
    (pathname?.startsWith('/share/') ?? false) || pathname === '/reset-password';

  // A Supabase password-reset link redirects to the Site URL ("/") with the
  // token in the URL hash. Catch that anywhere and forward to /reset-password,
  // carrying the hash, so the reset works even if the Supabase redirect URL
  // still points at the site root.
  const [authHashRedirecting, setAuthHashRedirecting] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash || '';
    if (
      pathname !== '/reset-password' &&
      /[#&]access_token=/.test(hash) &&
      /[#&]type=(recovery|magiclink|signup)/.test(hash)
    ) {
      setAuthHashRedirecting(true);
      window.location.replace('/reset-password' + hash);
    }
  }, [pathname]);

  // App Global States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const activeWorkspace = resolveWorkspace(pathname);

  // Close the workspace dropdown whenever the route changes.
  useEffect(() => {
    setWorkspaceMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const saved = localStorage.getItem('isLoggedIn');
    const loginAt = Number(localStorage.getItem('loginAt') || '0');
    const sessionValid = saved === 'true' && loginAt > 0 && Date.now() - loginAt < SESSION_MAX_MS;
    if (sessionValid) {
      setIsLoggedIn(true);
      try {
        const stored = JSON.parse(localStorage.getItem('authUser') || 'null');
        if (stored?.email) setCurrentUser(stored);
      } catch {
        /* ignore */
      }
    } else if (saved === 'true') {
      // Session on record but expired — clear it so the login gate shows.
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('loginAt');
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      localStorage.setItem('sessionExpired', '1');
    }
    if (localStorage.getItem('sessionExpired') === '1') {
      setSessionExpiredNotice(true);
    }
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;
    localStorage.setItem('isLoggedIn', String(isLoggedIn));
    if (!isLoggedIn) {
      localStorage.removeItem('loginAt');
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      setCurrentUser(null);
    }
  }, [isLoggedIn, hasMounted]);

  // Auto-logout 30 minutes after the session started. Checks on an interval
  // and when the tab regains focus, so a backgrounded tab still expires.
  useEffect(() => {
    if (!hasMounted || !isLoggedIn) return;

    const enforce = () => {
      const loginAt = Number(localStorage.getItem('loginAt') || '0');
      if (!loginAt || Date.now() - loginAt >= SESSION_MAX_MS) {
        setIsLoggedIn(false);
        setSessionExpiredNotice(true);
        localStorage.removeItem('loginAt');
        localStorage.removeItem('authToken');
        localStorage.setItem('isLoggedIn', 'false');
        localStorage.setItem('sessionExpired', '1');
        fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
        router.push('/');
      }
    };

    const id = window.setInterval(enforce, 30_000);
    window.addEventListener('focus', enforce);
    document.addEventListener('visibilitychange', enforce);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('focus', enforce);
      document.removeEventListener('visibilitychange', enforce);
    };
  }, [isLoggedIn, hasMounted, router]);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginBusy, setLoginBusy] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotBusy, setForgotBusy] = useState(false);
  const [forgotMsg, setForgotMsg] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // "Forgot password?" — email a Supabase reset link that lands on /reset-password.
  const sendResetLink = async () => {
    setForgotError(null);
    setForgotMsg(null);
    const email = forgotEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setForgotError('Enter a valid email address.');
      return;
    }
    setForgotBusy(true);
    try {
      const res = await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setForgotError(data?.error || 'Could not send the reset email.');
        return;
      }
      setForgotMsg(data?.message || 'If that email is registered, a reset link is on its way.');
    } catch {
      setForgotError('Network error — please try again.');
    } finally {
      setForgotBusy(false);
    }
  };

  // Performs the real login against /api/auth/login (salon_crm users table).
  const doLogin = async () => {
    setLoginError(null);
    setLoginBusy(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLoginError(data?.error || 'Sign in failed.');
        return;
      }
      localStorage.setItem('sessionExpired', '0');
      localStorage.removeItem('sessionExpired');
      localStorage.setItem('loginAt', String(Date.now()));
      if (data?.token) localStorage.setItem('authToken', data.token);
      const u = {
        name: (data?.user?.name as string) || (data?.user?.email as string) || loginEmail.trim(),
        email: (data?.user?.email as string) || loginEmail.trim(),
      };
      localStorage.setItem('authUser', JSON.stringify(u));
      setCurrentUser(u);
      setSessionExpiredNotice(false);
      setLoginPassword('');
      setIsLoggedIn(true);
      if (pathname === '/') router.push('/master');
      showToast('Signed in to Growth OS.', 'success');
    } catch {
      setLoginError('Network error — please try again.');
    } finally {
      setLoginBusy(false);
    }
  };

  const [theme, setTheme] = useState('dark');
  const [business, setBusiness] = useState<BusinessId>('helios');

  // Restore the last-selected business on mount, and persist future switches.
  useEffect(() => {
    const saved = localStorage.getItem('activeBusiness');
    if (saved === 'helios' || saved === 'icorganic') setBusiness(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem('activeBusiness', business);
  }, [business]);

  const [dateFilter, setDateFilter] = useState('30d');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => ({
    from: startOfDay(subDays(new Date(), 7)),
    to: endOfDay(new Date()),
  }));
  const [dateLabel, setDateLabel] = useState<string | undefined>('Last 7 days');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Spotlight Finder States
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [spotlightInput, setSpotlightInput] = useState('');
  const [spotlightSelectedIndex, setSpotlightSelectedIndex] = useState(0);

  // Inspector States
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [inspectorType, setInspectorType] = useState('order');
  const [inspectorData, setInspectorData] = useState<any>({});

  // Shared Global Databases — per-business datasets, swapped when `business` changes.
  const BUSINESS_DATA: Record<BusinessId, {
    inventory: Product[];
    supportCases: SupportCase[];
    reviews: Review[];
    receivables: Receivable[];
    leads: Lead[];
    contentDrafts: ContentDraft[];
    whatsappAlerts: WhatsappAlert[];
  }> = {
    helios: {
      inventory: HELIOS_INVENTORY,
      supportCases: HELIOS_SUPPORT_CASES,
      reviews: HELIOS_REVIEWS,
      receivables: HELIOS_RECEIVABLES,
      leads: HELIOS_LEADS,
      contentDrafts: HELIOS_CONTENT_DRAFTS,
      whatsappAlerts: [
        { id: 'wa-1', type: 'Low Stock', message: 'Mobile LED Billboard Unit fleet is critical (3 units left, 2 pending deployment).', time: '10m ago', active: true },
        { id: 'wa-2', type: 'Maintenance Due', message: 'Freestanding LED Billboard at Infinity Mall is due for its annual structural audit.', time: '2h ago', active: true },
      ],
    },
    icorganic: {
      inventory: ICORGANIC_INVENTORY,
      supportCases: ICORGANIC_SUPPORT_CASES,
      reviews: ICORGANIC_REVIEWS,
      receivables: ICORGANIC_RECEIVABLES,
      leads: ICORGANIC_LEADS,
      contentDrafts: ICORGANIC_CONTENT_DRAFTS,
      whatsappAlerts: [
        { id: 'wa-1', type: 'Low Stock', message: 'Organic Jaggery Powder 1kg is critical (10 units left).', time: '12m ago', active: true },
        { id: 'wa-2', type: 'Dead Stock', message: 'Herbal Strategi Multi-Surface Cleaner has 90 days of dead stock in Borivali Hub.', time: '3h ago', active: true },
      ],
    },
  };

  const [inventory, setInventory] = useState<Product[]>(BUSINESS_DATA.helios.inventory);
  const [supportCases, setSupportCases] = useState<SupportCase[]>(BUSINESS_DATA.helios.supportCases);
  const [reviews, setReviews] = useState<Review[]>(BUSINESS_DATA.helios.reviews);
  const [receivables, setReceivables] = useState<Receivable[]>(BUSINESS_DATA.helios.receivables);
  const [salonLeads, setSalonLeads] = useState<Lead[]>(BUSINESS_DATA.helios.leads);
  const [contentDrafts, setContentDrafts] = useState<ContentDraft[]>(BUSINESS_DATA.helios.contentDrafts);
  const [whatsappAlerts, setWhatsappAlerts] = useState<WhatsappAlert[]>(BUSINESS_DATA.helios.whatsappAlerts);

  // Re-seed every dataset whenever the active business changes.
  useEffect(() => {
    const data = BUSINESS_DATA[business];
    setInventory(data.inventory);
    setSupportCases(data.supportCases);
    setReviews(data.reviews);
    setReceivables(data.receivables);
    setSalonLeads(data.leads);
    setContentDrafts(data.contentDrafts);
    setWhatsappAlerts(data.whatsappAlerts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business]);

  // Dynamic Navigation History (Simulated)
  const [historyStack, setHistoryStack] = useState<string[]>(['/']);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Push path to custom history stack when pathname changes
  useEffect(() => {
    if (pathname && historyStack[historyIndex] !== pathname) {
      const newStack = historyStack.slice(0, historyIndex + 1);
      newStack.push(pathname);
      setHistoryStack(newStack);
      setHistoryIndex(newStack.length - 1);
    }
  }, [pathname]);

  // Go Back in Custom History
  const goBack = () => {
    if (historyIndex > 0) {
      const target = historyStack[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      router.push(target);
    }
  };

  // Go Forward in Custom History
  const goForward = () => {
    if (historyIndex < historyStack.length - 1) {
      const target = historyStack[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      router.push(target);
    }
  };

  // Toast System
  const showToast = (message: string, type = 'info') => {
    const newToast = { id: Date.now(), message, type };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 3200);
  };

  // Apply Theme Attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Listen for Global Cmd+K
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSpotlightInput('');
        setSpotlightSelectedIndex(0);
        setSpotlightOpen(true);
      }
      if (e.key === 'Escape') {
        setSpotlightOpen(false);
        setInspectorOpen(false);
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, []);

  const spotlightOptions = [
    { text: 'Go to Master Dashboard', type: 'navigation', target: '/master', shortcut: '⌘0' },
    { text: 'Go to Executive Dashboard', type: 'navigation', target: '/dashboard', shortcut: '⌘1' },
    { text: 'Go to Inventory Intelligence', type: 'navigation', target: '/inventory', shortcut: '⌘2' },
    { text: 'Go to Customer Care & Reviews', type: 'navigation', target: '/customer-care', shortcut: '⌘3' },
    { text: 'Go to Marketing Content OS', type: 'navigation', target: '/marketing', shortcut: '⌘4' },
    { text: 'Go to B2B Leads CRM: Dashboard', type: 'navigation', target: '/salon-crm/dashboard', shortcut: '⌘5' },
    { text: 'Go to B2B Leads CRM: Leads', type: 'navigation', target: '/salon-crm/leads', shortcut: '' },
    { text: 'Go to B2B Leads CRM: Google Maps Scraper', type: 'navigation', target: '/salon-crm/scraper', shortcut: '' },
    { text: 'Go to B2B Leads CRM: WhatsApp Dashboard', type: 'navigation', target: '/salon-crm/whatsapp/dashboard', shortcut: '' },
    { text: 'Go to B2B Leads CRM: WhatsApp Chats', type: 'navigation', target: '/salon-crm/whatsapp/chats', shortcut: '' },
    { text: 'Go to B2B Leads CRM: WhatsApp Leads', type: 'navigation', target: '/salon-crm/whatsapp/leads', shortcut: '' },
    { text: 'Go to B2B Leads CRM: WhatsApp Analytics', type: 'navigation', target: '/salon-crm/whatsapp/analytics', shortcut: '' },
    { text: 'Go to B2B Leads CRM: Email Dashboard', type: 'navigation', target: '/salon-crm/email/dashboard', shortcut: '' },
    { text: 'Go to B2B Leads CRM: Email Inbox', type: 'navigation', target: '/salon-crm/email/inbox', shortcut: '' },
    { text: 'Go to B2B Leads CRM: Email Analytics', type: 'navigation', target: '/salon-crm/email/analytics', shortcut: '' },
    { text: 'Go to B2B Leads CRM: Voice Dashboard', type: 'navigation', target: '/salon-crm/voice/dashboard', shortcut: '' },
    { text: 'Go to B2B Leads CRM: Voice Call Logs', type: 'navigation', target: '/salon-crm/voice/logs', shortcut: '' },
    { text: 'Go to B2B Leads CRM: Voice Analytics', type: 'navigation', target: '/salon-crm/voice/analytics', shortcut: '' },
    { text: 'Go to Receivables: Dashboard', type: 'navigation', target: '/accounts-receivable/dashboard', shortcut: '⌘6' },
    { text: 'Go to Receivables: Upload Invoice', type: 'navigation', target: '/accounts-receivable/upload-invoice', shortcut: '' },
    { text: 'Go to Receivables: WhatsApp Dashboard', type: 'navigation', target: '/accounts-receivable/whatsapp/dashboard', shortcut: '' },
    { text: 'Go to Receivables: WhatsApp Chats', type: 'navigation', target: '/accounts-receivable/whatsapp/chats', shortcut: '' },
    { text: 'Go to Receivables: WhatsApp Leads', type: 'navigation', target: '/accounts-receivable/whatsapp/leads', shortcut: '' },
    { text: 'Go to Receivables: WhatsApp Analytics', type: 'navigation', target: '/accounts-receivable/whatsapp/analytics', shortcut: '' },
    { text: 'Go to Receivables: Email Dashboard', type: 'navigation', target: '/accounts-receivable/email/dashboard', shortcut: '' },
    { text: 'Go to Receivables: Email Sent', type: 'navigation', target: '/accounts-receivable/email/sent', shortcut: '' },
    { text: 'Go to Receivables: Email Received', type: 'navigation', target: '/accounts-receivable/email/received', shortcut: '' },
    { text: 'Go to Receivables: Email Analytics', type: 'navigation', target: '/accounts-receivable/email/analytics', shortcut: '' },
    { text: 'Go to Receivables: Voice Panel', type: 'navigation', target: '/accounts-receivable/voice', shortcut: '' },
  ];

  const filteredSpotlightOptions = spotlightOptions.filter((item) =>
    item.text.toLowerCase().includes(spotlightInput.toLowerCase())
  );

  const selectSpotlightItem = (item: typeof spotlightOptions[0]) => {
    setSpotlightOpen(false);
    router.push(item.target);
    showToast(`Navigated to ${item.text}`, 'success');
  };

  // Public, unauthenticated share pages render standalone — no login gate,
  // no app shell/sidebar, no mount-loading spinner.
  if (isPublicSharePage) {
    return <>{children}</>;
  }

  // Forwarding a Supabase auth-hash link to /reset-password — show nothing
  // so the login page doesn't flash.
  if (authHashRedirecting) {
    return <div style={{ minHeight: '100vh', background: 'var(--bg-app)' }} />;
  }

  if (!hasMounted) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-app)', color: 'var(--label-primary)', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid var(--blue)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 16px' }}></div>
          <p style={{ fontSize: '14px', color: 'var(--label-secondary)' }}>Loading Growth OS...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        business,
        setBusiness,
        businesses: BUSINESSES,
        theme,
        setTheme,
        dateFilter,
        setDateFilter,
        dateRange,
        setDateRange,
        dateLabel,
        setDateLabel,
        toasts,
        showToast,
        spotlightOpen,
        setSpotlightOpen,
        inspectorOpen,
        setInspectorOpen,
        inspectorType,
        setInspectorType,
        inspectorData,
        setInspectorData,
        inventory,
        setInventory,
        supportCases,
        setSupportCases,
        reviews,
        setReviews,
        receivables,
        setReceivables,
        salonLeads,
        setSalonLeads,
        contentDrafts,
        setContentDrafts,
        whatsappAlerts,
        setWhatsappAlerts
      }}
    >
      <div className="app-container">
        {/* Apple Glass Glows */}
        <div className="ambient-glow bg-glow-1"></div>
        <div className="ambient-glow bg-glow-2"></div>
        <div className="ambient-glow bg-glow-3"></div>

        {/* Global Toast Alerts */}
        <div
          id="toast-container"
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            zIndex: 99999,
          }}
        >
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`toast-notif liquid-card-sm`}
              style={{
                boxShadow: 'var(--glass-shadow)',
                backdropFilter: 'blur(20px)',
                background: 'var(--glass-fill)',
                outline: '1.5px solid var(--glass-border)',
                color: 'var(--label-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 18px',
                borderRadius: '12px',
                animation: 'fadeIn 300ms ease',
              }}
            >
              {t.type === 'success' && <CheckCircle2 size={16} className="status-success-icon" style={{ color: 'var(--green)' }} />}
              {t.type === 'error' && <AlertTriangle size={16} style={{ color: 'var(--red)' }} />}
              {t.type === 'info' && <Info size={16} style={{ color: 'var(--blue)' }} />}
              <span style={{ fontSize: '13px', fontWeight: '500' }}>{t.message}</span>
            </div>
          ))}
        </div>

        {isLoggedIn ? (
          <>
            {mobileSidebarOpen && (
              <div className="mobile-sidebar-overlay" onClick={() => setMobileSidebarOpen(false)}></div>
            )}
            
            {/* macOS Frosted Sidebar Rail */}
            <aside className={`sidebar ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
              {/* Business Switcher — every module's data follows this tab */}
              <div
                className="business-switcher-wrapper"
                style={{
                  display: 'flex',
                  gap: '4px',
                  padding: '10px 12px 0',
                  boxSizing: 'border-box',
                }}
              >
                {BUSINESSES.map((b) => {
                  const active = b.id === business;
                  return (
                    <button
                      key={b.id}
                      onClick={() => setBusiness(b.id)}
                      title={b.domain}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1px',
                        padding: '7px 6px',
                        borderRadius: '10px',
                        border: active ? `1.5px solid ${b.color}` : '1px solid var(--separator)',
                        background: active ? 'var(--fill-tertiary)' : 'transparent',
                        cursor: 'pointer',
                        minWidth: 0,
                      }}
                    >
                      <span style={{ fontSize: '11px', fontWeight: 700, color: active ? b.color : 'var(--label-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                        {b.name}
                      </span>
                      <span style={{ fontSize: '8.5px', color: 'var(--label-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                        {b.domain}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div
                className="sidebar-header workspace-switcher-wrapper"
                style={{
                  padding: '14px 12px',
                  boxSizing: 'border-box',
                  borderBottom: '1px solid var(--separator)',
                }}
              >
                <button
                  onClick={() => setWorkspaceMenuOpen((prev) => !prev)}
                  title={`${activeWorkspace.name} — click to switch workspace`}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px',
                    borderRadius: '12px',
                    border: '1px solid var(--glass-border)',
                    background: workspaceMenuOpen ? 'var(--fill-tertiary)' : 'var(--fill-quaternary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--blue)', color: '#fff' }}>
                    <activeWorkspace.icon size={15} />
                  </div>
                  <div className="sidebar-logo-expanded" style={{ flexDirection: 'column', lineHeight: 1.2, flex: 1, minWidth: 0 }}>
                    <span style={{ fontWeight: '800', fontSize: '13px', color: 'var(--label-primary)', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeWorkspace.name}</span>
                    <span style={{ fontSize: '9.5px', color: 'var(--label-tertiary)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeWorkspace.tagline}</span>
                  </div>
                  <ChevronDown size={14} className="sidebar-logo-expanded" style={{ color: 'var(--label-tertiary)', flexShrink: 0, transform: workspaceMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease' }} />
                </button>
              </div>

              {workspaceMenuOpen && (
                <>
                  <div onClick={() => setWorkspaceMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 1500 }} />
                  <div
                    className="workspace-switcher-menu"
                    style={{
                      position: 'fixed',
                      top: '112px',
                      left: '32px',
                      width: '260px',
                      zIndex: 1501,
                      background: 'var(--bg-layer1)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '14px',
                      boxShadow: '0 16px 40px rgba(0,0,0,0.45)',
                      padding: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      maxHeight: '70vh',
                      overflowY: 'auto',
                    }}
                  >
                    {WORKSPACES.map((ws) => {
                      const WsIcon = ws.icon;
                      const isActive = ws.id === activeWorkspace.id;
                      return (
                        <button
                          key={ws.id}
                          onClick={() => {
                            setWorkspaceMenuOpen(false);
                            router.push(ws.homePath);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '9px 10px',
                            borderRadius: '9px',
                            border: 'none',
                            background: isActive ? 'rgba(0, 122, 255, 0.12)' : 'transparent',
                            cursor: 'pointer',
                            textAlign: 'left',
                            width: '100%',
                          }}
                        >
                          <div style={{ width: '26px', height: '26px', borderRadius: '7px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isActive ? 'var(--blue)' : 'var(--fill-quaternary)', color: isActive ? '#fff' : 'var(--label-secondary)' }}>
                            <WsIcon size={13} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--label-primary)' }}>{ws.name}</div>
                            <div style={{ fontSize: '10.5px', color: 'var(--label-tertiary)' }}>{ws.tagline}</div>
                          </div>
                          {isActive && <Check size={14} style={{ color: 'var(--blue)', flexShrink: 0 }} />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              <nav className="sidebar-nav">
                {activeWorkspace.sections.map((section) => (
                  <React.Fragment key={section.label}>
                    <div className="nav-section-label">{section.label}</div>
                    {section.items.map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                          <div className={`nav-item ${pathname === item.href ? 'active' : ''}`}>
                            <ItemIcon size={16} />
                            <span>{item.label}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </React.Fragment>
                ))}
              </nav>

              <div className="sidebar-footer">
                <div className="theme-switcher">
                  <button
                    className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                    onClick={() => setTheme('light')}
                    title="Light Theme"
                  >
                    <Sun size={14} />
                  </button>
                  <button
                    className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                    onClick={() => setTheme('dark')}
                    title="Dark Theme"
                  >
                    <Moon size={14} />
                  </button>
                </div>

                <div className="user-profile">
                  <div className="avatar">
                    <span>{initialsFromName(currentUser?.name || currentUser?.email || 'User')}</span>
                    <div className="status-indicator online"></div>
                  </div>
                  <div className="user-details">
                    <span className="user-name">{currentUser?.name || currentUser?.email || 'Signed in'}</span>
                    <span className="user-role">{currentUser?.email || 'Operator'}</span>
                  </div>
                  <button
                    className="btn-icon"
                    onClick={() => {
                      setIsLoggedIn(false);
                      setSessionExpiredNotice(false);
                      localStorage.removeItem('loginAt');
                      localStorage.removeItem('authToken');
                      localStorage.removeItem('sessionExpired');
                      fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
                      router.push('/');
                      showToast('Logged out of Growth OS.', 'info');
                    }}
                    title="System Logout"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--label-secondary)' }}
                  >
                    <LogOut size={14} />
                  </button>
                </div>

                <div
                  className="scalepods-footer"
                  style={{
                    textAlign: 'center',
                    fontSize: '9.5px',
                    color: 'var(--label-tertiary)',
                    padding: '12px 0 4px',
                    borderTop: '1px solid var(--separator)',
                    marginTop: '12px',
                    letterSpacing: '0.05em',
                  }}
                >
                  Powered by <span style={{ fontWeight: '700', color: 'var(--blue)' }}>ScalePods</span>
                </div>
              </div>
            </aside>

            {/* Main Workspace */}
            <div className="main-workspace">
              <header className="app-header">
                <div className="header-left">
                  <button
                    className="menu-toggle-btn"
                    onClick={() => setMobileSidebarOpen((prev) => !prev)}
                    title="Toggle Navigation"
                    style={{ background: 'transparent', border: 'none', color: 'var(--label-primary)', cursor: 'pointer' }}
                  >
                    <Menu size={18} />
                  </button>
                  <div className="navigation-controls" style={{ display: 'flex', gap: '6px' }}>
                    <button className="nav-ctrl-btn" onClick={goBack} title="Back" style={{ border: 'none', background: 'transparent', color: 'var(--label-secondary)' }}><ChevronLeft size={16} /></button>
                    <button className="nav-ctrl-btn" onClick={goForward} title="Forward" style={{ border: 'none', background: 'transparent', color: 'var(--label-secondary)' }}><ChevronRight size={16} /></button>
                  </div>
                  <div className="breadcrumb" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span className="breadcrumb-parent">{activeWorkspace.name}</span>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-active" style={{ textTransform: 'capitalize', fontWeight: '600' }}>
                      {(() => {
                        const currentItem = activeWorkspace.sections
                          .flatMap((s) => s.items)
                          .find((i) => i.href === pathname);
                        if (currentItem) return currentItem.label;
                        if (pathname === '/') return 'Dashboard';
                        const lastSegment = pathname?.split('/').filter(Boolean).pop() ?? 'Dashboard';
                        return lastSegment.replace(/-/g, ' ');
                      })()}
                    </span>
                  </div>
                </div>

                <div className="header-center">
                  <div
                    className="search-spotlight-trigger"
                    onClick={() => setSpotlightOpen(true)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Search size={14} />
                    <span>Search modules... (⌘K)</span>
                  </div>
                </div>

                <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <DateRangePicker
                    value={dateRange}
                    label={dateLabel}
                    onUpdate={({ range, label }) => {
                      setDateRange(range);
                      setDateLabel(label);
                    }}
                  />
                </div>
              </header>

              <main className="content-body" style={{ position: 'relative', overflowY: 'auto' }}>
                {children}
              </main>
            </div>
          </>
        ) : (
          /* Premium B2B SaaS Landing Page — light theme */
          <div className="landing-container" style={{ width: '100vw', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-app)', overflowY: 'auto', position: 'relative' }}>
            {/* Curated Aesthetic Glowing Orbs */}
            <div className="landing-glow-1" style={{ position: 'absolute', top: '10%', left: '5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0, 122, 255, 0.10) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }}></div>
            <div className="landing-glow-2" style={{ position: 'absolute', bottom: '20%', right: '5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(175, 82, 222, 0.10) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }}></div>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255, 45, 85, 0.06) 0%, transparent 70%)', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0 }}></div>

            {/* Navigation Header */}
            <header className="landing-navbar" style={{ position: 'sticky', left: 0, transform: 'none', width: '100%', borderBottom: '1px solid var(--separator)', background: 'var(--glass-fill)', backdropFilter: 'blur(20px)', zIndex: 10 }}>
              <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px' }}>
                <div className="landing-nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <BrandLockup logoHeight={28} fontSize={13} gap={10} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }} className="landing-nav-links-desktop">
                    <span style={{ fontSize: '13px', color: 'var(--label-secondary)', cursor: 'default' }}>Bombay Helios • IC Organic Store</span>
                  </div>
                  <a
                    href="#login"
                    style={{ cursor: 'pointer', background: 'linear-gradient(135deg, var(--blue), var(--purple))', padding: '8px 20px', borderRadius: '20px', border: 'none', color: '#fff', fontSize: '13px', fontWeight: '600', transition: 'all 200ms ease', boxShadow: '0 4px 12px rgba(0, 122, 255, 0.2)', textDecoration: 'none' }}
                  >
                    Sign In
                  </a>
                </div>
              </div>
            </header>

            {/* Split Grid Body */}
            <main style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '60px 24px', position: 'relative', zIndex: 1, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '60px' }}>
              
              <div className="landing-hero-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '60px', alignItems: 'center', flexWrap: 'wrap' }}>
                
                {/* Left Side Info Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0, 122, 255, 0.1)', border: '1px solid rgba(0, 122, 255, 0.2)', padding: '6px 16px', borderRadius: '30px', width: 'fit-content' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--blue)', display: 'inline-block', animation: 'pulse 1.5s infinite' }}></span>
                    <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--blue)' }}>COMMAND CENTER v1.2 ACTIVE • Powered by ScalePods</span>
                  </div>

                  <h1 style={{ fontSize: '42px', fontWeight: '800', lineHeight: '1.15', letterSpacing: '-0.03em', color: 'var(--label-primary)', margin: 0 }}>
                    The Intelligent OS for <br />
                    <span style={{ background: 'linear-gradient(135deg, var(--label-primary) 20%, var(--purple) 80%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Bombay Helios &amp; IC Organic Store</span>
                  </h1>

                  <p style={{ fontSize: '16px', color: 'var(--label-secondary)', lineHeight: '1.6', margin: 0 }}>
                    Unify warehouse logs, automate post-delivery review solicitation, orchestrate accounts receivable recoveries, and scale wholesale sales for both Bombay Helios and IC Organic Store from one command board.
                  </p>

                  {/* Core Value Props List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ background: 'rgba(52, 199, 89, 0.1)', color: 'var(--green)', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle2 size={16} /></div>
                      <div>
                        <strong style={{ display: 'block', fontSize: '13.5px', color: 'var(--label-primary)' }}>Automated Review Interception</strong>
                        <span style={{ fontSize: '12px', color: 'var(--label-secondary)' }}>Filters Day 3 check-in ratings; intercepts 1-3★ issues into private support tickets.</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ background: 'rgba(0, 122, 255, 0.1)', color: 'var(--blue)', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={16} /></div>
                      <div>
                        <strong style={{ display: 'block', fontSize: '13.5px', color: 'var(--label-primary)' }}>Multi-Channel Stock Forecasting</strong>
                        <span style={{ fontSize: '12px', color: 'var(--label-secondary)' }}>Calculates safety thresholds and restock dates incorporating supplier transit lead times.</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ background: 'rgba(175, 82, 222, 0.1)', color: 'var(--purple)', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><DollarSign size={16} /></div>
                      <div>
                        <strong style={{ display: 'block', fontSize: '13.5px', color: 'var(--label-primary)' }}>21-Day AI Receivables Recovery</strong>
                        <span style={{ fontSize: '12px', color: 'var(--label-secondary)' }}>Dials automated SMS, emails, and voice call dialers to recover retail accounts receivable.</span>
                      </div>
                    </div>
                  </div>

                  {/* Business / Platform Ribbons */}
                  <div style={{ marginTop: '20px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--label-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '12px' }}>CONNECTED BUSINESSES &amp; PLATFORMS</span>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11.5px', padding: '6px 12px', borderRadius: '20px', background: 'rgba(175, 82, 222, 0.1)', border: '1px solid rgba(175, 82, 222, 0.25)', color: 'var(--purple)', fontWeight: '600' }}>Bombay Helios</span>
                      <span style={{ fontSize: '11.5px', padding: '6px 12px', borderRadius: '20px', background: 'rgba(52, 199, 89, 0.1)', border: '1px solid rgba(52, 199, 89, 0.25)', color: 'var(--green)', fontWeight: '600' }}>IC Organic Store</span>
                      <span style={{ fontSize: '11.5px', padding: '6px 12px', borderRadius: '20px', background: 'rgba(150, 191, 72, 0.1)', border: '1px solid rgba(150, 191, 72, 0.2)', color: '#5a7a1f', fontWeight: '600' }}>Shopify</span>
                      <span style={{ fontSize: '11.5px', padding: '6px 12px', borderRadius: '20px', background: 'rgba(255, 153, 0, 0.1)', border: '1px solid rgba(255, 153, 0, 0.2)', color: '#b36b00', fontWeight: '600' }}>Amazon</span>
                      <span style={{ fontSize: '11.5px', padding: '6px 12px', borderRadius: '20px', background: 'rgba(250, 180, 5, 0.15)', border: '1px solid rgba(200, 150, 5, 0.3)', color: '#8a6c00', fontWeight: '600' }}>Blinkit</span>
                    </div>
                  </div>
                </div>

                {/* Right Side Glassmorphic Login Console */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '400px',
                      background: 'var(--glass-fill)',
                      backdropFilter: 'blur(30px) saturate(180%)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '24px',
                      padding: '32px',
                      boxShadow: 'var(--glass-shadow)'
                    }}
                  >
                    {/* Header profile */}
                    <div id="login" style={{ textAlign: 'center', marginBottom: '24px', scrollMarginTop: '90px' }}>
                      <div style={{ padding: '14px 18px', borderRadius: '20px', background: 'var(--fill-quaternary)', border: '1.5px solid var(--glass-border)', margin: '0 auto 16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
                        <BrandLockup logoHeight={32} fontSize={14} gap={12} />
                      </div>
                      <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--label-primary)', margin: 0 }}>Sign In</h2>
                      <p style={{ fontSize: '12.5px', color: 'var(--label-secondary)', marginTop: '6px', lineHeight: '1.4' }}>
                        Enter your Growth OS credentials.
                      </p>
                      <div style={{ marginTop: '12px', padding: '8px 12px', borderRadius: '10px', background: 'var(--fill-quaternary)', border: '1px solid var(--separator)', display: 'inline-block' }}>
                        <span style={{ fontSize: '11px', color: 'var(--label-secondary)' }}>
                          Demo access: <strong style={{ color: 'var(--label-primary)' }}>info@scalepods.co</strong> / <strong style={{ color: 'var(--label-primary)' }}>ScalePods@123</strong>
                        </span>
                      </div>
                    </div>

                    {sessionExpiredNotice && (
                      <div
                        style={{
                          background: 'rgba(255, 149, 0, 0.12)',
                          border: '1px solid rgba(255, 149, 0, 0.3)',
                          borderRadius: '12px',
                          padding: '10px 14px',
                          marginBottom: '16px',
                          fontSize: '12px',
                          color: 'var(--orange, #ff9500)',
                          textAlign: 'center',
                        }}
                      >
                        Your session expired after 30 minutes. Please sign in again.
                      </div>
                    )}

                    {/* Form Console */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!loginBusy) doLogin();
                      }}
                      style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                    >
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--label-secondary)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
                        <input
                          type="email"
                          autoComplete="username"
                          placeholder="you@company.com"
                          value={loginEmail}
                          onChange={(e) => { setLoginEmail(e.target.value); setLoginError(null); }}
                          style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--separator)', outline: 'none', fontSize: '13.5px', background: 'var(--bg-layer1)', color: 'var(--label-primary)', transition: 'border-color 200ms ease' }}
                          required
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--label-secondary)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
                        <input
                          type="password"
                          autoComplete="current-password"
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => { setLoginPassword(e.target.value); setLoginError(null); }}
                          style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--separator)', outline: 'none', fontSize: '13.5px', background: 'var(--bg-layer1)', color: 'var(--label-primary)', transition: 'border-color 200ms ease' }}
                          required
                        />
                      </div>

                      {loginError && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 59, 48, 0.1)', border: '1px solid rgba(255, 59, 48, 0.25)', padding: '10px 12px', borderRadius: '10px' }}>
                          <AlertTriangle size={14} style={{ color: 'var(--red)', flexShrink: 0 }} />
                          <span style={{ fontSize: '11.5px', color: 'var(--red)', lineHeight: '1.3' }}>{loginError}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loginBusy}
                        style={{ padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, var(--blue), var(--purple))', color: 'white', fontWeight: '700', cursor: loginBusy ? 'wait' : 'pointer', fontSize: '14px', marginTop: '4px', boxShadow: '0 4px 15px rgba(0, 122, 255, 0.3)', transition: 'all 200ms ease', opacity: loginBusy ? 0.7 : 1 }}
                      >
                        {loginBusy ? 'Signing in…' : 'Sign In'}
                      </button>

                      {!forgotOpen ? (
                        <button
                          type="button"
                          onClick={() => { setForgotOpen(true); setForgotEmail(loginEmail); }}
                          style={{ background: 'none', border: 'none', textAlign: 'center', fontSize: '12px', color: 'var(--blue)', cursor: 'pointer', marginTop: '2px' }}
                        >
                          Forgot password?
                        </button>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px', padding: '12px', borderRadius: '12px', background: 'var(--fill-quaternary)', border: '1px solid var(--separator)' }}>
                          <span style={{ fontSize: '11px', color: 'var(--label-secondary)', fontWeight: 600 }}>
                            We&apos;ll email you a link to set a new password.
                          </span>
                          <input
                            type="email"
                            placeholder="Account email"
                            value={forgotEmail}
                            onChange={(e) => { setForgotEmail(e.target.value); setForgotError(null); setForgotMsg(null); }}
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--separator)', outline: 'none', fontSize: '13px', background: 'var(--bg-layer1)', color: 'var(--label-primary)' }}
                          />
                          {forgotError && (
                            <span style={{ fontSize: '11px', color: 'var(--red)' }}>{forgotError}</span>
                          )}
                          {forgotMsg && (
                            <span style={{ fontSize: '11px', color: 'var(--green)' }}>{forgotMsg}</span>
                          )}
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={sendResetLink}
                              disabled={forgotBusy}
                              style={{ flex: 1, padding: '9px', borderRadius: '10px', border: 'none', background: 'var(--blue)', color: '#fff', fontWeight: 700, fontSize: '12.5px', cursor: forgotBusy ? 'wait' : 'pointer', opacity: forgotBusy ? 0.7 : 1 }}
                            >
                              {forgotBusy ? 'Sending…' : 'Send reset link'}
                            </button>
                            <button
                              type="button"
                              onClick={() => { setForgotOpen(false); setForgotError(null); setForgotMsg(null); }}
                              style={{ padding: '9px 12px', borderRadius: '10px', border: '1px solid var(--separator)', background: 'transparent', color: 'var(--label-secondary)', fontSize: '12.5px', cursor: 'pointer' }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </form>

                    <div style={{ textAlign: 'center', fontSize: '10.5px', color: 'var(--label-tertiary)', marginTop: '16px' }}>
                      Secured Gateway • Powered by <span style={{ color: 'var(--blue)', fontWeight: '600' }}>ScalePods</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Redesigned Features / Module Board Grid */}
              <div style={{ marginTop: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>OS MODULE ARCHITECTURE</span>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--label-primary)', marginTop: '6px' }}>Enterprise Sub-systems & Core Engines</h2>
                </div>

                <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                  {/* Module 1 */}
                  <div style={{ background: 'var(--bg-layer1)', border: '1px solid var(--separator)', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ background: 'rgba(0, 122, 255, 0.1)', color: 'var(--blue)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={18} /></div>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--label-primary)', margin: 0 }}>Inventory Intelligence & Forecasting</h3>
                    <p style={{ fontSize: '12.5px', color: 'var(--label-secondary)', lineHeight: '1.4', margin: 0 }}>Predict stockout dates, monitor multi-channel logs (warehouse, quick-commerce), and optimize purchase orders based on lead-time variables — for both Bombay Helios and IC Organic Store.</p>
                  </div>
                  {/* Module 2 */}
                  <div style={{ background: 'var(--bg-layer1)', border: '1px solid var(--separator)', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ background: 'rgba(52, 199, 89, 0.1)', color: 'var(--green)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bot size={18} /></div>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--label-primary)', margin: 0 }}>Customer Care & Review Engine</h3>
                    <p style={{ fontSize: '12.5px', color: 'var(--label-secondary)', lineHeight: '1.4', margin: 0 }}>Track post-purchase journeys, intercept low ratings privately, and auto-route 5-star reviews to public marketplaces (Amazon, Google).</p>
                  </div>
                  {/* Module 3 */}
                  <div style={{ background: 'var(--bg-layer1)', border: '1px solid var(--separator)', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ background: 'rgba(175, 82, 222, 0.1)', color: 'var(--purple)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><DollarSign size={18} /></div>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--label-primary)', margin: 0 }}>Accounts Receivable Recovery</h3>
                    <p style={{ fontSize: '12.5px', color: 'var(--label-secondary)', lineHeight: '1.4', margin: 0 }}>Monitor outstanding ageing buckets, track structured 21-day timeline reminders, and dispatch voice calls, emails, and SMS alerts.</p>
                  </div>
                  {/* Module 4 */}
                  <div style={{ background: 'var(--bg-layer1)', border: '1px solid var(--separator)', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ background: 'rgba(255, 149, 0, 0.1)', color: 'var(--orange)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={18} /></div>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--label-primary)', margin: 0 }}>B2B Sales Engine</h3>
                    <p style={{ fontSize: '12.5px', color: 'var(--label-secondary)', lineHeight: '1.4', margin: 0 }}>Scrape wholesale leads off Google Maps for either business, organize active pipeline stages, and send template outreach campaigns.</p>
                  </div>
                  {/* Module 5 */}
                  <div style={{ background: 'var(--bg-layer1)', border: '1px solid var(--separator)', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ background: 'rgba(255, 45, 85, 0.1)', color: 'var(--pink)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sparkles size={18} /></div>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--label-primary)', margin: 0 }}>Marketing Content OS</h3>
                    <p style={{ fontSize: '12.5px', color: 'var(--label-secondary)', lineHeight: '1.4', margin: 0 }}>Plan calendar schedules, generate UGC ad scripts, and manage Maker-Checker content review pipelines from one station.</p>
                  </div>
                  {/* Core Platform integration */}
                  <div style={{ background: 'var(--bg-layer1)', border: '1px solid var(--separator)', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ background: 'rgba(90, 200, 250, 0.1)', color: 'var(--teal)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Activity size={18} /></div>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--label-primary)', margin: 0 }}>Real-Time Live API Sync</h3>
                    <p style={{ fontSize: '12.5px', color: 'var(--label-secondary)', lineHeight: '1.4', margin: 0 }}>Continuously syncs data streams across POS endpoints, dark store locations, and multi-channel marketing campaigns.</p>
                  </div>
                </div>
              </div>

            </main>

            {/* Footer Credits */}
            <footer style={{ borderTop: '1px solid var(--separator)', padding: '30px 24px', marginTop: 'auto', background: 'var(--bg-layer1)' }}>
              <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', fontSize: '12.5px', color: 'var(--label-tertiary)' }}>
                <span>© 2026 Bombay Helios &amp; IC Organic Store. All Rights Reserved.</span>
                <span>Powered by <span style={{ fontWeight: '700', color: 'var(--blue)' }}>ScalePods</span> Growth Framework</span>
              </div>
            </footer>
          </div>
        )}

        {/* Global Search Spotlight Modal */}
        {spotlightOpen && (
          <div className="spotlight-overlay" style={{ display: 'flex' }} onClick={() => setSpotlightOpen(false)}>
            <div className="spotlight-panel" onClick={(e) => e.stopPropagation()}>
              <div className="spotlight-header">
                <Search size={18} />
                <input
                  type="text"
                  className="spotlight-input"
                  value={spotlightInput}
                  onChange={(e) => setSpotlightInput(e.target.value)}
                  placeholder="Type navigations (e.g. inventory, care, leads)..."
                  autoFocus
                />
              </div>
              <div className="spotlight-results">
                {filteredSpotlightOptions.length === 0 ? (
                  <div style={{ padding: '16px', fontSize: '13px', color: 'var(--label-tertiary)' }}>No matching modules found.</div>
                ) : (
                  filteredSpotlightOptions.map((item, index) => (
                    <div
                      key={index}
                      className={`spotlight-item ${index === spotlightSelectedIndex ? 'selected' : ''}`}
                      onClick={() => selectSpotlightItem(item)}
                    >
                      <div className="spotlight-item-left">
                        <LayoutDashboard size={14} />
                        <span>{item.text}</span>
                      </div>
                      <span className="spotlight-shortcut">{item.shortcut}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="spotlight-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Use <kbd>ESC</kbd> to close, <kbd>Click</kbd> to select option</span>
                <span style={{ fontSize: '9.5px', color: 'var(--label-tertiary)' }}>Powered by <span style={{ color: 'var(--blue)', fontWeight: '700' }}>ScalePods</span></span>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppContext.Provider>
  );
}
