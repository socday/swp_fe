import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Textarea } from "../../ui/textarea";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Calendar, FileText, User, Eye } from "lucide-react";
import { Report } from "../../../lib/api";

interface StaffReportsUIProps {
  reports: Report[];
  loading: boolean;
  selectedReport: Report | null;
  setSelectedReport: (report: Report | null) => void;
  reportDialogOpen: boolean;
  setReportDialogOpen: (open: boolean) => void;
  reportResponse: string;
  setReportResponse: (response: string) => void;
  reportStatus: Report["status"];
  setReportStatus: (status: Report["status"]) => void;
  handleReviewReport: () => void;
}

export function StaffReportsUI({
  reports,
  loading,
  selectedReport,
  setSelectedReport,
  reportDialogOpen,
  setReportDialogOpen,
  reportResponse,
  setReportResponse,
  reportStatus,
  setReportStatus,
  handleReviewReport,
}: StaffReportsUIProps) {
  const getTypeBadge = (type: Report["type"]) => {
    switch (type) {
      case "facility_issue":
        return <Badge className="bg-red-500">Facility Issue</Badge>;
      case "equipment_damage":
        return <Badge className="bg-orange-500">Equipment Damage</Badge>;
      case "cleanliness":
        return <Badge className="bg-blue-500">Cleanliness</Badge>;
      case "other":
        return <Badge className="bg-gray-500">Other</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: Report["status"]) => {
    switch (status) {
      case "Submitted":
        return <Badge className="bg-yellow-500">Submitted</Badge>;
      case "Reviewed":
        return <Badge className="bg-green-500">Reviewed</Badge>;
      case "Resolved":
        return <Badge className="bg-blue-500">Resolved</Badge>;
      default:
        return null;
    }
  };

  const openReviewDialog = (report: Report) => {
    setSelectedReport(report);
    setReportStatus(report.status);
    setReportResponse(report.response || "");
    setReportDialogOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          <p>Loading reports...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Facility Reports</CardTitle>
          <CardDescription>Review and respond to user-submitted reports</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {reports.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No reports submitted</p>
          ) : (
            reports.map((report) => (
              <Card key={report.id}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-gray-600" />
                          <h3 className="text-lg">{report.roomName}</h3>
                        </div>
                        <p className="text-sm text-gray-600">{report.building}</p>
                      </div>
                      <div className="flex gap-2">
                        {getTypeBadge(report.type)}
                        {getStatusBadge(report.status)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{report.userName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(report.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm">
                        <span className="text-gray-700">Issue:</span> {report.description}
                      </p>
                    </div>

                    {report.response && (
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm">
                          <span className="text-blue-700">Staff Response:</span> {report.response}
                        </p>
                      </div>
                    )}

                    <Button onClick={() => openReviewDialog(report)} variant="outline" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      Review Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Report</DialogTitle>
            <DialogDescription>Update status and provide response to the report</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedReport && (
              <>
                <div className="bg-gray-50 p-4 rounded space-y-2">
                  <div className="flex justify-between">
                    <p>
                      <strong>Room:</strong> {selectedReport.roomName}
                    </p>
                    {getTypeBadge(selectedReport.type)}
                  </div>
                  <p>
                    <strong>Reported by:</strong> {selectedReport.userName}
                  </p>
                  <p>
                    <strong>Date:</strong> {new Date(selectedReport.createdAt).toLocaleDateString()}
                  </p>
                  <div className="pt-2 border-t">
                    <p className="text-sm">
                      <strong>Description:</strong>
                    </p>
                    <p className="text-sm mt-1">{selectedReport.description}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={reportStatus} onValueChange={(val) => setReportStatus(val as Report["status"])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Submitted">Submitted</SelectItem>
                      <SelectItem value="Reviewed">Reviewed</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reportResponse">Staff Response</Label>
                  <Textarea
                    id="reportResponse"
                    placeholder="Provide your response or action taken..."
                    value={reportResponse}
                    onChange={(e) => setReportResponse(e.target.value)}
                    rows={4}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReviewReport} className="bg-orange-500 hover:bg-orange-600">
              Update Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
