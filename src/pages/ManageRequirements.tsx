import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  FileText, 
  Users, 
  CheckCircle, 
  XCircle, 
  Shield,
  AlertTriangle,
  Search,
  Filter,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  BookOpen
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface Requirement {
  id: string;
  student_id: string;
  category: string;
  subject: string;
  location: string;
  description: string;
  preferred_teaching_mode: string;
  preferred_time: string;
  budget_range: string;
  urgency: string;
  additional_requirements?: string;
  class_level?: string;
  board?: string;
  exam_preparation?: string;
  skill_level?: string;
  age_group?: string;
  specific_topics?: string;
  learning_goals?: string;
  status: 'active' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  student_name?: string;
  student_email?: string;
}

export default function ManageRequirements() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [filteredRequirements, setFilteredRequirements] = useState<Requirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate('/admin/login');
      return;
    }
    
    loadRequirements();
    setupRealtimeSubscriptions();
  }, [navigate]);

  useEffect(() => {
    filterRequirements();
  }, [requirements, searchTerm]);

  const loadRequirements = async () => {
    try {
      setIsLoading(true);
      
      // Load requirements
      const { data: requirementsData, error: requirementsError } = await supabase
        .from('requirements')
        .select('*')
        .order('created_at', { ascending: false });

      if (requirementsError) {
        console.error('Error loading requirements:', requirementsError);
        toast({
          title: "Error",
          description: "Failed to load requirements data",
          variant: "destructive",
        });
        return;
      }

      // Get student information for each requirement
      const studentIds = requirementsData?.map(r => r.student_id) || [];
      const { data: studentProfiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', studentIds)
        .eq('role', 'student');

      // Process requirements with student information
      const processedRequirements: Requirement[] = (requirementsData || []).map(requirement => {
        const studentProfile = studentProfiles?.find(p => p.user_id === requirement.student_id);
        return {
          ...requirement,
          student_name: studentProfile?.full_name || 'Unknown Student',
          student_email: studentProfile?.email || 'No email'
        };
      });

      setRequirements(processedRequirements);

      console.log('Requirements loaded:', {
        total: processedRequirements.length,
        active: processedRequirements.filter(r => r.status === 'active').length,
        inProgress: processedRequirements.filter(r => r.status === 'in_progress').length,
        completed: processedRequirements.filter(r => r.status === 'completed').length,
        cancelled: processedRequirements.filter(r => r.status === 'cancelled').length
      });

    } catch (error) {
      console.error('Error loading requirements:', error);
      toast({
        title: "Error",
        description: "Failed to load requirements data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    const requirementsSubscription = supabase
      .channel('admin-manage-requirements')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'requirements' 
      }, () => {
        console.log('Requirements table changed, reloading requirements...');
        loadRequirements();
      })
      .subscribe();

    return () => {
      requirementsSubscription.unsubscribe();
    };
  };

  const filterRequirements = () => {
    let filtered = requirements;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(requirement => 
        requirement.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        requirement.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        requirement.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequirements(filtered);
  };

  const handleApproveRequirement = async (requirement: Requirement) => {
    try {
      const { error } = await supabase
        .from('requirements')
        .update({ 
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', requirement.id);

      if (error) {
        console.error('Error approving requirement:', error);
        toast({
          title: "Error",
          description: "Failed to approve requirement",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Requirement Approved",
        description: `${requirement.student_name}'s requirement has been approved`,
      });
      setShowApproveDialog(false);
      setSelectedRequirement(null);
      loadRequirements(); // Reload requirements to reflect changes
    } catch (error) {
      console.error('Error approving requirement:', error);
      toast({
        title: "Error",
        description: "Failed to approve requirement",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequirement = async (requirement: Requirement) => {
    try {
      const { error } = await supabase
        .from('requirements')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', requirement.id);

      if (error) {
        console.error('Error rejecting requirement:', error);
        toast({
          title: "Error",
          description: "Failed to reject requirement",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Requirement Rejected",
        description: `${requirement.student_name}'s requirement has been rejected`,
      });
      setShowRejectDialog(false);
      setSelectedRequirement(null);
      loadRequirements(); // Reload requirements to reflect changes
    } catch (error) {
      console.error('Error rejecting requirement:', error);
      toast({
        title: "Error",
        description: "Failed to reject requirement",
        variant: "destructive",
      });
    }
  };

  const handleCompleteRequirement = async (requirement: Requirement) => {
    try {
      const { error } = await supabase
        .from('requirements')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', requirement.id);

      if (error) {
        console.error('Error completing requirement:', error);
        toast({
          title: "Error",
          description: "Failed to complete requirement",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Requirement Completed",
        description: `${requirement.student_name}'s requirement has been marked as completed`,
      });
      setShowCompleteDialog(false);
      setSelectedRequirement(null);
      loadRequirements(); // Reload requirements to reflect changes
    } catch (error) {
      console.error('Error completing requirement:', error);
      toast({
        title: "Error",
        description: "Failed to complete requirement",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800">Active</Badge>;
      case 'in_progress':
        return <Badge className="bg-green-100 text-green-800">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case 'normal':
        return <Badge className="bg-yellow-100 text-yellow-800">Normal</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{urgency}</Badge>;
    }
  };

  const getBudgetDisplay = (budgetRange: string) => {
    switch (budgetRange) {
      case '500-1000':
        return '₹500 - ₹1,000';
      case '1000-2000':
        return '₹1,000 - ₹2,000';
      case '2000-3000':
        return '₹2,000 - ₹3,000';
      case '3000+':
        return '₹3,000+';
      default:
        return budgetRange;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading requirements...</p>
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
                <h1 className="text-xl font-semibold text-gray-900">Manage Requirements</h1>
                <p className="text-xs text-gray-500">Student Requirements Management</p>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Requirements</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {requirements.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {requirements.filter(r => r.status === 'active').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {requirements.filter(r => r.status === 'in_progress').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
              <XCircle className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">
                {requirements.filter(r => r.status === 'completed').length}
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
                    placeholder="Search requirements by student, subject, or description..."
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

        {/* Requirements Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">All Requirements</CardTitle>
              <Badge variant="outline">
                {filteredRequirements.length} {filteredRequirements.length === 1 ? 'requirement' : 'requirements'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {filteredRequirements.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium text-gray-600">Student Name</th>
                      <th className="text-left p-3 font-medium text-gray-600">Subject</th>
                      <th className="text-left p-3 font-medium text-gray-600">Budget</th>
                      <th className="text-left p-3 font-medium text-gray-600">Status</th>
                      <th className="text-left p-3 font-medium text-gray-600">Urgency</th>
                      <th className="text-left p-3 font-medium text-gray-600">Created</th>
                      <th className="text-left p-3 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequirements.map((requirement) => (
                      <tr key={requirement.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{requirement.student_name}</div>
                              <div className="text-sm text-gray-500">{requirement.student_email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div>
                            <div className="font-medium text-gray-900">{requirement.subject}</div>
                            <div className="text-sm text-gray-500">{requirement.category}</div>
                            {requirement.class_level && (
                              <div className="text-xs text-gray-400">{requirement.class_level}</div>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center text-gray-600">
                            <DollarSign className="h-4 w-4 mr-2" />
                            {getBudgetDisplay(requirement.budget_range)}
                          </div>
                        </td>
                        <td className="p-3">
                          {getStatusBadge(requirement.status)}
                        </td>
                        <td className="p-3">
                          {getUrgencyBadge(requirement.urgency)}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            {new Date(requirement.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-2">
                            {requirement.status === 'active' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedRequirement(requirement);
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
                                    setSelectedRequirement(requirement);
                                    setShowRejectDialog(true);
                                  }}
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                            {requirement.status === 'in_progress' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedRequirement(requirement);
                                  setShowCompleteDialog(true);
                                }}
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Mark Complete
                              </Button>
                            )}
                            {requirement.status === 'completed' && (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className="text-gray-400"
                              >
                                Completed
                              </Button>
                            )}
                            {requirement.status === 'cancelled' && (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className="text-gray-400"
                              >
                                Rejected
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No requirements found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Approve Requirement Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Approve Requirement</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to approve <strong>{selectedRequirement?.student_name}</strong>'s requirement for <strong>{selectedRequirement?.subject}</strong>?
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Requirement Details:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Subject:</strong> {selectedRequirement?.subject}</p>
                <p><strong>Budget:</strong> {selectedRequirement?.budget_range && getBudgetDisplay(selectedRequirement.budget_range)}</p>
                <p><strong>Location:</strong> {selectedRequirement?.location}</p>
                <p><strong>Teaching Mode:</strong> {selectedRequirement?.preferred_teaching_mode}</p>
                {selectedRequirement?.description && (
                  <p><strong>Description:</strong> {selectedRequirement.description}</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => selectedRequirement && handleApproveRequirement(selectedRequirement)}
            >
              Approve Requirement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Requirement Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span>Reject Requirement</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to reject <strong>{selectedRequirement?.student_name}</strong>'s requirement for <strong>{selectedRequirement?.subject}</strong>?
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Requirement Details:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Subject:</strong> {selectedRequirement?.subject}</p>
                <p><strong>Budget:</strong> {selectedRequirement?.budget_range && getBudgetDisplay(selectedRequirement.budget_range)}</p>
                <p><strong>Location:</strong> {selectedRequirement?.location}</p>
                <p><strong>Teaching Mode:</strong> {selectedRequirement?.preferred_teaching_mode}</p>
                {selectedRequirement?.description && (
                  <p><strong>Description:</strong> {selectedRequirement.description}</p>
                )}
              </div>
            </div>
            <p className="text-sm text-red-600 mt-2">
              This will mark the requirement as cancelled and notify the student.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => selectedRequirement && handleRejectRequirement(selectedRequirement)}
            >
              Reject Requirement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Requirement Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <span>Mark Requirement Complete</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to mark <strong>{selectedRequirement?.student_name}</strong>'s requirement for <strong>{selectedRequirement?.subject}</strong> as completed?
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Requirement Details:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Subject:</strong> {selectedRequirement?.subject}</p>
                <p><strong>Budget:</strong> {selectedRequirement?.budget_range && getBudgetDisplay(selectedRequirement.budget_range)}</p>
                <p><strong>Location:</strong> {selectedRequirement?.location}</p>
                <p><strong>Teaching Mode:</strong> {selectedRequirement?.preferred_teaching_mode}</p>
                {selectedRequirement?.description && (
                  <p><strong>Description:</strong> {selectedRequirement.description}</p>
                )}
              </div>
            </div>
            <p className="text-sm text-blue-600 mt-2">
              This will mark the requirement as completed and move it to the completed status.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => selectedRequirement && handleCompleteRequirement(selectedRequirement)}
            >
              Mark Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
