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
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<string[]>([]);
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

  // Filter tutors based on search and multiple filters
  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch = searchTerm === "" || 
      tutor.profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutor.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getSubjects(tutor).toLowerCase().includes(searchTerm.toLowerCase());
    
    // Check subjects filter
    const matchesSubjects = selectedSubjects.length === 0 || 
      selectedSubjects.some(subject => 
        getSubjects(tutor).toLowerCase().includes(subject.toLowerCase())
      );
    
    // Check mode filter (online/offline)
    const matchesModes = selectedModes.length === 0 || 
      selectedModes.some(mode => {
        const tutorMode = tutor.teaching_mode?.toLowerCase() || '';
        return mode.toLowerCase() === 'online' ? tutorMode.includes('online') : tutorMode.includes('offline');
      });
    
    // Check gender filter (assuming we have gender in profile)
    const matchesGenders = selectedGenders.length === 0 || 
      selectedGenders.some(gender => {
        // This would need to be implemented based on your data structure
        // For now, we'll assume it's available in the profile
        return true; // Placeholder - implement based on actual data structure
      });
    
    // Check radius filter (this would need location-based filtering)
    const matchesRadius = selectedRadius.length === 0 || 
      selectedRadius.some(radius => {
        // This would need to be implemented with actual location data
        return true; // Placeholder - implement based on actual location data
      });
    
    return matchesSearch && matchesSubjects && matchesModes && matchesGenders && matchesRadius;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTutors.length / tutorsPerPage);
  const startIndex = (currentPage - 1) * tutorsPerPage;
  const endIndex = startIndex + tutorsPerPage;
  const currentTutors = filteredTutors.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSubjects, selectedModes, selectedGenders, selectedRadius]);

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
      <section className="pt-16 sm:pt-20 pb-12 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Find Your Perfect
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {" "}Tutor
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect with verified, experienced tutors who are passionate about helping you succeed
            </p>
            {/* Temporarily disabled - Tutor count display */}
            {/* <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">{tutors.length} verified tutors available</span>
            </div> */}
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-6 sm:py-8 bg-background/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Search Input */}
            <div className="mb-6">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tutors by name, subject, or expertise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 sm:h-12 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Multi-Select Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Subjects/Skills Filter */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Subjects/Skills</label>
                <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                  {[
                    'mathematics', 'physics', 'chemistry', 'biology', 'english', 
                    'hindi', 'sanskrit', 'history', 'geography', 'economics',
                    'computer-science', 'art', 'music'
                  ].map((subject) => (
                    <label key={subject} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedSubjects.includes(subject)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSubjects(prev => [...prev, subject]);
                          } else {
                            setSelectedSubjects(prev => prev.filter(s => s !== subject));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="capitalize">{subject.replace('-', ' ')}</span>
                    </label>
                  ))}
                </div>
                {selectedSubjects.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedSubjects.map((subject) => (
                      <Badge key={subject} variant="secondary" className="text-xs">
                        {subject.replace('-', ' ')}
                        <button
                          onClick={() => setSelectedSubjects(prev => prev.filter(s => s !== subject))}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Mode Filter */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Mode</label>
                <div className="space-y-2 border rounded-md p-2">
                  {['online', 'offline', 'hybrid'].map((mode) => (
                    <label key={mode} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedModes.includes(mode)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedModes(prev => [...prev, mode]);
                          } else {
                            setSelectedModes(prev => prev.filter(m => m !== mode));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="capitalize">{mode}</span>
                    </label>
                  ))}
                </div>
                {selectedModes.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedModes.map((mode) => (
                      <Badge key={mode} variant="secondary" className="text-xs">
                        {mode}
                        <button
                          onClick={() => setSelectedModes(prev => prev.filter(m => m !== mode))}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Gender Filter */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Gender</label>
                <div className="space-y-2 border rounded-md p-2">
                  {['male', 'female', 'other'].map((gender) => (
                    <label key={gender} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedGenders.includes(gender)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedGenders(prev => [...prev, gender]);
                          } else {
                            setSelectedGenders(prev => prev.filter(g => g !== gender));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="capitalize">{gender}</span>
                    </label>
                  ))}
                </div>
                {selectedGenders.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedGenders.map((gender) => (
                      <Badge key={gender} variant="secondary" className="text-xs">
                        {gender}
                        <button
                          onClick={() => setSelectedGenders(prev => prev.filter(g => g !== gender))}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Radius Filter */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Radius</label>
                <div className="space-y-2 border rounded-md p-2">
                  {['0-5', '5-10', '10-20', '20-50', '50+'].map((radius) => (
                    <label key={radius} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedRadius.includes(radius)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRadius(prev => [...prev, radius]);
                          } else {
                            setSelectedRadius(prev => prev.filter(r => r !== radius));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span>{radius} km</span>
                    </label>
                  ))}
                </div>
                {selectedRadius.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedRadius.map((radius) => (
                      <Badge key={radius} variant="secondary" className="text-xs">
                        {radius} km
                        <button
                          onClick={() => setSelectedRadius(prev => prev.filter(r => r !== radius))}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Clear All Filters Button */}
            {(selectedSubjects.length > 0 || selectedModes.length > 0 || selectedGenders.length > 0 || selectedRadius.length > 0) && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedSubjects([]);
                    setSelectedModes([]);
                    setSelectedGenders([]);
                    setSelectedRadius([]);
                  }}
                  className="text-xs"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
            
            {/* Search Results Info */}
            <div className="mt-3 sm:mt-4 text-center">
              <p className="text-sm sm:text-base text-muted-foreground">
                {searchTerm || selectedSubjects.length > 0 || selectedModes.length > 0 || selectedGenders.length > 0 || selectedRadius.length > 0 ? (
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {currentTutors.map((tutor) => (
                <Card key={tutor.id} className="group hover:shadow-medium hover:-translate-y-1 transition-all duration-300 border-0 bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-sm">
                  <CardContent className="p-4 sm:p-6">
                    {/* Tutor Header */}
                    <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 border-primary/20">
                        <AvatarFallback className="bg-gradient-subtle text-primary font-semibold text-sm sm:text-lg">
                          {tutor.profile.full_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors">
                          {tutor.profile.full_name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-1">
                          <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="truncate">{getSubjects(tutor)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{tutor.profile.city}, {tutor.profile.area}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed line-clamp-3">
                      {tutor.bio || 'Passionate educator dedicated to student success'}
                    </p>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs sm:text-sm font-medium">4.8</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                        <span>{tutor.experience_years}+ years</span>
                        <span>•</span>
                        <span className="text-xs sm:text-sm font-medium text-primary">
                          {getPriceRange(tutor.hourly_rate_min, tutor.hourly_rate_max)}
                        </span>
                      </div>
                    </div>

                    {/* Teaching Mode */}
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
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
                        className="w-full border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-colors text-xs sm:text-sm py-2 sm:py-2.5"
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
                <div className="flex justify-center items-center gap-1 sm:gap-2 mt-6 sm:mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
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
                        className="w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm"
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
                    className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
                  >
                    Next
                  </Button>
                </div>
              )}
              
              {/* Page Info */}
              <div className="text-center mt-3 sm:mt-4 text-muted-foreground">
                <p className="text-xs sm:text-sm">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredTutors.length)} of {filteredTutors.length} tutors
                  {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* All Tutors Section */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Browse All Available Tutors
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
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
      <section className="py-12 sm:py-16 text-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              Ready to Find Your Perfect Tutor?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
              Sign up now to access complete tutor profiles, book sessions, and start your learning journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link to="/signup-choice">
                <Button 
                  size="lg"
                  className="bg-gradient-primary hover:bg-gradient-primary/90 shadow-medium text-base sm:text-lg px-6 sm:px-8 py-2.5 sm:py-3 h-auto w-full sm:w-auto"
                >
                  Sign Up Now
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 text-base sm:text-lg px-6 sm:px-8 py-2.5 sm:py-3 h-auto w-full sm:w-auto"
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
