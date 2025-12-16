import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Building2, Clock, LayoutGrid } from 'lucide-react';
import { useAdvancedStatistics } from './useAdvancedStatistics';

export function AdvancedStatistics() {
  const {
    analytics,
    loading,
    campus,
    setCampus,
    period,
    setPeriod,
    topRoomsData,
    topSlotsData,
    categoriesData,
  } = useAdvancedStatistics();

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Advanced Statistics
          </CardTitle>
          <CardDescription>Detailed analytics and insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 max-w-xs">
              <label className="text-sm mb-2 block">Campus</label>
              <Select value={campus} onValueChange={setCampus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campuses</SelectItem>
                  <SelectItem value="FU_FPT">FU FPT</SelectItem>
                  <SelectItem value="NVH">NVH</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 max-w-xs">
              <label className="text-sm mb-2 block">Period</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
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
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading analytics...</div>
      ) : !analytics ? (
        <div className="text-center py-8 text-gray-500">No data available</div>
      ) : (
        <>
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5" />
                Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl mb-2">{analytics.totalApprovedBookings}</div>
              <p className="text-gray-600">Total Approved Bookings</p>
            </CardContent>
          </Card>

          {/* Top Rooms Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Top 10 Most Booked Rooms
              </CardTitle>
              <CardDescription>Rooms with the highest number of bookings</CardDescription>
            </CardHeader>
            <CardContent>
              {topRoomsData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No data available</div>
              ) : (
                <div className="h-96 w-full min-h-[384px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topRoomsData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="bookings" fill="#3b82f6" name="Bookings" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Time Slots Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Top 10 Most Popular Time Slots
              </CardTitle>
              <CardDescription>Time slots with the highest booking frequency</CardDescription>
            </CardHeader>
            <CardContent>
              {topSlotsData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No data available</div>
              ) : (
                <div className="h-96 w-full min-h-[384px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topSlotsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="bookings" fill="#f97316" name="Bookings" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Room Categories Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5" />
                Bookings by Room Category
              </CardTitle>
              <CardDescription>Distribution of bookings across room types</CardDescription>
            </CardHeader>
            <CardContent>
              {categoriesData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No data available</div>
              ) : (
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="h-96 w-full md:flex-1 min-h-[384px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoriesData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoriesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-3">
                    <h4 className="font-medium mb-4">Category Breakdown</h4>
                    {categoriesData.map((cat, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded" 
                            style={{ backgroundColor: cat.color }}
                          />
                          <span>{cat.name}</span>
                        </div>
                        <span className="font-medium">{cat.value} bookings</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Rooms Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Room Statistics</CardTitle>
              <CardDescription>Complete breakdown of room usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Rank</th>
                      <th className="text-left p-3">Room Name</th>
                      <th className="text-left p-3">Campus</th>
                      <th className="text-right p-3">Total Bookings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topRoomsData.map((room, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="p-3 text-gray-600">#{idx + 1}</td>
                        <td className="p-3">{room.name}</td>
                        <td className="p-3">
                          <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">
                            {room.campus}
                          </span>
                        </td>
                        <td className="p-3 text-right">{room.bookings}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}