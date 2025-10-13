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
  BookOpen, 
  GraduationCap, 
  Building2, 
  Users, 
  Shield,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  EyeOff,
  Calendar,
  DollarSign
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface TutorCourse {
  id: string;
  title: string;
  description?: string;
  subject: string;
  level: string;
  duration_hours: number;
  price: number;
  currency: string;
  max_students: number;
  is_active: boolean;
  tutor_id: string;
  created_at: string;
  tutor_name?: string;
  tutor_email?: string;
  enrolled_count: number;
  type: 'tutor';
}

interface InstitutionCourse {
  id: string;
  title: string;
  description?: string;
  category: string;
  duration: string;
  fee_structure: any;
  level: string;
  status: string;
  instructor: string;
  students_enrolled: number;
  rating: number;
  total_reviews: number;
  institution_id: string;
  created_at: string;
  institution_name?: string;
  institution_email?: string;
  type: 'institution';
}

type Course = TutorCourse | InstitutionCourse;

export default function ManageCourses() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate('/admin/login');
      return;
    }
    
    loadCourses();
    setupRealtimeSubscriptions();
  }, [navigate]);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm]);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      
      // Load tutor courses
      const { data: tutorCoursesData, error: tutorCoursesError } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      // Load institution courses
      const { data: institutionCoursesData, error: institutionCoursesError } = await supabase
        .from('institution_courses')
        .select('*')
        .order('created_at', { ascending: false });

      // Load enrollment counts for tutor courses
      const { data: tutorEnrollments, error: tutorEnrollmentsError } = await supabase
        .from('course_enrollments')
        .select('course_id')
        .in('course_id', tutorCoursesData?.map(c => c.id) || []);

      // Load enrollment counts for institution courses (if they have enrollments)
      const { data: institutionEnrollments, error: institutionEnrollmentsError } = await supabase
        .from('course_enrollments')
        .select('course_id')
        .in('course_id', institutionCoursesData?.map(c => c.id) || []);

      if (tutorCoursesError || institutionCoursesError) {
        console.error('Error loading courses:', { tutorCoursesError, institutionCoursesError });
        toast({
          title: "Error",
          description: "Failed to load courses data",
          variant: "destructive",
        });
        return;
      }

      // Get tutor information for tutor courses
      const tutorIds = tutorCoursesData?.map(c => c.tutor_id) || [];
      const { data: tutorProfiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', tutorIds)
        .eq('role', 'tutor');

      // Get institution information for institution courses
      const institutionIds = institutionCoursesData?.map(c => c.institution_id) || [];
      const { data: institutionProfiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', institutionIds)
        .eq('role', 'institution');

      // Process tutor courses
      const processedTutorCourses: TutorCourse[] = (tutorCoursesData || []).map(course => {
        const tutorProfile = tutorProfiles?.find(p => p.user_id === course.tutor_id);
        return {
          ...course,
          tutor_name: tutorProfile?.full_name || 'Unknown Tutor',
          tutor_email: tutorProfile?.email || 'No email',
          enrolled_count: tutorEnrollments?.filter(e => e.course_id === course.id).length || 0,
          type: 'tutor' as const
        };
      });

      // Process institution courses
      const processedInstitutionCourses: InstitutionCourse[] = (institutionCoursesData || []).map(course => {
        const institutionProfile = institutionProfiles?.find(p => p.user_id === course.institution_id);
        return {
          ...course,
          institution_name: institutionProfile?.full_name || 'Unknown Institution',
          institution_email: institutionProfile?.email || 'No email',
          type: 'institution' as const
        };
      });

      // Combine all courses
      const allCourses = [...processedTutorCourses, ...processedInstitutionCourses];
      setCourses(allCourses);

      console.log('Courses loaded:', {
        tutorCourses: processedTutorCourses.length,
        institutionCourses: processedInstitutionCourses.length,
        total: allCourses.length
      });

    } catch (error) {
      console.error('Error loading courses:', error);
      toast({
        title: "Error",
        description: "Failed to load courses data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    const coursesSubscription = supabase
      .channel('admin-manage-courses')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'courses' 
      }, () => {
        console.log('Courses table changed, reloading courses...');
        loadCourses();
      })
      .subscribe();

    const institutionCoursesSubscription = supabase
      .channel('admin-manage-institution-courses')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'institution_courses' 
      }, () => {
        console.log('Institution courses table changed, reloading courses...');
        loadCourses();
      })
      .subscribe();

    return () => {
      coursesSubscription.unsubscribe();
      institutionCoursesSubscription.unsubscribe();
    };
  };

  const filterCourses = () => {
    let filtered = courses;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(course => 
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.type === 'tutor' ? 
          (course as TutorCourse).tutor_name?.toLowerCase().includes(searchTerm.toLowerCase()) :
          (course as InstitutionCourse).institution_name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredCourses(filtered);
  };

  const handleDeactivateCourse = async (course: Course) => {
    try {
      if (course.type === 'tutor') {
        const { error } = await supabase
          .from('courses')
          .update({ is_active: false })
          .eq('id', course.id);

        if (error) {
          console.error('Error deactivating tutor course:', error);
          toast({
            title: "Error",
            description: "Failed to deactivate course",
            variant: "destructive",
          });
          return;
        }
      } else {
        const { error } = await supabase
          .from('institution_courses')
          .update({ status: 'Inactive' })
          .eq('id', course.id);

        if (error) {
          console.error('Error deactivating institution course:', error);
          toast({
            title: "Error",
            description: "Failed to deactivate course",
            variant: "destructive",
          });
          return;
        }
      }

      toast({
        title: "Course Deactivated",
        description: `${course.title} has been deactivated`,
      });
      setShowDeactivateDialog(false);
      setSelectedCourse(null);
      loadCourses(); // Reload courses to reflect changes
    } catch (error) {
      console.error('Error deactivating course:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate course",
        variant: "destructive",
      });
    }
  };

  const getCourseTypeIcon = (course: Course) => {
    return course.type === 'tutor' ? 
      <GraduationCap className="h-4 w-4 text-green-600" /> : 
      <Building2 className="h-4 w-4 text-purple-600" />;
  };

  const getCourseTypeBadge = (course: Course) => {
    return course.type === 'tutor' ? 
      <Badge className="bg-green-100 text-green-800">Tutor Course</Badge> :
      <Badge className="bg-purple-100 text-purple-800">Institution Course</Badge>;
  };

  const getStatusBadge = (course: Course) => {
    const isActive = course.type === 'tutor' ? 
      (course as TutorCourse).is_active : 
      (course as InstitutionCourse).status === 'Active';

    return isActive ? (
      <Badge className="bg-green-100 text-green-800">
        <Eye className="h-3 w-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">
        <EyeOff className="h-3 w-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  const getInstructorInfo = (course: Course) => {
    if (course.type === 'tutor') {
      const tutorCourse = course as TutorCourse;
      return {
        name: tutorCourse.tutor_name || 'Unknown Tutor',
        email: tutorCourse.tutor_email || 'No email',
        type: 'Tutor'
      };
    } else {
      const institutionCourse = course as InstitutionCourse;
      return {
        name: institutionCourse.institution_name || 'Unknown Institution',
        email: institutionCourse.institution_email || 'No email',
        type: 'Institution'
      };
    }
  };

  const getEnrolledCount = (course: Course) => {
    if (course.type === 'tutor') {
      return (course as TutorCourse).enrolled_count;
    } else {
      return (course as InstitutionCourse).students_enrolled;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
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
                <h1 className="text-xl font-semibold text-gray-900">Manage Courses</h1>
                <p className="text-xs text-gray-500">Course Management & Administration</p>
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
              <CardTitle className="text-sm font-medium text-gray-600">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {courses.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Tutor Courses</CardTitle>
              <GraduationCap className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {courses.filter(c => c.type === 'tutor').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Institution Courses</CardTitle>
              <Building2 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {courses.filter(c => c.type === 'institution').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Enrollments</CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {courses.reduce((total, course) => total + getEnrolledCount(course), 0)}
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
                    placeholder="Search courses by name or instructor..."
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

        {/* Courses Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">All Courses</CardTitle>
              <Badge variant="outline">
                {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {filteredCourses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium text-gray-600">Course Name</th>
                      <th className="text-left p-3 font-medium text-gray-600">Type</th>
                      <th className="text-left p-3 font-medium text-gray-600">Instructor</th>
                      <th className="text-left p-3 font-medium text-gray-600">Enrolled Students</th>
                      <th className="text-left p-3 font-medium text-gray-600">Status</th>
                      <th className="text-left p-3 font-medium text-gray-600">Created</th>
                      <th className="text-left p-3 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.map((course) => {
                      const instructorInfo = getInstructorInfo(course);
                      const enrolledCount = getEnrolledCount(course);
                      const isActive = course.type === 'tutor' ? 
                        (course as TutorCourse).is_active : 
                        (course as InstitutionCourse).status === 'Active';

                      return (
                        <tr key={course.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                {getCourseTypeIcon(course)}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{course.title}</div>
                                {course.description && (
                                  <div className="text-sm text-gray-500 truncate max-w-xs">
                                    {course.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            {getCourseTypeBadge(course)}
                          </td>
                          <td className="p-3">
                            <div>
                              <div className="font-medium text-gray-900">{instructorInfo.name}</div>
                              <div className="text-sm text-gray-500">{instructorInfo.email}</div>
                              <div className="text-xs text-gray-400">{instructorInfo.type}</div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center text-gray-600">
                              <Users className="h-4 w-4 mr-2" />
                              {enrolledCount}
                            </div>
                          </td>
                          <td className="p-3">
                            {getStatusBadge(course)}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center text-gray-600">
                              <Calendar className="h-4 w-4 mr-2" />
                              {new Date(course.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex space-x-2">
                              {isActive ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedCourse(course);
                                    setShowDeactivateDialog(true);
                                  }}
                                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                                >
                                  <EyeOff className="h-4 w-4 mr-1" />
                                  Deactivate
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled
                                  className="text-gray-400"
                                >
                                  <EyeOff className="h-4 w-4 mr-1" />
                                  Deactivated
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No courses found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Deactivate Course Dialog */}
      <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>Deactivate Course</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to deactivate <strong>{selectedCourse?.title}</strong>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This will make the course unavailable for new enrollments. Existing students will retain access.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeactivateDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => selectedCourse && handleDeactivateCourse(selectedCourse)}
            >
              Deactivate Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
