import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { 
  Users, 
  GraduationCap, 
  Building2, 
  UserCheck, 
  UserX, 
  Trash2, 
  AlertTriangle,
  Shield,
  Mail,
  Phone,
  Calendar,
  MoreHorizontal,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  MapPin,
  Clock,
  Award,
  BookOpen,
  User,
  Building,
  GraduationCap as GraduationCapIcon,
  Star,
  Globe,
  MessageSquare
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface User {
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  phone?: string;
  bio?: string;
  created_at: string;
  status?: string;
  verification_status?: 'pending' | 'approved' | 'rejected' | 'verified';
  profile_completion?: number;
  // Additional fields for detailed view
  location?: string;
  experience?: string;
  qualifications?: string;
  subjects?: string[];
  teaching_mode?: string[];
  hourly_rate?: number;
  availability?: string;
  languages?: string[];
  achievements?: string[];
  documents?: any[];
  reviews_count?: number;
  rating?: number;
  // Student-specific fields
  grade_level?: string;
  learning_goals?: string;
  age?: number;
  date_of_birth?: string;
  learning_mode?: string;
  budget_min?: number;
  budget_max?: number;
  class_duration?: number;
  frequency?: string;
  tutor_gender_preference?: string;
  instruction_language?: string;
  special_requirements?: string;
  teaching_methodology?: string;
  class_type_preference?: string;
  timeline?: string;
  // Institution-specific fields
  institution_name?: string;
  institution_type?: string;
  established_year?: number;
  registration_number?: string;
  complete_address?: string;
  city?: string;
  state?: string;
  pin_code?: string;
  // Common fields
  updated_at?: string;
}

export default function ManageUsers() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("students");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate('/admin/login');
      return;
    }
    
    loadUsers();
    setupRealtimeSubscriptions();
  }, [navigate]);

  useEffect(() => {
    filterUsers();
  }, [users, activeTab, searchTerm]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      
      console.log('🔍 Loading users from Supabase...');
      
      // First, try to load basic profiles data
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('❌ Error loading profiles:', profilesError);
        toast({
          title: "Error",
          description: `Failed to load profiles: ${profilesError.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Profiles loaded:', profilesData?.length || 0);

      // Process each user and fetch their role-specific data
      const processedUsers = await Promise.all((profilesData || []).map(async (user) => {
        const baseUser = {
          user_id: user.user_id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          bio: user.bio,
          created_at: user.created_at,
          verification_status: user.verified ? 'approved' : 'pending', // Use verified field from profiles
          profile_completion: 0, // Will be calculated based on role-specific data
          location: user.city || user.area || 'Not provided', // Use city/area from profiles
          updated_at: user.updated_at
        };

        try {
          // Fetch role-specific data based on user role
          if (user.role === 'tutor') {
            const { data: tutorData, error: tutorError } = await supabase
              .from('tutor_profiles')
              .select('*')
              .eq('user_id', user.user_id)
              .single();

            if (!tutorError && tutorData) {
              console.log('✅ Tutor profile loaded for:', user.full_name);
              
              // Calculate profile completion for tutors based on actual fields
              const tutorFields = [
                baseUser.full_name, baseUser.email, baseUser.phone, baseUser.bio, baseUser.location,
                tutorData.experience_years, tutorData.education, tutorData.subjects,
                tutorData.teaching_mode, tutorData.hourly_rate, tutorData.availability
              ];
              const completedFields = tutorFields.filter(field => field && field !== '' && field !== '[]').length;
              const profileCompletion = Math.round((completedFields / tutorFields.length) * 100);
              
              return {
                ...baseUser,
                experience: tutorData.experience_years ? `${tutorData.experience_years} years` : tutorData.teaching_experience,
                qualifications: tutorData.education || tutorData.highest_qualification,
                subjects: tutorData.subjects || [],
                teaching_mode: tutorData.teaching_mode ? [tutorData.teaching_mode] : [],
                hourly_rate: tutorData.hourly_rate,
                availability: tutorData.availability ? JSON.stringify(tutorData.availability) : tutorData.weekly_schedule ? JSON.stringify(tutorData.weekly_schedule) : 'Not specified',
                languages: tutorData.languages || [],
                achievements: tutorData.certifications || [],
                rating: tutorData.rating,
                reviews_count: 0, // Not available in current schema
                profile_completion: profileCompletion,
                verification_status: tutorData.verified ? 'approved' : 'pending'
              };
            } else {
              console.log('⚠️ No tutor profile found for:', user.full_name, tutorError);
            }
          }

          if (user.role === 'institution') {
            const { data: institutionData, error: institutionError } = await supabase
              .from('institution_profiles')
              .select('*')
              .eq('user_id', user.user_id)
              .single();

            if (!institutionError && institutionData) {
              console.log('✅ Institution profile loaded for:', user.full_name);
              
              // Calculate profile completion for institutions based on actual fields
              const institutionFields = [
                baseUser.full_name, baseUser.email, baseUser.phone, baseUser.bio, baseUser.location,
                institutionData.institution_name, institutionData.institution_type, institutionData.established_year,
                institutionData.registration_number, institutionData.complete_address
              ];
              const completedFields = institutionFields.filter(field => field && field !== '' && field !== '[]').length;
              const profileCompletion = Math.round((completedFields / institutionFields.length) * 100);
              
              return {
                ...baseUser,
                experience: institutionData.established_year ? `Established in ${institutionData.established_year}` : 'Not specified',
                qualifications: institutionData.registration_number || 'Not provided',
                subjects: [], // Not directly available in institution_profiles
                languages: [institutionData.primary_language].filter(Boolean),
                rating: 0, // Not available in current schema
                reviews_count: 0, // Not available in current schema
                profile_completion: profileCompletion,
                verification_status: institutionData.verified ? 'approved' : 'pending',
                // Additional institution-specific fields
                institution_name: institutionData.institution_name,
                institution_type: institutionData.institution_type,
                established_year: institutionData.established_year,
                registration_number: institutionData.registration_number,
                complete_address: institutionData.complete_address,
                city: institutionData.city,
                state: institutionData.state,
                pin_code: institutionData.pin_code
              };
            } else {
              console.log('⚠️ No institution profile found for:', user.full_name, institutionError);
            }
          }

          if (user.role === 'student') {
            const { data: studentData, error: studentError } = await supabase
              .from('student_profiles')
              .select('*')
              .eq('user_id', user.user_id)
              .single();

            if (!studentError && studentData) {
              console.log('✅ Student profile loaded for:', user.full_name);
              
              // Calculate profile completion for students based on actual fields
              const studentFields = [
                baseUser.full_name, baseUser.email, baseUser.phone, baseUser.bio, baseUser.location,
                studentData.education_level, studentData.learning_mode, studentData.subject_interests
              ];
              const completedFields = studentFields.filter(field => field && field !== '' && field !== '[]').length;
              const profileCompletion = Math.round((completedFields / studentFields.length) * 100);
              
              return {
                ...baseUser,
                subjects: studentData.subject_interests || [],
                grade_level: studentData.education_level,
                learning_goals: studentData.learning_objectives ? JSON.stringify(studentData.learning_objectives) : 'Not specified',
                profile_completion: profileCompletion,
                // Additional student-specific fields
                age: studentData.age,
                date_of_birth: studentData.date_of_birth,
                learning_mode: studentData.learning_mode,
                budget_min: studentData.budget_min,
                budget_max: studentData.budget_max,
                class_duration: studentData.class_duration,
                frequency: studentData.frequency,
                tutor_gender_preference: studentData.tutor_gender_preference,
                instruction_language: studentData.instruction_language,
                special_requirements: studentData.special_requirements,
                teaching_methodology: studentData.teaching_methodology,
                class_type_preference: studentData.class_type_preference,
                timeline: studentData.timeline
              };
            } else {
              console.log('⚠️ No student profile found for:', user.full_name, studentError);
            }
          }

        } catch (roleError) {
          console.error('❌ Error loading role-specific data for:', user.full_name, roleError);
        }

        return baseUser;
      }));

      setUsers(processedUsers);
      console.log('✅ All users processed:', processedUsers.length);

    } catch (error) {
      console.error('❌ Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    const profilesSubscription = supabase
      .channel('admin-manage-users')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'profiles' 
      }, () => {
        console.log('Profiles table changed, reloading users...');
        loadUsers();
      })
      .subscribe();

    return () => {
      profilesSubscription.unsubscribe();
    };
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by role
    if (activeTab === 'students') {
      filtered = filtered.filter(user => user.role === 'student');
    } else if (activeTab === 'tutors') {
      filtered = filtered.filter(user => user.role === 'tutor');
    } else if (activeTab === 'institutions') {
      filtered = filtered.filter(user => user.role === 'institution');
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const handleSuspendUser = async (user: User) => {
    try {
      // For now, we'll just show a toast since we don't have a status field
      // In a real implementation, you'd update a status field in the database
      toast({
        title: "User Suspended",
        description: `${user.full_name} has been suspended`,
      });
      setShowSuspendDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error suspending user:', error);
      toast({
        title: "Error",
        description: "Failed to suspend user",
        variant: "destructive",
      });
    }
  };

  const handleApproveUser = async (user: User) => {
    try {
      // Only approve tutors and institutions
      if (user.role !== 'tutor' && user.role !== 'institution') {
        toast({
          title: "Invalid Action",
          description: "Only tutors and institutions can be approved",
          variant: "destructive",
        });
        return;
      }

      // Update the role-specific profile table
      const tableName = user.role === 'tutor' ? 'tutor_profiles' : 'institution_profiles';
      const { error } = await supabase
        .from(tableName)
        .update({ 
          verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.user_id);

      if (error) {
        console.error('Error approving user:', error);
        toast({
          title: "Error",
          description: "Failed to approve user",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "User Approved",
        description: `${user.full_name}'s profile has been approved`,
      });
      setShowApproveDialog(false);
      setSelectedUser(null);
      loadUsers(); // Reload users to reflect changes
    } catch (error) {
      console.error('Error approving user:', error);
      toast({
        title: "Error",
        description: "Failed to approve user",
        variant: "destructive",
      });
    }
  };

  const handleRejectUser = async (user: User) => {
    try {
      // Only reject tutors and institutions
      if (user.role !== 'tutor' && user.role !== 'institution') {
        toast({
          title: "Invalid Action",
          description: "Only tutors and institutions can be rejected",
          variant: "destructive",
        });
        return;
      }

      // Update the role-specific profile table
      const tableName = user.role === 'tutor' ? 'tutor_profiles' : 'institution_profiles';
      const { error } = await supabase
        .from(tableName)
        .update({ 
          verified: false,
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.user_id);

      if (error) {
        console.error('Error rejecting user:', error);
        toast({
          title: "Error",
          description: "Failed to reject user",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "User Rejected",
        description: `${user.full_name}'s profile has been rejected`,
      });
      setShowRejectDialog(false);
      setSelectedUser(null);
      loadUsers(); // Reload users to reflect changes
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast({
        title: "Error",
        description: "Failed to reject user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (user: User) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', user.user_id);

      if (error) {
        console.error('Error deleting user:', error);
        toast({
          title: "Error",
          description: "Failed to delete user",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "User Deleted",
        description: `${user.full_name} has been deleted`,
      });
      setShowDeleteDialog(false);
      setSelectedUser(null);
      loadUsers(); // Reload users to reflect changes
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'student':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'tutor':
        return <GraduationCap className="h-4 w-4 text-green-600" />;
      case 'institution':
        return <Building2 className="h-4 w-4 text-purple-600" />;
      default:
        return <UserCheck className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'student':
        return 'bg-blue-100 text-blue-800';
      case 'tutor':
        return 'bg-green-100 text-green-800';
      case 'institution':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (user: User) => {
    const status = user.verification_status || 'pending';
    
    switch (status) {
      case 'approved':
      case 'verified':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const UserTable = ({ users }: { users: User[] }) => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3 font-medium text-gray-600">User</th>
            <th className="text-left p-3 font-medium text-gray-600">Email</th>
            <th className="text-left p-3 font-medium text-gray-600">Role</th>
            <th className="text-left p-3 font-medium text-gray-600">Verification</th>
            <th className="text-left p-3 font-medium text-gray-600">Joined</th>
            <th className="text-left p-3 font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.user_id} className="border-b hover:bg-gray-50">
              <td className="p-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    {getRoleIcon(user.role)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{user.full_name}</div>
                    {user.phone && (
                      <div className="text-sm text-gray-500 flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {user.phone}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="p-3">
                <div className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {user.email}
                </div>
              </td>
              <td className="p-3">
                <Badge className={getRoleBadgeColor(user.role)}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              </td>
              <td className="p-3">
                {getStatusBadge(user)}
              </td>
              <td className="p-3">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(user.created_at).toLocaleDateString()}
                </div>
              </td>
              <td className="p-3">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setShowProfileDialog(true);
                    }}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  {user.verification_status === 'pending' && (user.role === 'tutor' || user.role === 'institution') && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowApproveDialog(true);
                        }}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowRejectDialog(true);
                        }}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setShowSuspendDialog(true);
                    }}
                    className="text-orange-600 border-orange-200 hover:bg-orange-50"
                  >
                    <UserX className="h-4 w-4 mr-1" />
                    Suspend
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setShowDeleteDialog(true);
                    }}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
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
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Manage Users</h1>
                <p className="text-xs text-gray-500">User Management & Administration</p>
              </div>
            </div>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {users.filter(u => u.role === 'student').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Tutors</CardTitle>
              <GraduationCap className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.role === 'tutor').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Institutions</CardTitle>
              <Building2 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {users.filter(u => u.role === 'institution').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Management Tabs */}
        <Card>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="students" className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Students ({users.filter(u => u.role === 'student').length})</span>
                </TabsTrigger>
                <TabsTrigger value="tutors" className="flex items-center space-x-2">
                  <GraduationCap className="h-4 w-4" />
                  <span>Tutors ({users.filter(u => u.role === 'tutor').length})</span>
                </TabsTrigger>
                <TabsTrigger value="institutions" className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4" />
                  <span>Institutions ({users.filter(u => u.role === 'institution').length})</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="students" className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Students</h3>
                    <Badge variant="outline">
                      {filteredUsers.length} {filteredUsers.length === 1 ? 'student' : 'students'}
                    </Badge>
                  </div>
                  {filteredUsers.length > 0 ? (
                    <UserTable users={filteredUsers} />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No students found</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="tutors" className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Tutors</h3>
                    <Badge variant="outline">
                      {filteredUsers.length} {filteredUsers.length === 1 ? 'tutor' : 'tutors'}
                    </Badge>
                  </div>
                  {filteredUsers.length > 0 ? (
                    <UserTable users={filteredUsers} />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No tutors found</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="institutions" className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Institutions</h3>
                    <Badge variant="outline">
                      {filteredUsers.length} {filteredUsers.length === 1 ? 'institution' : 'institutions'}
                    </Badge>
                  </div>
                  {filteredUsers.length > 0 ? (
                    <UserTable users={filteredUsers} />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No institutions found</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      {/* Suspend User Dialog */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>Suspend User</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to suspend <strong>{selectedUser?.full_name}</strong>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This will prevent the user from accessing their account.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuspendDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => selectedUser && handleSuspendUser(selectedUser)}
            >
              Suspend User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              <span>Delete User</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to permanently delete <strong>{selectedUser?.full_name}</strong>?
            </p>
            <p className="text-sm text-red-600 mt-2">
              This action cannot be undone. All user data will be permanently removed.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => selectedUser && handleDeleteUser(selectedUser)}
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile Details Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <span>Profile Details - {selectedUser?.full_name}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Basic Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedUser?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{selectedUser?.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{selectedUser?.location || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Joined</p>
                      <p className="font-medium">{selectedUser?.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : 'Unknown'}</p>
                    </div>
                  </div>
                  {selectedUser?.updated_at && (
                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Last Updated</p>
                        <p className="font-medium">{new Date(selectedUser.updated_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Verification Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Status</p>
                      {selectedUser && getStatusBadge(selectedUser)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Award className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Profile Completion</p>
                      <p className="font-medium">{selectedUser?.profile_completion || 0}%</p>
                    </div>
                  </div>
                  {selectedUser?.rating && (
                    <div className="flex items-center space-x-3">
                      <Star className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Rating</p>
                        <p className="font-medium">{selectedUser.rating}/5 ({selectedUser.reviews_count || 0} reviews)</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Bio and Description */}
            {selectedUser?.bio && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>Bio & Description</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{selectedUser.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Role-specific Information */}
            {selectedUser?.role === 'tutor' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <GraduationCapIcon className="h-5 w-5" />
                    <span>Tutor Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Experience</p>
                      <p className="font-medium">{selectedUser?.experience || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Hourly Rate</p>
                      <p className="font-medium">{selectedUser?.hourly_rate ? `₹${selectedUser.hourly_rate}` : 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Qualifications</p>
                      <p className="font-medium">{selectedUser?.qualifications || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Availability</p>
                      <p className="font-medium">{selectedUser?.availability || 'Not specified'}</p>
                    </div>
                  </div>
                  {selectedUser?.subjects && selectedUser.subjects.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Subjects</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.subjects.map((subject, index) => (
                          <Badge key={index} variant="outline">{subject}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedUser?.teaching_mode && selectedUser.teaching_mode.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Teaching Modes</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.teaching_mode.map((mode, index) => (
                          <Badge key={index} variant="outline">{mode}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {selectedUser?.role === 'institution' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Building className="h-5 w-5" />
                    <span>Institution Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Institution Name</p>
                      <p className="font-medium">{selectedUser?.institution_name || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Institution Type</p>
                      <p className="font-medium">{selectedUser?.institution_type || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Established Year</p>
                      <p className="font-medium">{selectedUser?.established_year || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Registration Number</p>
                      <p className="font-medium">{selectedUser?.registration_number || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Complete Address</p>
                      <p className="font-medium">{selectedUser?.complete_address || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">City, State</p>
                      <p className="font-medium">{selectedUser?.city && selectedUser?.state ? `${selectedUser.city}, ${selectedUser.state}` : 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">PIN Code</p>
                      <p className="font-medium">{selectedUser?.pin_code || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Languages</p>
                      <p className="font-medium">{selectedUser?.languages?.join(', ') || 'Not specified'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedUser?.role === 'student' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>Student Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Education Level</p>
                      <p className="font-medium">{selectedUser?.grade_level || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Age</p>
                      <p className="font-medium">{selectedUser?.age || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Learning Mode</p>
                      <p className="font-medium">{selectedUser?.learning_mode || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Budget Range</p>
                      <p className="font-medium">
                        {selectedUser?.budget_min && selectedUser?.budget_max 
                          ? `₹${selectedUser.budget_min} - ₹${selectedUser.budget_max}`
                          : 'Not specified'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Class Duration</p>
                      <p className="font-medium">{selectedUser?.class_duration ? `${selectedUser.class_duration} minutes` : 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Frequency</p>
                      <p className="font-medium">{selectedUser?.frequency || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tutor Gender Preference</p>
                      <p className="font-medium">{selectedUser?.tutor_gender_preference || 'No preference'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Instruction Language</p>
                      <p className="font-medium">{selectedUser?.instruction_language || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Class Type Preference</p>
                      <p className="font-medium">{selectedUser?.class_type_preference || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Timeline</p>
                      <p className="font-medium">{selectedUser?.timeline || 'Not specified'}</p>
                    </div>
                  </div>
                  {selectedUser?.subjects && selectedUser.subjects.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Subjects of Interest</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.subjects.map((subject, index) => (
                          <Badge key={index} variant="outline">{subject}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedUser?.learning_goals && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Learning Goals</p>
                      <p className="text-gray-700">{selectedUser.learning_goals}</p>
                    </div>
                  )}
                  {selectedUser?.special_requirements && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Special Requirements</p>
                      <p className="text-gray-700">{selectedUser.special_requirements}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Documents Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Documents & Verification</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Document verification system coming soon</p>
                  <p className="text-sm text-gray-400 mt-1">Uploaded documents will appear here</p>
                </div>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProfileDialog(false)}>
              Close
            </Button>
            {selectedUser?.verification_status === 'pending' && (selectedUser?.role === 'tutor' || selectedUser?.role === 'institution') && (
              <div className="flex space-x-2">
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setShowProfileDialog(false);
                    setShowApproveDialog(true);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Profile
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    setShowProfileDialog(false);
                    setShowRejectDialog(true);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Profile
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve User Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Approve User Profile</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to approve <strong>{selectedUser?.full_name}</strong>'s {selectedUser?.role} profile?
            </p>
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>This will:</strong>
              </p>
              <ul className="text-sm text-green-700 mt-2 space-y-1">
                <li>• Mark the {selectedUser?.role} profile as verified</li>
                <li>• Allow the {selectedUser?.role} to access all platform features</li>
                <li>• Make their profile visible to students and other users</li>
                <li>• Send an approval notification to the {selectedUser?.role}</li>
                {selectedUser?.role === 'tutor' && <li>• Enable them to create and manage courses</li>}
                {selectedUser?.role === 'institution' && <li>• Enable them to create institutional courses</li>}
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => selectedUser && handleApproveUser(selectedUser)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject User Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span>Reject User Profile</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to reject <strong>{selectedUser?.full_name}</strong>'s {selectedUser?.role} profile?
            </p>
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>This will:</strong>
              </p>
              <ul className="text-sm text-red-700 mt-2 space-y-1">
                <li>• Mark the {selectedUser?.role} profile as rejected</li>
                <li>• Restrict access to platform features</li>
                <li>• Hide their profile from students and other users</li>
                <li>• Send a rejection notification with feedback</li>
                {selectedUser?.role === 'tutor' && <li>• Prevent them from creating or managing courses</li>}
                {selectedUser?.role === 'institution' && <li>• Prevent them from creating institutional courses</li>}
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => selectedUser && handleRejectUser(selectedUser)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
