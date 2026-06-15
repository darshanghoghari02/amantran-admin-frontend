import { API_URL } from '@/config';
import React, { useState, useEffect } from 'react';
import {
  Users as UsersIcon,
  Palette,
  FolderHeart,
  Sparkles,
  Download,
  PlusCircle,
  ChevronRight,
  Calendar,
  FileText,
  ChevronDown,
  TrendingUp,
  Coins,
  Percent,
  CreditCard,
  ArrowUpRight,
  Activity
} from 'lucide-react';
import { cmsCache } from '@/config/cache';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

const MOCK_STATS_FALLBACK = {
  counters: {
    totalUsers: 18,
    totalTemplates: 4,
    totalCategories: 4,
    premiumTemplates: 2,
    totalInvitations: 45,
    totalDrafts: 12
  },
  recentActivities: [
    { id: '1', action: 'New Template "Royal Wedding" created', user: 'Vicky Patel', time: '2 hours ago' },
    { id: '2', action: 'User registered: ramesh.patel@gmail.com', user: 'System', time: '5 hours ago' },
    { id: '3', action: 'Font "Hind Vadodara" updated', user: 'Sneha Sharma', time: '1 day ago' }
  ],
  topTemplates: [
    { id: '1', name: 'Royal Wedding Cover', isPremium: true, downloads: 340 },
    { id: '2', name: 'Elegant Floral Invitation', isPremium: false, downloads: 210 }
  ]
};

const MOCK_CHARTS_FALLBACK = {
  userGrowthTrend: [
    { month: 'Jan', users: 120 },
    { month: 'Feb', users: 240 },
    { month: 'Mar', users: 380 },
    { month: 'Apr', users: 510 },
    { month: 'May', users: 720 },
    { month: 'Jun', users: 950 }
  ],
  categoryDistribution: [
    { name: 'Wedding', count: 8 },
    { name: 'Engagement', count: 4 },
    { name: 'Baby Shower', count: 3 },
    { name: 'Reception', count: 5 }
  ]
};

const MOCK_REVENUE_FALLBACK = {
  totalRevenue: 24500,
  subscriptionRevenue: 18500,
  purchaseRevenue: 6000,
  totalTransactions: 42,
  successfulTransactions: 38,
  monthlySubscriptions: 15,
  yearlySubscriptions: 4,
  singlePurchases: 19
};

const MOCK_SUB_SUMMARY_FALLBACK = {
  totalSubscribers: 19,
  activeTrials: 5,
  monthlyRevenue: 1500,
  churnRate: 5.2,
  growthTrend: [
    { month: "Jan '26", subscribers: 8 },
    { month: "Feb '26", subscribers: 11 },
    { month: "Mar '26", subscribers: 14 },
    { month: "Apr '26", subscribers: 16 },
    { month: "May '26", subscribers: 18 },
    { month: "Jun '26", subscribers: 19 }
  ]
};

