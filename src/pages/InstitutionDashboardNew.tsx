import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useInstitutionDashboard } from '@/hooks/useInstitutionDashboard';
import { AddCourseModal } from '@/components/courses/AddCourseModal';
import { ViewCourseModal } from '@/components/courses/ViewCourseModal';
import { EditCourseModal } from '@/components/courses/EditCourseModal';
import InstitutionProfileEditDialog from '@/components/institution/InstitutionProfileEditDialog';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
} from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Building2, 
  Users, 
  BookOpen,
  Plus,
  Trash2,
  Mail,
  Phone,
  GraduationCap, 
  Settings, 
  Eye,
  Star,
  Shield,
  CheckCircle,
  Clock,
  Upload,
  Loader2,
  AlertCircle,
  MessageSquare,
  UserPlus,
  DollarSign,
  Calendar,
  RefreshCw,
  BarChart3,
  CreditCard,
  ThumbsUp,
  Edit3,
  UserCheck,
  FileText,
  Menu,
  LogOut,
  Home as HomeIcon,
  Search,
  Grid3X3,
  List,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  MapPin,
  User,
  Edit3 as Edit,
  DollarSign as DollarSignIcon,
  X,
  TrendingUp,
  PieChart,
  Download,
  Share
} from 'lucide-react';

interface DashboardState {
  activeTab: string;
  showProfileDialog: boolean;
  selectedStudent: any;
  refreshTrigger: number;
  showEditProfileDialog: boolean;
}

// Global helper function to get current user ID safely
let currentUserGlobal: any = null;

const setCurrentUserGlobal = (user: any) => {
  currentUserGlobal = user;
};

const getCurrentUserId = () => {
  if (!currentUserGlobal) {
    console.error('❌ [InstitutionDashboard] No current user available');
    return null;
  }
  return currentUserGlobal.id;
};

