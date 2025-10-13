import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  Users, 
  TrendingUp,
  Calendar,
  Shield,
  RefreshCw,
  Download,
  Filter
} from "lucide-react";

interface UserData {
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

interface MonthlyUserData {
  month: string;
  students: number;
  tutors: number;
  institutions: number;
  total: number;
}

interface UserDistributionData {
  name: string;
  value: number;
  color: string;
}

export default function ReportsAnalytics() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyUserData[]>([]);
  const [distributionData, setDistributionData] = useState<UserDistributionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const COLORS = {
    students: '#3B82F6', // Blue
    tutors: '#10B981',   // Green
    institutions: '#F59E0B', // Yellow
    total: '#8B5CF6'     // Purple
  };

  const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B'];

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate('/admin/login');
      return;
    }
    
    loadAnalyticsData();
    setupRealtimeSubscriptions();
  }, [navigate]);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // Load all users from profiles table
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, role, created_at')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Error loading users:', usersError);
        toast({
          title: "Error",
          description: "Failed to load analytics data",
          variant: "destructive",
        });
        return;
      }

      setUsers(usersData || []);
      processAnalyticsData(usersData || []);
      setLastUpdated(new Date());

      console.log('Analytics data loaded:', {
        totalUsers: usersData?.length || 0,
        students: usersData?.filter(u => u.role === 'student').length || 0,
        tutors: usersData?.filter(u => u.role === 'tutor').length || 0,
        institutions: usersData?.filter(u => u.role === 'institution').length || 0
      });

    } catch (error) {
      console.error('Error loading analytics data:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processAnalyticsData = (usersData: UserData[]) => {
    // Process monthly data
    const monthlyMap = new Map<string, { students: number; tutors: number; institutions: number }>();
    
    usersData.forEach(user => {
      const date = new Date(user.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { students: 0, tutors: 0, institutions: 0 });
      }
      
      const monthData = monthlyMap.get(monthKey)!;
      if (user.role === 'student') monthData.students++;
      else if (user.role === 'tutor') monthData.tutors++;
      else if (user.role === 'institution') monthData.institutions++;
    });

    // Convert to array and sort by month
    const monthlyArray: MonthlyUserData[] = Array.from(monthlyMap.entries())
      .map(([monthKey, data]) => ({
        month: new Date(monthKey + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        students: data.students,
        tutors: data.tutors,
        institutions: data.institutions,
        total: data.students + data.tutors + data.institutions
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    setMonthlyData(monthlyArray);

    // Process distribution data
    const roleCounts = {
      students: usersData.filter(u => u.role === 'student').length,
      tutors: usersData.filter(u => u.role === 'tutor').length,
      institutions: usersData.filter(u => u.role === 'institution').length
    };

    const distributionArray: UserDistributionData[] = [
      { name: 'Students', value: roleCounts.students, color: PIE_COLORS[0] },
      { name: 'Tutors', value: roleCounts.tutors, color: PIE_COLORS[1] },
      { name: 'Institutions', value: roleCounts.institutions, color: PIE_COLORS[2] }
    ].filter(item => item.value > 0); // Only show roles with users

    setDistributionData(distributionArray);
  };

  const setupRealtimeSubscriptions = () => {
    const profilesSubscription = supabase
      .channel('admin-reports-analytics')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'profiles' 
      }, () => {
        console.log('Profiles table changed, reloading analytics...');
        loadAnalyticsData();
      })
      .subscribe();

    return () => {
      profilesSubscription.unsubscribe();
    };
  };

  const getTotalUsers = () => users.length;
  const getStudentsCount = () => users.filter(u => u.role === 'student').length;
  const getTutorsCount = () => users.filter(u => u.role === 'tutor').length;
  const getInstitutionsCount = () => users.filter(u => u.role === 'institution').length;

  const getCurrentMonthGrowth = () => {
    const currentMonth = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    const currentMonthData = monthlyData.find(m => m.month === currentMonth);
    return currentMonthData?.total || 0;
  };

  const getPreviousMonthGrowth = () => {
    const currentDate = new Date();
    const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
    const previousMonthName = previousMonth.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    const previousMonthData = monthlyData.find(m => m.month === previousMonthName);
    return previousMonthData?.total || 0;
  };

  const getGrowthPercentage = () => {
    const current = getCurrentMonthGrowth();
    const previous = getPreviousMonthGrowth();
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Reports & Analytics</h1>
                <p className="text-xs text-gray-500">User Analytics and Insights</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {lastUpdated && (
                <div className="text-sm text-gray-500">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadAnalyticsData}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/admin/dashboard')}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {getTotalUsers()}
              </div>
              <p className="text-xs text-gray-500">
                All registered users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Students</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {getStudentsCount()}
              </div>
              <p className="text-xs text-gray-500">
                {getTotalUsers() > 0 ? Math.round((getStudentsCount() / getTotalUsers()) * 100) : 0}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Tutors</CardTitle>
              <Users className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {getTutorsCount()}
              </div>
              <p className="text-xs text-gray-500">
                {getTotalUsers() > 0 ? Math.round((getTutorsCount() / getTotalUsers()) * 100) : 0}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Institutions</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {getInstitutionsCount()}
              </div>
              <p className="text-xs text-gray-500">
                {getTotalUsers() > 0 ? Math.round((getInstitutionsCount() / getTotalUsers()) * 100) : 0}% of total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Growth Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>Monthly Growth</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-600">
                  +{getCurrentMonthGrowth()}
                </div>
                <p className="text-sm text-gray-600">New users this month</p>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${getGrowthPercentage() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {getGrowthPercentage() >= 0 ? '+' : ''}{getGrowthPercentage()}%
                </div>
                <p className="text-sm text-gray-600">vs last month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bar Chart - New Users Per Month */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <span>New Users Per Month</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value, name) => [value, name]}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Bar dataKey="students" stackId="a" fill={COLORS.students} name="Students" />
                    <Bar dataKey="tutors" stackId="a" fill={COLORS.tutors} name="Tutors" />
                    <Bar dataKey="institutions" stackId="a" fill={COLORS.institutions} name="Institutions" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pie Chart - User Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChartIcon className="h-5 w-5 text-green-600" />
                <span>User Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {distributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  <div className="text-center">
                    <PieChartIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Data Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              <span>Data Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Monthly Breakdown</h4>
                <div className="space-y-1">
                  {monthlyData.slice(-3).map((month, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">{month.month}</span>
                      <span className="font-medium">{month.total} users</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Role Distribution</h4>
                <div className="space-y-1">
                  {distributionData.map((role, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: role.color }}
                      ></div>
                      <span className="text-sm text-gray-600">{role.name}: {role.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Growth Metrics</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">This Month:</span>
                    <span className="font-medium text-green-600">+{getCurrentMonthGrowth()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Growth Rate:</span>
                    <span className={`font-medium ${getGrowthPercentage() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {getGrowthPercentage() >= 0 ? '+' : ''}{getGrowthPercentage()}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Users:</span>
                    <span className="font-medium">{getTotalUsers()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