const MOCK_RECENT_TX_FALLBACK = [
  { id: 'tx_1', userId: 'usr_1', userEmail: 'rahul.sharma@gmail.com', type: 'subscription', amount: 99, planId: 'monthly', status: 'success', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 'tx_2', userId: 'usr_2', userEmail: 'priya.patel@yahoo.com', type: 'single_purchase', amount: 250, templateName: 'Royal Palace Invitation', status: 'success', timestamp: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: 'tx_3', userId: 'usr_3', userEmail: 'amit.verma@outlook.com', type: 'subscription', amount: 999, planId: 'yearly', status: 'success', timestamp: new Date(Date.now() - 86400000).toISOString() },
  { id: 'tx_4', userId: 'usr_4', userEmail: 'sneha.reddy@gmail.com', type: 'subscription', amount: 99, planId: 'monthly', status: 'failed', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 'tx_5', userId: 'usr_5', userEmail: 'karan.johari@gmail.com', type: 'single_purchase', amount: 150, templateName: 'Classic Marigold design', status: 'success', timestamp: new Date(Date.now() - 86400000 * 3).toISOString() }
];

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState<any>(cmsCache.dashboard?.stats || null);
  const [charts, setCharts] = useState<any>(cmsCache.dashboard?.charts || null);
  const [subSummary, setSubSummary] = useState<any>(cmsCache.dashboard?.subSummary || null);
  const [txSummary, setTxSummary] = useState<any>(cmsCache.dashboard?.txSummary || null);
  const [txList, setTxList] = useState<any[]>(cmsCache.dashboard?.txList || null);
  const [loading, setLoading] = useState(!cmsCache.dashboard || !cmsCache.dashboard.subSummary);

  const [fetchingGrowth, setFetchingGrowth] = useState(false);
  const [fetchingDistribution, setFetchingDistribution] = useState(false);
  const [fetchingSubGrowth, setFetchingSubGrowth] = useState(false);

  const [activeTab, setActiveTab] = useState<'general' | 'revenue'>('general');

  // Dynamic filter states
  const [userGrowthRange, setUserGrowthRange] = useState('6m');
  const [userGrowthStart, setUserGrowthStart] = useState('');
  const [userGrowthEnd, setUserGrowthEnd] = useState('');

  const [distributionRange, setDistributionRange] = useState('this_month');
  const [distributionStart, setDistributionStart] = useState('');
  const [distributionEnd, setDistributionEnd] = useState('');

  const [subGrowthRange, setSubGrowthRange] = useState('6m');
  const [subGrowthStart, setSubGrowthStart] = useState('');
  const [subGrowthEnd, setSubGrowthEnd] = useState('');

  // Keep track of previous values to identify what changed
  const prevGrowthRange = React.useRef(userGrowthRange);
  const prevGrowthStart = React.useRef(userGrowthStart);
  const prevGrowthEnd = React.useRef(userGrowthEnd);

  const prevDistRange = React.useRef(distributionRange);
  const prevDistStart = React.useRef(distributionStart);
  const prevDistEnd = React.useRef(distributionEnd);

  const prevSubGrowthRange = React.useRef(subGrowthRange);
  const prevSubGrowthStart = React.useRef(subGrowthStart);
  const prevSubGrowthEnd = React.useRef(subGrowthEnd);

  useEffect(() => {
    // Check if parameters changed from previous render
    const growthChanged =
      prevGrowthRange.current !== userGrowthRange ||
      prevGrowthStart.current !== userGrowthStart ||
      prevGrowthEnd.current !== userGrowthEnd;

    const distChanged =
      prevDistRange.current !== distributionRange ||
      prevDistStart.current !== distributionStart ||
      prevDistEnd.current !== distributionEnd;

    const subGrowthChanged =
      prevSubGrowthRange.current !== subGrowthRange ||
      prevSubGrowthStart.current !== subGrowthStart ||
      prevSubGrowthEnd.current !== subGrowthEnd;

    // Update refs to current values immediately
    prevGrowthRange.current = userGrowthRange;
    prevGrowthStart.current = userGrowthStart;
    prevGrowthEnd.current = userGrowthEnd;
    prevDistRange.current = distributionRange;
    prevDistStart.current = distributionStart;
    prevDistEnd.current = distributionEnd;
    prevSubGrowthRange.current = subGrowthRange;
    prevSubGrowthStart.current = subGrowthStart;
    prevSubGrowthEnd.current = subGrowthEnd;

    async function fetchDashboardData(silent = false) {
      if (!silent && (!cmsCache.dashboard || !cmsCache.dashboard.subSummary)) setLoading(true);

      // If a specific chart filter changed, show local loader
      if (growthChanged) setFetchingGrowth(true);
      if (distChanged) setFetchingDistribution(true);
      if (subGrowthChanged) setFetchingSubGrowth(true);

      try {
        const growthParams = new URLSearchParams({
          userGrowthRange,
          userGrowthStart,
          userGrowthEnd
        }).toString();

        const distParams = new URLSearchParams({
          distributionRange,
          distributionStart,
          distributionEnd
        }).toString();

        const subParams = new URLSearchParams({
          subGrowthRange,
          subGrowthStart,
          subGrowthEnd
        }).toString();

        const [resSummary, resCharts, resSubSummary, resTxSummary, resTxList] = await Promise.all([
          fetch(`${API_URL}/api/analytics/summary`).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch(`${API_URL}/api/analytics/charts?${growthParams}&${distParams}`).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch(`${API_URL}/api/analytics/subscription-summary?${subParams}`).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch(`${API_URL}/api/transactions/stats/summary`).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch(`${API_URL}/api/transactions`).then(r => r.ok ? r.json() : null).catch(() => null),
        ]);

        const statsData = resSummary || MOCK_STATS_FALLBACK;
        const chartsData = resCharts || MOCK_CHARTS_FALLBACK;
        const subSumData = resSubSummary || MOCK_SUB_SUMMARY_FALLBACK;
        const txSumData = resTxSummary || MOCK_REVENUE_FALLBACK;
        const txListData = resTxList || MOCK_RECENT_TX_FALLBACK;

        setStats(statsData);
        setCharts(chartsData);
        setSubSummary(subSumData);
        setTxSummary(txSumData);
        setTxList(txListData);

        cmsCache.dashboard = { 
          stats: statsData, 
          charts: chartsData,
          subSummary: subSumData,
          txSummary: txSumData,
          txList: txListData
        };
      } catch (error) {
        console.error('Failed to load dashboard analytics, using offline fallback:', error);
        if (!cmsCache.dashboard || !cmsCache.dashboard.subSummary) {
          setStats(MOCK_STATS_FALLBACK);
          setCharts(MOCK_CHARTS_FALLBACK);
          setSubSummary(MOCK_SUB_SUMMARY_FALLBACK);
          setTxSummary(MOCK_REVENUE_FALLBACK);
          setTxList(MOCK_RECENT_TX_FALLBACK);
        }
      } finally {
        setLoading(false);
        setFetchingGrowth(false);
        setFetchingDistribution(false);
        setFetchingSubGrowth(false);
      }
    }
    fetchDashboardData(cmsCache.dashboard && cmsCache.dashboard.subSummary ? true : false);

    // Set up polling interval to keep dashboard statistics in sync in real-time (every 5 seconds)
    const intervalId = setInterval(() => {
      fetchDashboardData(true);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [
    userGrowthRange, userGrowthStart, userGrowthEnd, 
    distributionRange, distributionStart, distributionEnd,
    subGrowthRange, subGrowthStart, subGrowthEnd
  ]);

  if (loading || !stats || !subSummary || !txSummary || !txList) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-12 h-12 border-4 border-wedding-pink-medium border-t-wedding-pink-dark rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-wedding-pink-dark">Assembling your wedding dashboard...</p>
      </div>
    );
  }

  const counters = stats?.counters || { totalUsers: 0, totalTemplates: 0, totalCategories: 0, premiumTemplates: 0, totalInvitations: 0, totalDrafts: 0 };
  const recentActivities = stats?.recentActivities || [];
  const topTemplates = stats?.topTemplates || [];

  const userGrowth = charts?.userGrowthTrend || [];
  const rawMaxUsers = userGrowth.length > 0 ? Math.max(...userGrowth.map((pt: any) => pt.users), 1) : 1;
  const maxUsersY = rawMaxUsers <= 6 ? 6 : Math.ceil(rawMaxUsers / 6) * 6;
  const userScale = 120 / maxUsersY;

  const catDistribution = charts?.categoryDistribution || [];
  const rawMaxCat = catDistribution.length > 0 ? Math.max(...catDistribution.map((pt: any) => pt.count), 1) : 1;
  const maxCatY = rawMaxCat <= 8 ? 8 : Math.ceil(rawMaxCat / 4) * 4;
  const catScale = 110 / maxCatY;

  const cardData = [
    { name: 'Total Users', value: counters.totalUsers, icon: UsersIcon, bg: 'bg-wedding-card', border: 'border-wedding-pink-medium/30 shadow-wedding-pink-light/50', text: 'text-wedding-pink-dark', iconBg: 'bg-wedding-pink-light text-wedding-pink-dark border border-wedding-pink-medium/30' },
    { name: 'Total Templates', value: counters.totalTemplates, icon: Palette, bg: 'bg-wedding-card', border: 'border-wedding-gold-accent/30 shadow-wedding-gold-light/40', text: 'text-wedding-gold-dark', iconBg: 'bg-wedding-gold-light text-wedding-gold-dark border border-wedding-gold-accent/30' },
    { name: 'Active Categories', value: counters.totalCategories, icon: FolderHeart, bg: 'bg-wedding-card', border: 'border-green-500/20 shadow-green-50/40', text: 'text-green-600', iconBg: 'bg-green-50 text-green-600 border border-green-200' },
    { name: 'Premium Invitations', value: counters.premiumTemplates, icon: Sparkles, bg: 'bg-wedding-card', border: 'border-purple-500/20 shadow-purple-50/40', text: 'text-purple-600', iconBg: 'bg-purple-50 text-purple-600 border border-purple-200' },
    { name: 'Total Invitations Created', value: counters.totalInvitations, icon: Download, bg: 'bg-wedding-card', border: 'border-blue-500/20 shadow-blue-50/40', text: 'text-blue-600', iconBg: 'bg-blue-50 text-blue-600 border border-blue-200' },
    { name: 'User Drafts', value: counters.totalDrafts, icon: FileText, bg: 'bg-wedding-card', border: 'border-amber-500/20 shadow-amber-50/40', text: 'text-amber-600', iconBg: 'bg-amber-50 text-amber-600 border border-amber-200' },
  ];

  // Revenue overview states
  const activePaidSubscribers = Math.max(0, subSummary.totalSubscribers - subSummary.activeTrials);
  const revenueCardData = [
    { name: 'Total Revenue', value: `₹${txSummary.totalRevenue || 0}`, icon: Coins, bg: 'bg-wedding-card', border: 'border-emerald-500/20 shadow-emerald-50/50', text: 'text-emerald-600', iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200' },
    { name: 'Monthly Revenue', value: `₹${subSummary.monthlyRevenue || 0}`, icon: TrendingUp, bg: 'bg-wedding-card', border: 'border-blue-500/20 shadow-blue-50/50', text: 'text-blue-600', iconBg: 'bg-blue-50 text-blue-600 border border-blue-200' },
    { name: 'Paid Subscribers', value: activePaidSubscribers, icon: UsersIcon, bg: 'bg-wedding-card', border: 'border-wedding-pink-medium/30 shadow-wedding-pink-light/50', text: 'text-wedding-pink-dark', iconBg: 'bg-wedding-pink-light text-wedding-pink-dark border border-wedding-pink-medium/30' },
    { name: 'Active Trials', value: subSummary.activeTrials || 0, icon: Sparkles, bg: 'bg-wedding-card', border: 'border-purple-500/20 shadow-purple-50/50', text: 'text-purple-600', iconBg: 'bg-purple-50 text-purple-600 border border-purple-200' },
    { name: 'Churn Rate', value: `${subSummary.churnRate || 0.0}%`, icon: Percent, bg: 'bg-wedding-card', border: 'border-red-500/20 shadow-red-50/50', text: 'text-red-600', iconBg: 'bg-red-50 text-red-600 border border-red-200' }
  ];

  const trend = subSummary.growthTrend || [];
  const rawMaxSubs = trend.length > 0 ? Math.max(...trend.map((pt: any) => pt.subscribers), 1) : 1;
  const maxSubsY = rawMaxSubs <= 6 ? 6 : Math.ceil(rawMaxSubs / 6) * 6;
  const subScale = 120 / maxSubsY;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-wedding-charcoal-dark to-[#2c1215] p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 border border-wedding-pink-dark/20">
        <div className="z-10 space-y-2 max-w-xl w-full">
          <span className="px-3 py-1 bg-wedding-pink-dark/25 border border-wedding-pink-dark/30 text-wedding-pink-light text-[10px] sm:text-xs font-semibold uppercase tracking-wider rounded-full inline-block">
            CMS Center
          </span>
          <h3 className="text-lg sm:text-xl lg:text-2xl font-black tracking-tight mt-2">Welcome Back, Super Admin! 👏</h3>
          <p className="text-gray-300 text-xs sm:text-sm leading-relaxed font-medium">
            Manage your categories, custom fonts, invitation layouts, and canvas vectors. Monitor user invites and template downloads effortlessly.
          </p>
        </div>
        <div className="z-10 flex gap-4 w-full sm:w-auto">
          <button
            onClick={() => onNavigate('templates')}
            className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-wedding-gold-accent hover:bg-wedding-gold-dark text-wedding-charcoal-dark text-xs sm:text-sm font-black rounded-xl sm:rounded-2xl shadow-lg shadow-wedding-gold-accent/20 transition-all duration-300 transform hover:-translate-y-0.5 w-full sm:w-auto"
          >
            <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 text-wedding-charcoal-dark shrink-0" />
            Add Template
          </button>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-12 hidden sm:block">
          <Palette className="w-64 h-64 sm:w-96 sm:h-96 text-wedding-gold-accent" />
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 p-1 bg-[#FFF5F6]/45 border border-[#FFCAD2]/40 rounded-xl sm:rounded-2xl w-fit shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-300 whitespace-nowrap ${
            activeTab === 'general'
              ? 'bg-wedding-charcoal-dark text-wedding-gold-light shadow-md'
              : 'text-gray-500 hover:text-wedding-charcoal-dark hover:bg-white/50'
          }`}
        >
          <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span className="hidden sm:inline">General Overview</span>
          <span className="sm:hidden">General</span>
        </button>
        <button
          onClick={() => setActiveTab('revenue')}
          className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-300 whitespace-nowrap ${
            activeTab === 'revenue'
              ? 'bg-wedding-charcoal-dark text-wedding-gold-light shadow-md'
              : 'text-gray-500 hover:text-wedding-charcoal-dark hover:bg-white/50'
          }`}
        >
          <Coins className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span className="hidden sm:inline">Revenue Dashboard</span>
          <span className="sm:hidden">Revenue</span>
        </button>
      </div>

      {activeTab === 'general' ? (
        <>
          {/* Grid of Statistical cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {cardData.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className={`${card.bg} ${card.border} border p-4 sm:p-6 rounded-xl sm:rounded-2xl flex items-center justify-between shadow-xs hover:shadow-md transition-all duration-300`}
                >
                  <div className="space-y-1">
                    <p className="text-[10px] sm:text-xs text-gray-500 font-extrabold uppercase tracking-wider">{card.name}</p>
                    <h4 className="text-2xl sm:text-3xl font-extrabold text-wedding-charcoal-dark tracking-tight">{card.value}</h4>
                  </div>
                  <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl ${card.iconBg} shadow-xs`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${card.text}`} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dynamic Data Charts Container */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* SVG User Growth Chart */}
            <div className="bg-wedding-card border border-wedding-pink-medium/20 p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-xs space-y-4 relative overflow-hidden">
              {fetchingGrowth && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center gap-2 z-10 animate-fadeIn">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 border-3 border-wedding-pink-medium border-t-wedding-pink-dark rounded-full animate-spin"></div>
                  <span className="text-[10px] font-bold text-wedding-pink-dark uppercase tracking-wider">Refreshing Users...</span>
                </div>
              )}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                <div className="w-full sm:w-auto">
                  <h4 className="text-sm sm:text-base lg:text-lg font-bold text-wedding-charcoal-dark tracking-tight">Active User Growth</h4>
                  <p className="text-[10px] sm:text-xs text-gray-500 font-semibold">Monthly registration count trend</p>
                </div>
                <div className="relative w-full sm:w-auto">
                  <select
                    value={userGrowthRange}
                    onChange={(e) => setUserGrowthRange(e.target.value)}
                    className="appearance-none pl-8 pr-8 py-1.5 sm:py-1.5 bg-[#FFF0F2] hover:bg-[#FFE5E8] border border-[#FFCAD2] text-wedding-pink-dark text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl shadow-xs transition-colors focus:outline-none cursor-pointer w-full sm:w-auto"
                  >
                    <option value="6m">Last 6 Months</option>
                    <option value="12m">Last 12 Months</option>
                    <option value="this_year">This Year</option>
                    <option value="last_year">Last Year</option>
                    <option value="custom">Custom Range</option>
                  </select>
                  <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-wedding-pink-dark absolute left-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                  <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-wedding-pink-dark absolute right-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {userGrowthRange === 'custom' && (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center p-3 bg-[#FFF0F2]/45 border border-[#FFCAD2]/40 rounded-xl sm:rounded-2xl animate-fadeIn">
                  <div className="flex flex-col gap-0.5 flex-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Start Date</span>
                    <input
                      type="date"
                      value={userGrowthStart}
                      onChange={(e) => setUserGrowthStart(e.target.value)}
                      className="px-2 py-1.5 sm:py-1 rounded-lg border border-wedding-pink-medium/30 text-xs font-semibold focus:outline-none bg-white text-wedding-charcoal-dark w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-0.5 flex-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">End Date</span>
                    <input
                      type="date"
                      value={userGrowthEnd}
                      onChange={(e) => setUserGrowthEnd(e.target.value)}
                      className="px-2 py-1.5 sm:py-1 rounded-lg border border-wedding-pink-medium/30 text-xs font-semibold focus:outline-none bg-white text-wedding-charcoal-dark w-full"
                    />
                  </div>
                </div>
              )}

              <div className="h-48 sm:h-56 lg:h-64 w-full relative flex items-end pt-4 overflow-x-auto">
                {charts && Array.isArray(charts.userGrowthTrend) && charts.userGrowthTrend.length >= 1 && (() => {
                  const userGridLines = [
                    { label: '0', y: 170 },
                    { label: String(Math.round(maxUsersY * 1 / 3)), y: 170 - (maxUsersY * 1 / 3) * userScale },
                    { label: String(Math.round(maxUsersY * 2 / 3)), y: 170 - (maxUsersY * 2 / 3) * userScale },
                    { label: String(maxUsersY), y: 170 - maxUsersY * userScale }
                  ];
                  return (
                    <svg className="w-full h-full" viewBox="0 0 500 200">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FF3E5C" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#FF3E5C" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Grid Lines with Y-Axis Labels */}
                      {userGridLines.map((line, idx) => (
                        <g key={idx}>
                          <line
                            x1="45"
                            y1={line.y}
                            x2="480"
                            y2={line.y}
                            stroke={idx === 0 ? "#E6DFE1" : "#F1EAEC"}
                            strokeWidth={idx === 0 ? "1.5" : "1"}
                            strokeDasharray={idx === 0 ? "none" : "4 4"}
                          />
                          <text
                            x="30"
                            y={line.y + 4}
                            fontSize="9.5"
                            fontWeight="bold"
                            fill="#6B5E62"
                            textAnchor="end"
                          >
                            {line.label}
                          </text>
                        </g>
                      ))}

                      {/* Area Gradient */}
                      {(() => {
                        const trendSpacing = charts.userGrowthTrend.length > 1 ? 435 / (charts.userGrowthTrend.length - 1) : 435;
                        const points = charts.userGrowthTrend.map((pt: any, idx: number) => {
                          const x = 45 + idx * trendSpacing;
                          const y = 170 - pt.users * userScale;
                          return `${x},${y}`;
                        });
                        const areaD = `M 45,170 L ${points.map((p: string) => p.replace(',', ' ')).join(' L ')} L 480,170 Z`;
                        const lineD = `M ${points.map((p: string) => p.replace(',', ' ')).join(' L ')}`;

                        return (
                          <>
                            <path d={areaD} fill="url(#chartGrad)" />
                            <path d={lineD} fill="none" stroke="#FF3E5C" strokeWidth="3.5" strokeLinecap="round" />

                            {/* Data Nodes */}
                            {charts.userGrowthTrend.map((pt: any, idx: number) => {
                              const x = 45 + idx * trendSpacing;
                              const y = 170 - pt.users * userScale;
                              return (
                                <g key={idx} className="group cursor-pointer">
                                  <circle cx={x} cy={y} r="5" fill="#FF3E5C" stroke="#FFF" strokeWidth="2" />
                                  <circle cx={x} cy={y} r="8" fill="#FF3E5C" opacity="0" className="group-hover:opacity-20 transition-opacity" />
                                  <text x={x} y={y - 12} fontSize="9.5" fontWeight="bold" fill="#161112" textAnchor="middle">
                                    {pt.users}
                                  </text>
                                  <text x={x} y="188" fontSize="10.5" fontWeight="600" fill="#6B5E62" textAnchor="middle">
                                    {pt.month}
                                  </text>
                                </g>
                              );
                            })}
                          </>
                        );
                      })()}
                    </svg>
                  );
                })()}
              </div>
            </div>

            {/* SVG Templates by Category Distribution */}
            <div className="bg-wedding-card border border-wedding-pink-medium/20 p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-xs space-y-4 relative overflow-hidden">
              {fetchingDistribution && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center gap-2 z-10 animate-fadeIn">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 border-3 border-wedding-pink-medium border-t-wedding-pink-dark rounded-full animate-spin"></div>
                  <span className="text-[10px] font-bold text-wedding-pink-dark uppercase tracking-wider">Refreshing Templates...</span>
                </div>
              )}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                <div className="w-full sm:w-auto">
                  <h4 className="text-sm sm:text-base lg:text-lg font-bold text-wedding-charcoal-dark tracking-tight">Template Distribution</h4>
                  <p className="text-[10px] sm:text-xs text-gray-500 font-semibold">Number of invitation layouts by categories</p>
                </div>
                <div className="relative w-full sm:w-auto">
                  <select
                    value={distributionRange}
                    onChange={(e) => setDistributionRange(e.target.value)}
                    className="appearance-none pl-8 pr-8 py-1.5 sm:py-1.5 bg-[#FFF0F2] hover:bg-[#FFE5E8] border border-[#FFCAD2] text-wedding-pink-dark text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl shadow-xs transition-colors focus:outline-none cursor-pointer w-full sm:w-auto"
                  >
                    <option value="this_month">This Month</option>
                    <option value="last_month">Last Month</option>
                    <option value="this_year">This Year</option>
                    <option value="all_time">All Time</option>
                    <option value="custom">Custom Range</option>
                  </select>
                  <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-wedding-pink-dark absolute left-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                  <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-wedding-pink-dark absolute right-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {distributionRange === 'custom' && (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center p-3 bg-[#FFF0F2]/45 border border-[#FFCAD2]/40 rounded-xl sm:rounded-2xl animate-fadeIn">
                  <div className="flex flex-col gap-0.5 flex-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Start Date</span>
                    <input
                      type="date"
                      value={distributionStart}
                      onChange={(e) => setDistributionStart(e.target.value)}
                      className="px-2 py-1.5 sm:py-1 rounded-lg border border-wedding-pink-medium/30 text-xs font-semibold focus:outline-none bg-white text-wedding-charcoal-dark w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-0.5 flex-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">End Date</span>
                    <input
                      type="date"
                      value={distributionEnd}
                      onChange={(e) => setDistributionEnd(e.target.value)}
                      className="px-2 py-1.5 sm:py-1 rounded-lg border border-wedding-pink-medium/30 text-xs font-semibold focus:outline-none bg-white text-wedding-charcoal-dark w-full"
                    />
                  </div>
                </div>
              )}

              <div className="h-48 sm:h-56 lg:h-64 w-full relative flex items-end pt-4 overflow-x-auto">
                {charts && Array.isArray(charts.categoryDistribution) && (() => {
                  const catGridLines = [];
                  const steps = 4;
                  for (let i = 0; i <= steps; i++) {
                    const val = (maxCatY / steps) * i;
                    catGridLines.push({
                      label: String(Math.round(val)),
                      y: 150 - val * catScale
                    });
                  }
                  const spacing = 430 / Math.max(1, catDistribution.length);
                  return (
                    <svg className="w-full h-full" viewBox="0 0 500 230">
                      {/* Grid Lines with Y-Axis Labels */}
                      {catGridLines.map((line, idx) => (
                        <g key={idx}>
                          <line
                            x1="45"
                            y1={line.y}
                            x2="480"
                            y2={line.y}
                            stroke={idx === 0 ? "#E6DFE1" : "#F1EAEC"}
                            strokeWidth={idx === 0 ? "1.5" : "1"}
                            strokeDasharray={idx === 0 ? "none" : "4 4"}
                          />
                          <text
                            x="30"
                            y={line.y + 4}
                            fontSize="9.5"
                            fontWeight="bold"
                            fill="#6B5E62"
                            textAnchor="end"
                          >
                            {line.label}
                          </text>
                        </g>
                      ))}

                      {/* Render bars dynamically */}
                      {catDistribution.map((pt: any, idx: number) => {
                        const x = 52 + idx * spacing;
                        const barWidth = Math.max(6, Math.min(16, spacing - 8));
                        const barHeight = pt.count * catScale;
                        const y = 150 - barHeight;
                        return (
                          <g key={idx} className="group cursor-pointer">
                            {/* Highlight rect on hover */}
                            <rect x={x - 4} y="35" width={barWidth + 8} height="115" fill="#FFF0F2" opacity="0" className="group-hover:opacity-100 transition-opacity rounded-2xl" />

                            {/* The bar */}
                            <rect
                              x={x}
                              y={y}
                              width={barWidth}
                              height={barHeight}
                              fill={idx % 2 === 0 ? "#FF3E5C" : "#F7C566"}
                              rx="3"
                            />

                            {/* Text (only show above bar if count > 0, otherwise show 0 at baseline) */}
                            <text x={x + barWidth / 2} y={y - 6} fontSize="9" fontWeight="extrabold" fill="#161112" textAnchor="middle">
                              {pt.count}
                            </text>

                            {/* Rotated non-overlapping label */}
                            <text
                              x={x + barWidth / 2}
                              y="160"
                              fontSize="8.5"
                              fontWeight="700"
                              fill="#6B5E62"
                              textAnchor="end"
                              transform={`rotate(-35, ${x + barWidth / 2}, 160)`}
                            >
                              {pt.name.length > 12 ? `${pt.name.substring(0, 10)}...` : pt.name}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Bottom Row Details: Recent Activities & Top Performing templates */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Recent Activities Section */}
            <div className="bg-wedding-card border border-wedding-pink-medium/20 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xs lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm sm:text-base lg:text-lg font-bold text-wedding-charcoal-dark tracking-tight">Recent Activity Log</h4>
                <span className="text-[10px] sm:text-xs text-wedding-pink-dark font-semibold cursor-pointer hover:underline flex items-center gap-0.5">
                  View all log <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-wedding-pink-dark shrink-0" />
                </span>
              </div>
              <div className="divide-y divide-wedding-pink-medium/15">
                {recentActivities.map((act: any) => (
                  <div key={act.id} className="py-3 sm:py-4 first:pt-0 last:pb-0 flex gap-3 sm:gap-4 items-start">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-wedding-pink-light text-wedding-pink-dark flex items-center justify-center shrink-0 border border-wedding-pink-medium/20 shadow-xs">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-wedding-pink-dark shrink-0" />
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-wedding-charcoal-dark line-clamp-2">{act.action}</p>
                      <div className="flex flex-wrap gap-2 text-[10px] sm:text-xs text-gray-500 font-medium">
                        <span className="font-semibold text-wedding-pink-dark">{act.user}</span>
                        <span>•</span>
                        <span>{act.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Downloaded Templates Section */}
            <div className="bg-wedding-card border border-wedding-pink-medium/20 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xs space-y-4">
              <h4 className="text-sm sm:text-base lg:text-lg font-bold text-wedding-charcoal-dark tracking-tight">Top Templates</h4>
              <div className="space-y-3 sm:space-y-4">
                {topTemplates.map((tpl: any) => (
                  <div key={tpl.id} className="p-3 sm:p-4 bg-wedding-pink-light/35 border border-wedding-pink-medium/25 rounded-xl sm:rounded-2xl flex items-center justify-between gap-2">
                    <div className="space-y-1 flex-1 min-w-0">
                      <h5 className="text-xs sm:text-sm font-bold text-wedding-charcoal-dark truncate">{tpl.name}</h5>
                      <div className="flex gap-2">
                        <span className="px-2 py-0.5 bg-wedding-pink-light text-wedding-pink-dark text-[8px] sm:text-[9px] font-bold rounded-md uppercase border border-wedding-pink-medium/30 shadow-xs">
                          {tpl.isPremium ? 'Premium' : 'Free'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-wedding-pink-dark text-[10px] sm:text-xs font-semibold bg-wedding-pink-light px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-wedding-pink-medium/20 shadow-xs shrink-0">
                      <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-wedding-pink-dark shrink-0" />
                      <span className="hidden sm:inline">{tpl.downloads} downloads</span>
                      <span className="sm:hidden">{tpl.downloads}</span>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => onNavigate('templates')}
                  className="w-full py-2.5 sm:py-3 bg-wedding-pink-light/40 text-wedding-pink-dark hover:bg-wedding-pink-dark hover:text-white text-[10px] sm:text-xs font-bold rounded-xl sm:rounded-2xl transition-all duration-300 text-center border border-wedding-pink-medium/30"
                >
                  Open Template Manager
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Revenue tab cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
            {revenueCardData.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className={`${card.bg} ${card.border} border p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2 shadow-xs hover:shadow-md transition-all duration-300`}
                >
                  <div className="space-y-1 text-center sm:text-left">
                    <p className="text-[8px] sm:text-[10px] text-gray-500 font-extrabold uppercase tracking-wider">{card.name}</p>
                    <h4 className="text-base sm:text-xl lg:text-2xl font-extrabold text-wedding-charcoal-dark tracking-tight">{card.value}</h4>
                  </div>
                  <div className={`p-2 sm:p-3 lg:p-4 rounded-xl sm:rounded-2xl ${card.iconBg} shadow-xs`}>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${card.text}`} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* SVG Subscription Growth Trend Chart */}
            <div className="bg-wedding-card border border-wedding-pink-medium/20 p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-xs space-y-4 lg:col-span-2 relative overflow-hidden">
              {fetchingSubGrowth && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center gap-2 z-10 animate-fadeIn">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 border-3 border-wedding-pink-medium border-t-wedding-pink-dark rounded-full animate-spin"></div>
                  <span className="text-[10px] font-bold text-wedding-pink-dark uppercase tracking-wider">Refreshing Subscriptions...</span>
                </div>
              )}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                <div className="w-full sm:w-auto">
                  <h4 className="text-sm sm:text-base lg:text-lg font-bold text-wedding-charcoal-dark tracking-tight font-sans">Subscription Growth Trend</h4>
                  <p className="text-[10px] sm:text-xs text-gray-500 font-semibold">Active subscribers over the past 6 months</p>
                </div>
                <div className="relative w-full sm:w-auto">
                  <select
                    value={subGrowthRange}
                    onChange={(e) => setSubGrowthRange(e.target.value)}
                    className="appearance-none pl-8 pr-8 py-1.5 sm:py-1.5 bg-[#FFF0F2] hover:bg-[#FFE5E8] border border-[#FFCAD2] text-wedding-pink-dark text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl shadow-xs transition-colors focus:outline-none cursor-pointer w-full sm:w-auto"
                  >
                    <option value="6m">Last 6 Months</option>
                    <option value="12m">Last 12 Months</option>
                    <option value="this_year">This Year</option>
                    <option value="last_year">Last Year</option>
                    <option value="custom">Custom Range</option>
                  </select>
                  <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-wedding-pink-dark absolute left-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                  <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-wedding-pink-dark absolute right-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {subGrowthRange === 'custom' && (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center p-3 bg-[#FFF0F2]/45 border border-[#FFCAD2]/40 rounded-xl sm:rounded-2xl animate-fadeIn">
                  <div className="flex flex-col gap-0.5 flex-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Start Date</span>
                    <input
                      type="date"
                      value={subGrowthStart}
                      onChange={(e) => setSubGrowthStart(e.target.value)}
                      className="px-2 py-1.5 sm:py-1 rounded-lg border border-wedding-pink-medium/30 text-xs font-semibold focus:outline-none bg-white text-wedding-charcoal-dark w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-0.5 flex-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">End Date</span>
                    <input
                      type="date"
                      value={subGrowthEnd}
                      onChange={(e) => setSubGrowthEnd(e.target.value)}
                      className="px-2 py-1.5 sm:py-1 rounded-lg border border-wedding-pink-medium/30 text-xs font-semibold focus:outline-none bg-white text-wedding-charcoal-dark w-full"
                    />
                  </div>
                </div>
              )}

              <div className="h-48 sm:h-56 lg:h-64 w-full relative flex items-end pt-4 overflow-x-auto">
                {trend && trend.length >= 1 && (() => {
                  const gridLines = [
                    { label: '0', y: 170 },
                    { label: String(Math.round(maxSubsY * 0.5)), y: 170 - (maxSubsY * 0.5) * subScale },
                    { label: String(maxSubsY), y: 170 - maxSubsY * subScale }
                  ];
                  return (
                    <svg className="w-full h-full" viewBox="0 0 500 200">
                      <defs>
                        <linearGradient id="subChartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FF3E5C" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#FF3E5C" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Grid Lines with Y-Axis Labels */}
                      {gridLines.map((line, idx) => (
                        <g key={idx}>
                          <line
                            x1="45"
                            y1={line.y}
                            x2="480"
                            y2={line.y}
                            stroke="#F1EAEC"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                          />
                          <text
                            x="30"
                            y={line.y + 4}
                            fontSize="9.5"
                            fontWeight="bold"
                            fill="#6B5E62"
                            textAnchor="end"
                          >
                            {line.label}
                          </text>
                        </g>
                      ))}

                      {/* Area Gradient */}
                      {(() => {
                        const trendSpacing = trend.length > 1 ? 435 / (trend.length - 1) : 435;
                        const points = trend.map((pt: any, idx: number) => {
                          const x = 45 + idx * trendSpacing;
                          const y = 170 - pt.subscribers * subScale;
                          return `${x},${y}`;
                        });
                        const areaD = `M 45,170 L ${points.map((p: string) => p.replace(',', ' ')).join(' L ')} L 480,170 Z`;
                        const lineD = `M ${points.map((p: string) => p.replace(',', ' ')).join(' L ')}`;

                        return (
                          <>
                            <path d={areaD} fill="url(#subChartGrad)" />
                            <path d={lineD} fill="none" stroke="#FF3E5C" strokeWidth="3.5" strokeLinecap="round" />

                            {/* Data Nodes */}
                            {trend.map((pt: any, idx: number) => {
                              const x = 45 + idx * trendSpacing;
                              const y = 170 - pt.subscribers * subScale;
                              return (
                                <g key={idx} className="group cursor-pointer">
                                  <circle cx={x} cy={y} r="5" fill="#FF3E5C" stroke="#FFF" strokeWidth="2" />
                                  <circle cx={x} cy={y} r="8" fill="#FF3E5C" opacity="0" className="group-hover:opacity-20 transition-opacity" />
                                  <text x={x} y={y - 12} fontSize="9.5" fontWeight="bold" fill="#161112" textAnchor="middle">
                                    {pt.subscribers}
                                  </text>
                                  <text x={x} y="188" fontSize="10.5" fontWeight="600" fill="#6B5E62" textAnchor="middle">
                                    {pt.month}
                                  </text>
                                </g>
                              );
                            })}
                          </>
                        );
                      })()}
                    </svg>
                  );
                })()}
              </div>
            </div>

            {/* Visual breakdown of Transaction type / channels */}
            <div className="bg-wedding-card border border-wedding-pink-medium/20 p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-xs space-y-4 sm:space-y-6 flex flex-col justify-between">
              <div>
                <h4 className="text-sm sm:text-base lg:text-lg font-bold text-wedding-charcoal-dark tracking-tight font-sans">Checkout Distribution</h4>
                <p className="text-[10px] sm:text-xs text-gray-500 font-semibold">Breakdown of purchase transaction methods</p>
              </div>

              <div className="space-y-3 sm:space-y-4 flex-1 flex flex-col justify-center">
                {(() => {
                  const total = txSummary.totalTransactions || 1;
                  const monthlyPct = Math.round((txSummary.monthlySubscriptions || 0) / total * 100);
                  const yearlyPct = Math.round((txSummary.yearlySubscriptions || 0) / total * 100);
                  const purchasePct = Math.round((txSummary.singlePurchases || 0) / total * 100);

                  return (
                    <div className="space-y-4">
                      {/* Monthly Plan bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-wedding-charcoal-dark">
                          <span>Monthly Passes ({txSummary.monthlySubscriptions || 0})</span>
                          <span>{monthlyPct}%</span>
                        </div>
                        <div className="w-full h-3 bg-wedding-pink-light rounded-full overflow-hidden">
                          <div className="h-full bg-wedding-pink-dark rounded-full transition-all duration-500" style={{ width: `${monthlyPct}%` }} />
                        </div>
                      </div>

                      {/* Yearly Plan bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-wedding-charcoal-dark">
                          <span>Yearly Passes ({txSummary.yearlySubscriptions || 0})</span>
                          <span>{yearlyPct}%</span>
                        </div>
                        <div className="w-full h-3 bg-wedding-gold-light rounded-full overflow-hidden">
                          <div className="h-full bg-wedding-gold-accent rounded-full transition-all duration-500" style={{ width: `${yearlyPct}%` }} />
                        </div>
                      </div>

                      {/* Single Templates purchase bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-wedding-charcoal-dark">
                          <span>Single Layout Purchases ({txSummary.singlePurchases || 0})</span>
                          <span>{purchasePct}%</span>
                        </div>
                        <div className="w-full h-3 bg-emerald-50 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${purchasePct}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="bg-[#FFF0F2] border border-[#FFCAD2]/40 rounded-2xl p-4 flex items-center justify-between text-xs font-semibold">
                <div className="text-gray-500">Subscription Share:</div>
                <div className="text-wedding-pink-dark font-extrabold text-sm">
                  {Math.round(((txSummary.subscriptionRevenue || 0) / (txSummary.totalRevenue || 1)) * 100)}% of total revenue
                </div>
              </div>
            </div>
          </div>

          {/* Recent Payments Table */}
          <div className="bg-wedding-card border border-wedding-pink-medium/20 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xs space-y-4">
            <h4 className="text-sm sm:text-base lg:text-lg font-bold text-wedding-charcoal-dark tracking-tight font-sans">Recent Payments Transactions</h4>
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-wedding-pink-medium/20 font-bold text-gray-500">
                    <th className="py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs">User Details</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs">Transaction Type</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs">Status</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs hidden sm:table-cell">Execution Date</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wedding-pink-medium/10">
                  {txList.slice(0, 5).map((tx: any) => {
                    const isSubscription = tx.type === 'subscription';
                    const statusSuccess = tx.status === 'success';

                    return (
                      <tr key={tx.id} className="hover:bg-wedding-pink-light/10 transition-colors">
                        <td className="py-2 sm:py-4 px-2 sm:px-4">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 sm:p-2 rounded-lg bg-gray-100 text-gray-500 shrink-0">
                              <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-wedding-charcoal-dark text-[10px] sm:text-xs truncate">{tx.userEmail || 'anonymous'}</p>
                              <p className="text-[8px] sm:text-[10px] text-gray-400 font-mono hidden sm:block">ID: {tx.userId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 sm:py-4 px-2 sm:px-4">
                          <span className={`px-1.5 sm:px-2 py-1 border text-[8px] sm:text-[10px] font-extrabold rounded-lg uppercase inline-block max-w-full truncate ${
                            isSubscription ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-purple-50 border-purple-200 text-purple-700'
                          }`}>
                            {isSubscription ? `${tx.planId || 'Monthly'} sub` : `Single: ${tx.templateName || 'Template'}`}
                          </span>
                        </td>
                        <td className="py-2 sm:py-4 px-2 sm:px-4">
                          <span className={`px-1.5 sm:px-2 py-1 text-[8px] sm:text-[10px] font-bold rounded-lg ${
                            statusSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-2 sm:py-4 px-2 sm:px-4 text-gray-500 font-semibold font-mono text-[10px] sm:text-xs hidden sm:table-cell">
                          {new Date(tx.timestamp || tx.createdAt).toLocaleDateString('en-IN')} {new Date(tx.timestamp || tx.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-2 sm:py-4 px-2 sm:px-4 text-right font-black text-emerald-600 font-mono text-[10px] sm:text-xs">
                          ₹{tx.amount}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
