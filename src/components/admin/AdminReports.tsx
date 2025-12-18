import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { useAdminReports } from './useAdminReports';

export function AdminReports() {
  const {
    loading,
    filterRole,
    setFilterRole,
    filteredReports,
    selectedReport,
    isDialogOpen,
    setIsDialogOpen,
    openReport,
    reload,
  } = useAdminReports();
       
  return (
    <Card className="mt-6">
        console.log(r);

      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Facility Reports (Admin)</CardTitle>
            <CardDescription>View reports submitted by Security and other users</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <Select value={filterRole} onValueChange={(val) => setFilterRole(val as any)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reports</SelectItem>
                <SelectItem value="security">Security Reports</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={reload}>Refresh</Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="py-8 text-center text-gray-500">Loading reports...</div>
        ) : filteredReports.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No reports found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-3 text-left text-sm">Facility</th>
                  <th className="p-3 text-left text-sm">Title</th>
                  <th className="p-3 text-left text-sm">Reporter</th>
                  <th className="p-3 text-left text-sm">Role</th>
                  <th className="p-3 text-left text-sm">Status</th>
                  <th className="p-3 text-left text-sm">Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((r) => (
                  <tr key={r.reportId} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => openReport(r)}>
                    <td className="p-3">{r.facilityName}</td>
                    <td className="p-3">{r.title}</td>
                    <td className="p-3">{r.createdBy}</td>
                    <td className="p-3">{r.reporterRole || '-'}</td>
                    <td className="p-3">{r.status}</td>
                    <td className="p-3">{new Date(r.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )} 

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Report details</DialogTitle>
              <DialogDescription>
                {selectedReport && (
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold">{selectedReport.title}</p>
                    <p className="mt-2">{selectedReport.description}</p>
                    <p className="mt-4 text-xs text-gray-500">Facility: {selectedReport.facilityName}</p>
                    <p className="text-xs text-gray-500">Reported by: {selectedReport.createdBy} ({selectedReport.reporterRole || 'Unknown'})</p>
                    <p className="text-xs text-gray-500">Status: {selectedReport.status}</p>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
