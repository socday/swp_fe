import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download } from 'lucide-react';
import { useUsageReports } from './useUsageReports';

export function UsageReports() {
  const {
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
  } = useUsageReports();

  if (loading || !analytics) {
    return (
      <Card>
        {/* <CardContent className="py-12 text-center text-gray-500">
          <p>Loading analytics...</p>
        </CardContent> */}
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Usage Reports & Analytics</CardTitle>
              <CardDescription>Track facility utilization and booking trends</CardDescription>
            </div>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleExportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Select value={selectedCampus} onValueChange={setSelectedCampus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campuses</SelectItem>
                <SelectItem value="FU_FPT">FU FPT Campus</SelectItem>
                <SelectItem value="NVH">NVH Campus</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Bookings</p>
                  <p className="text-3xl mt-2">{totalBookings}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Approval Rate</p>
                  <p className="text-3xl mt-2">{approvalRate}%</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Active Facilities</p>
                  <p className="text-3xl mt-2">{Object.keys(analytics.bookingsByRoom || {}).length}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {bookingsByRoom.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Bookings by Room</CardTitle>
              <CardDescription>Most frequently booked facilities</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bookingsByRoom}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="bookings" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {bookingsByCategory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Bookings by Category</CardTitle>
              <CardDescription>Distribution across facility types</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={bookingsByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {bookingsByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {campusUtilization.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Campus Utilization</CardTitle>
              <CardDescription>Booking comparison across campuses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={campusUtilization}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="bookings" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {totalBookings === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <p>No booking data available yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}