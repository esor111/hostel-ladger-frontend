import React, { useState, useEffect } from 'react'
import { dashboardService } from '../services/dashboardService.js'
import { Users, Building, Bed, TrendingUp, Calendar, DollarSign, AlertCircle, CheckCircle } from 'lucide-react'

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await dashboardService.getDashboardData()
      setDashboardData(data)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-lg text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg text-red-600 mb-2">Error Loading Dashboard</p>
            <p className="text-gray-600">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-gray-600">No dashboard data available</p>
        </div>
      </div>
    )
  }

  // Extract data from API response
  const { summary, monthlyData, guestTypeData, performanceMetrics } = dashboardData
  const totalBookings = summary.totalBookings
  const monthlyRevenue = summary.monthlyRevenue
  const avgOccupancy = summary.avgOccupancy
  const occupancyGrowth = summary.occupancyGrowth

  const stats = [
    {
      title: 'Monthly Revenue',
      value: `₨${monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      change: `+${summary.revenueGrowth}%`,
      changeType: 'positive'
    },
    {
      title: 'Total Bookings',
      value: totalBookings,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      change: `+${summary.bookingsGrowth}%`,
      changeType: 'positive'
    },
    {
      title: 'Occupancy Rate',
      value: `${avgOccupancy}%`,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      change: `+${occupancyGrowth}%`,
      changeType: 'positive'
    },
    {
      title: 'Growth Rate',
      value: `${summary.growthRate}%`,
      icon: Building,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      change: 'This Month',
      changeType: 'neutral'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dashboard Overview
              </h1>
              <p className="text-gray-600 mt-1">Welcome back! Here's what's happening at your hostel today.</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadData}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <TrendingUp className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>{new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.title}
                className="group relative overflow-hidden bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                {/* Content */}
                <div className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.textColor}`} />
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                        stat.changeType === 'positive' 
                          ? 'bg-green-100 text-green-700' 
                          : stat.changeType === 'negative'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {stat.change}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>

                  {/* Progress bar for occupancy */}
                  {stat.title === 'Occupancy Rate' && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-gradient-to-r ${stat.color} transition-all duration-1000 ease-out`}
                          style={{ width: `${avgOccupancy}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="group p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200">
              <div className="text-center">
                <Users className="h-8 w-8 text-gray-400 group-hover:text-blue-500 mx-auto mb-2 transition-colors" />
                <h3 className="font-medium text-gray-900 group-hover:text-blue-700">Add New Student</h3>
                <p className="text-sm text-gray-500 mt-1">Register a new student</p>
              </div>
            </button>
            
            <button className="group p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200">
              <div className="text-center">
                <Building className="h-8 w-8 text-gray-400 group-hover:text-green-500 mx-auto mb-2 transition-colors" />
                <h3 className="font-medium text-gray-900 group-hover:text-green-700">Manage Rooms</h3>
                <p className="text-sm text-gray-500 mt-1">Configure room settings</p>
              </div>
            </button>
            
            <button className="group p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200">
              <div className="text-center">
                <DollarSign className="h-8 w-8 text-gray-400 group-hover:text-purple-500 mx-auto mb-2 transition-colors" />
                <h3 className="font-medium text-gray-900 group-hover:text-purple-700">Record Payment</h3>
                <p className="text-sm text-gray-500 mt-1">Process student payments</p>
              </div>
            </button>
          </div>
        </div>

        {/* Monthly Revenue Trend */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
            Monthly Revenue Trend
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {monthlyData.map((month, index) => (
              <div key={month.month} className="text-center">
                <div className="mb-2">
                  <div 
                    className="w-full bg-gray-200 rounded-full mx-auto"
                    style={{ height: '60px', position: 'relative' }}
                  >
                    <div 
                      className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        height: `${(month.revenue / Math.max(...monthlyData.map(m => m.revenue))) * 100}%`,
                        width: '100%',
                        position: 'absolute',
                        bottom: 0
                      }}
                    />
                  </div>
                </div>
                <p className="text-xs font-medium text-gray-600">{month.month}</p>
                <p className="text-sm font-bold text-gray-900">₨{(month.revenue / 1000).toFixed(0)}K</p>
                <p className="text-xs text-gray-500">{month.occupancy}% occ</p>
              </div>
            ))}
          </div>
        </div>

        {/* Guest Types and Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 text-purple-500 mr-2" />
              Guest Types Distribution
            </h2>
            <div className="space-y-3">
              {guestTypeData.map((guest, index) => {
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500'];
                const bgColors = ['bg-blue-50', 'bg-green-50', 'bg-purple-50', 'bg-orange-50', 'bg-red-50'];
                const textColors = ['text-blue-700', 'text-green-700', 'text-purple-700', 'text-orange-700', 'text-red-700'];
                
                return (
                  <div key={guest.name} className={`flex items-center justify-between p-3 ${bgColors[index]} rounded-lg`}>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 ${colors[index]} rounded-full mr-3`}></div>
                      <span className={`font-medium ${textColors[index]}`}>{guest.name}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-lg font-bold ${textColors[index]}`}>{guest.value}%</span>
                      <p className="text-xs text-gray-500">{guest.count} guests</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
              Performance Metrics
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="font-medium text-green-800">Avg Daily Rate</span>
                </div>
                <span className="text-2xl font-bold text-green-600">₨{performanceMetrics.averageDailyRate}</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="font-medium text-blue-800">Revenue Per Bed</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">₨{performanceMetrics.revenuePerAvailableBed}</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                  <span className="font-medium text-purple-800">Avg Length of Stay</span>
                </div>
                <span className="text-2xl font-bold text-purple-600">{performanceMetrics.averageLengthOfStay} days</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                  <span className="font-medium text-orange-800">Repeat Guest Rate</span>
                </div>
                <span className="text-2xl font-bold text-orange-600">{performanceMetrics.repeatGuestRate}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-orange-500 mr-2" />
              Recent Activity
            </h2>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">New student enrolled</p>
                  <p className="text-xs text-gray-500">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Payment received</p>
                  <p className="text-xs text-gray-500">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Room maintenance completed</p>
                  <p className="text-xs text-gray-500">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard