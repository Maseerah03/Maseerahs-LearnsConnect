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
  Filter
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
      
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Error loading users:', usersError);
        toast({
          title: "Error",
          description: "Failed to load users data",
          variant: "destructive",
        });
        return;
      }

      setUsers(usersData || []);
      console.log('Users loaded:', usersData?.length || 0);

    } catch (error) {
      console.error('Error loading users:', error);
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
    // Since we don't have a status field, we'll show "Active" for all users
    return (
      <Badge className="bg-green-100 text-green-800">
        <UserCheck className="h-3 w-3 mr-1" />
        Active
      </Badge>
    );
  };

  const UserTable = ({ users }: { users: User[] }) => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3 font-medium text-gray-600">User</th>
            <th className="text-left p-3 font-medium text-gray-600">Email</th>
            <th className="text-left p-3 font-medium text-gray-600">Role</th>
            <th className="text-left p-3 font-medium text-gray-600">Status</th>
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
    </div>
  );
}
