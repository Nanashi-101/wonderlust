"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  Package,
  CalendarCheck,
  Inbox,
  ArrowUpRight,
  Compass,
  CheckCircle2,
  Users,
  Activity,
  Eye,
  MapPin,
  Clock,
  Star,
} from "lucide-react";

interface AdminOverviewPanelProps {
  stats: {
    totalPackages: number;
    totalBookings: number;
    totalInquiries: number;
    totalRevenue: number;
    recentBookings: any[];
  };
  onNavigateToTab: (tab: "packages" | "enquiries" | "admins") => void;
}

const staggerChildren = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function AdminOverviewPanel({
  stats,
  onNavigateToTab,
}: AdminOverviewPanelProps) {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  const changeBadgeStyles: Record<string, string> = {
    positive: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
    warning: "bg-amber-50 text-amber-700 border border-amber-200/60",
    neutral: "bg-slate-50 text-slate-600 border border-slate-200/60",
  };

  const kpiCards = [
    {
      label: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      change: "+18.4%",
      changeType: "positive",
      subtitle: "Confirmed package revenue",
      icon: DollarSign,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      borderAccent: "border-l-emerald-500",
    },
    {
      label: "Active Expeditions",
      value: `${stats.totalPackages}`,
      change: "Live",
      changeType: "neutral",
      subtitle: "Published in tour catalog",
      icon: Compass,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      borderAccent: "border-l-blue-500",
      action: () => onNavigateToTab("packages"),
      actionLabel: "Manage",
    },
    {
      label: "Total Bookings",
      value: `${stats.totalBookings}`,
      change: "+12 this month",
      changeType: "positive",
      subtitle: "Customer reservations",
      icon: CalendarCheck,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      borderAccent: "border-l-violet-500",
    },
    {
      label: "Pending Inquiries",
      value: `${stats.totalInquiries}`,
      change: "Action needed",
      changeType: "warning",
      subtitle: "Awaiting your response",
      icon: Inbox,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      borderAccent: "border-l-amber-500",
      action: () => onNavigateToTab("enquiries"),
      actionLabel: "View Inbox",
    },
  ];

  const revenueData = [
    { month: "Jan", value: 45, amount: "₹2.2L" },
    { month: "Feb", value: 60, amount: "₹3.1L" },
    { month: "Mar", value: 75, amount: "₹4.2L" },
    { month: "Apr", value: 50, amount: "₹2.8L" },
    { month: "May", value: 90, amount: "₹5.6L" },
    { month: "Jun", value: 100, amount: "₹6.4L" },
    { month: "Jul", value: 85, amount: "₹4.9L" },
    { month: "Aug", value: 70, amount: "₹3.8L" },
    { month: "Sep", value: 65, amount: "₹3.5L" },
    { month: "Oct", value: 80, amount: "₹4.5L" },
    { month: "Nov", value: 55, amount: "₹2.9L" },
    { month: "Dec", value: 95, amount: "₹5.9L" },
  ];

  const recentActivity = [
    {
      user: "Ananya Sharma",
      action: "Booked Kashmir Alpine Retreat",
      amount: "₹22,999",
      time: "2 hours ago",
      status: "CONFIRMED",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      avatar: "AS",
    },
    {
      user: "Vikram Rathore",
      action: "Inquired about Ladakh Bike Expedition",
      amount: "₹42,999",
      time: "5 hours ago",
      status: "NEW INQUIRY",
      statusColor: "bg-blue-50 text-blue-700 border-blue-200",
      avatar: "VR",
    },
    {
      user: "Pooja Mehra",
      action: "Requested Rishikesh Retreat",
      amount: "₹18,999",
      time: "1 day ago",
      status: "IN REVIEW",
      statusColor: "bg-amber-50 text-amber-700 border-amber-200",
      avatar: "PM",
    },
    {
      user: "Rohit Kapoor",
      action: "Booked Manali Snow Trek",
      amount: "₹34,999",
      time: "2 days ago",
      status: "CONFIRMED",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      avatar: "RK",
    },
  ];

  const topDestinations = [
    { name: "Kashmir", revenue: "₹6.2L", bookings: 14, color: "bg-cyan-500" },
    { name: "Ladakh", revenue: "₹4.8L", bookings: 11, color: "bg-blue-500" },
    { name: "Manali", revenue: "₹2.4L", bookings: 7, color: "bg-violet-500" },
    {
      name: "Rishikesh",
      revenue: "₹1.1L",
      bookings: 4,
      color: "bg-amber-500",
    },
  ];

  return (
    <motion.div
      variants={staggerChildren}
      initial="initial"
      animate="animate"
      className="space-y-8"
    >
      {/* ─── KPI Cards Row ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={i}
              variants={fadeInUp}
              className={`relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 border-l-4 ${card.borderAccent} p-6 shadow-sm hover:shadow-md transition-all`}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl ${card.iconBg} dark:bg-slate-800 flex items-center justify-center`}
                >
                  <Icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
                {card.action ? (
                  <button
                    onClick={card.action}
                    className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {card.actionLabel}{" "}
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${changeBadgeStyles[card.changeType] || changeBadgeStyles.neutral}`}
                  >
                    {card.changeType === "positive" && (
                      <TrendingUp className="w-3 h-3" />
                    )}
                    {card.change}
                  </span>
                )}
              </div>

              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {card.value}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                {card.subtitle}
              </p>
            </motion.div>
          );
        })}
      </div>


      {/* ─── Revenue Chart + Top Destinations ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart (2/3) */}
        <motion.div
          variants={fadeInUp}
          className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                Monthly Revenue Performance
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Expedition bookings across all regions
              </p>
            </div>

            <div className="flex items-center gap-2">
              {topDestinations.slice(0, 3).map((dest, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${dest.color}`}
                  />
                  {dest.name}: {dest.revenue}
                </span>
              ))}
            </div>
          </div>

          {/* Bar Chart */}
          <div className="grid grid-cols-12 gap-3 items-end h-72 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            {revenueData.map((bar, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 h-full justify-end group"
              >
                <span className="text-[11px] font-bold text-cyan-700 dark:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {bar.amount}
                </span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${bar.value}%` }}
                  transition={{ duration: 0.7, delay: i * 0.04, ease: "easeOut" }}
                  className="w-full bg-gradient-to-t from-slate-800 to-slate-600 dark:from-slate-700 dark:to-slate-500 rounded-t-lg group-hover:from-cyan-600 group-hover:to-cyan-400 transition-all duration-300 cursor-pointer shadow-sm"
                />
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500 pt-1">
                  {bar.month}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Destinations (1/3) */}
        <motion.div
          variants={fadeInUp}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              Top Destinations
            </h3>
            <Star className="w-5 h-5 text-amber-400" />
          </div>

          <div className="space-y-5">
            {topDestinations.map((dest, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-3 h-3 rounded-full ${dest.color}`}
                    />
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {dest.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {dest.revenue}
                    </span>
                    <span className="text-xs text-slate-400 ml-2">
                      {dest.bookings} trips
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(dest.bookings / 14) * 100}%`,
                    }}
                    transition={{
                      duration: 0.8,
                      delay: 0.3 + i * 0.1,
                      ease: "easeOut",
                    }}
                    className={`h-full rounded-full ${dest.color}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigateToTab("packages")}
            className="w-full mt-6 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold border border-slate-200/60 dark:border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            View All Expeditions <ArrowUpRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>

      {/* ─── Recent Activity Feed ─── */}
      <motion.div
        variants={fadeInUp}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            Recent Activity
          </h3>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            Live Stream
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentActivity.map((act, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
              className="flex items-start gap-4 p-5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {act.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {act.user}
                  </h4>
                  <span className="text-base font-extrabold text-cyan-700 dark:text-cyan-400 shrink-0">
                    {act.amount}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">{act.action}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-slate-400 dark:text-slate-500">{act.time}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${act.statusColor}`}
                  >
                    {act.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

