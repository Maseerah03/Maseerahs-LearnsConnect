import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { isAdminAuthenticated, adminLogout } from "@/lib/admin-auth";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, LogOut, Users, GraduationCap, Building2, BookOpen, UserCheck, RefreshCw } from "lucide-react";

interface DashboardStats {
  totalStudents: number;
  totalTutors: number;
  totalInstitutions: number;
  totalCourses: number;
  totalEnrollments: number;
  isLoading: boolean;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTutors: 0,
    totalInstitutions: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    isLoading: true
  });

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate('/admin/login');
      return;
    }
    
    loadDashboardStats();
    setupRealtimeSubscriptions();
  }, [navigate]);

  const loadDashboardStats = async () => {
    try {
      setStats(prev => ({ ...prev, isLoading: true }));

      // Load all stats in parallel
      const [
        profilesResult,
        coursesResult,
        institutionCoursesResult,
        enrollmentsResult
      ] = await Promise.allSettled([
        // Get user counts from profiles table (this has the role information)
        supabase
        .from('profiles')
          .select('role'),
        
        // Count tutor courses
        supabase
          .from('courses')
          .select('id', { count: 'exact', head: true }),
        
        // Count institution courses
        supabase
          .from('institution_courses')
          .select('id', { count: 'exact', head: true }),
        
        // Count enrollments - try with different approaches
        supabase
          .from('course_enrollments')
          .select('*', { count: 'exact', head: true })
      ]);

      // Process user counts from profiles table
      let totalStudents = 0;
      let totalTutors = 0;
      let totalInstitutions = 0;

      if (profilesResult.status === 'fulfilled' && profilesResult.value.data) {
        const roleCounts = profilesResult.value.data.reduce((acc, profile) => {
          acc[profile.role] = (acc[profile.role] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        totalStudents = roleCounts.student || 0;
        totalTutors = roleCounts.tutor || 0;
        totalInstitutions = roleCounts.institution || 0;
      }

      const totalTutorCourses = coursesResult.status === 'fulfilled' ? coursesResult.value.count || 0 : 0;
      const totalInstitutionCourses = institutionCoursesResult.status === 'fulfilled' ? institutionCoursesResult.value.count || 0 : 0;
      
      // Handle enrollments with fallback for RLS issues
      let totalEnrollments = 0;
      if (enrollmentsResult.status === 'fulfilled') {
        totalEnrollments = enrollmentsResult.value.count || 0;
      } else {
        // Fallback: try to get enrollments data directly if count query fails due to RLS
        console.log('Enrollments count query failed, trying direct data fetch...');
        try {
          const { data: enrollmentsData, error: enrollmentsError } = await supabase
            .from('course_enrollments')
            .select('id');
          
          if (!enrollmentsError && enrollmentsData) {
            totalEnrollments = enrollmentsData.length;
            console.log('Enrollments fetched directly:', totalEnrollments);
      } else {
            console.log('Direct enrollments fetch also failed:', enrollmentsError);
          }
        } catch (fallbackError) {
          console.log('Fallback enrollments fetch error:', fallbackError);
        }
      }

      setStats({
        totalStudents,
        totalTutors,
        totalInstitutions,
        totalCourses: totalTutorCourses + totalInstitutionCourses,
        totalEnrollments,
        isLoading: false
      });

      console.log('Dashboard stats loaded:', {
        totalStudents,
        totalTutors,
        totalInstitutions,
        totalCourses: totalTutorCourses + totalInstitutionCourses,
        totalEnrollments,
        sources: {
          users: 'profiles',
          courses: coursesResult.status === 'fulfilled' ? 'courses' : 'none',
          institutionCourses: institutionCoursesResult.status === 'fulfilled' ? 'institution_courses' : 'none',
          enrollments: enrollmentsResult.status === 'fulfilled' ? 'course_enrollments' : 'none'
        },
        profileData: profilesResult.status === 'fulfilled' ? profilesResult.value.data : null,
        detailedResults: {
          profilesResult: profilesResult.status,
          coursesResult: coursesResult.status,
          institutionCoursesResult: institutionCoursesResult.status,
          enrollmentsResult: enrollmentsResult.status,
          enrollmentsData: enrollmentsResult.status === 'fulfilled' ? enrollmentsResult.value : enrollmentsResult.status === 'rejected' ? enrollmentsResult.reason : null
        }
      });

    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      setStats(prev => ({ ...prev, isLoading: false }));
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics. Please check the console for details.",
        variant: "destructive",
      });
    }
  };

  const setupRealtimeSubscriptions = () => {
    const subscriptions: any[] = [];

    // Subscribe to profiles table changes (main user data source)
    const profilesSubscription = supabase
      .channel('admin-dashboard-profiles')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'profiles' 
      }, () => {
        console.log('profiles table changed, reloading stats...');
        loadDashboardStats();
      })
      .subscribe();
    subscriptions.push(profilesSubscription);

    // Subscribe to courses table changes
    const coursesSubscription = supabase
      .channel('admin-dashboard-courses')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'courses' 
      }, () => {
        console.log('courses table changed, reloading stats...');
        loadDashboardStats();
      })
      .subscribe();
    subscriptions.push(coursesSubscription);

    // Subscribe to institution_courses table changes
    const institutionCoursesSubscription = supabase
      .channel('admin-dashboard-institution-courses')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'institution_courses' 
      }, () => {
        console.log('institution_courses table changed, reloading stats...');
        loadDashboardStats();
      })
      .subscribe();
    subscriptions.push(institutionCoursesSubscription);

    // Subscribe to course_enrollments table changes
    const enrollmentsSubscription = supabase
      .channel('admin-dashboard-enrollments')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'course_enrollments' 
      }, () => {
        console.log('course_enrollments table changed, reloading stats...');
        loadDashboardStats();
      })
      .subscribe();
    subscriptions.push(enrollmentsSubscription);

    // Cleanup function
    return () => {
      subscriptions.forEach(subscription => {
        if (subscription && typeof subscription.unsubscribe === 'function') {
          subscription.unsubscribe();
        }
      });
    };
  };

  const handleLogout = () => {
    adminLogout();
      toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    navigate('/admin/login');
  };

  const handleRefresh = () => {
    loadDashboardStats();
      toast({
      title: "Data Refreshed",
      description: "Dashboard statistics have been updated",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
                <p className="text-xs text-gray-500">Platform Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  Welcome, <span className="font-medium">Admin</span>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                onClick={handleRefresh}
                disabled={stats.isLoading}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                <RefreshCw className={`h-4 w-4 mr-2 ${stats.isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Overview Cards */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Real-time statistics and platform metrics</p>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {/* Total Students Card */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.isLoading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                ) : (
                  stats.totalStudents.toLocaleString()
                        )}
                      </div>
              <p className="text-xs text-gray-500 mt-1">Registered students</p>
              </CardContent>
            </Card>

          {/* Total Tutors Card */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Tutors</CardTitle>
              <GraduationCap className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.isLoading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                ) : (
                  stats.totalTutors.toLocaleString()
                          )}
                        </div>
              <p className="text-xs text-gray-500 mt-1">Verified tutors</p>
              </CardContent>
            </Card>

          {/* Total Institutions Card */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Institutions</CardTitle>
              <Building2 className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.isLoading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                ) : (
                  stats.totalInstitutions.toLocaleString()
                        )}
                      </div>
              <p className="text-xs text-gray-500 mt-1">Educational institutions</p>
              </CardContent>
            </Card>

          {/* Total Courses Card */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.isLoading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                ) : (
                  stats.totalCourses.toLocaleString()
                        )}
                      </div>
              <p className="text-xs text-gray-500 mt-1">Available courses</p>
              </CardContent>
            </Card>

          {/* Total Enrollments Card */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Enrollments</CardTitle>
              <UserCheck className="h-4 w-4 text-indigo-600" />
              </CardHeader>
              <CardContent>
              <div className="text-2xl font-bold text-indigo-600">
                {stats.isLoading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                ) : (
                  stats.totalEnrollments.toLocaleString()
                        )}
                      </div>
              <p className="text-xs text-gray-500 mt-1">Course enrollments</p>
              </CardContent>
            </Card>
                        </div>

        {/* Platform Status Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-blue-900 mb-1">Platform Status</h2>
                  <p className="text-blue-700">
                    {stats.isLoading ? (
                      "Loading platform statistics..."
                    ) : (
                      `Active platform with ${stats.totalStudents + stats.totalTutors + stats.totalInstitutions} total users`
                    )}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-600 font-medium">Last Updated</div>
                <div className="text-sm text-blue-900">
                  {new Date().toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button 
                onClick={() => navigate('/admin/users')}
                className="h-20 flex flex-col items-center justify-center space-y-2 bg-blue-50 hover:bg-blue-100 border-blue-200"
              >
                <Users className="h-6 w-6 text-blue-600" />
                <span className="text-blue-800 font-medium">Manage Users</span>
                <span className="text-xs text-blue-600">View, suspend, delete users</span>
              </Button>
              
              <Button 
                onClick={() => navigate('/admin/courses')}
                className="h-20 flex flex-col items-center justify-center space-y-2 bg-green-50 hover:bg-green-100 border-green-200"
              >
                <BookOpen className="h-6 w-6 text-green-600" />
                <span className="text-green-800 font-medium">Manage Courses</span>
                <span className="text-xs text-green-600">View, deactivate courses</span>
              </Button>
              
              <Button 
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
                disabled
              >
                <UserCheck className="h-6 w-6 text-gray-400" />
                <span className="text-gray-600 font-medium">Manage Enrollments</span>
                <span className="text-xs text-gray-500">Coming soon</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Debug Information Card */}
        <Card className="mt-6 bg-gray-50 border-gray-200">
              <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Data Sources & Debug</CardTitle>
                  </CardHeader>
                  <CardContent>
            <div className="text-xs text-gray-500 space-y-1">
              <p>• <strong>Users:</strong> profiles table (student, tutor, institution roles)</p>
              <p>• <strong>Courses:</strong> courses + institution_courses tables</p>
              <p>• <strong>Enrollments:</strong> course_enrollments table</p>
              <p>• Real-time updates active for all tables</p>
              <p>• Check browser console for detailed statistics</p>
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-yellow-800 font-medium">Enrollments Debug:</p>
                <p className="text-yellow-700">If enrollments show 0, run the check_enrollments_data.sql script to see if the table has data.</p>
                      </div>
                      </div>
                  </CardContent>
                </Card>
      </main>
    </div>
  );
}