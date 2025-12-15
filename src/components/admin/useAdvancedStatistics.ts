import { useState, useEffect } from 'react';
import { adminApi, AdvancedAnalytics } from '../../api/api';

const COLORS = ['#3b82f6', '#f97316', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];

export function useAdvancedStatistics() {
  const [analytics, setAnalytics] = useState<AdvancedAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [campus, setCampus] = useState<string>('all');
  const [period, setPeriod] = useState<string>('month');

  useEffect(() => {
    loadAnalytics();
  }, [campus, period]);

  const loadAnalytics = async () => {
    setLoading(true);
    const data = await adminApi.getAdvancedAnalytics(period, campus === 'all' ? undefined : campus);
    setAnalytics(data);
    setLoading(false);
  };

  const topRoomsData = analytics?.topRooms.map(r => ({
    name: r.roomName,
    bookings: r.count,
    campus: r.campus === 'FU_FPT' ? 'FU FPT' : 'NVH',
  })) || [];

  const topSlotsData = analytics?.topSlots.map(s => ({
    name: s.slot,
    bookings: s.count,
  })) || [];

  const categoriesData = analytics?.topCategories.map((c, idx) => ({
    name: c.category,
    value: c.count,
    color: COLORS[idx % COLORS.length],
  })) || [];

  return {
    analytics,
    loading,
    campus,
    setCampus,
    period,
    setPeriod,
    topRoomsData,
    topSlotsData,
    categoriesData,
    COLORS,
  };
}