export default function InstitutionDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Centralized user state to prevent profile mixing
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  
  const { profile, registrationData, stats, recentActivity, loading, error, refreshData } = useInstitutionDashboard();
  
  // Real-time status state
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Profile update function
  const handleProfileUpdate = async (updatedProfile: any) => {
    try {
      // Refresh the dashboard data to show updated profile
      await refreshData();
      toast({
        title: "Profile Updated",
        description: "Your institution profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Error refreshing profile data:', error);
      toast({
        title: "Error",
        description: "Profile updated but failed to refresh data. Please reload the page.",
        variant: "destructive",
      });
    }
  };

  // Enhanced refresh function with real-time status
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
      setLastRefreshTime(new Date());
      toast({
        title: "Data Refreshed",
        description: "Dashboard data has been updated successfully.",
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Initialize user authentication once
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error getting user:', error);
          navigate('/login');
          return;
        }
        if (!user) {
          navigate('/login');
          return;
        }
        setCurrentUser(user);
        setCurrentUserGlobal(user);
        console.log('🔐 [InstitutionDashboard] User initialized:', user.id, user.email);
      } catch (error) {
        console.error('Error initializing user:', error);
        navigate('/login');
      } finally {
        setUserLoading(false);
      }
    };
    
    initializeUser();
  }, [navigate]);
  
  const [state, setState] = useState<DashboardState>({
    activeTab: "dashboard",
    showProfileDialog: false,
    selectedStudent: null,
    refreshTrigger: 0,
    showEditProfileDialog: false,
  });
  
  // Show loading while user is being initialized
  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Initializing dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Redirect if no user
  if (!currentUser) {
    return null;
  }

  // Navigation menu items
  const navMenu = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <HomeIcon className="h-4 w-4" />,
    },
    {
      id: "inquiries",
      label: "Student Inquiries",
      icon: <MessageSquare className="h-4 w-4" />,
      badge: stats.newInquiries > 0 ? stats.newInquiries : undefined,
    },
    {
      id: "students",
      label: "My Students",
      icon: <Users className="h-4 w-4" />,
    },
    {
      id: "courses",
      label: "Courses & Batches",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      id: "faculty",
      label: "Faculty Management",
      icon: <UserCheck className="h-4 w-4" />,
    },
    {
      id: "admissions",
      label: "Admissions",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      id: "fees",
      label: "Fee Management",
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      id: "reports",
      label: "Reports & Analytics",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      id: "settings",
      label: "Profile Settings",
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex flex-col">
        <SidebarProvider>
          <div className="flex flex-1">
            <Sidebar className="bg-sidebar border-r">
              <SidebarContent>
                <div className="p-4 border-b">
                  <h2 className="text-lg font-bold text-primary">LearnsConnect</h2>
                  <p className="text-sm text-muted-foreground">Institution Dashboard</p>
          </div>
              </SidebarContent>
            </Sidebar>
            <main className="flex-1 p-4 sm:p-6 md:p-10 bg-background overflow-y-auto">
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-gray-600">Loading dashboard...</p>
                </div>
              </div>
            </main>
            </div>
        </SidebarProvider>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex flex-col">
        <SidebarProvider>
          <div className="flex flex-1">
            <Sidebar className="bg-sidebar border-r">
              <SidebarContent>
                <div className="p-4 border-b">
                  <h2 className="text-lg font-bold text-primary">LearnsConnect</h2>
                  <p className="text-sm text-muted-foreground">Institution Dashboard</p>
          </div>
              </SidebarContent>
            </Sidebar>
            <main className="flex-1 p-4 sm:p-6 md:p-10 bg-background overflow-y-auto">
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={refreshData} variant="outline">
                    Try Again
                  </Button>
                </div>
              </div>
            </main>
            </div>
        </SidebarProvider>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      <SidebarProvider>
        <div className="flex flex-1">
          {/* Sidebar Navigation */}
          <Sidebar className="bg-sidebar border-r">
            <SidebarContent>
              <div className="p-3 sm:p-4 border-b">
                <h2 className="text-base sm:text-lg font-bold text-primary">LearnsConnect</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {registrationData?.name || profile?.organization_name || "Institution Dashboard"}
                </p>
        </div>
              <SidebarMenu>
                {navMenu.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      isActive={state.activeTab === item.id}
                      onClick={() => setState(prev => ({ ...prev, activeTab: item.id }))}
                      className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base"
                    >
                      {item.icon}
                      <span className="hidden sm:inline">{item.label}</span>
                      <span className="sm:hidden">{item.label.split(' ')[0]}</span>
                      {item.badge && (
                        <SidebarMenuBadge className="text-xs">{item.badge}</SidebarMenuBadge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-destructive hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>

          {/* Main Dashboard Content */}
          <main className="flex-1 p-4 sm:p-6 md:p-10 bg-background overflow-y-auto">
            {/* Real-time Status Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-muted-foreground">
                    {isRealtimeConnected ? 'Live Data' : 'Offline'}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Last updated: {lastRefreshTime.toLocaleTimeString()}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>

            {state.activeTab === "dashboard" && (
              <DashboardHome 
                profile={profile}
                registrationData={registrationData}
                stats={stats}
                onViewProfile={() => setState(prev => ({ ...prev, showEditProfileDialog: true }))}
                onRefresh={handleRefresh}
                isRealtimeConnected={isRealtimeConnected}
                lastRefreshTime={lastRefreshTime}
              />
            )}

            {state.activeTab === "inquiries" && (
              <InquiriesDashboard 
                isRealtimeConnected={isRealtimeConnected}
                lastRefreshTime={lastRefreshTime}
                onRefresh={handleRefresh}
              />
            )}

            {state.activeTab === "students" && (
              <StudentsDashboard 
                isRealtimeConnected={isRealtimeConnected}
                lastRefreshTime={lastRefreshTime}
                onRefresh={handleRefresh}
              />
            )}

            {state.activeTab === "courses" && (
              <CoursesDashboard />
            )}

            {state.activeTab === "faculty" && (
              <FacultyDashboard 
                isRealtimeConnected={isRealtimeConnected}
                lastRefreshTime={lastRefreshTime}
                onRefresh={handleRefresh}
              />
            )}

            {state.activeTab === "admissions" && (
              <AdmissionsDashboard 
                isRealtimeConnected={isRealtimeConnected}
                lastRefreshTime={lastRefreshTime}
                onRefresh={handleRefresh}
              />
            )}

            {state.activeTab === "fees" && (
              <FeesDashboard 
                isRealtimeConnected={isRealtimeConnected}
                lastRefreshTime={lastRefreshTime}
                onRefresh={handleRefresh}
              />
            )}

            {state.activeTab === "reports" && (
              <ReportsDashboard 
                isRealtimeConnected={isRealtimeConnected}
                lastRefreshTime={lastRefreshTime}
                onRefresh={handleRefresh}
              />
            )}


            {state.activeTab === "settings" && (
              <SettingsDashboard 
                isRealtimeConnected={isRealtimeConnected}
                lastRefreshTime={lastRefreshTime}
                onRefresh={handleRefresh}
              />
            )}
          </main>
        </div>
      </SidebarProvider>

      {/* Edit Profile Dialog */}
      {state.showEditProfileDialog && (
        <InstitutionProfileEditDialog
          profile={profile}
          onUpdate={handleProfileUpdate}
          onClose={() => setState(prev => ({ ...prev, showEditProfileDialog: false }))}
        />
      )}
    </div>
  );
}

// Dashboard Home Component
function DashboardHome({ 
  profile, 
  registrationData,
  stats, 
  onViewProfile,
  onRefresh,
  isRealtimeConnected,
  lastRefreshTime
}: {
  profile: any;
  registrationData: any;
  stats: any;
  onViewProfile: () => void;
  onRefresh: () => void;
  isRealtimeConnected: boolean;
  lastRefreshTime: Date;
}) {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage 
              src={profile?.logo_url || ""} 
              alt={`${registrationData?.name || profile?.organization_name || "Institution"}'s logo`}
            />
            <AvatarFallback className="text-xl font-semibold">
              {registrationData?.name ? 
                registrationData.name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase() :
                <Building2 className="h-8 w-8" />
              }
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Welcome back, <span className="text-primary">{registrationData?.name || profile?.organization_name || "Institution"}</span>
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground text-sm">Profile Completion</span>
              <Progress value={stats.profileCompletion || 0} className="w-40 h-2" />
              <span className="text-sm font-semibold">{stats.profileCompletion || 0}%</span>
              <Button size="sm" className="ml-4 bg-gradient-primary" onClick={onViewProfile}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
                </Button>
              </div>
            </div>
            </div>
      </section>

            {/* Institution Header */}
            <div className="mb-6 lg:mb-8">
              <Card className="overflow-hidden shadow-lg border-0 bg-white">
                <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                {/* Left Side - Institution Info */}
                <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                  {/* Institution Logo */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shadow-lg">
                      <img 
                        src="/logo.jpg" 
                        alt="LearnsConnect Logo" 
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                  
                  {/* Institution Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                        {registrationData?.name || profile?.organization_name || 'Institution Name'}
                      </h1>
                      <Badge variant="outline" className={
                        profile?.verified 
                          ? "text-green-600 border-green-200" 
                          : "text-yellow-600 border-yellow-200"
                      }>
                        {profile?.verified ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 mr-1" />
                            Pending Verification
                          </>
                        )}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-4">
                      {profile?.description || registrationData?.name || 'Educational institution providing quality education'}
                      {(profile?.established_year || registrationData?.establishment_year) && ` since ${profile?.established_year || registrationData?.establishment_year}`}
                    </p>
                    
                    {/* Registration Details */}
                    {registrationData && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Type:</span>
                          <span className="font-medium">{registrationData.type}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Registration:</span>
                          <span className="font-medium">{registrationData.registration_number}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Contact:</span>
                          <span className="font-medium">{registrationData.primary_contact}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Location:</span>
                          <span className="font-medium">{registrationData.city}, {registrationData.state}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Rating and Reviews */}
                    {stats.overallRating > 0 && (
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex items-center space-x-1">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= Math.round(stats.overallRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-700 ml-1">
                            {stats.overallRating}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          ({stats.totalReviews} reviews)
                        </span>
                      </div>
                    )}
                    
                    {/* Key Metrics */}
                    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-6 text-sm">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-600">
                          {stats.totalStudents.toLocaleString()} students enrolled
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-green-500" />
                        <span className="text-gray-600">
                          {stats.activeCourses} active courses
                        </span>
                      </div>
                      {profile?.established_year && (
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-purple-500" />
                          <span className="text-gray-600">
                            Est. {profile.established_year}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Right Side - Actions and Status */}
                <div className="flex flex-col lg:items-end space-y-4">
                  {/* Profile Completion */}
                  <div className="w-full lg:w-64">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                      <span className="text-sm text-gray-500">{stats.profileCompletion}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${stats.profileCompletion}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Logo
                    </Button>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>



        {/* Institution Information Card */}
        {registrationData && (
          <div className="mb-6 lg:mb-8">
            <Card className="overflow-hidden shadow-lg border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Building2 className="w-6 h-6 text-primary" />
                  Institution Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 border-b pb-2">Basic Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Institution Name:</span>
                        <span className="font-medium">{registrationData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">{registrationData.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Established:</span>
                        <span className="font-medium">{registrationData.establishment_year}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Registration No:</span>
                        <span className="font-medium font-mono text-xs">{registrationData.registration_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">PAN:</span>
                        <span className="font-medium font-mono text-xs">{registrationData.pan}</span>
                      </div>
                      {registrationData.gst && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">GST:</span>
                          <span className="font-medium font-mono text-xs">{registrationData.gst}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 border-b pb-2">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Official Email:</span>
                        <span className="font-medium">{registrationData.official_email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Primary Contact:</span>
                        <span className="font-medium">{registrationData.primary_contact}</span>
                      </div>
                      {registrationData.secondary_contact && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Secondary Contact:</span>
                          <span className="font-medium">{registrationData.secondary_contact}</span>
                        </div>
                      )}
                      {registrationData.website && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Website:</span>
                          <a href={registrationData.website} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                            {registrationData.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 border-b pb-2">Address Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Address:</span>
                        <span className="font-medium text-right">{registrationData.complete_address}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">City:</span>
                        <span className="font-medium">{registrationData.city}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">State:</span>
                        <span className="font-medium">{registrationData.state}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pincode:</span>
                        <span className="font-medium">{registrationData.pincode}</span>
                      </div>
                      {registrationData.landmark && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Landmark:</span>
                          <span className="font-medium">{registrationData.landmark}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Owner Information */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold text-gray-900 border-b pb-2 mb-4">Owner Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Owner Name:</span>
                      <span className="font-medium">{registrationData.owner_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Owner Contact:</span>
                      <span className="font-medium">{registrationData.owner_contact}</span>
                    </div>
                  </div>
                </div>

                {/* Verification Status */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold text-gray-900 border-b pb-2 mb-4">Verification Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Primary Contact Verified:</span>
                      <Badge variant={registrationData.primary_contact_verified ? "default" : "secondary"}>
                        {registrationData.primary_contact_verified ? "Verified" : "Pending"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Owner Contact Verified:</span>
                      <Badge variant={registrationData.owner_contact_verified ? "default" : "secondary"}>
                        {registrationData.owner_contact_verified ? "Verified" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}




          </div>
  );
}

// Payment-Gated Inquiries Dashboard
function InquiriesDashboard({ 
  isRealtimeConnected, 
  lastRefreshTime, 
  onRefresh 
}: {
  isRealtimeConnected: boolean;
  lastRefreshTime: Date;
  onRefresh: () => void;
}) {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [inquiriesData, setInquiriesData] = useState({
    inquiries: [],
    stats: {
      total: 0,
      new: 0,
      paid: 0,
      unpaid: 0,
      thisMonth: 0
    }
  });
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showInquiryDetails, setShowInquiryDetails] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(50); // Default payment amount

  // Real data fetching from database
  useEffect(() => {
    loadInquiriesData();
  }, [selectedStatus, selectedPriority]);

  const loadInquiriesData = async () => {
    setIsLoading(true);
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User not authenticated');
        setIsLoading(false);
        return;
      }

      console.log('Current user:', user);
      console.log('User ID:', user.id);

      // Fetch inquiries data from database
      const [inquiries, stats] = await Promise.all([
        fetchInquiries(user.id),
        fetchInquiriesStats(user.id)
      ]);

      setInquiriesData({
        inquiries,
        stats
      });

    } catch (error) {
      console.error('Error loading inquiries data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch inquiries data from messages table
  const fetchInquiries = async (userId: string) => {
    try {
      console.log('Fetching inquiries for user ID:', userId);
      
      // Fetch real inquiries from student_inquiries table
      const { data: inquiriesData, error: inquiriesError } = await supabase
        .from('student_inquiries')
        .select('*')
        .eq('institution_id', userId)
        .order('created_at', { ascending: false });

      console.log('Inquiries query result:', { inquiriesData, inquiriesError });

      if (inquiriesError) {
        console.error('Error fetching inquiries:', inquiriesError);
        return [];
      }

      // Transform the data to match the expected format
      const transformedInquiries = (inquiriesData || []).map((inquiry: any) => ({
        id: inquiry.id,
        studentName: inquiry.student_name,
        studentEmail: inquiry.student_email,
        studentPhone: '',
        courseName: inquiry.course_interest,
        inquiryDate: inquiry.created_at,
        status: inquiry.status,
        priority: 'medium', // Default priority since it's not in the table
        message: inquiry.message,
        paymentStatus: 'unpaid', // Default since payment info is not in the table
        paymentAmount: 0,
        paymentDate: null,
        source: 'website', // Default source
        followUpDate: null,
        notes: '',
        isPaid: false
      }));

      // Filter by status and priority
      let filteredInquiries = transformedInquiries;
      if (selectedStatus !== 'all') {
        filteredInquiries = filteredInquiries.filter(inquiry => inquiry.status === selectedStatus);
      }
      if (selectedPriority !== 'all') {
        filteredInquiries = filteredInquiries.filter(inquiry => inquiry.priority === selectedPriority);
      }

      return filteredInquiries;
    } catch (error) {
      console.error('Error in fetchInquiries:', error);
      return [];
    }
  };

  // Fetch inquiries statistics
  const fetchInquiriesStats = async (userId: string) => {
    try {
      const inquiries = await fetchInquiries(userId);
      
      const stats = {
        total: inquiries.length,
        new: inquiries.filter(i => i.status === 'new').length,
        paid: inquiries.filter(i => i.isPaid).length,
        unpaid: inquiries.filter(i => !i.isPaid).length,
        thisMonth: inquiries.filter(i => {
          const inquiryDate = new Date(i.inquiryDate);
          const now = new Date();
          return inquiryDate.getMonth() === now.getMonth() && inquiryDate.getFullYear() === now.getFullYear();
        }).length
      };

      return stats;
    } catch (error) {
      console.error('Error in fetchInquiriesStats:', error);
      return {
        total: 0,
        new: 0,
        paid: 0,
        unpaid: 0,
        thisMonth: 0
      };
    }
  };

  const handleStatusChange = async (inquiryId: string, newStatus: string) => {
    try {
      // Update the status in the database
      const { error } = await supabase
        .from('student_inquiries')
        .update({ status: newStatus })
        .eq('id', inquiryId);

      if (error) {
        throw error;
      }

      console.log(`Updated inquiry ${inquiryId} to status: ${newStatus}`);
      
      // Update local state
      setInquiriesData(prev => ({
        ...prev,
        inquiries: prev.inquiries.map(inquiry => 
          inquiry.id === inquiryId ? { ...inquiry, status: newStatus } : inquiry
        )
      }));

      // Refresh stats
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const stats = await fetchInquiriesStats(user.id);
        setInquiriesData(prev => ({
          ...prev,
          stats
        }));
      }

    } catch (error) {
      console.error('Error updating inquiry status:', error);
    }
  };

  const handlePaymentProcess = async (inquiryId: string) => {
    try {
      // In real implementation, this would process payment
      console.log(`Processing payment for inquiry ${inquiryId}, amount: $${paymentAmount}`);
      
      // Update local state
      setInquiriesData(prev => ({
        ...prev,
        inquiries: prev.inquiries.map(inquiry => 
          inquiry.id === inquiryId ? { 
            ...inquiry, 
            isPaid: true, 
            paymentStatus: 'paid',
            paymentDate: new Date().toISOString()
          } : inquiry
        )
      }));

      // Refresh stats
      const stats = await fetchInquiriesStats('current_user');
      setInquiriesData(prev => ({
        ...prev,
        stats
      }));

      setShowPaymentModal(false);
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'interested': return 'bg-green-100 text-green-800';
      case 'admitted': return 'bg-purple-100 text-purple-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (isPaid: boolean) => {
    return isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const filteredInquiries = inquiriesData.inquiries.filter(inquiry =>
    inquiry.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inquiry.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inquiry.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Student Inquiries</h2>
          <p className="text-muted-foreground">Manage inquiries from potential students</p>
        </div>
        <Button 
          variant="outline" 
          onClick={loadInquiriesData}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Inquiries</p>
                <p className="text-2xl font-bold">{inquiriesData.stats.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">New Inquiries</p>
                <p className="text-2xl font-bold">{inquiriesData.stats.new}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">{inquiriesData.stats.thisMonth}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unpaid</p>
                <p className="text-2xl font-bold">{inquiriesData.stats.unpaid}</p>
              </div>
              <DollarSign className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search inquiries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="interested">Interested</SelectItem>
            <SelectItem value="admitted">Admitted</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Inquiries List */}
      {isLoading ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading inquiries...</p>
          </div>
        </Card>
      ) : filteredInquiries.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <MessageSquare className="w-12 h-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">No Inquiries Found</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedStatus !== 'all' || selectedPriority !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Student inquiries will appear here when they contact you about your courses.'
                }
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredInquiries.map((inquiry) => (
            <Card key={inquiry.id} className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedInquiry(inquiry);
                    setShowInquiryDetails(true);
                  }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {inquiry.studentName?.charAt(0) || 'S'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-lg">{inquiry.studentName}</h4>
                      <p className="text-muted-foreground">{inquiry.studentEmail}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge variant="outline" className="text-blue-600">
                          {inquiry.courseName}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(inquiry.inquiryDate).toLocaleDateString()}
                        </span>
                      </div>
                      {inquiry.message && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {inquiry.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={inquiry.status === 'new' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {inquiry.status}
                    </Badge>
                    <Badge 
                      variant="outline"
                      className={inquiry.priority === 'high' ? 'text-red-600 border-red-600' : 
                                inquiry.priority === 'medium' ? 'text-yellow-600 border-yellow-600' : 
                                'text-green-600 border-green-600'}
                    >
                      {inquiry.priority}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function StudentsDashboard({ 
  isRealtimeConnected, 
  lastRefreshTime, 
  onRefresh 
}: {
  isRealtimeConnected: boolean;
  lastRefreshTime: Date;
  onRefresh: () => void;
}) {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch student enrollments on component mount
  useEffect(() => {
    fetchStudentEnrollments();
  }, []);

  const fetchStudentEnrollments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching student enrollments for institution:', user.id);

      // First, get the institution's courses
      const { data: institutionCourses, error: coursesError } = await supabase
        .from('institution_courses')
        .select('id, title, description, category, institution_id')
        .eq('institution_id', user.id);

      if (coursesError) {
        console.error('Error fetching institution courses:', coursesError);
        throw new Error('Failed to fetch institution courses');
      }

      console.log('Institution courses fetched:', institutionCourses);
      console.log('Number of courses found:', institutionCourses?.length || 0);

      if (!institutionCourses || institutionCourses.length === 0) {
        console.log('No courses found for this institution');
        setEnrollments([]);
        return;
      }

      const courseIds = institutionCourses.map(course => course.id);
      console.log('Institution course IDs:', courseIds);

      // Then fetch enrollments for these courses
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('course_enrollments')
        .select(`
          id,
          student_id,
          course_id,
          status,
          enrolled_at,
          created_at
        `)
        .in('course_id', courseIds)
        .eq('status', 'enrolled')
        .order('enrolled_at', { ascending: false });

      if (enrollmentError) {
        console.error('Error fetching enrollments:', enrollmentError);
        throw new Error('Failed to fetch student enrollments');
      }

      console.log('Student enrollments fetched:', enrollmentData);
      console.log('Total enrollments found:', enrollmentData?.length || 0);

      // Check for self-enrollments (institution enrolling in their own course)
      const selfEnrollments = (enrollmentData || []).filter(e => e.student_id === user.id);
      const realStudentEnrollments = (enrollmentData || []).filter(e => e.student_id !== user.id);
      
      console.log('🔍 ENROLLMENT ANALYSIS:');
      console.log('Current user ID (institution):', user.id);
      console.log('All enrollment student IDs:', enrollmentData?.map(e => e.student_id) || []);
      console.log('Self-enrollments (institution enrolling in own course):', selfEnrollments.length);
      console.log('Real student enrollments:', realStudentEnrollments.length);
      
      if (selfEnrollments.length > 0) {
        console.warn('⚠️ DATA INTEGRITY ISSUE: Institution is enrolled in their own course!');
        console.warn('Self-enrollment details:', selfEnrollments);
      }

      // Use only real student enrollments (filter out self-enrollments)
      let validEnrollments = realStudentEnrollments;
      console.log('Using valid enrollments (excluding self-enrollments):', validEnrollments.length);
      
      // If no valid enrollments, show all enrollments for debugging
      if (validEnrollments.length === 0 && enrollmentData && enrollmentData.length > 0) {
        console.warn('⚠️ No valid enrollments after filtering! All enrollments appear to be self-enrollments.');
        console.warn('This indicates a data integrity issue - institution enrolled in their own course.');
        console.warn('Recommendation: Delete self-enrollments from database.');
        // Don't show self-enrollments in UI - keep validEnrollments empty
      }

      // Fetch student profiles for the enrolled students
      const studentIds = [...new Set(validEnrollments?.map(e => e.student_id) || [])];
      console.log('Student IDs to fetch profiles for:', studentIds);
      console.log('Raw enrollment data:', validEnrollments);

      let studentProfiles = [];
      if (studentIds.length > 0) {
        console.log('🔍 PROFILE FETCHING DEBUG:');
        console.log('Searching for profiles with IDs:', studentIds);
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email, role, created_at')
          .in('id', studentIds);

        if (profilesError) {
          console.error('Error fetching student profiles:', profilesError);
          console.error('Profile error details:', {
            code: profilesError.code,
            message: profilesError.message,
            details: profilesError.details,
            hint: profilesError.hint
          });
        } else {
          studentProfiles = profilesData || [];
          console.log('Student profiles fetched:', studentProfiles);
          console.log('Number of profiles found:', studentProfiles.length);
          
          // Check if we found profiles for all students
          const foundProfileIds = studentProfiles.map(p => p.id);
          const missingProfileIds = studentIds.filter(id => !foundProfileIds.includes(id));
          if (missingProfileIds.length > 0) {
            console.warn('⚠️ Missing profiles for student IDs:', missingProfileIds);
            
            // Try to fetch from users table as fallback
            console.log('🔍 Trying to fetch from users table as fallback...');
            const { data: usersData, error: usersError } = await supabase
              .from('users')
              .select('id, email, created_at')
              .in('id', missingProfileIds);
              
            if (usersError) {
              console.error('Error fetching from users table:', usersError);
            } else {
              console.log('Users data fetched:', usersData);
              // Add users data to studentProfiles with fallback names
              const fallbackProfiles = (usersData || []).map(user => ({
                id: user.id,
                full_name: `Student ${user.id.slice(0, 8)}...`,
                email: user.email || 'No email available',
                role: 'student',
                created_at: user.created_at
              }));
              studentProfiles = [...studentProfiles, ...fallbackProfiles];
              console.log('Combined profiles (profiles + users fallback):', studentProfiles);
            }
          }
        }
      }

      // Combine enrollment data with student profiles and course details
      const enrichedEnrollments = (validEnrollments || []).map(enrollment => {
        const studentProfile = studentProfiles.find(profile => profile.id === enrollment.student_id);
        const courseDetails = institutionCourses.find(course => course.id === enrollment.course_id);
        
        console.log(`Processing enrollment for student_id: ${enrollment.student_id}`);
        console.log(`Found profile:`, studentProfile);
        
        return {
          ...enrollment,
          student_name: studentProfile?.full_name || `Student ${enrollment.student_id.slice(0, 8)}...`,
          student_email: studentProfile?.email || `student_${enrollment.student_id.slice(0, 8)}@example.com`,
          course_title: courseDetails?.title || 'Unknown Course',
          course_description: courseDetails?.description || '',
          course_category: courseDetails?.category || '',
          has_profile: !!studentProfile,
          student_role: studentProfile?.role || 'unknown'
        };
      });

      setEnrollments(enrichedEnrollments);
      console.log('Enriched enrollments:', enrichedEnrollments);

    } catch (err) {
      console.error('Error in fetchStudentEnrollments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch student enrollments');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchStudentEnrollments();
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold text-gray-900">My Students</h2>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-xs text-muted-foreground">
                {isRealtimeConnected ? 'Live Data' : 'Offline'}
              </span>
            </div>
          </div>
          <p className="text-gray-600">Student enrollments and course details</p>
          <p className="text-xs text-gray-500 mt-1">Last updated: {lastRefreshTime.toLocaleTimeString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleRefresh}
            disabled={loading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : enrollments.length}
                </p>
                <p className="text-sm text-gray-500">Active student enrollments</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Students</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : 
                    new Set(enrollments.map(e => e.student_id)).size}
                </p>
                <p className="text-sm text-gray-500">Distinct enrolled students</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Courses Offered</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : 
                    new Set(enrollments.map(e => e.course_id)).size}
                </p>
                <p className="text-sm text-gray-500">Courses with enrollments</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-800">Error Loading Data</h3>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Integrity Warning */}
      {enrollments.length === 0 && !loading && !error && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-orange-800">No Valid Student Enrollments</h3>
                <p className="text-sm text-orange-600 mt-1">
                  All current enrollments appear to be self-enrollments (institution enrolled in own courses).
                </p>
                <p className="text-xs text-orange-500 mt-2">
                  This is a data integrity issue. Please clean up the database by removing self-enrollments.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enrollments List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Student Enrollments
                <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              </CardTitle>
              <p className="text-sm text-gray-600">Detailed view of all student enrollments</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <p className="text-gray-500">Loading student enrollments...</p>
            </div>
          ) : enrollments.length > 0 ? (
            <div className="space-y-4">
              {enrollments.map((enrollment) => (
                <Card key={enrollment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {enrollment.student_name?.charAt(0) || 'S'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{enrollment.student_name}</h3>
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              {enrollment.status.toUpperCase()}
                            </Badge>
                            {!enrollment.has_profile && (
                              <Badge variant="secondary" className="text-orange-600">
                                No Profile
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{enrollment.student_email}</p>
                          {!enrollment.has_profile && (
                            <p className="text-xs text-orange-600 mb-1">
                              Student ID: {enrollment.student_id}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mb-3">
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium text-gray-700">{enrollment.course_title}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-500">
                                Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          {enrollment.course_description && (
                            <p className="text-sm text-gray-600 line-clamp-2">{enrollment.course_description}</p>
                          )}
                          {enrollment.course_category && (
                            <Badge variant="secondary" className="mt-2">
                              {enrollment.course_category}
                            </Badge>
                          )}
                        </div>
                      </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                console.log('Viewing details for enrollment:', enrollment);
                                // You can add more functionality here like opening a modal
                                alert(`Student: ${enrollment.student_name}\nEmail: ${enrollment.student_email}\nCourse: ${enrollment.course_title}\nEnrolled: ${new Date(enrollment.enrolled_at).toLocaleDateString()}\nStatus: ${enrollment.status}`);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No student enrollments found</p>
              <p className="text-sm text-gray-400 mt-1">
                Students will appear here when they enroll in your courses
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CoursesDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // State for data
  const [courses, setCourses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Modal state
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [isViewCourseModalOpen, setIsViewCourseModalOpen] = useState(false);
  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);
  const [isCreateBatchModalOpen, setIsCreateBatchModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  
  // Batch form state
  const [batchFormData, setBatchFormData] = useState({
    batchName: '',
    courseId: '',
    startDate: '',
    endDate: '',
    classTimings: '',
    daysOfWeek: [] as string[],
    maxCapacity: '',
    assignedFaculty: '',
    classroomAssignment: '',
    feeSchedule: {
      type: 'fixed',
      amount: '',
      currency: 'INR',
      installments: 1
    }
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Set up real-time subscription for course enrollments
  useEffect(() => {
    let subscription: any = null;

  const setupSubscription = async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      console.log('No user found for real-time subscription');
      return;
    }

      console.log('Setting up real-time subscription for course enrollments...');

      // Subscribe to course_enrollments changes
      subscription = supabase
        .channel('course_enrollments_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'course_enrollments'
          },
          (payload) => {
            console.log('🔄 Course enrollment change detected:', payload);
            console.log('Event type:', payload.eventType);
            console.log('New record:', payload.new);
            console.log('Old record:', payload.old);
            
            // Only refresh if it's an enrollment change (not just any change)
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
              console.log('🔄 Refreshing enrollment data due to enrollment change...');
              refreshEnrollmentData();
            }
          }
        )
        .subscribe((status) => {
          console.log('Real-time subscription status:', status);
        });

      return subscription;
    };

    setupSubscription();

    return () => {
      if (subscription) {
        console.log('Unsubscribing from real-time updates...');
        subscription.unsubscribe();
      }
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current user
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // Fetch courses and batches
      const [coursesData, batchesData] = await Promise.all([
        loadCourses(userId),
        loadBatches(userId)
      ]);
      
      setCourses(coursesData);
      setBatches(batchesData);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Targeted refresh function for real-time updates
  const refreshEnrollmentData = async () => {
    try {
      setIsRefreshing(true);
      console.log('🔄 Refreshing enrollment data...');
      
      // Get current user
      const userId = getCurrentUserId();
      if (!userId) {
        console.error('No user found for refresh');
        return;
      }
      
      // Fetch courses and batches with fresh data
      const [coursesData, batchesData] = await Promise.all([
        loadCourses(userId),
        loadBatches(userId)
      ]);
      
      setCourses(coursesData);
      setBatches(batchesData);
      
      console.log('✅ Enrollment data refreshed successfully');
    } catch (err) {
      console.error('Error refreshing enrollment data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Test function to simulate enrollment changes (for debugging)
  const testEnrollmentUpdate = () => {
    console.log('🧪 Testing enrollment update...');
    refreshEnrollmentData();
  };

  // Test function to debug courses enrollment count specifically
  const testCoursesEnrollmentCount = async () => {
    console.log('🧪 Testing courses enrollment count...');
    const userId = getCurrentUserId();
    if (!userId) {
      console.error('No user found for test');
      return;
    }
    
    console.log('Testing loadCourses function directly...');
    const coursesData = await loadCourses(userId);
    console.log('Direct loadCourses result:', coursesData);
    setCourses(coursesData);
  };

  // Test function to debug student profile loading
  const testStudentProfileLoading = async () => {
    console.log('🧪 Testing student profile loading...');
    
    try {
      // First, let's check if there are any enrollments
      const userId = getCurrentUserId();
      if (!userId) {
        console.error('No user found');
        return;
      }

      // Get institution courses
      const { data: courses } = await supabase
        .from('institution_courses' as any)
        .select('id')
        .eq('institution_id', userId);

      if (!courses || courses.length === 0) {
        console.log('No institution courses found');
        return;
      }

      const courseIds = (courses as any[]).map((c: any) => c.id);
      console.log('Course IDs:', courseIds);

      // Get enrollments
      const { data: enrollments } = await supabase
        .from('course_enrollments' as any)
        .select('student_id')
        .in('course_id', courseIds)
        .eq('status', 'enrolled')
        .limit(1);

      if (!enrollments || enrollments.length === 0) {
        console.log('No enrollments found');
        return;
      }

      const studentId = (enrollments as any[])[0].student_id;
      console.log('Testing with student ID:', studentId);

      // Test profile query
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, created_at')
        .eq('id', studentId);

      if (error) {
        console.error('Profile query error:', error);
      } else if (!profiles || profiles.length === 0) {
        console.warn('No profile found for student_id:', studentId);
      } else {
        console.log('Profile query success:', profiles[0]);
      }
    } catch (err) {
      console.error('Test error:', err);
    }
  };

  // Test function to compare course vs batch enrollment loading
  const testCourseVsBatchEnrollments = async () => {
    console.log('🧪 Testing course vs batch enrollment loading...');
    
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        console.error('No user found');
        return;
      }

      console.log('=== COURSE ENROLLMENT TEST ===');
      // Test course enrollment loading (same as loadCourses)
      const { data: courses } = await supabase
        .from('institution_courses' as any)
        .select('id, title')
        .eq('institution_id', userId);

      if (courses && courses.length > 0) {
        const course = (courses as any[])[0];
        console.log('Testing course:', course.title, 'ID:', course.id);
        
        const { data: courseEnrollments, error: courseError } = await supabase
          .from('course_enrollments' as any)
          .select('id, student_id, status')
          .eq('course_id', course.id)
          .eq('status', 'enrolled');

        console.log('Course enrollments result:', { enrollments: courseEnrollments, error: courseError });
      }

      console.log('=== BATCH ENROLLMENT TEST ===');
      // Test batch enrollment loading (same as loadBatches)
      const { data: batches } = await supabase
        .from('institution_batches' as any)
        .select('id, batch_name, course_id')
        .eq('institution_id', userId);

      if (batches && batches.length > 0) {
        const batch = (batches as any[])[0];
        console.log('Testing batch:', (batch as any).batch_name, 'Course ID:', (batch as any).course_id);
        
        const { data: batchEnrollments, error: batchError } = await supabase
          .from('course_enrollments' as any)
          .select('id, student_id, status')
          .eq('course_id', (batch as any).course_id)
          .eq('status', 'enrolled');

        console.log('Batch enrollments result:', { enrollments: batchEnrollments, error: batchError });
      }

      console.log('=== COMPARISON ===');
      console.log('Courses found:', courses?.length || 0);
      console.log('Batches found:', batches?.length || 0);
      
    } catch (err) {
      console.error('Test error:', err);
    }
  };

  // Expose test functions to window for debugging
  useEffect(() => {
    (window as any).testEnrollmentUpdate = testEnrollmentUpdate;
    (window as any).testStudentProfileLoading = testStudentProfileLoading;
    (window as any).testCourseVsBatchEnrollments = testCourseVsBatchEnrollments;
    return () => {
      delete (window as any).testEnrollmentUpdate;
      delete (window as any).testStudentProfileLoading;
      delete (window as any).testCourseVsBatchEnrollments;
    };
  }, []);

  const loadCourses = async (userId: string) => {
    try {
      console.log('Loading courses for institution user:', userId);
      
      const { data: institutionCourses, error: coursesError } = await supabase
        .from('institution_courses' as any)
        .select('*')
        .eq('institution_id', userId)
        .order('created_at', { ascending: false });

      if (coursesError) {
        console.error('Error loading institution courses:', coursesError);
        return [];
      }

      console.log('Institution courses loaded:', institutionCourses);
      console.log('Number of courses found:', institutionCourses?.length || 0);
      
      // Load enrollment counts for each course
      const coursesWithEnrollments = await Promise.all(
        (institutionCourses || []).map(async (course: any) => {
          try {
            console.log(`Loading enrollments for course: ${course.title} (ID: ${course.id})`);
            
            const { data: enrollments, error: enrollmentError } = await supabase
              .from('course_enrollments' as any)
              .select('id, student_id, status')
              .eq('course_id', course.id)
              .eq('status', 'enrolled');

            if (enrollmentError) {
              console.error('Error loading enrollments for course:', course.id, enrollmentError);
              return {
                ...course,
                enrollment_count: 0
              };
            }

            console.log(`Found ${(enrollments as any[])?.length || 0} enrollments for course: ${course.title}`);
            console.log('Enrollment details:', enrollments);
            console.log('Course ID being queried:', course.id);
            console.log('Enrollment query result:', { enrollments, enrollmentError });

            const enrollmentCount = (enrollments as any[])?.length || 0;
            console.log(`Setting enrollment_count to ${enrollmentCount} for course: ${course.title}`);

            return {
              ...course,
              enrollment_count: enrollmentCount
            };
          } catch (error) {
            console.error('Error in enrollment query for course:', course.id, error);
            return {
              ...course,
              enrollment_count: 0
            };
          }
        })
      );
      
      // Additional debugging - check all courses without filter
      const { data: allCourses, error: allCoursesError } = await supabase
        .from('institution_courses' as any)
        .select('id, title, institution_id, created_at')
        .order('created_at', { ascending: false });
      
      console.log('All courses in database (for debugging):', allCourses);
      console.log('Current user ID:', userId);
      console.log('Final courses with enrollments:', JSON.stringify(coursesWithEnrollments, null, 2));
      console.log('Enrollment counts summary:', coursesWithEnrollments.map(c => ({ title: c.title, enrollment_count: c.enrollment_count })));
      
      return coursesWithEnrollments;
    } catch (err) {
      console.error('Error loading courses:', err);
      return [];
    }
  };

  const loadBatches = async (userId: string) => {
    try {
      console.log('Loading batches for institution user:', userId);
      
      const { data: institutionBatches, error: batchesError } = await supabase
        .from('institution_batches' as any)
        .select('*')
        .eq('institution_id', userId)
        .order('created_at', { ascending: false });

      console.log('Raw batches data:', institutionBatches);
      console.log('Batches error:', batchesError);

      if (batchesError) {
        console.error('❌ Error loading institution batches:', batchesError);
        return [];
      }

      if (!institutionBatches || institutionBatches.length === 0) {
        console.log('ℹ️ No batches found for institution user:', userId);
        return [];
      }

      console.log('✅ Found', institutionBatches.length, 'batches for institution user');

      // Load enrollment counts for each batch's course
      const batchesWithEnrollment = await Promise.all(
        (institutionBatches || []).map(async (batch: any) => {
          try {
            // Get the course ID from the batch
            const courseId = batch.course_id;
            console.log(`Loading enrollments for batch: ${batch.batch_name} (Course ID: ${courseId})`);
            
            // Count enrollments for this course
            const { data: enrollments, error: enrollmentError } = await supabase
              .from('course_enrollments' as any)
              .select('id, student_id, status')
              .eq('course_id', courseId)
              .eq('status', 'enrolled');

            if (enrollmentError) {
              console.error('Error loading enrollments for batch course:', courseId, enrollmentError);
              return {
                ...batch,
                current_enrollment: 0
              };
            }

            console.log(`Found ${(enrollments as any[])?.length || 0} enrollments for batch: ${batch.batch_name}`);
            console.log('Batch enrollment details:', enrollments);

            return {
              ...batch,
              current_enrollment: (enrollments as any[])?.length || 0
            };
          } catch (error) {
            console.error('Error in batch enrollment query:', batch.id, error);
            return {
              ...batch,
              current_enrollment: 0
            };
          }
        })
      );

      return batchesWithEnrollment;
    } catch (err) {
      console.error('Error loading batches:', err);
      return [];
    }
  };



  const handleCreateCourse = async (courseData: any) => {
    try {
      // Get current user
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      console.log('Creating course for user:', userId);

      // Upload syllabus file if provided
      let syllabusUrl = null;
      if (courseData.syllabus) {
        const fileExt = courseData.syllabus.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('institution-course-files')
          .upload(fileName, courseData.syllabus);
        
        if (uploadError) {
          console.error('Error uploading syllabus:', uploadError);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('institution-course-files')
            .getPublicUrl(fileName);
          syllabusUrl = publicUrl;
        }
      }

      // Upload course images if provided
      let imageUrls = [];
      if (courseData.images && courseData.images.length > 0) {
        for (const image of courseData.images) {
          const fileExt = image.name.split('.').pop();
          const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('institution-course-images')
            .upload(fileName, image);
          
          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('institution-course-images')
              .getPublicUrl(fileName);
            imageUrls.push(publicUrl);
          }
        }
      }

      // Create course in database
      const { data: newCourse, error } = await supabase
        .from('institution_courses' as any)
        .insert([{
          institution_id: userId,
          title: courseData.courseName,
          description: courseData.description,
          category: courseData.category,
          duration: courseData.duration,
          fee_structure: courseData.feeStructure,
          prerequisites: courseData.prerequisites || [],
          syllabus_url: syllabusUrl,
          certificate_details: courseData.certificateDetails,
          images: imageUrls,
          level: 'Beginner', // Default level
          status: 'Active'
        }])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setCourses(prev => [newCourse, ...prev]);
      
      console.log('Course created successfully:', newCourse);
      
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  };

  const handleViewCourse = (course: any) => {
    setSelectedCourse(course);
    setIsViewCourseModalOpen(true);
  };

  const handleEditCourse = (course: any) => {
    setSelectedCourse(course);
    setIsEditCourseModalOpen(true);
  };

  const handleUpdateCourse = async (courseId: string, courseData: any) => {
    try {
      // Upload syllabus file if provided
      let syllabusUrl = null;
      if (courseData.syllabus) {
        const userId = getCurrentUserId();
        if (userId) {
          const fileExt = courseData.syllabus.name.split('.').pop();
          const fileName = `${userId}/${Date.now()}.${fileExt}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('institution-course-files')
            .upload(fileName, courseData.syllabus);
          
          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('institution-course-files')
              .getPublicUrl(fileName);
            syllabusUrl = publicUrl;
          }
        }
      }

      // Upload course images if provided
      let imageUrls = [];
      if (courseData.images && courseData.images.length > 0) {
        const userId = getCurrentUserId();
        if (userId) {
          for (const image of courseData.images) {
            const fileExt = image.name.split('.').pop();
            const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('institution-course-images')
              .upload(fileName, image);
            
            if (!uploadError) {
              const { data: { publicUrl } } = supabase.storage
                .from('institution-course-images')
                .getPublicUrl(fileName);
              imageUrls.push(publicUrl);
            }
          }
        }
      }

      // Update course in database
      const updateData: any = {
        title: courseData.courseName,
        description: courseData.description,
        category: courseData.category,
        duration: courseData.duration,
        fee_structure: courseData.feeStructure,
        prerequisites: courseData.prerequisites || [],
        certificate_details: courseData.certificateDetails,
        level: courseData.level || 'Beginner',
        status: courseData.status || 'Active'
      };

      if (syllabusUrl) {
        updateData.syllabus_url = syllabusUrl;
      }

      if (imageUrls.length > 0) {
        updateData.images = imageUrls;
      }

      const { data: updatedCourse, error } = await supabase
        .from('institution_courses' as any)
        .update(updateData)
        .eq('id', courseId)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setCourses(prev => prev.map(course => 
        course.id === courseId ? updatedCourse : course
      ));
      
      // Close modals
      setIsEditCourseModalOpen(false);
      setIsViewCourseModalOpen(false);
      setSelectedCourse(null);
      
      console.log('Course updated successfully:', updatedCourse);
      
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  };

  const handleCloseModals = () => {
    setIsViewCourseModalOpen(false);
    setIsEditCourseModalOpen(false);
    setSelectedCourse(null);
  };

  const handleCreateBatch = async () => {
    try {
      // Get current user
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Validate required fields
      if (!batchFormData.batchName || !batchFormData.courseId || !batchFormData.startDate || 
          !batchFormData.endDate || !batchFormData.classTimings || batchFormData.daysOfWeek.length === 0 ||
          !batchFormData.maxCapacity || !batchFormData.assignedFaculty || !batchFormData.classroomAssignment) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      // Create batch in institution_batches table
      const { error } = await supabase
        .from('institution_batches' as any)
        .insert({
          batch_name: batchFormData.batchName,
          course_id: batchFormData.courseId,
          institution_id: userId,
          start_date: batchFormData.startDate,
          end_date: batchFormData.endDate,
          class_timings: batchFormData.classTimings,
          days_of_week: batchFormData.daysOfWeek,
          max_capacity: parseInt(batchFormData.maxCapacity),
          assigned_faculty: batchFormData.assignedFaculty,
          classroom_assignment: batchFormData.classroomAssignment,
          fee_schedule: batchFormData.feeSchedule,
          price: parseFloat(batchFormData.feeSchedule.amount) || 0,
          status: 'Active'
        });

      if (error) {
        console.error('Error creating batch:', error);
        throw error;
      }

      // Reset form
      setBatchFormData({
        batchName: '',
        courseId: '',
        startDate: '',
        endDate: '',
        classTimings: '',
        daysOfWeek: [],
        maxCapacity: '',
        assignedFaculty: '',
        classroomAssignment: '',
        feeSchedule: {
          type: 'fixed',
          amount: '',
          currency: 'INR',
          installments: 1
        }
      });

      // Close modal
      setIsCreateBatchModalOpen(false);
      
      toast({
        title: "Batch Created",
        description: "Batch has been created successfully.",
      });

      // Refresh batches
      await loadBatches(userId);
    } catch (error) {
      console.error('Error creating batch:', error);
      toast({
        title: "Error",
        description: "Failed to create batch. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = (course.title || course.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (course.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (course.status || '').toLowerCase() === statusFilter.toLowerCase();
    const matchesCategory = categoryFilter === 'all' || (course.category || '').toLowerCase() === categoryFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Debug logging for courses filtering
  console.log('🔍 FILTERING COURSES:');
  console.log('🔍 Original courses array:', JSON.stringify(courses, null, 2));
  console.log('🔍 Courses enrollment counts:', courses.map(c => ({ title: c.title, enrollment_count: c.enrollment_count })));
  console.log('🔍 Filtered courses array:', JSON.stringify(filteredCourses, null, 2));
  console.log('🔍 Filtered enrollment counts:', filteredCourses.map(c => ({ title: c.title, enrollment_count: c.enrollment_count })));
  console.log('🔍 Search query:', searchQuery);
  console.log('🔍 Status filter:', statusFilter);
  console.log('🔍 Category filter:', categoryFilter);

  // Filter batches
  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.batch_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesStatus = statusFilter === 'all' || batch.status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string | undefined) => {
    if (!status) {
      return 'bg-gray-100 text-gray-800 border-gray-200';
    }
    
    switch (status.toLowerCase()) {
      case 'active':
      case 'ongoing':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'draft':
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLevelColor = (level: string | undefined) => {
    if (!level) {
      return 'bg-gray-100 text-gray-800 border-gray-200';
    }
    
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Empty state component for courses
  const CoursesEmptyState = () => (
    <div className="text-center py-12">
      <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
      <p className="text-gray-500 mb-6">
        {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
          ? 'No courses match your current filters. Try adjusting your search criteria.'
          : 'Get started by creating your first course.'}
      </p>
      <Button 
        className="bg-blue-600 hover:bg-blue-700 text-white"
        onClick={() => setIsAddCourseModalOpen(true)}
      >
        <Plus className="w-4 h-4 mr-2" />
        Create Your First Course
      </Button>
    </div>
  );

  // Empty state component for batches
  const BatchesEmptyState = () => (
    <div className="text-center py-12">
      <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No batches found</h3>
      <p className="text-gray-500 mb-6">
        {searchQuery || statusFilter !== 'all'
          ? 'No batches match your current filters. Try adjusting your search criteria.'
          : 'Create your first batch to start managing student groups.'}
      </p>
      <Button variant="outline" onClick={() => setIsCreateBatchModalOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Create Your First Batch
      </Button>
    </div>
  );

  // Loading state component
  const LoadingState = () => (
    <div className="text-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-500">Loading courses and batches...</p>
    </div>
  );

  // Error state component
  const ErrorState = () => (
    <div className="text-center py-12">
      <div className="mx-auto h-12 w-12 text-red-400 mb-4">
        <AlertCircle className="h-12 w-12" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading data</h3>
      <p className="text-gray-500 mb-6">{error}</p>
      <Button onClick={fetchData} variant="outline">
        Try Again
      </Button>
    </div>
  );

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Courses & Batches</h2>
          <p className="text-muted-foreground mt-1">
            Manage your courses and batches efficiently
          </p>
        </div>
        <div className="flex space-x-3">
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setIsAddCourseModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Course
          </Button>
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add New Batch
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-sm border-0 bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search courses or batches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex items-center space-x-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              {activeTab === 'courses' && (
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="languages">Languages</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="arts">Arts</SelectItem>
                  </SelectContent>
                </Select>
              )}
              
              {/* Refresh Button */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={refreshEnrollmentData}
                disabled={loading || isRefreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${(loading || isRefreshing) ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Updating...' : 'Refresh'}
              </Button>

              {/* Debug Test Button */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={testCoursesEnrollmentCount}
                className="flex items-center gap-2"
              >
                🧪 Test Courses Count
              </Button>

              {/* View Mode Toggle */}
              <div className="flex border rounded-lg">
                <Button 
                  variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                  size="sm" 
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'default' : 'ghost'} 
                  size="sm" 
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="courses" className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4" />
            <span>Courses ({filteredCourses.length})</span>
          </TabsTrigger>
          <TabsTrigger value="batches" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Batches ({filteredBatches.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          {filteredCourses.length === 0 ? (
            <CoursesEmptyState />
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(() => {
                console.log('🎨 RENDERING COURSES:', JSON.stringify(filteredCourses, null, 2));
                console.log('🎨 Enrollment counts in render:', filteredCourses.map(c => ({ title: c.title, enrollment_count: c.enrollment_count })));
                return null;
              })()}
              {filteredCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow duration-200 border-0 bg-white">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                          {course.title || course.category}
                        </CardTitle>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {course.description || 'No description available'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="outline" className={getStatusColor(course.status)}>
                        {course.status || 'Unknown'}
                      </Badge>
                      <Badge variant="outline" className={getLevelColor(course.level)}>
                        {course.level || 'All Levels'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{course.duration || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-medium text-green-600">
                          ₹{course.fee_structure?.amount?.toLocaleString() || 'Free'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Created:</span>
                        <span className="font-medium">
                          {new Date(course.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 mt-4 pt-4 border-t">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleViewCourse(course)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleEditCourse(course)}
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-md transition-shadow duration-200 border-0 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{course.title || course.category}</h3>
                          <div className="flex space-x-2">
                            <Badge variant="outline" className={getStatusColor(course.status)}>
                              {course.status || 'Unknown'}
                            </Badge>
                            <Badge variant="outline" className={getLevelColor(course.level)}>
                              {course.level || 'All Levels'}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-3">{course.description || 'No description available'}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Duration:</span>
                            <p className="font-medium">{course.duration || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Price:</span>
                            <p className="font-medium text-green-600">
                              ₹{course.fee_structure?.amount?.toLocaleString() || 'Free'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Enrolled:</span>
                            <p className="font-medium text-blue-600 flex items-center gap-1">
                              {course.enrollment_count || 0} students
                              {isRefreshing && (
                                <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />
                              )}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Created:</span>
                            <p className="font-medium">
                              {new Date(course.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-6">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewCourse(course)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditCourse(course)}
                        >
                          <Edit3 className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Batches Tab */}
        <TabsContent value="batches" className="space-y-6">
          {/* Header with Create Button */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Batches</h3>
              <p className="text-sm text-muted-foreground">Manage student batches and class schedules</p>
            </div>
            <Button onClick={() => setIsCreateBatchModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Batch
            </Button>
          </div>

          {filteredBatches.length === 0 ? (
            <BatchesEmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBatches.map((batch) => (
                <Card key={batch.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{batch.batch_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">Course: {batch.course?.title || 'Unknown'}</p>
                      </div>
                      <Badge variant="outline">{batch.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                        <span>{new Date(batch.start_date).toLocaleDateString()} - {new Date(batch.end_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 text-muted-foreground" />
                        <span>{batch.class_timings}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="flex items-center gap-1">
                          Capacity: {batch.current_enrollment || 0}/{batch.max_capacity}
                          {isRefreshing && (
                            <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>Faculty: {batch.assigned_faculty}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

      </Tabs>

      {/* Add Course Modal */}
      <AddCourseModal
        isOpen={isAddCourseModalOpen}
        onClose={() => setIsAddCourseModalOpen(false)}
        onSubmit={handleCreateCourse}
      />

      {/* View Course Modal */}
      <ViewCourseModal
        isOpen={isViewCourseModalOpen}
        onClose={handleCloseModals}
        course={selectedCourse}
        onEdit={() => {
          setIsViewCourseModalOpen(false);
          setIsEditCourseModalOpen(true);
        }}
      />

      {/* Edit Course Modal */}
      <EditCourseModal
        isOpen={isEditCourseModalOpen}
        onClose={handleCloseModals}
        course={selectedCourse}
        onSubmit={handleUpdateCourse}
      />

      {/* Create Batch Modal */}
      <Dialog open={isCreateBatchModalOpen} onOpenChange={setIsCreateBatchModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Create New Batch
            </DialogTitle>
            <DialogDescription>
              Create a new batch for your course with detailed scheduling and capacity information.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="batchName">Batch Name/ID *</Label>
                <Input
                  id="batchName"
                  placeholder="e.g., Batch-2024-001, Morning Batch"
                  value={batchFormData.batchName}
                  onChange={(e) => setBatchFormData(prev => ({ ...prev, batchName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="courseId">Course Selection *</Label>
                <Select
                  value={batchFormData.courseId}
                  onValueChange={(value) => setBatchFormData(prev => ({ ...prev, courseId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title || course.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={batchFormData.startDate}
                  onChange={(e) => setBatchFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={batchFormData.endDate}
                  onChange={(e) => setBatchFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            {/* Class Timings and Days */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="classTimings">Class Timings *</Label>
                <Input
                  id="classTimings"
                  placeholder="e.g., 9:00 AM - 11:00 AM"
                  value={batchFormData.classTimings}
                  onChange={(e) => setBatchFormData(prev => ({ ...prev, classTimings: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Days of Week *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={day}
                        checked={batchFormData.daysOfWeek.includes(day)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setBatchFormData(prev => ({
                              ...prev,
                              daysOfWeek: [...prev.daysOfWeek, day]
                            }));
                          } else {
                            setBatchFormData(prev => ({
                              ...prev,
                              daysOfWeek: prev.daysOfWeek.filter(d => d !== day)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={day} className="text-sm">{day}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Capacity and Faculty */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxCapacity">Maximum Capacity *</Label>
                <Input
                  id="maxCapacity"
                  type="number"
                  placeholder="e.g., 30"
                  value={batchFormData.maxCapacity}
                  onChange={(e) => setBatchFormData(prev => ({ ...prev, maxCapacity: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignedFaculty">Assigned Faculty *</Label>
                <Input
                  id="assignedFaculty"
                  placeholder="e.g., Dr. John Smith, Prof. Jane Doe"
                  value={batchFormData.assignedFaculty}
                  onChange={(e) => setBatchFormData(prev => ({ ...prev, assignedFaculty: e.target.value }))}
                />
              </div>
            </div>

            {/* Classroom Assignment */}
            <div className="space-y-2">
              <Label htmlFor="classroomAssignment">Classroom Assignment *</Label>
              <Input
                id="classroomAssignment"
                placeholder="e.g., Room 101, Lab A, Online Meeting Room"
                value={batchFormData.classroomAssignment}
                onChange={(e) => setBatchFormData(prev => ({ ...prev, classroomAssignment: e.target.value }))}
              />
            </div>

            {/* Fee Schedule */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Fee Schedule *</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="feeType">Fee Type</Label>
                  <Select
                    value={batchFormData.feeSchedule.type}
                    onValueChange={(value) => setBatchFormData(prev => ({
                      ...prev,
                      feeSchedule: { ...prev.feeSchedule, type: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="installment">Installment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feeAmount">Amount</Label>
                  <Input
                    id="feeAmount"
                    type="number"
                    placeholder="e.g., 5000"
                    value={batchFormData.feeSchedule.amount}
                    onChange={(e) => setBatchFormData(prev => ({
                      ...prev,
                      feeSchedule: { ...prev.feeSchedule, amount: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feeCurrency">Currency</Label>
                  <Select
                    value={batchFormData.feeSchedule.currency}
                    onValueChange={(value) => setBatchFormData(prev => ({
                      ...prev,
                      feeSchedule: { ...prev.feeSchedule, currency: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {batchFormData.feeSchedule.type === 'installment' && (
                <div className="space-y-2">
                  <Label htmlFor="installments">Number of Installments</Label>
                  <Input
                    id="installments"
                    type="number"
                    min="1"
                    max="12"
                    value={batchFormData.feeSchedule.installments}
                    onChange={(e) => setBatchFormData(prev => ({
                      ...prev,
                      feeSchedule: { ...prev.feeSchedule, installments: parseInt(e.target.value) || 1 }
                    }))}
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setIsCreateBatchModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateBatch}>
                <Users className="w-4 h-4 mr-2" />
                Create Batch
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FacultyDashboard({ 
  isRealtimeConnected, 
  lastRefreshTime, 
  onRefresh 
}: {
  isRealtimeConnected: boolean;
  lastRefreshTime: Date;
  onRefresh: () => void;
}) {
  const [showAddFaculty, setShowAddFaculty] = useState(false);
  const [facultyForm, setFacultyForm] = useState({
    name: '',
    subject: '',
    email: '',
    contactNumber: ''
  });
  const [faculty, setFaculty] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Load faculty data on component mount
  useEffect(() => {
    loadFaculty();
  }, []);

  const loadFaculty = async () => {
    setIsLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User not authenticated');
        return;
      }

      const { data, error } = await supabase
        .from('faculty')
        .select('*')
        .eq('institution_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading faculty:', error);
        toast({
          title: "Error",
          description: "Failed to load faculty data",
          variant: "destructive",
        });
      } else {
        setFaculty(data || []);
      }
    } catch (error) {
      console.error('Error loading faculty:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFacultyForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    // Validate form
    if (!facultyForm.name || !facultyForm.subject || !facultyForm.email || !facultyForm.contactNumber) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('faculty')
        .insert({
          institution_id: user.id,
          name: facultyForm.name,
          subject_expertise: facultyForm.subject,
          email: facultyForm.email,
          contact_number: facultyForm.contactNumber
        })
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Faculty member added successfully",
      });

      // Reset form and close modal
      setFacultyForm({
        name: '',
        subject: '',
        email: '',
        contactNumber: ''
      });
      setShowAddFaculty(false);

      // Reload faculty data
      await loadFaculty();

    } catch (error) {
      console.error('Error adding faculty:', error);
      toast({
        title: "Error",
        description: "Failed to add faculty member",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFaculty = async (facultyId: string) => {
    try {
      const { error } = await supabase
        .from('faculty')
        .delete()
        .eq('id', facultyId);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Faculty member deleted successfully",
      });

      // Reload faculty data
      await loadFaculty();

    } catch (error) {
      console.error('Error deleting faculty:', error);
      toast({
        title: "Error",
        description: "Failed to delete faculty member",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold text-gray-900">Faculty Management</h2>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-xs text-muted-foreground">
                {isRealtimeConnected ? 'Live Data' : 'Offline'}
              </span>
            </div>
          </div>
          <p className="text-gray-600">Manage faculty members, departments, and academic staff</p>
          <p className="text-xs text-gray-500 mt-1">Last updated: {lastRefreshTime.toLocaleTimeString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowAddFaculty(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Faculty
          </Button>
        </div>
      </div>

      {/* Faculty Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <p className="text-gray-500">Loading faculty...</p>
        </div>
      ) : faculty.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {faculty.map((facultyMember) => (
            <Card key={facultyMember.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{facultyMember.name}</h3>
                      <p className="text-sm text-gray-600">{facultyMember.subject_expertise}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteFaculty(facultyMember.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{facultyMember.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{facultyMember.contact_number}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Added on {new Date(facultyMember.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[400px] border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Faculty Members</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first faculty member</p>
            <Button
              onClick={() => setShowAddFaculty(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Faculty Member
            </Button>
          </div>
        </div>
      )}

      {/* Add Faculty Modal */}
      <Dialog open={showAddFaculty} onOpenChange={setShowAddFaculty}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Faculty Member</DialogTitle>
            <DialogDescription>
              Add a new faculty member to your institution
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                placeholder="Dr. John Smith" 
                value={facultyForm.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject/Expertise</Label>
              <Input 
                id="subject" 
                placeholder="Mathematics, Physics, etc." 
                value={facultyForm.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="john.smith@institution.edu" 
                value={facultyForm.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input 
                id="contactNumber" 
                placeholder="+1-555-123-4567" 
                value={facultyForm.contactNumber}
                onChange={(e) => handleInputChange('contactNumber', e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowAddFaculty(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Faculty'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdmissionsDashboard({ 
  isRealtimeConnected, 
  lastRefreshTime, 
  onRefresh 
}: {
  isRealtimeConnected: boolean;
  lastRefreshTime: Date;
  onRefresh: () => void;
}) {
  const [admissionsData, setAdmissionsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Fetch student admissions data on component mount
  useEffect(() => {
    fetchStudentAdmissions();
  }, []);

  const fetchStudentAdmissions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching student admissions for institution:', user.id);

      // First, get the institution's courses
      const { data: institutionCourses, error: coursesError } = await supabase
        .from('institution_courses')
        .select('id, title, description, category, institution_id')
        .eq('institution_id', user.id);

      if (coursesError) {
        console.error('Error fetching institution courses:', coursesError);
        throw new Error('Failed to fetch institution courses');
      }

      if (!institutionCourses || institutionCourses.length === 0) {
        console.log('No courses found for this institution');
        setAdmissionsData([]);
        return;
      }

      const courseIds = institutionCourses.map(course => course.id);

      // Then fetch enrollments for these courses
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('course_enrollments')
        .select(`
          id,
          student_id,
          course_id,
          status,
          enrolled_at,
          created_at
        `)
        .in('course_id', courseIds)
        .eq('status', 'enrolled')
        .order('enrolled_at', { ascending: false });

      if (enrollmentError) {
        console.error('Error fetching enrollments:', enrollmentError);
        throw new Error('Failed to fetch student enrollments');
      }

      // Filter out self-enrollments (institution enrolling in their own course)
      const validEnrollments = (enrollmentData || []).filter(e => e.student_id !== user.id);

      // Fetch student profiles for the enrolled students
      const studentIds = [...new Set(validEnrollments?.map(e => e.student_id) || [])];
      let studentProfiles = [];
      
      if (studentIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email, role, created_at')
          .in('id', studentIds);

        if (profilesError) {
          console.error('Error fetching student profiles:', profilesError);
        } else {
          studentProfiles = profilesData || [];
        }
      }

      // Combine enrollment data with student profiles and course details
      const enrichedAdmissions = (validEnrollments || []).map(enrollment => {
        const studentProfile = studentProfiles.find(profile => profile.id === enrollment.student_id);
        const courseDetails = institutionCourses.find(course => course.id === enrollment.course_id);
        
        return {
          id: enrollment.id,
          studentName: studentProfile?.full_name || `Student ${enrollment.student_id.slice(0, 8)}...`,
          course: courseDetails?.title || 'Unknown Course',
          dateOfAdmission: enrollment.enrolled_at || enrollment.created_at,
          status: enrollment.status === 'enrolled' ? 'Active' : 'Pending'
        };
      });

      setAdmissionsData(enrichedAdmissions);

    } catch (err) {
      console.error('Error in fetchStudentAdmissions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch student admissions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = (studentId: string) => {
    const student = admissionsData.find(s => s.id === studentId);
    if (student) {
      setSelectedStudent(student);
      setShowDetailsModal(true);
    }
  };

  const handleRefresh = () => {
    fetchStudentAdmissions();
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold text-gray-900">Admissions Management</h2>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-xs text-muted-foreground">
                {isRealtimeConnected ? 'Live Data' : 'Offline'}
              </span>
            </div>
          </div>
          <p className="text-gray-600">Manage student applications and admissions process</p>
          <p className="text-xs text-gray-500 mt-1">Last updated: {lastRefreshTime.toLocaleTimeString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleRefresh}
            disabled={loading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Admissions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Student Admissions
                <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              </CardTitle>
              <p className="text-sm text-gray-600">List of all student admissions and their status</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <p className="text-gray-500">Loading admissions data...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 mb-2">Error loading admissions data</p>
              <p className="text-sm text-gray-500">{error}</p>
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          ) : admissionsData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Student Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Course</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Date of Admission</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admissionsData.map((student) => (
                    <tr key={student.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {student.studentName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">{student.studentName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">{student.course}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(student.dateOfAdmission).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(student.status)}>
                          {student.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(student.id)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No admissions found</p>
              <p className="text-sm text-gray-400 mt-1">
                Students will appear here when they enroll in your courses
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Details Modal */}
      {selectedStudent && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Student Details</DialogTitle>
              <DialogDescription>
                Detailed information about {selectedStudent.studentName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Student Header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-medium text-blue-600">
                    {selectedStudent.studentName.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedStudent.studentName}</h3>
                  <p className="text-gray-600">{selectedStudent.course}</p>
                  <Badge className={getStatusColor(selectedStudent.status)}>
                    {selectedStudent.status}
                  </Badge>
                </div>
              </div>

              {/* Student Information Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Student Name</Label>
                  <p className="text-sm text-gray-900 mt-1">{selectedStudent.studentName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Course</Label>
                  <p className="text-sm text-gray-900 mt-1">{selectedStudent.course}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Date of Admission</Label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(selectedStudent.dateOfAdmission).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Status</Label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedStudent.status)}>
                      {selectedStudent.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Enrollment ID</Label>
                  <p className="text-sm text-gray-900 mt-1 font-mono">{selectedStudent.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Days Since Admission</Label>
                  <p className="text-sm text-gray-900 mt-1">
                    {Math.floor((new Date().getTime() - new Date(selectedStudent.dateOfAdmission).getTime()) / (1000 * 60 * 60 * 24))} days
                  </p>
                </div>
              </div>

              {/* Additional Information */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Admission Date</span>
                    <span className="text-sm text-gray-900">
                      {new Date(selectedStudent.dateOfAdmission).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Enrollment Status</span>
                    <Badge className={getStatusColor(selectedStudent.status)}>
                      {selectedStudent.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-gray-600">Course Duration</span>
                    <span className="text-sm text-gray-900">Ongoing</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function FeesDashboard({ 
  isRealtimeConnected, 
  lastRefreshTime, 
  onRefresh 
}: {
  isRealtimeConnected: boolean;
  lastRefreshTime: Date;
  onRefresh: () => void;
}) {
  const [feesData, setFeesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch fees data on component mount
  useEffect(() => {
    fetchFeesData();
  }, []);

  const fetchFeesData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching fees data for institution:', user.id);

      // Fetch fees with related data
      const { data: fees, error: feesError } = await supabase
        .from('student_fees')
        .select(`
          id,
          total_amount,
          amount_paid,
          balance_due,
          currency,
          payment_status,
          due_date,
          paid_date,
          fee_type,
          payment_method,
          transaction_id,
          notes,
          created_at,
          student_id,
          course_id,
          enrollment_id
        `)
        .eq('institution_id', user.id)
        .order('created_at', { ascending: false });

      if (feesError) {
        console.error('Error fetching fees:', feesError);
        throw new Error('Failed to fetch fees data');
      }

      // Fetch student profiles
      const studentIds = [...new Set(fees?.map(f => f.student_id) || [])];
      let studentProfiles = [];
      
      if (studentIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', studentIds);

        if (profilesError) {
          console.error('Error fetching student profiles:', profilesError);
        } else {
          studentProfiles = profilesData || [];
        }
      }

      // Fetch course details
      const courseIds = [...new Set(fees?.map(f => f.course_id) || [])];
      let courseDetails = [];
      
      if (courseIds.length > 0) {
        const { data: coursesData, error: coursesError } = await supabase
          .from('institution_courses')
          .select('id, title, category')
          .in('id', courseIds);

        if (coursesError) {
          console.error('Error fetching course details:', coursesError);
        } else {
          courseDetails = coursesData || [];
        }
      }

      // Combine data
      const enrichedFees = (fees || []).map(fee => {
        const studentProfile = studentProfiles.find(p => p.id === fee.student_id);
        const courseDetail = courseDetails.find(c => c.id === fee.course_id);
        
        return {
          ...fee,
          studentName: studentProfile?.full_name || `Student ${fee.student_id.slice(0, 8)}...`,
          studentEmail: studentProfile?.email || 'N/A',
          courseName: courseDetail?.title || 'Unknown Course',
          courseCategory: courseDetail?.category || 'N/A'
        };
      });

      setFeesData(enrichedFees);

    } catch (err) {
      console.error('Error in fetchFeesData:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch fees data');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (feeId: string) => {
    try {
      setIsUpdating(true);
      
      // Get the fee to update
      const fee = feesData.find(f => f.id === feeId);
      if (!fee) return;

      // Update the fee to mark as paid
      const { error: updateError } = await supabase
        .from('student_fees')
        .update({
          amount_paid: fee.total_amount,
          payment_status: 'paid',
          paid_date: new Date().toISOString(),
          payment_method: 'Manual Entry',
          transaction_id: `MANUAL_${Date.now()}`
        })
        .eq('id', feeId);

      if (updateError) {
        console.error('Error updating fee:', updateError);
        throw new Error('Failed to update fee');
      }

      // Refresh the data
      await fetchFeesData();
      onRefresh();

    } catch (err) {
      console.error('Error in handleMarkAsPaid:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark fee as paid');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRefresh = () => {
    fetchFeesData();
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold text-gray-900">Fee Management</h2>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-xs text-muted-foreground">
                {isRealtimeConnected ? 'Live Data' : 'Offline'}
              </span>
            </div>
          </div>
          <p className="text-gray-600">Manage student fees and payments</p>
          <p className="text-xs text-gray-500 mt-1">Last updated: {lastRefreshTime.toLocaleTimeString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleRefresh}
            disabled={loading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Fees Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Student Fees
                <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              </CardTitle>
              <p className="text-sm text-gray-600">Manage student fee payments and balances</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <p className="text-gray-500">Loading fees data...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 mb-2">Error loading fees data</p>
              <p className="text-sm text-gray-500">{error}</p>
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          ) : feesData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Student Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Course</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Amount Paid</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Balance Due</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {feesData.map((fee) => (
                    <tr key={fee.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {fee.studentName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{fee.studentName}</p>
                            <p className="text-sm text-gray-500">{fee.studentEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{fee.courseName}</p>
                          <p className="text-sm text-gray-500">{fee.courseCategory}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {fee.currency} {fee.amount_paid.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            of {fee.currency} {fee.total_amount.toLocaleString()}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className={`font-medium ${fee.balance_due > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {fee.currency} {fee.balance_due.toLocaleString()}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(fee.payment_status)}>
                          {fee.payment_status.charAt(0).toUpperCase() + fee.payment_status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {fee.payment_status !== 'paid' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkAsPaid(fee.id)}
                            disabled={isUpdating}
                            className="flex items-center gap-2 text-green-600 hover:text-green-700"
                          >
                            {isUpdating ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                            Mark as Paid
                          </Button>
                        )}
                        {fee.payment_status === 'paid' && (
                          <span className="text-sm text-green-600 font-medium">
                            ✓ Paid
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No fees found</p>
              <p className="text-sm text-gray-400 mt-1">
                Fees will appear here when students enroll in your courses
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ReportsDashboard({ 
  isRealtimeConnected, 
  lastRefreshTime, 
  onRefresh 
}: {
  isRealtimeConnected: boolean;
  lastRefreshTime: Date;
  onRefresh: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentsPerCourse, setStudentsPerCourse] = useState<Array<{course: string, students: number}>>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<Array<{month: string, revenue: number}>>([]);

  // Fetch data on component mount
  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User not authenticated');
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      // Fetch students per course data from institution_courses
      // Since course_enrollments references courses(id), we need to check if the course_id exists in institution_courses
      const { data: institutionCourses, error: coursesError } = await supabase
        .from('institution_courses')
        .select(`
          id,
          title,
          institution_id
        `)
        .eq('institution_id', user.id);

      if (coursesError) {
        console.error('Error fetching institution courses:', coursesError);
        setError('Failed to fetch institution courses');
        setLoading(false);
        return;
      }

      // Get course IDs for this institution
      const institutionCourseIds = (institutionCourses || []).map(course => course.id);
      
      if (institutionCourseIds.length === 0) {
        setStudentsPerCourse([]);
        setLoading(false);
        return;
      }

      // Fetch enrollments for institution courses
      const { data: courseEnrollments, error: enrollmentsError } = await supabase
        .from('course_enrollments')
        .select(`
          course_id,
          student_id
        `)
        .in('course_id', institutionCourseIds);

      if (enrollmentsError) {
        console.error('Error fetching course enrollments:', enrollmentsError);
        setError('Failed to fetch course enrollment data');
        setLoading(false);
        return;
      }

      // Process students per course data
      const courseStudentCounts: {[key: string]: number} = {};
      
      // Create a map of course_id to course_title
      const courseMap: {[key: string]: string} = {};
      (institutionCourses || []).forEach((course: any) => {
        courseMap[course.id] = course.title;
      });

      // Count students per course
      (courseEnrollments || []).forEach((enrollment: any) => {
        const courseTitle = courseMap[enrollment.course_id];
        if (courseTitle) {
          courseStudentCounts[courseTitle] = (courseStudentCounts[courseTitle] || 0) + 1;
        }
      });

      const studentsPerCourseData = Object.entries(courseStudentCounts).map(([course, students]) => ({
        course,
        students: students as number
      }));

      setStudentsPerCourse(studentsPerCourseData);

      // Fetch monthly revenue data from student_fees
      const { data: feesData, error: feesError } = await supabase
        .from('student_fees')
        .select(`
          amount_paid,
          paid_date,
          institution_id
        `)
        .eq('institution_id', user.id)
        .not('paid_date', 'is', null)
        .not('amount_paid', 'is', null);

      if (feesError) {
        console.error('Error fetching fees data:', feesError);
        setError('Failed to fetch revenue data');
        setLoading(false);
        return;
      }

      // Process monthly revenue data
      const monthlyRevenueData: {[key: string]: number} = {};
      (feesData || []).forEach((fee: any) => {
        const month = new Date(fee.paid_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyRevenueData[month] = (monthlyRevenueData[month] || 0) + (fee.amount_paid || 0);
      });

      const monthlyRevenueArray = Object.entries(monthlyRevenueData)
        .map(([month, revenue]) => ({
          month,
          revenue: revenue as number
        }))
        .sort((a, b) => {
          // Sort by date
          const dateA = new Date(a.month + ' 1');
          const dateB = new Date(b.month + ' 1');
          return dateA.getTime() - dateB.getTime();
        });

      setMonthlyRevenue(monthlyRevenueArray);

    } catch (error) {
      console.error('Error fetching reports data:', error);
      setError('Failed to fetch reports data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchReportsData();
    onRefresh();
  };

  // Simple bar chart component for students per course
  const BarChart = ({ data }: { data: Array<{course: string, students: number}> }) => {
    const maxStudents = Math.max(...data.map(d => d.students), 1);
    
    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-32 text-sm font-medium text-gray-700 truncate" title={item.course}>
              {item.course}
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
              <div 
                className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
                style={{ width: `${(item.students / maxStudents) * 100}%` }}
              >
                <span className="text-xs text-white font-medium">{item.students}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Simple line chart component for monthly revenue
  const LineChart = ({ data }: { data: Array<{month: string, revenue: number}> }) => {
    if (data.length === 0) return <div className="text-center text-gray-500 py-8">No revenue data available</div>;
    
    const maxRevenue = Math.max(...data.map(d => d.revenue), 1);
    const minRevenue = Math.min(...data.map(d => d.revenue), 0);
    const range = maxRevenue - minRevenue;
    
    // Handle single data point case
    const getXPosition = (index: number) => {
      if (data.length === 1) return 210; // Center the single point
      return 40 + (index / (data.length - 1)) * 340;
    };
    
    return (
      <div className="relative h-64">
        <svg className="w-full h-full" viewBox="0 0 400 200">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <line
              key={i}
              x1="40"
              y1={40 + ratio * 120}
              x2="380"
              y2={40 + ratio * 120}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}
          
          {/* Line path - only draw if we have more than one point */}
          {data.length > 1 && (
            <path
              d={data.map((item, index) => {
                const x = getXPosition(index);
                const y = 160 - ((item.revenue - minRevenue) / range) * 120;
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
            />
          )}
          
          {/* Data points */}
          {data.map((item, index) => {
            const x = getXPosition(index);
            const y = 160 - ((item.revenue - minRevenue) / range) * 120;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill="#3b82f6"
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
          
          {/* X-axis labels */}
          {data.map((item, index) => {
            const x = getXPosition(index);
            return (
              <text
                key={index}
                x={x}
                y="190"
                textAnchor="middle"
                className="text-xs fill-gray-600"
              >
                {item.month}
              </text>
            );
          })}
          
          {/* Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const value = minRevenue + ratio * range;
            return (
              <text
                key={i}
                x="35"
                y={165 - ratio * 120}
                textAnchor="end"
                className="text-xs fill-gray-600"
              >
                ₹{Math.round(value).toLocaleString()}
              </text>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-xs text-muted-foreground">
                {isRealtimeConnected ? 'Live Data' : 'Offline'}
              </span>
            </div>
          </div>
          <p className="text-gray-600">Real-time insights into your institution's performance</p>
          <p className="text-xs text-gray-500 mt-1">Last updated: {lastRefreshTime.toLocaleTimeString()}</p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={loading}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students Per Course Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Students Per Course
              <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            </CardTitle>
            <p className="text-sm text-gray-600">Total student enrollments by course</p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <p className="text-gray-500">Loading course data...</p>
              </div>
            ) : studentsPerCourse.length > 0 ? (
              <BarChart data={studentsPerCourse} />
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No course enrollment data available</p>
                <p className="text-sm text-gray-400 mt-1">Student enrollments will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Revenue Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Monthly Revenue Trend
              <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            </CardTitle>
            <p className="text-sm text-gray-600">Revenue from paid fees over time</p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <p className="text-gray-500">Loading revenue data...</p>
              </div>
            ) : monthlyRevenue.length > 0 ? (
              <LineChart data={monthlyRevenue} />
            ) : (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No revenue data available</p>
                <p className="text-sm text-gray-400 mt-1">Paid fees will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {studentsPerCourse.reduce((sum, item) => sum + item.students, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{monthlyRevenue.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Courses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {studentsPerCourse.length}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


function SettingsDashboard({ 
  isRealtimeConnected, 
  lastRefreshTime, 
  onRefresh 
}: {
  isRealtimeConnected: boolean;
  lastRefreshTime: Date;
  onRefresh: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic');

  // Get profile data from the hook
  const { profile, registrationData, refreshData } = useInstitutionDashboard();

  // Form data state - matching all 7 steps from signup
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    institutionName: '',
    institutionType: '',
    otherInstitutionType: '',
    establishmentYear: '',
    registrationNumber: '',
    panNumber: '',
    gstNumber: '',
    officialEmail: '',
    primaryContact: '',
    secondaryContact: '',
    websiteUrl: '',
    completeAddress: '',
    city: '',
    state: '',
    pinCode: '',
    landmark: '',
    mapLocation: '',
    ownerDirectorName: '',
    ownerContactNumber: '',

    // Step 2: Facilities
    totalClassrooms: '',
    classroomCapacity: '',
    libraryAvailable: 'no',
    computerLabAvailable: 'no',
    wifiAvailable: 'no',
    parkingAvailable: 'no',
    cafeteriaAvailable: 'no',
    airConditioningAvailable: 'no',
    cctvSecurityAvailable: 'no',
    wheelchairAccessible: 'no',
    projectorsSmartBoardsAvailable: 'no',
    audioSystemAvailable: 'no',
    transportationProvided: 'no',
    hostelFacility: 'no',
    studyMaterialProvided: 'no',
    onlineClasses: 'no',
    recordedSessions: 'no',
    mockTestsAssessments: 'no',
    careerCounseling: 'no',
    jobPlacementAssistance: 'no',

    // Step 3: Courses & Programs
    totalCurrentStudents: '',
    averageBatchSize: '',
    studentTeacherRatio: '',
    admissionTestRequired: 'no',
    minimumQualification: '',
    ageRestrictions: '',
    admissionFees: '',
    securityDeposit: '',
    refundPolicy: '',

    // Step 4: Faculty & Staff
    totalTeachingStaff: '',
    totalNonTeachingStaff: '',
    averageFacultyExperience: '',
    principalDirectorName: '',
    principalDirectorQualification: '',
    principalDirectorExperience: '',
    principalDirectorBio: '',
    phdHolders: '',
    postGraduates: '',
    graduates: '',
    professionalCertified: '',
    awardsReceived: '',
    publications: '',
    industryExperience: '',
    trainingPrograms: '',

    // Step 5: Achievements
    institutionAwards: '',
    governmentRecognition: '',
    educationBoardAwards: '',
    qualityCertifications: '',
    mediaRecognition: '',
    sportsAchievements: '',
    culturalAchievements: '',
    academicExcellenceAwards: '',
    competitionWinners: '',
    alumniSuccessStories: '',
    placementRecords: '',
    higherStudiesAdmissions: '',
    scholarshipRecipients: '',

    // Step 6: Fee Structure
    emiAvailable: 'no',
    paymentSchedule: '',
    latePaymentPenalty: '',
    scholarshipAvailable: 'no',
    scholarshipCriteria: '',
    discountMultipleCourses: '',
    siblingDiscount: '',
    earlyBirdDiscount: '',
    educationLoanAssistance: 'no',
    installmentFacility: 'no',
    hardshipSupport: 'no',

    // Step 7: Contact & Communication
    primaryContactPerson: '',
    designation: '',
    directPhoneNumber: '',
    emailAddress: '',
    whatsappNumber: '',
    bestTimeToContact: '',
    facebookPageUrl: '',
    instagramAccountUrl: '',
    youtubeChannelUrl: '',
    linkedinProfileUrl: '',
    googleMyBusinessUrl: '',
    emergencyContactPerson: '',
    localPoliceStationContact: '',
    nearestHospitalContact: '',
    fireDepartmentContact: ''
  });

  // Load existing profile data from registrationData (which contains all 7-step data)
  useEffect(() => {
    if (registrationData) {
      console.log('Loading registration data into form:', registrationData);
      
      setFormData(prev => ({
        ...prev,
        // Step 1: Basic Information
        institutionName: registrationData.name || '',
        institutionType: registrationData.type || '',
        otherInstitutionType: registrationData.other_institution_type || '',
        establishmentYear: registrationData.establishment_year?.toString() || '',
        registrationNumber: registrationData.registration_number || '',
        panNumber: registrationData.pan || '',
        gstNumber: registrationData.gst || '',
        officialEmail: registrationData.official_email || '',
        primaryContact: registrationData.primary_contact || '',
        secondaryContact: registrationData.secondary_contact || '',
        websiteUrl: registrationData.website || '',
        completeAddress: registrationData.complete_address || '',
        city: registrationData.city || '',
        state: registrationData.state || '',
        pinCode: registrationData.pincode || '',
        landmark: registrationData.landmark || '',
        mapLocation: registrationData.map_location || '',
        ownerDirectorName: registrationData.owner_name || '',
        ownerContactNumber: registrationData.owner_contact || '',

        // Step 2: Facilities (from step2_data JSONB)
        totalClassrooms: registrationData.step2_data?.totalClassrooms || '',
        classroomCapacity: registrationData.step2_data?.classroomCapacity || '',
        libraryAvailable: registrationData.step2_data?.libraryAvailable || 'no',
        computerLabAvailable: registrationData.step2_data?.computerLabAvailable || 'no',
        wifiAvailable: registrationData.step2_data?.wifiAvailable || 'no',
        parkingAvailable: registrationData.step2_data?.parkingAvailable || 'no',
        cafeteriaAvailable: registrationData.step2_data?.cafeteriaAvailable || 'no',
        airConditioningAvailable: registrationData.step2_data?.airConditioningAvailable || 'no',
        cctvSecurityAvailable: registrationData.step2_data?.cctvSecurityAvailable || 'no',
        wheelchairAccessible: registrationData.step2_data?.wheelchairAccessible || 'no',
        projectorsSmartBoardsAvailable: registrationData.step2_data?.projectorsSmartBoardsAvailable || 'no',
        audioSystemAvailable: registrationData.step2_data?.audioSystemAvailable || 'no',
        transportationProvided: registrationData.step2_data?.transportationProvided || 'no',
        hostelFacility: registrationData.step2_data?.hostelFacility || 'no',
        studyMaterialProvided: registrationData.step2_data?.studyMaterialProvided || 'no',
        onlineClasses: registrationData.step2_data?.onlineClasses || 'no',
        recordedSessions: registrationData.step2_data?.recordedSessions || 'no',
        mockTestsAssessments: registrationData.step2_data?.mockTestsAssessments || 'no',
        careerCounseling: registrationData.step2_data?.careerCounseling || 'no',
        jobPlacementAssistance: registrationData.step2_data?.jobPlacementAssistance || 'no',

        // Step 3: Courses & Programs (from step3_data JSONB)
        totalCurrentStudents: registrationData.step3_data?.totalCurrentStudents || '',
        averageBatchSize: registrationData.step3_data?.averageBatchSize || '',
        studentTeacherRatio: registrationData.step3_data?.studentTeacherRatio || '',
        admissionTestRequired: registrationData.step3_data?.admissionTestRequired || 'no',
        minimumQualification: registrationData.step3_data?.minimumQualification || '',
        ageRestrictions: registrationData.step3_data?.ageRestrictions || '',
        admissionFees: registrationData.step3_data?.admissionFees || '',
        securityDeposit: registrationData.step3_data?.securityDeposit || '',
        refundPolicy: registrationData.step3_data?.refundPolicy || '',

        // Step 4: Faculty & Staff (from step4_data JSONB)
        totalTeachingStaff: registrationData.step4_data?.totalTeachingStaff || '',
        totalNonTeachingStaff: registrationData.step4_data?.totalNonTeachingStaff || '',
        averageFacultyExperience: registrationData.step4_data?.averageFacultyExperience || '',
        principalDirectorName: registrationData.step4_data?.principalDirectorName || '',
        principalDirectorQualification: registrationData.step4_data?.principalDirectorQualification || '',
        principalDirectorExperience: registrationData.step4_data?.principalDirectorExperience || '',
        principalDirectorBio: registrationData.step4_data?.principalDirectorBio || '',
        phdHolders: registrationData.step4_data?.phdHolders || '',
        postGraduates: registrationData.step4_data?.postGraduates || '',
        graduates: registrationData.step4_data?.graduates || '',
        professionalCertified: registrationData.step4_data?.professionalCertified || '',
        awardsReceived: registrationData.step4_data?.awardsReceived || '',
        publications: registrationData.step4_data?.publications || '',
        industryExperience: registrationData.step4_data?.industryExperience || '',
        trainingPrograms: registrationData.step4_data?.trainingPrograms || '',

        // Step 5: Achievements (from step5_data JSONB)
        institutionAwards: registrationData.step5_data?.institutionAwards?.institutionAwards || '',
        governmentRecognition: registrationData.step5_data?.institutionAwards?.governmentRecognition || '',
        educationBoardAwards: registrationData.step5_data?.institutionAwards?.educationBoardAwards || '',
        qualityCertifications: registrationData.step5_data?.institutionAwards?.qualityCertifications || '',
        mediaRecognition: registrationData.step5_data?.institutionAwards?.mediaRecognition || '',
        sportsAchievements: registrationData.step5_data?.studentAchievements?.sportsAchievements || '',
        culturalAchievements: registrationData.step5_data?.studentAchievements?.culturalAchievements || '',
        academicExcellenceAwards: registrationData.step5_data?.studentAchievements?.academicExcellenceAwards || '',
        competitionWinners: registrationData.step5_data?.studentAchievements?.competitionWinners || '',
        alumniSuccessStories: registrationData.step5_data?.successStories?.alumniSuccessStories || '',
        placementRecords: registrationData.step5_data?.successStories?.placementRecords || '',
        higherStudiesAdmissions: registrationData.step5_data?.successStories?.higherStudiesAdmissions || '',
        scholarshipRecipients: registrationData.step5_data?.successStories?.scholarshipRecipients || '',

        // Step 6: Fee Structure (from step6_data JSONB)
        emiAvailable: registrationData.step6_data?.emiAvailable || 'no',
        paymentSchedule: registrationData.step6_data?.paymentSchedule || '',
        latePaymentPenalty: registrationData.step6_data?.latePaymentPenalty || '',
        scholarshipAvailable: registrationData.step6_data?.scholarshipAvailable || 'no',
        scholarshipCriteria: registrationData.step6_data?.scholarshipCriteria || '',
        discountMultipleCourses: registrationData.step6_data?.discountMultipleCourses || '',
        siblingDiscount: registrationData.step6_data?.siblingDiscount || '',
        earlyBirdDiscount: registrationData.step6_data?.earlyBirdDiscount || '',
        educationLoanAssistance: registrationData.step6_data?.educationLoanAssistance || 'no',
        installmentFacility: registrationData.step6_data?.installmentFacility || 'no',
        hardshipSupport: registrationData.step6_data?.hardshipSupport || 'no',

        // Step 7: Contact & Communication (direct fields)
        primaryContactPerson: registrationData.primary_contact_person || '',
        designation: registrationData.contact_designation || '',
        directPhoneNumber: registrationData.contact_phone_number || '',
        emailAddress: registrationData.contact_email_address || '',
        whatsappNumber: registrationData.whatsapp_number || '',
        bestTimeToContact: registrationData.best_time_to_contact || '',
        facebookPageUrl: registrationData.facebook_page_url || '',
        instagramAccountUrl: registrationData.instagram_account_url || '',
        youtubeChannelUrl: registrationData.youtube_channel_url || '',
        linkedinProfileUrl: registrationData.linkedin_profile_url || '',
        googleMyBusinessUrl: registrationData.google_my_business_url || '',
        emergencyContactPerson: registrationData.emergency_contact_person || '',
        localPoliceStationContact: registrationData.local_police_station_contact || '',
        nearestHospitalContact: registrationData.nearest_hospital_contact || '',
        fireDepartmentContact: registrationData.fire_department_contact || ''
      }));
    }
  }, [registrationData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // First, check if the profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('institution_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error(`Failed to check profile: ${checkError.message}`);
      }

      const profileData = {
        // Step 1: Basic Information
        institution_name: formData.institutionName,
        institution_type: formData.institutionType === 'other' ? formData.otherInstitutionType : formData.institutionType,
        other_institution_type: formData.institutionType === 'other' ? formData.otherInstitutionType : null,
        established_year: formData.establishmentYear ? parseInt(formData.establishmentYear) : null,
        registration_number: formData.registrationNumber,
        pan_number: formData.panNumber,
        gst_number: formData.gstNumber,
        official_email: formData.officialEmail,
        primary_contact_number: formData.primaryContact,
        secondary_contact_number: formData.secondaryContact,
        website_url: formData.websiteUrl,
        complete_address: formData.completeAddress,
        city: formData.city,
        state: formData.state,
        pin_code: formData.pinCode,
        landmark: formData.landmark,
        map_location: formData.mapLocation,
        owner_director_name: formData.ownerDirectorName,
        owner_contact_number: formData.ownerContactNumber,

        // Step 2: Facilities (JSONB)
        step2_data: {
          totalClassrooms: formData.totalClassrooms,
          classroomCapacity: formData.classroomCapacity,
          libraryAvailable: formData.libraryAvailable,
          computerLabAvailable: formData.computerLabAvailable,
          wifiAvailable: formData.wifiAvailable,
          parkingAvailable: formData.parkingAvailable,
          cafeteriaAvailable: formData.cafeteriaAvailable,
          airConditioningAvailable: formData.airConditioningAvailable,
          cctvSecurityAvailable: formData.cctvSecurityAvailable,
          wheelchairAccessible: formData.wheelchairAccessible,
          projectorsSmartBoardsAvailable: formData.projectorsSmartBoardsAvailable,
          audioSystemAvailable: formData.audioSystemAvailable,
          transportationProvided: formData.transportationProvided,
          hostelFacility: formData.hostelFacility,
          studyMaterialProvided: formData.studyMaterialProvided,
          onlineClasses: formData.onlineClasses,
          recordedSessions: formData.recordedSessions,
          mockTestsAssessments: formData.mockTestsAssessments,
          careerCounseling: formData.careerCounseling,
          jobPlacementAssistance: formData.jobPlacementAssistance
        },

        // Step 3: Courses & Programs (JSONB)
        step3_data: {
          totalCurrentStudents: formData.totalCurrentStudents,
          averageBatchSize: formData.averageBatchSize,
          studentTeacherRatio: formData.studentTeacherRatio,
          admissionTestRequired: formData.admissionTestRequired,
          minimumQualification: formData.minimumQualification,
          ageRestrictions: formData.ageRestrictions,
          admissionFees: formData.admissionFees,
          securityDeposit: formData.securityDeposit,
          refundPolicy: formData.refundPolicy
        },

        // Step 4: Faculty & Staff (JSONB)
        step4_data: {
          totalTeachingStaff: formData.totalTeachingStaff,
          totalNonTeachingStaff: formData.totalNonTeachingStaff,
          averageFacultyExperience: formData.averageFacultyExperience,
          principalDirectorName: formData.principalDirectorName,
          principalDirectorQualification: formData.principalDirectorQualification,
          principalDirectorExperience: formData.principalDirectorExperience,
          principalDirectorBio: formData.principalDirectorBio,
          phdHolders: formData.phdHolders,
          postGraduates: formData.postGraduates,
          graduates: formData.graduates,
          professionalCertified: formData.professionalCertified,
          awardsReceived: formData.awardsReceived,
          publications: formData.publications,
          industryExperience: formData.industryExperience,
          trainingPrograms: formData.trainingPrograms
        },

        // Step 5: Achievements (JSONB)
        step5_data: {
          institutionAwards: {
            institutionAwards: formData.institutionAwards,
            governmentRecognition: formData.governmentRecognition,
            educationBoardAwards: formData.educationBoardAwards,
            qualityCertifications: formData.qualityCertifications,
            mediaRecognition: formData.mediaRecognition
          },
          studentAchievements: {
            sportsAchievements: formData.sportsAchievements,
            culturalAchievements: formData.culturalAchievements,
            academicExcellenceAwards: formData.academicExcellenceAwards,
            competitionWinners: formData.competitionWinners
          },
          successStories: {
            alumniSuccessStories: formData.alumniSuccessStories,
            placementRecords: formData.placementRecords,
            higherStudiesAdmissions: formData.higherStudiesAdmissions,
            scholarshipRecipients: formData.scholarshipRecipients
          }
        },

        // Step 6: Fee Structure (JSONB)
        step6_data: {
          emiAvailable: formData.emiAvailable,
          paymentSchedule: formData.paymentSchedule,
          latePaymentPenalty: formData.latePaymentPenalty,
          scholarshipAvailable: formData.scholarshipAvailable,
          scholarshipCriteria: formData.scholarshipCriteria,
          discountMultipleCourses: formData.discountMultipleCourses,
          siblingDiscount: formData.siblingDiscount,
          earlyBirdDiscount: formData.earlyBirdDiscount,
          educationLoanAssistance: formData.educationLoanAssistance,
          installmentFacility: formData.installmentFacility,
          hardshipSupport: formData.hardshipSupport
        },

        // Step 7: Contact & Communication (direct fields)
        primary_contact_person: formData.primaryContactPerson,
        contact_designation: formData.designation,
        contact_phone_number: formData.directPhoneNumber,
        contact_email_address: formData.emailAddress,
        whatsapp_number: formData.whatsappNumber,
        best_time_to_contact: formData.bestTimeToContact,
        facebook_page_url: formData.facebookPageUrl,
        instagram_account_url: formData.instagramAccountUrl,
        youtube_channel_url: formData.youtubeChannelUrl,
        linkedin_profile_url: formData.linkedinProfileUrl,
        google_my_business_url: formData.googleMyBusinessUrl,
        emergency_contact_person: formData.emergencyContactPerson,
        local_police_station_contact: formData.localPoliceStationContact,
        nearest_hospital_contact: formData.nearestHospitalContact,
        fire_department_contact: formData.fireDepartmentContact,
        updated_at: new Date().toISOString()
      };

      // Use update if profile exists, insert if it doesn't
      let updateError;
      if (existingProfile) {
        // Profile exists, update it
        const { error } = await supabase
          .from('institution_profiles')
          .update(profileData)
          .eq('user_id', user.id);
        updateError = error;
      } else {
        // Profile doesn't exist, create it
        const { error } = await supabase
          .from('institution_profiles')
          .insert({
            user_id: user.id,
            ...profileData
          });
        updateError = error;
      }

      if (updateError) {
        console.error('Database update error:', updateError);
        
        // Handle specific error cases
        if (updateError.code === '23505') {
          throw new Error('Profile already exists. Please refresh the page and try again.');
        } else if (updateError.code === '23503') {
          throw new Error('Invalid data provided. Please check your inputs and try again.');
        } else if (updateError.code === '42501') {
          throw new Error('Permission denied. Please contact support if this issue persists.');
        } else {
          throw new Error(`Database error: ${updateError.message}`);
        }
      }

      setSuccess('Profile updated successfully!');
      await refreshData();
      onRefresh();

    } catch (error: any) {
      console.error('Error saving profile:', error);
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to save profile';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error.code) {
        switch (error.code) {
          case '23505':
            errorMessage = 'Profile already exists. Please refresh the page and try again.';
            break;
          case '23503':
            errorMessage = 'Invalid data provided. Please check your inputs and try again.';
            break;
          case '42501':
            errorMessage = 'Permission denied. Please contact support if this issue persists.';
            break;
          default:
            errorMessage = `Database error: ${error.message || 'Unknown error'}`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-xs text-muted-foreground">
                {isRealtimeConnected ? 'Live Data' : 'Offline'}
              </span>
            </div>
          </div>
          <p className="text-gray-600">Manage your institution profile and settings</p>
          <p className="text-xs text-gray-500 mt-1">Last updated: {lastRefreshTime.toLocaleTimeString()}</p>
        </div>
        <Button
          onClick={handleSaveChanges}
          disabled={saving}
          className="flex items-center gap-2"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Settings className="h-4 w-4" />
          )}
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-green-800">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="facilities">Facilities</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="faculty">Faculty</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Basic Institution Information
              </CardTitle>
              <p className="text-sm text-gray-600">Essential details about your institution</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="institutionName">Institution Name *</Label>
                    <Input
                      id="institutionName"
                      value={formData.institutionName}
                      onChange={(e) => handleInputChange('institutionName', e.target.value)}
                      placeholder="Enter institution name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="institutionType">Institution Type *</Label>
                    <Select value={formData.institutionType} onValueChange={(value) => handleInputChange('institutionType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select institution type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="school">School</SelectItem>
                        <SelectItem value="college">College</SelectItem>
                        <SelectItem value="university">University</SelectItem>
                        <SelectItem value="coaching">Coaching Center</SelectItem>
                        <SelectItem value="training">Training Institute</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.institutionType === 'other' && (
                    <div>
                      <Label htmlFor="otherInstitutionType">Specify Institution Type</Label>
                      <Input
                        id="otherInstitutionType"
                        value={formData.otherInstitutionType}
                        onChange={(e) => handleInputChange('otherInstitutionType', e.target.value)}
                        placeholder="Enter institution type"
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="establishmentYear">Establishment Year *</Label>
                    <Input
                      id="establishmentYear"
                      type="number"
                      value={formData.establishmentYear}
                      onChange={(e) => handleInputChange('establishmentYear', e.target.value)}
                      placeholder="e.g., 1995"
                    />
                  </div>
                  <div>
                    <Label htmlFor="registrationNumber">Registration Number *</Label>
                    <Input
                      id="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                      placeholder="Enter registration number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="panNumber">PAN Number *</Label>
                    <Input
                      id="panNumber"
                      value={formData.panNumber}
                      onChange={(e) => handleInputChange('panNumber', e.target.value)}
                      placeholder="Enter PAN number"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="gstNumber">GST Number</Label>
                    <Input
                      id="gstNumber"
                      value={formData.gstNumber}
                      onChange={(e) => handleInputChange('gstNumber', e.target.value)}
                      placeholder="Enter GST number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="officialEmail">Official Email *</Label>
                    <Input
                      id="officialEmail"
                      type="email"
                      value={formData.officialEmail}
                      onChange={(e) => handleInputChange('officialEmail', e.target.value)}
                      placeholder="Enter official email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="primaryContact">Primary Contact *</Label>
                    <Input
                      id="primaryContact"
                      value={formData.primaryContact}
                      onChange={(e) => handleInputChange('primaryContact', e.target.value)}
                      placeholder="Enter primary contact number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="secondaryContact">Secondary Contact</Label>
                    <Input
                      id="secondaryContact"
                      value={formData.secondaryContact}
                      onChange={(e) => handleInputChange('secondaryContact', e.target.value)}
                      placeholder="Enter secondary contact number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="websiteUrl">Website URL</Label>
                    <Input
                      id="websiteUrl"
                      value={formData.websiteUrl}
                      onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                      placeholder="Enter website URL"
                    />
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Address Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="completeAddress">Complete Address *</Label>
                    <Textarea
                      id="completeAddress"
                      value={formData.completeAddress}
                      onChange={(e) => handleInputChange('completeAddress', e.target.value)}
                      placeholder="Enter complete address"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Enter city"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="Enter state"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pinCode">Pin Code *</Label>
                      <Input
                        id="pinCode"
                        value={formData.pinCode}
                        onChange={(e) => handleInputChange('pinCode', e.target.value)}
                        placeholder="Enter pin code"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="landmark">Landmark</Label>
                    <Input
                      id="landmark"
                      value={formData.landmark}
                      onChange={(e) => handleInputChange('landmark', e.target.value)}
                      placeholder="Enter nearby landmark"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mapLocation">Google Maps Location</Label>
                    <Input
                      id="mapLocation"
                      value={formData.mapLocation}
                      onChange={(e) => handleInputChange('mapLocation', e.target.value)}
                      placeholder="Enter Google Maps link"
                    />
                  </div>
                </div>
              </div>

              {/* Owner/Director Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Owner/Director Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="ownerDirectorName">Owner/Director Name *</Label>
                    <Input
                      id="ownerDirectorName"
                      value={formData.ownerDirectorName}
                      onChange={(e) => handleInputChange('ownerDirectorName', e.target.value)}
                      placeholder="Enter owner/director name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ownerContactNumber">Owner Contact Number *</Label>
                    <Input
                      id="ownerContactNumber"
                      value={formData.ownerContactNumber}
                      onChange={(e) => handleInputChange('ownerContactNumber', e.target.value)}
                      placeholder="Enter owner contact number"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Facilities Tab */}
        <TabsContent value="facilities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Facilities & Infrastructure
              </CardTitle>
              <p className="text-sm text-gray-600">Information about your institution's facilities</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="totalClassrooms">Total Classrooms</Label>
                    <Input
                      id="totalClassrooms"
                      type="number"
                      value={formData.totalClassrooms}
                      onChange={(e) => handleInputChange('totalClassrooms', e.target.value)}
                      placeholder="Enter number of classrooms"
                    />
                  </div>
                  <div>
                    <Label htmlFor="classroomCapacity">Classroom Capacity</Label>
                    <Input
                      id="classroomCapacity"
                      type="number"
                      value={formData.classroomCapacity}
                      onChange={(e) => handleInputChange('classroomCapacity', e.target.value)}
                      placeholder="Enter average classroom capacity"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Basic Facilities</Label>
                    <div className="space-y-2">
                      {[
                        { key: 'libraryAvailable', label: 'Library' },
                        { key: 'computerLabAvailable', label: 'Computer Lab' },
                        { key: 'wifiAvailable', label: 'WiFi' },
                        { key: 'parkingAvailable', label: 'Parking' },
                        { key: 'cafeteriaAvailable', label: 'Cafeteria' },
                        { key: 'airConditioningAvailable', label: 'Air Conditioning' },
                        { key: 'cctvSecurityAvailable', label: 'CCTV Security' },
                        { key: 'wheelchairAccessible', label: 'Wheelchair Accessible' },
                        { key: 'projectorsSmartBoardsAvailable', label: 'Projectors/Smart Boards' },
                        { key: 'audioSystemAvailable', label: 'Audio System' }
                      ].map((facility) => (
                        <div key={facility.key} className="flex items-center justify-between">
                          <Label className="text-sm">{facility.label}</Label>
                          <Select 
                            value={formData[facility.key as keyof typeof formData]} 
                            onValueChange={(value) => handleInputChange(facility.key, value)}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="yes">Yes</SelectItem>
                              <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Additional Services</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'transportationProvided', label: 'Transportation Provided' },
                    { key: 'hostelFacility', label: 'Hostel Facility' },
                    { key: 'studyMaterialProvided', label: 'Study Material Provided' },
                    { key: 'onlineClasses', label: 'Online Classes' },
                    { key: 'recordedSessions', label: 'Recorded Sessions' },
                    { key: 'mockTestsAssessments', label: 'Mock Tests & Assessments' },
                    { key: 'careerCounseling', label: 'Career Counseling' },
                    { key: 'jobPlacementAssistance', label: 'Job Placement Assistance' }
                  ].map((service) => (
                    <div key={service.key} className="flex items-center justify-between">
                      <Label className="text-sm">{service.label}</Label>
                      <Select 
                        value={formData[service.key as keyof typeof formData]} 
                        onValueChange={(value) => handleInputChange(service.key, value)}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Courses & Programs
              </CardTitle>
              <p className="text-sm text-gray-600">Information about your courses and programs</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="totalCurrentStudents">Total Current Students</Label>
                    <Input
                      id="totalCurrentStudents"
                      type="number"
                      value={formData.totalCurrentStudents}
                      onChange={(e) => handleInputChange('totalCurrentStudents', e.target.value)}
                      placeholder="Enter total current students"
                    />
                  </div>
                  <div>
                    <Label htmlFor="averageBatchSize">Average Batch Size</Label>
                    <Input
                      id="averageBatchSize"
                      type="number"
                      value={formData.averageBatchSize}
                      onChange={(e) => handleInputChange('averageBatchSize', e.target.value)}
                      placeholder="Enter average batch size"
                    />
                  </div>
                  <div>
                    <Label htmlFor="studentTeacherRatio">Student-Teacher Ratio</Label>
                    <Input
                      id="studentTeacherRatio"
                      value={formData.studentTeacherRatio}
                      onChange={(e) => handleInputChange('studentTeacherRatio', e.target.value)}
                      placeholder="e.g., 30:1"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="admissionFees">Admission Fees (₹)</Label>
                    <Input
                      id="admissionFees"
                      type="number"
                      value={formData.admissionFees}
                      onChange={(e) => handleInputChange('admissionFees', e.target.value)}
                      placeholder="Enter admission fees"
                    />
                  </div>
                  <div>
                    <Label htmlFor="securityDeposit">Security Deposit (₹)</Label>
                    <Input
                      id="securityDeposit"
                      type="number"
                      value={formData.securityDeposit}
                      onChange={(e) => handleInputChange('securityDeposit', e.target.value)}
                      placeholder="Enter security deposit"
                    />
                  </div>
                  <div>
                    <Label htmlFor="minimumQualification">Minimum Qualification</Label>
                    <Input
                      id="minimumQualification"
                      value={formData.minimumQualification}
                      onChange={(e) => handleInputChange('minimumQualification', e.target.value)}
                      placeholder="Enter minimum qualification required"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ageRestrictions">Age Restrictions</Label>
                  <Input
                    id="ageRestrictions"
                    value={formData.ageRestrictions}
                    onChange={(e) => handleInputChange('ageRestrictions', e.target.value)}
                    placeholder="Enter age restrictions"
                  />
                </div>
                <div>
                  <Label htmlFor="refundPolicy">Refund Policy</Label>
                  <Textarea
                    id="refundPolicy"
                    value={formData.refundPolicy}
                    onChange={(e) => handleInputChange('refundPolicy', e.target.value)}
                    placeholder="Enter refund policy details"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Admission Test Required</Label>
                  <Select 
                    value={formData.admissionTestRequired} 
                    onValueChange={(value) => handleInputChange('admissionTestRequired', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Faculty Tab */}
        <TabsContent value="faculty" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Faculty & Staff Information
              </CardTitle>
              <p className="text-sm text-gray-600">Details about your teaching and non-teaching staff</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="totalTeachingStaff">Total Teaching Staff</Label>
                    <Input
                      id="totalTeachingStaff"
                      type="number"
                      value={formData.totalTeachingStaff}
                      onChange={(e) => handleInputChange('totalTeachingStaff', e.target.value)}
                      placeholder="Enter number of teaching staff"
                    />
                  </div>
                  <div>
                    <Label htmlFor="totalNonTeachingStaff">Total Non-Teaching Staff</Label>
                    <Input
                      id="totalNonTeachingStaff"
                      type="number"
                      value={formData.totalNonTeachingStaff}
                      onChange={(e) => handleInputChange('totalNonTeachingStaff', e.target.value)}
                      placeholder="Enter number of non-teaching staff"
                    />
                  </div>
                  <div>
                    <Label htmlFor="averageFacultyExperience">Average Faculty Experience (years)</Label>
                    <Input
                      id="averageFacultyExperience"
                      value={formData.averageFacultyExperience}
                      onChange={(e) => handleInputChange('averageFacultyExperience', e.target.value)}
                      placeholder="Enter average faculty experience"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="phdHolders">PhD Holders</Label>
                    <Input
                      id="phdHolders"
                      type="number"
                      value={formData.phdHolders}
                      onChange={(e) => handleInputChange('phdHolders', e.target.value)}
                      placeholder="Enter number of PhD holders"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postGraduates">Post Graduates</Label>
                    <Input
                      id="postGraduates"
                      type="number"
                      value={formData.postGraduates}
                      onChange={(e) => handleInputChange('postGraduates', e.target.value)}
                      placeholder="Enter number of post graduates"
                    />
                  </div>
                  <div>
                    <Label htmlFor="graduates">Graduates</Label>
                    <Input
                      id="graduates"
                      type="number"
                      value={formData.graduates}
                      onChange={(e) => handleInputChange('graduates', e.target.value)}
                      placeholder="Enter number of graduates"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Principal/Director Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="principalDirectorName">Principal/Director Name</Label>
                    <Input
                      id="principalDirectorName"
                      value={formData.principalDirectorName}
                      onChange={(e) => handleInputChange('principalDirectorName', e.target.value)}
                      placeholder="Enter principal/director name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="principalDirectorQualification">Qualification</Label>
                    <Input
                      id="principalDirectorQualification"
                      value={formData.principalDirectorQualification}
                      onChange={(e) => handleInputChange('principalDirectorQualification', e.target.value)}
                      placeholder="Enter qualification"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="principalDirectorExperience">Experience (years)</Label>
                  <Input
                    id="principalDirectorExperience"
                    value={formData.principalDirectorExperience}
                    onChange={(e) => handleInputChange('principalDirectorExperience', e.target.value)}
                    placeholder="Enter experience in years"
                  />
                </div>
                <div>
                  <Label htmlFor="principalDirectorBio">Bio</Label>
                  <Textarea
                    id="principalDirectorBio"
                    value={formData.principalDirectorBio}
                    onChange={(e) => handleInputChange('principalDirectorBio', e.target.value)}
                    placeholder="Enter principal/director bio"
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Additional Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="professionalCertified">Professional Certified</Label>
                    <Input
                      id="professionalCertified"
                      type="number"
                      value={formData.professionalCertified}
                      onChange={(e) => handleInputChange('professionalCertified', e.target.value)}
                      placeholder="Enter number of professional certified staff"
                    />
                  </div>
                  <div>
                    <Label htmlFor="awardsReceived">Awards Received</Label>
                    <Input
                      id="awardsReceived"
                      value={formData.awardsReceived}
                      onChange={(e) => handleInputChange('awardsReceived', e.target.value)}
                      placeholder="Enter awards received"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="publications">Publications</Label>
                  <Input
                    id="publications"
                    value={formData.publications}
                    onChange={(e) => handleInputChange('publications', e.target.value)}
                    placeholder="Enter publications details"
                  />
                </div>
                <div>
                  <Label htmlFor="industryExperience">Industry Experience</Label>
                  <Input
                    id="industryExperience"
                    value={formData.industryExperience}
                    onChange={(e) => handleInputChange('industryExperience', e.target.value)}
                    placeholder="Enter industry experience details"
                  />
                </div>
                <div>
                  <Label htmlFor="trainingPrograms">Training Programs</Label>
                  <Input
                    id="trainingPrograms"
                    value={formData.trainingPrograms}
                    onChange={(e) => handleInputChange('trainingPrograms', e.target.value)}
                    placeholder="Enter training programs conducted"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact & Communication
              </CardTitle>
              <p className="text-sm text-gray-600">Contact information and communication preferences</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Primary Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="primaryContactPerson">Primary Contact Person</Label>
                    <Input
                      id="primaryContactPerson"
                      value={formData.primaryContactPerson}
                      onChange={(e) => handleInputChange('primaryContactPerson', e.target.value)}
                      placeholder="Enter primary contact person name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="designation">Designation</Label>
                    <Input
                      id="designation"
                      value={formData.designation}
                      onChange={(e) => handleInputChange('designation', e.target.value)}
                      placeholder="Enter designation"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="directPhoneNumber">Direct Phone Number</Label>
                    <Input
                      id="directPhoneNumber"
                      value={formData.directPhoneNumber}
                      onChange={(e) => handleInputChange('directPhoneNumber', e.target.value)}
                      placeholder="Enter direct phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emailAddress">Email Address</Label>
                    <Input
                      id="emailAddress"
                      type="email"
                      value={formData.emailAddress}
                      onChange={(e) => handleInputChange('emailAddress', e.target.value)}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                    <Input
                      id="whatsappNumber"
                      value={formData.whatsappNumber}
                      onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                      placeholder="Enter WhatsApp number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bestTimeToContact">Best Time to Contact</Label>
                    <Input
                      id="bestTimeToContact"
                      value={formData.bestTimeToContact}
                      onChange={(e) => handleInputChange('bestTimeToContact', e.target.value)}
                      placeholder="e.g., 9 AM - 5 PM"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Social Media & Online Presence</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="facebookPageUrl">Facebook Page URL</Label>
                    <Input
                      id="facebookPageUrl"
                      value={formData.facebookPageUrl}
                      onChange={(e) => handleInputChange('facebookPageUrl', e.target.value)}
                      placeholder="Enter Facebook page URL"
                    />
                  </div>
                  <div>
                    <Label htmlFor="instagramAccountUrl">Instagram Account URL</Label>
                    <Input
                      id="instagramAccountUrl"
                      value={formData.instagramAccountUrl}
                      onChange={(e) => handleInputChange('instagramAccountUrl', e.target.value)}
                      placeholder="Enter Instagram account URL"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="youtubeChannelUrl">YouTube Channel URL</Label>
                    <Input
                      id="youtubeChannelUrl"
                      value={formData.youtubeChannelUrl}
                      onChange={(e) => handleInputChange('youtubeChannelUrl', e.target.value)}
                      placeholder="Enter YouTube channel URL"
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedinProfileUrl">LinkedIn Profile URL</Label>
                    <Input
                      id="linkedinProfileUrl"
                      value={formData.linkedinProfileUrl}
                      onChange={(e) => handleInputChange('linkedinProfileUrl', e.target.value)}
                      placeholder="Enter LinkedIn profile URL"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="googleMyBusinessUrl">Google My Business URL</Label>
                  <Input
                    id="googleMyBusinessUrl"
                    value={formData.googleMyBusinessUrl}
                    onChange={(e) => handleInputChange('googleMyBusinessUrl', e.target.value)}
                    placeholder="Enter Google My Business URL"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Emergency Contacts</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="emergencyContactPerson">Emergency Contact Person</Label>
                    <Input
                      id="emergencyContactPerson"
                      value={formData.emergencyContactPerson}
                      onChange={(e) => handleInputChange('emergencyContactPerson', e.target.value)}
                      placeholder="Enter emergency contact person"
                    />
                  </div>
                  <div>
                    <Label htmlFor="localPoliceStationContact">Local Police Station Contact</Label>
                    <Input
                      id="localPoliceStationContact"
                      value={formData.localPoliceStationContact}
                      onChange={(e) => handleInputChange('localPoliceStationContact', e.target.value)}
                      placeholder="Enter police station contact"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="nearestHospitalContact">Nearest Hospital Contact</Label>
                    <Input
                      id="nearestHospitalContact"
                      value={formData.nearestHospitalContact}
                      onChange={(e) => handleInputChange('nearestHospitalContact', e.target.value)}
                      placeholder="Enter hospital contact"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fireDepartmentContact">Fire Department Contact</Label>
                    <Input
                      id="fireDepartmentContact"
                      value={formData.fireDepartmentContact}
                      onChange={(e) => handleInputChange('fireDepartmentContact', e.target.value)}
                      placeholder="Enter fire department contact"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
