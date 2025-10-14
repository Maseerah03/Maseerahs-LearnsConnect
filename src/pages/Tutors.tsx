import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, BookOpen, ArrowRight, Users, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';

interface TutorProfile {
  id: string;
  user_id: string;
  bio: string;
  experience_years: number;
  hourly_rate_min: number;
  hourly_rate_max: number;
  teaching_mode: string;
  qualifications: any;
  availability: any;
  verified: boolean;
  created_at: string;
  profile: {
    full_name: string;
    city: string;
    area: string;
  };
  subjects?: string[];
}

export default function Tutors() {
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const tutorsPerPage = 10;

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      setLoading(true);
      
      // First fetch ALL tutor profiles
      const { data: tutorData, error: tutorError } = await supabase
        .from('tutor_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (tutorError) {
        console.error('Error fetching tutor profiles:', tutorError);
        return;
      }

      if (!tutorData || tutorData.length === 0) {
        console.log('No tutor profiles found');
        setTutors([]);
        return;
      }

      console.log('Found tutor profiles:', tutorData.length);

      // Then fetch the corresponding user profiles (optional - don't fail if no profiles found)
      const userIds = tutorData.map(tutor => tutor.user_id);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, full_name, city, area')
        .in('user_id', userIds);

      if (profileError) {
        console.error('Error fetching profiles (continuing without profiles):', profileError);
      }

      // Create a map of user_id to profile data
      const profileMap = new Map(profileData?.map(profile => [profile.user_id, profile]) || []);
      console.log('Found profiles:', profileData?.length || 0);

      // Transform the data to match our interface
      const transformedTutors = tutorData.map(tutor => {
        const profile = profileMap.get(tutor.user_id);
        return {
          ...tutor,
          profile: profile || {
            full_name: 'Expert Tutor',
            city: 'Various Locations',
            area: 'Online & In-Person'
          },
          // Extract subjects from qualifications if available
          subjects: tutor.qualifications?.subjects || []
        };
      });

      setTutors(transformedTutors);
    } catch (error) {
      console.error('Error fetching tutors:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriceRange = (min: number, max: number) => {
    if (min === max) return `₹${min}/hr`;
    return `₹${min}-${max}/hr`;
  };

  const getSubjects = (tutor: TutorProfile) => {
    if (tutor.subjects && tutor.subjects.length > 0) {
      return tutor.subjects.join(', ');
    }
    return 'General Tutoring';
  };

  // Filter tutors based on search and subject
  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch = searchTerm === "" || 
      tutor.profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutor.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getSubjects(tutor).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = selectedSubject === "all" || 
      getSubjects(tutor).toLowerCase().includes(selectedSubject.toLowerCase());
    
    return matchesSearch && matchesSubject;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTutors.length / tutorsPerPage);
  const startIndex = (currentPage - 1) * tutorsPerPage;
  const endIndex = startIndex + tutorsPerPage;
  const currentTutors = filteredTutors.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSubject]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Loading tutors...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Find Your Perfect
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {" "}Tutor
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect with verified, experienced tutors who are passionate about helping you succeed
            </p>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Users className="h-5 w-5" />
              <span>{tutors.length} verified tutors available</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-background/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search Input */}
              <div className="flex-1 w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tutors by name, subject, or expertise..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>
              
              {/* Subject Filter */}
              <div className="w-full md:w-48">
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                    <SelectItem value="biology">Biology</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="hindi">Hindi</SelectItem>
                    <SelectItem value="sanskrit">Sanskrit</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                    <SelectItem value="geography">Geography</SelectItem>
                    <SelectItem value="economics">Economics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Search Results Info */}
            <div className="mt-4 text-center">
              <p className="text-muted-foreground">
                {searchTerm || selectedSubject !== "all" ? (
                  <>Showing {filteredTutors.length} of {tutors.length} tutors</>
                ) : (
                  <>All {tutors.length} tutors available</>
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tutors Grid */}
      <section className="pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {filteredTutors.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-muted-foreground mb-4">
                <Users className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {searchTerm || selectedSubject !== "all" ? "No tutors match your search" : "No tutors available"}
                </h3>
                <p>
                  {searchTerm || selectedSubject !== "all" 
                    ? "Try adjusting your search criteria or browse all tutors below" 
                    : "Check back later for available tutors or become one yourself!"
                  }
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentTutors.map((tutor) => (
                <Card key={tutor.id} className="group hover:shadow-medium hover:-translate-y-1 transition-all duration-300 border-0 bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-sm">
                  <CardContent className="p-6">
                    {/* Tutor Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-16 w-16 border-2 border-primary/20">
                        <AvatarFallback className="bg-gradient-subtle text-primary font-semibold text-lg">
                          {tutor.profile.full_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                          {tutor.profile.full_name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <BookOpen className="h-4 w-4" />
                          <span className="truncate">{getSubjects(tutor)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{tutor.profile.city}, {tutor.profile.area}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-3">
                      {tutor.bio || 'Passionate educator dedicated to student success'}
                    </p>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">4.8</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{tutor.experience_years}+ years</span>
                        <span>•</span>
                        <span className="text-sm font-medium text-primary">
                          {getPriceRange(tutor.hourly_rate_min, tutor.hourly_rate_max)}
                        </span>
                      </div>
                    </div>

                    {/* Teaching Mode */}
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline" className="text-xs">
                        {tutor.teaching_mode || 'Online'}
                      </Badge>
                      {tutor.verified && (
                        <Badge variant="default" className="text-xs">
                          ✓ Verified
                        </Badge>
                      )}
                    </div>

                    {/* Action Button */}
                    <Link to="/signup-choice">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        View Profile
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-10 h-10"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
              
              {/* Page Info */}
              <div className="text-center mt-4 text-muted-foreground">
                <p>
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredTutors.length)} of {filteredTutors.length} tutors
                  {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* All Tutors Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Browse All Available Tutors
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore our complete directory of verified tutors across all subjects and locations
            </p>
          </div>

          {tutors.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-muted-foreground mb-4">
                <Users className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No tutors available</h3>
                <p>Check back later for available tutors or become one yourself!</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {tutors.map((tutor) => (
                  <Card key={tutor.id} className="group hover:shadow-medium hover:-translate-y-1 transition-all duration-300 border-0 bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-sm">
                    <CardContent className="p-6">
                      {/* Tutor Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <Avatar className="h-16 w-16 border-2 border-primary/20">
                          <AvatarFallback className="bg-gradient-subtle text-primary font-semibold text-lg">
                            {tutor.profile.full_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                            {tutor.profile.full_name}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <BookOpen className="h-4 w-4" />
                            <span className="truncate">{getSubjects(tutor)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{tutor.profile.city}, {tutor.profile.area}</span>
                          </div>
                        </div>
                      </div>

                      {/* Bio */}
                      <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-3">
                        {tutor.bio || 'Passionate educator dedicated to student success'}
                      </p>

                      {/* Stats Row */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">4.8</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{tutor.experience_years}+ years</span>
                          <span>•</span>
                          <span className="text-sm font-medium text-primary">
                            {getPriceRange(tutor.hourly_rate_min, tutor.hourly_rate_max)}
                          </span>
                        </div>
                      </div>

                      {/* Teaching Mode */}
                      <div className="flex items-center gap-2 mb-4">
                        <Badge variant="outline" className="text-xs">
                          {tutor.teaching_mode || 'Online'}
                        </Badge>
                        {tutor.verified && (
                          <Badge variant="default" className="text-xs">
                            ✓ Verified
                          </Badge>
                        )}
                      </div>

                      {/* Action Button */}
                      <Link to="/signup-choice">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          View Profile
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Total Count */}
              <div className="text-center mt-8">
                <p className="text-muted-foreground">
                  Total: {tutors.length} verified tutors available
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Signup CTA */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Find Your Perfect Tutor?
            </h2>
            <p className="text-xl text-muted-foreground">
              Sign up now to access complete tutor profiles, book sessions, and start your learning journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup-choice">
                <Button 
                  size="lg"
                  className="bg-gradient-primary hover:bg-gradient-primary/90 shadow-medium text-lg px-8 py-3 h-auto"
                >
                  Sign Up Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 text-lg px-8 py-3 h-auto"
                >
                  Already have an account? Log in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
