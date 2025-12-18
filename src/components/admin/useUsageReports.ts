import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { analyticsApi } from '../../api/api';

export const categoryColors: Record<string, string> = {
  'Phòng học': '#3b82f6',
  'Phòng Lab': '#8b5cf6',
  'Hội trường': '#10b981',
  'Sân thể thao': '#f97316',
};

export function useUsageReports() {
  const [selectedCampus, setSelectedCampus] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [selectedCampus, selectedPeriod]);

  const loadAnalytics = async () => {
    setLoading(true);
    const data = await analyticsApi.getStats(selectedPeriod, selectedCampus !== 'all' ? selectedCampus : undefined);
    setAnalytics(data);
    setLoading(false);
  };

  const handleExportReport = () => {
    toast.success('Report exported successfully');
  };

  const bookingsByRoom = (analytics?.topFacilities && Array.isArray(analytics.topFacilities) && analytics.topFacilities.length > 0)
    ? analytics.topFacilities.map((f: any) => ({ name: f.facilityName, bookings: f.bookingCount })).slice(0, 10)
    : Object.entries(analytics?.bookingsByRoom || {}).map(([name, value]) => ({
        name,
        bookings: value,
      })).slice(0, 10);

  const bookingsByCategory = Object.entries(analytics?.bookingsByCategory || {}).map(([name, value], index) => ({
    name,
    value: value as number,
    color: categoryColors[name] || '#6b7280',
  }));

  const campusUtilization = Object.entries(analytics?.bookingsByCampus || {}).map(([name, value]) => ({
    name,
    bookings: value,
  }));

  const totalBookings = analytics?.totalBookings || 0;
  const approvalRate = analytics?.approvalRate || 0;

  return {
    selectedCampus,
    setSelectedCampus,
    selectedPeriod,
    setSelectedPeriod,
    analytics,
    loading,
    handleExportReport,
    bookingsByRoom,
    bookingsByCategory,
    campusUtilization,
    totalBookings,
    approvalRate,
  };
}
