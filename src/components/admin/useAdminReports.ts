import { useState, useEffect } from 'react';
import { reportsApi } from '../../api/api';
import type { FrontendReport } from '../../api/apiAdapters';

export function useAdminReports() {
  const [reports, setReports] = useState<FrontendReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterRole, setFilterRole] = useState<'all' | 'security'>('all');
  const [selectedReport, setSelectedReport] = useState<FrontendReport | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await reportsApi.getAll();
      setReports(data || []);
    } catch (e) {
      console.error('Failed to load reports', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(r => {
    if (filterRole === 'all') return true;
    return (r.reporterRole || '').toLowerCase() === 'security';
  });

  const openReport = (r: FrontendReport) => {
    setSelectedReport(r);
    setIsDialogOpen(true);
  };

  return {
    reports,
    loading,
    filterRole,
    setFilterRole,
    filteredReports,
    selectedReport,
    isDialogOpen,
    setIsDialogOpen,
    openReport,
    reload: loadReports,
  };
}
