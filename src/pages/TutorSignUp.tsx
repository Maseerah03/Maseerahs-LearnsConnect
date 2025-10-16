import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { ProgressBar } from "@/components/ui/progress-bar";
import { PasswordStrength } from "@/components/ui/password-strength";
import { Header } from "@/components/layout/Header";
import { 
  ArrowLeft, 
  ArrowRight, 
  User, 
  Mail, 
  Lock, 
  Upload, 
  Calendar,
  MapPin,
  BookOpen,
  DollarSign,
  AlertCircle,
  Phone,
  CreditCard,
  Loader2,
  X
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { emailRegex } from "@/lib/validation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TutorFormData {
  // Page 1: Basic Information
  title: string;
  fullName: string;
  mobileNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  gender: string;
  city: string;
  area: string;
  pinCode: string;
  termsAccepted: boolean;
  backgroundVerificationAccepted: boolean;

  // Page 2: Professional Details
  highestQualification: string;
  universityName: string;
  yearOfPassing: string;
  percentage: string;
  certificate: File | null;
  teachingExperience: string;
  previousExperience: string;
  currentlyTeaching: string;
  currentTeachingPlace: string;
  subjects: string[];
  studentLevels: string[];
  curriculum: string[];

  // Page 3: Service Information
  classType: string;
  maxTravelDistance: number;
  classSize: string[];
  availableDays: string[];
  timeSlots: Record<string, string[]>;
  individualFee: string;
  groupFee: string;
  homeTuitionFee: string;
  demoClass: string;
  demoClassFee: string;
  assignmentHelp: string;
  testPreparation: string;
  homeworkSupport: string;
  weekendClasses: string;

  // Page 4: Profile & Verification
  profilePhoto: File | null;
  profileHeadline: string;
  teachingMethodology: string;
  whyChooseMe: string;
  languages: string[];
  governmentId: File | null;
  addressProof: File | null;
  educationalCertificates: File[];
  experienceCertificates: File[];
  videoIntroduction: File | null;
}

interface ValidationErrors {
  [key: string]: string;
}

const initialFormData: TutorFormData = {
  title: "",
  fullName: "",
  mobileNumber: "",
  email: "",
  password: "",
  confirmPassword: "",
  dateOfBirth: "",
  gender: "",
  city: "",
  area: "",
  pinCode: "",
  termsAccepted: false,
  backgroundVerificationAccepted: false,
  highestQualification: "",
  universityName: "",
  yearOfPassing: "",
  percentage: "",
  certificate: null,
  teachingExperience: "",
  previousExperience: "",
  currentlyTeaching: "",
  currentTeachingPlace: "",
  subjects: [],
  studentLevels: [],
  curriculum: [],
  classType: "",
  maxTravelDistance: 10,
  classSize: [],
  availableDays: [],
  timeSlots: {},
  individualFee: "",
  groupFee: "",
  homeTuitionFee: "",
  demoClass: "",
  demoClassFee: "",
  assignmentHelp: "",
  testPreparation: "",
  homeworkSupport: "",
  weekendClasses: "",
  profilePhoto: null,
  profileHeadline: "",
  teachingMethodology: "",
  whyChooseMe: "",
  languages: [],
  governmentId: null,
  addressProof: null,
  educationalCertificates: [],
  experienceCertificates: [],
  videoIntroduction: null,
};

export default function TutorSignUp() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<TutorFormData>(initialFormData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subjectSearchTerm, setSubjectSearchTerm] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const totalSteps = 5;
  const navigate = useNavigate();
  const { toast } = useToast();

  const titles = ["Mr.", "Mrs.", "Ms.", "Dr."];
  const qualifications = ["10th", "12th", "Graduate", "Post-Graduate", "PhD"];
  const experienceLevels = ["Fresher", "1-2 years", "3-5 years", "5+ years"];
  const subjectCategories = {
    academic: [
      "Mathematics", "Physics", "Chemistry", "Biology", "English", 
      "Hindi", "History", "Geography", "Economics", "Political Science"
    ],
    professional: [
      "Programming", "Web Development", "Data Science", "Digital Marketing",
      "Graphic Design", "UI/UX Design", "Business Analytics", "Finance"
    ],
    creative: [
      "Music", "Dance", "Painting", "Photography", "Cooking", 
      "Creative Writing", "Theatre", "Yoga", "Meditation"
    ],
    testPrep: [
      "JEE Main/Advanced", "NEET", "CAT", "GATE", "UPSC", 
      "IELTS", "TOEFL", "GRE", "GMAT", "SSC"
    ]
  };
  const studentLevels = ["Grade (1–5)", "Grade (6–10)", "Grade (11–12th)", "Diploma", "Graduate", "Professional"];
  const curriculums = ["CBSE", "ICSE", "State Board", "IB", "Cambridge", "NIOS", "Waldorf", "Edexcel", "Others"];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const languages = ["English", "Hindi", "Bengali", "Tamil", "Telugu", "Marathi", "Gujarati"];

  // Filter subjects based on search term
  const filteredSubjectCategories = useMemo(() => {
    if (!subjectSearchTerm.trim()) {
      return subjectCategories;
    }

    const filtered: typeof subjectCategories = {};
    Object.entries(subjectCategories).forEach(([category, subjects]) => {
      const filteredSubjects = subjects.filter(subject =>
        subject.toLowerCase().includes(subjectSearchTerm.toLowerCase())
      );
      if (filteredSubjects.length > 0) {
        filtered[category] = filteredSubjects;
      }
    });
    return filtered;
  }, [subjectSearchTerm]);

  const validateField = (field: keyof TutorFormData, value: any) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'fullName':
        if (!value || value.trim().split(' ').length < 2) {
          newErrors.fullName = 'Full name must contain at least 2 words';
        } else {
          delete newErrors.fullName;
        }
        break;
        
      case 'mobileNumber':
        if (!value || !/^\d{10}$/.test(value)) {
          newErrors.mobileNumber = 'Mobile number must be exactly 10 digits';
        } else {
          delete newErrors.mobileNumber;
        }
        break;
        
      case 'email':
        if (!value) {
          newErrors.email = 'Email is required';
        } else if (!emailRegex.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
        
      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (value.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        } else if (!/[A-Z]/.test(value)) {
          newErrors.password = 'Password must contain at least one uppercase letter';
        } else if (!/[a-z]/.test(value)) {
          newErrors.password = 'Password must contain at least one lowercase letter';
        } else if (!/\d/.test(value)) {
          newErrors.password = 'Password must contain at least one number';
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
          newErrors.password = 'Password must contain at least one special character';
        } else {
          delete newErrors.password;
        }
        break;
        
      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (value !== formData.password) {
          newErrors.confirmPassword = "Passwords don't match";
        } else {
          delete newErrors.confirmPassword;
        }
        break;
        
      case 'dateOfBirth':
        if (!value) {
          newErrors.dateOfBirth = 'Date of birth is required';
        } else {
          const birthDate = new Date(value);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          if (age < 18) {
            newErrors.dateOfBirth = 'You must be at least 18 years old';
          } else {
            delete newErrors.dateOfBirth;
          }
        }
        break;
        
      case 'pinCode':
        if (!value || !/^\d{6}$/.test(value)) {
          newErrors.pinCode = 'Pin code must be exactly 6 digits';
        } else {
          delete newErrors.pinCode;
        }
        break;
    }
    
    setErrors(newErrors);
  };

  const handleInputChange = (field: keyof TutorFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
    setTouchedFields(prev => new Set(prev).add(field));
    validateField(field, value);
  };

  const handleArrayChange = (field: keyof TutorFormData, value: string, checked: boolean) => {
    const currentArray = (formData[field] as string[]) || [];
    const newArray = checked 
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);
    
    setFormData({ ...formData, [field]: newArray });
  };

  const handleAddCustomSubject = () => {
    const trimmedSubject = customSubject.trim();
    
    if (!trimmedSubject) {
      toast({
        title: "Empty Subject",
        description: "Please enter a subject name.",
        variant: "destructive",
      });
      return;
    }

    if (trimmedSubject.length < 2) {
      toast({
        title: "Subject Too Short",
        description: "Subject name must be at least 2 characters long.",
        variant: "destructive",
      });
      return;
    }

    // Check if subject already exists (case-insensitive)
    const subjectExists = formData.subjects.some(subject => 
      subject.toLowerCase() === trimmedSubject.toLowerCase()
    );

    if (subjectExists) {
      toast({
        title: "Subject Already Added",
        description: `"${trimmedSubject}" is already in your subjects list.`,
        variant: "destructive",
      });
      return;
    }

    // Check if subject exists in predefined categories (case-insensitive)
    const allPredefinedSubjects = Object.values(subjectCategories).flat();
    const predefinedExists = allPredefinedSubjects.some(subject => 
      subject.toLowerCase() === trimmedSubject.toLowerCase()
    );

    if (predefinedExists) {
      toast({
        title: "Subject Available in List",
        description: `"${trimmedSubject}" is already available in the subject categories above. Please select it from the list instead.`,
        variant: "destructive",
      });
      return;
    }

    setFormData({ 
      ...formData, 
      subjects: [...formData.subjects, trimmedSubject] 
    });
    setCustomSubject("");
    toast({
      title: "Subject Added",
      description: `"${trimmedSubject}" has been added to your subjects.`,
    });
  };

  const handleRemoveSubject = (subjectToRemove: string) => {
    setFormData({ 
      ...formData, 
      subjects: formData.subjects.filter(subject => subject !== subjectToRemove) 
    });
  };

  const validateStep = (step: number) => {
    // Basic validation for each step
    const requiredFields: Record<number, (keyof TutorFormData)[]> = {
      1: ['title', 'fullName', 'mobileNumber', 'email', 'password', 'confirmPassword', 'dateOfBirth', 'gender', 'city', 'area', 'pinCode'],
      2: ['highestQualification', 'universityName', 'yearOfPassing', 'percentage', 'teachingExperience'],
      3: ['classType', 'individualFee', 'groupFee', 'demoClass'],
      4: ['profileHeadline', 'teachingMethodology']
    };

    const fields = requiredFields[step] || [];
    let isValid = true;

    fields.forEach(field => {
      if (!formData[field] || (Array.isArray(formData[field]) && (formData[field] as any[]).length === 0)) {
        isValid = false;
      }
    });

    // Additional validation for step 3 based on class type
    if (step === 3) {
      // Home tuition fee is required for visit_student and tutor_home class types
      if ((formData.classType === "visit_student" || formData.classType === "tutor_home") && !formData.homeTuitionFee) {
        isValid = false;
      }
    }

    if (step === 1 && (!formData.termsAccepted || !formData.backgroundVerificationAccepted)) {
      isValid = false;
    }

    return isValid;
  };

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Starting tutor signup process...');
      
      // Step 1: Create user account with Supabase Auth
      console.log('Creating user account...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: 'tutor',
          }
        }
      });

      console.log('Auth response:', { authData, authError });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error("Failed to create user account");
      }

      console.log('User created successfully:', authData.user.id);

      // Store form data for profile creation after email verification
      // RLS policies are likely blocking profile creation during signup
      console.log('Storing form data for profile creation after email verification...');
      
      // Store the complete form data and user info
      const profileData = {
        userId: authData.user.id,
        formData: formData,
        timestamp: Date.now(),
        email: formData.email
      };
      
      localStorage.setItem('pendingTutorProfile', JSON.stringify(profileData));
      
      console.log('Form data stored successfully');

      // Step 4: Upload profile photo if provided
      if (formData.profilePhoto) {
        try {
          const fileExt = formData.profilePhoto.name.split('.').pop();
          const fileName = `${authData.user.id}-profile.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('profile-photos')
            .upload(fileName, formData.profilePhoto);

          if (!uploadError) {
            // Update profile with photo URL
            const { data: photoData } = supabase.storage
              .from('profile-photos')
              .getPublicUrl(fileName);

            await supabase
              .from('profiles')
              .update({ profile_photo_url: photoData.publicUrl })
              .eq('user_id', authData.user.id);
          }
        } catch (uploadError) {
          console.warn('Profile photo upload failed:', uploadError);
          // Continue without photo upload - not critical for account creation
        }
      }

      // Store form data in localStorage for profile creation after email verification
      // Since we're not attempting profile creation during signup due to RLS, always store the data
      localStorage.setItem('pendingTutorProfile', JSON.stringify({
        userId: authData.user.id,
        formData: formData,
        timestamp: Date.now()
      }));
      
      toast({
        title: "Account Created Successfully!",
        description: "Please check your email to verify your account. Your profile will be created after verification.",
      });

      // Redirect to login page
      navigate('/login');

    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Signup Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Basic Information</h2>
        <p className="text-muted-foreground">Tell us about yourself to get started</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Title *</Label>
          <Select value={formData.title} onValueChange={(value) => handleInputChange("title", value)}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select title" />
            </SelectTrigger>
            <SelectContent>
              {titles.map((title) => (
                <SelectItem key={title} value={title}>{title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              className={`pl-10 h-12 ${errors.fullName && touchedFields.has('fullName') ? 'border-destructive' : ''}`}
              required
            />
            {errors.fullName && touchedFields.has('fullName') && (
              <div className="flex items-center mt-1 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.fullName}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mobileNumber">Mobile Number *</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="mobileNumber"
              placeholder="10-digit mobile number"
              value={formData.mobileNumber}
              onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
              className={`pl-10 h-12 ${errors.mobileNumber && touchedFields.has('mobileNumber') ? 'border-destructive' : ''}`}
              required
            />
            {errors.mobileNumber && touchedFields.has('mobileNumber') && (
              <div className="flex items-center mt-1 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.mobileNumber}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={`pl-10 h-12 ${errors.email && touchedFields.has('email') ? 'border-destructive' : ''}`}
              required
            />
            {errors.email && touchedFields.has('email') && (
              <div className="flex items-center mt-1 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.email}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="password">Password *</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className={`pl-10 h-12 ${errors.password && touchedFields.has('password') ? 'border-destructive' : ''}`}
              required
            />
            {errors.password && touchedFields.has('password') && (
              <div className="flex items-center mt-1 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.password}
              </div>
            )}
          </div>
          {formData.password && (
            <div className="mt-3">
              <PasswordStrength password={formData.password} />
            </div>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="confirmPassword">Confirm Password *</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              className={`pl-10 h-12 ${errors.confirmPassword && touchedFields.has('confirmPassword') ? 'border-destructive' : ''}`}
              required
            />
            {errors.confirmPassword && touchedFields.has('confirmPassword') && (
              <div className="flex items-center mt-1 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.confirmPassword}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
              className={`pl-10 h-12 ${errors.dateOfBirth && touchedFields.has('dateOfBirth') ? 'border-destructive' : ''}`}
              required
            />
            {errors.dateOfBirth && touchedFields.has('dateOfBirth') && (
              <div className="flex items-center mt-1 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.dateOfBirth}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Gender *</Label>
          <RadioGroup value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male">Male</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female">Female</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other">Other</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="city"
              placeholder="Enter your city"
              value={formData.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="area">Area/Locality *</Label>
          <Input
            id="area"
            placeholder="Enter your area or locality"
            value={formData.area}
            onChange={(e) => handleInputChange("area", e.target.value)}
            className="h-12"
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="pinCode">Pin Code *</Label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="pinCode"
              placeholder="6-digit pin code"
              value={formData.pinCode}
              onChange={(e) => handleInputChange("pinCode", e.target.value)}
              className={`pl-10 h-12 ${errors.pinCode && touchedFields.has('pinCode') ? 'border-destructive' : ''}`}
              required
            />
            {errors.pinCode && touchedFields.has('pinCode') && (
              <div className="flex items-center mt-1 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.pinCode}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start space-x-2">
          <Checkbox 
            id="termsAccepted"
            checked={formData.termsAccepted}
            onCheckedChange={(checked) => handleInputChange("termsAccepted", checked)}
          />
          <Label htmlFor="termsAccepted" className="text-sm leading-5">
            I agree to the{" "}
            <Link to="/terms" className="text-primary hover:underline">
              Terms and Conditions
            </Link>{" "}
            *
          </Label>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox 
            id="backgroundVerificationAccepted"
            checked={formData.backgroundVerificationAccepted}
            onCheckedChange={(checked) => handleInputChange("backgroundVerificationAccepted", checked)}
          />
          <Label htmlFor="backgroundVerificationAccepted" className="text-sm leading-5">
            I agree to Background Verification *
          </Label>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Professional Details</h2>
        <p className="text-muted-foreground">Share your educational background and experience</p>
      </div>

      {/* Educational Qualifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Educational Qualifications</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Highest Qualification *</Label>
            <Select value={formData.highestQualification} onValueChange={(value) => handleInputChange("highestQualification", value)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select qualification" />
              </SelectTrigger>
              <SelectContent>
                {qualifications.map((qual) => (
                  <SelectItem key={qual} value={qual}>{qual}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="universityName">University/Board Name *</Label>
            <Input
              id="universityName"
              placeholder="Enter university or board name"
              value={formData.universityName}
              onChange={(e) => handleInputChange("universityName", e.target.value)}
              className="h-12"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Year of Passing *</Label>
            <Select value={formData.yearOfPassing} onValueChange={(value) => handleInputChange("yearOfPassing", value)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="percentage">Percentage/CGPA *</Label>
            <Input
              id="percentage"
              placeholder="Enter percentage or CGPA"
              value={formData.percentage}
              onChange={(e) => handleInputChange("percentage", e.target.value)}
              className="h-12"
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="certificate">Upload Certificate *</Label>
            <Input
              id="certificate"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleInputChange("certificate", e.target.files?.[0] || null)}
              className="h-12"
              required
            />
            <p className="text-xs text-muted-foreground">PDF/JPG format, max 5MB</p>
          </div>
        </div>
      </div>

      {/* Teaching Experience */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Teaching Experience</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Total Teaching Experience *</Label>
            <Select value={formData.teachingExperience} onValueChange={(value) => handleInputChange("teachingExperience", value)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select experience" />
              </SelectTrigger>
              <SelectContent>
                {experienceLevels.map((exp) => (
                  <SelectItem key={exp} value={exp}>{exp}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Currently Teaching</Label>
            <RadioGroup value={formData.currentlyTeaching} onValueChange={(value) => handleInputChange("currentlyTeaching", value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="teaching-yes" />
                <Label htmlFor="teaching-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="teaching-no" />
                <Label htmlFor="teaching-no">No</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="previousExperience">Previous Teaching Experience</Label>
            <Textarea
              id="previousExperience"
              placeholder="Describe your teaching experience (optional)"
              value={formData.previousExperience}
              onChange={(e) => handleInputChange("previousExperience", e.target.value)}
              className="min-h-20"
            />
          </div>

          {formData.currentlyTeaching === "yes" && (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="currentTeachingPlace">Where are you currently teaching?</Label>
              <Input
                id="currentTeachingPlace"
                placeholder="Enter current teaching place"
                value={formData.currentTeachingPlace}
                onChange={(e) => handleInputChange("currentTeachingPlace", e.target.value)}
                className="h-12"
              />
            </div>
          )}
        </div>
      </div>

      {/* Specialization */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Specialization</h3>
        
        <div className="space-y-4">
          <div className="space-y-4">
            <Label>Subjects/Skills to Teach *</Label>
            
            {/* Search Input */}
            <div className="space-y-2">
              <Input
                placeholder="Search subjects..."
                value={subjectSearchTerm}
                onChange={(e) => setSubjectSearchTerm(e.target.value)}
                className="h-10"
              />
              {subjectSearchTerm && (
                <p className="text-xs text-muted-foreground">
                  Showing {Object.values(filteredSubjectCategories).flat().length} subjects matching "{subjectSearchTerm}"
                </p>
              )}
            </div>

            <div className="space-y-4">
              {Object.entries(filteredSubjectCategories).map(([category, subjects]) => (
                <div key={category} className="space-y-3">
                  <h4 className="font-medium text-primary capitalize text-sm">
                    {category.replace(/([A-Z])/g, ' $1').trim()} Subjects
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {subjects.map((subject) => (
                      <div key={subject} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`subject-${subject}`}
                          checked={formData.subjects.includes(subject)}
                          onCheckedChange={(checked) => handleArrayChange("subjects", subject, checked as boolean)}
                        />
                        <Label htmlFor={`subject-${subject}`} className="text-sm">{subject}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {Object.keys(filteredSubjectCategories).length === 0 && subjectSearchTerm && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No subjects found matching "{subjectSearchTerm}"</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSubjectSearchTerm("")}
                    className="mt-2"
                  >
                    Clear Search
                  </Button>
                </div>
              )}
            </div>
            {/* Custom Subject Input */}
            <div className="space-y-3">
              <Label>Add Custom Subject</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Type a custom subject (e.g., Advanced Calculus, Machine Learning)"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomSubject();
                    }
                  }}
                />
                <Button 
                  type="button"
                  onClick={handleAddCustomSubject}
                  disabled={!customSubject.trim()}
                  variant="outline"
                >
                  Add
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Can't find your specialization? Add a custom subject here.
              </p>
            </div>

            {formData.subjects.length > 0 && (
              <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                <p className="text-sm font-medium text-primary mb-2">Selected Subjects ({formData.subjects.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {formData.subjects.map((subject) => (
                    <span 
                      key={subject}
                      className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full flex items-center gap-1"
                    >
                      {subject}
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(subject)}
                        className="ml-1 hover:bg-primary-foreground/20 rounded-full p-0.5"
                        title="Remove subject"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Student Levels *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {studentLevels.map((level) => (
                <div key={level} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`level-${level}`}
                    checked={formData.studentLevels.includes(level)}
                    onCheckedChange={(checked) => handleArrayChange("studentLevels", level, checked as boolean)}
                  />
                  <Label htmlFor={`level-${level}`} className="text-sm">{level}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Board/Curriculum *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {curriculums.map((curriculum) => (
                <div key={curriculum} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`curriculum-${curriculum}`}
                    checked={formData.curriculum.includes(curriculum)}
                    onCheckedChange={(checked) => handleArrayChange("curriculum", curriculum, checked as boolean)}
                  />
                  <Label htmlFor={`curriculum-${curriculum}`} className="text-sm">{curriculum}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Service Information</h2>
        <p className="text-muted-foreground">Define your teaching preferences and pricing</p>
      </div>

      {/* Teaching Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Teaching Preferences</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Class Type *</Label>
            <RadioGroup value={formData.classType} onValueChange={(value) => handleInputChange("classType", value)}>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="online" id="online" />
                  <div className="flex-1">
                    <Label htmlFor="online" className="font-medium cursor-pointer">Online Mode</Label>
                    <p className="text-sm text-muted-foreground">Teach students through video calls and online platforms</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="visit_student" id="visit_student" />
                  <div className="flex-1">
                    <Label htmlFor="visit_student" className="font-medium cursor-pointer">Visit Student (Home Visit)</Label>
                    <p className="text-sm text-muted-foreground">Travel to student's home for in-person tutoring</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="tutor_home" id="tutor_home" />
                  <div className="flex-1">
                    <Label htmlFor="tutor_home" className="font-medium cursor-pointer">Tutor Tuition (Home Tuition at Tutor's Place)</Label>
                    <p className="text-sm text-muted-foreground">Students come to your home/place for tutoring</p>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Class Type Specific Options */}
          {formData.classType === "visit_student" && (
            <div className="space-y-2">
              <Label>Maximum Travel Distance (km): {formData.maxTravelDistance}</Label>
              <Slider
                value={[formData.maxTravelDistance]}
                onValueChange={(value) => handleInputChange("maxTravelDistance", value[0])}
                max={50}
                min={0}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Set the maximum distance you're willing to travel for home visits
              </p>
            </div>
          )}

          {formData.classType === "online" && (
            <div className="space-y-2">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-1">Online Teaching Setup</h4>
                <p className="text-sm text-blue-700">
                  Make sure you have a stable internet connection, good lighting, and a quiet environment for online classes.
                </p>
              </div>
            </div>
          )}

          {formData.classType === "tutor_home" && (
            <div className="space-y-2">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-900 mb-1">Home Tutoring Setup</h4>
                <p className="text-sm text-green-700">
                  Ensure you have a dedicated teaching space at your home with necessary equipment and materials.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2 md:col-span-2">
            <Label>Preferred Class Size</Label>
            <div className="flex space-x-4">
              {["Individual", "Group", "Both"].map((size) => (
                <div key={size} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`size-${size}`}
                    checked={formData.classSize.includes(size)}
                    onCheckedChange={(checked) => handleArrayChange("classSize", size, checked as boolean)}
                  />
                  <Label htmlFor={`size-${size}`}>{size}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Available Days *</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {days.map((day) => (
                <div key={day} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`day-${day}`}
                    checked={formData.availableDays.includes(day)}
                    onCheckedChange={(checked) => handleArrayChange("availableDays", day, checked as boolean)}
                  />
                  <Label htmlFor={`day-${day}`} className="text-sm">{day}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Fee Structure */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Fee Structure</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Individual Class Fee - Always shown */}
          <div className="space-y-2">
            <Label htmlFor="individualFee">Individual Class Fee (per hour) * ₹</Label>
            <div className="relative">
              <Input
                id="individualFee"
                placeholder="Enter hourly rate"
                value={formData.individualFee}
                onChange={(e) => handleInputChange("individualFee", e.target.value)}
                className="h-12"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              One-on-one teaching rate
            </p>
          </div>

          {/* Group Class Fee - Always shown */}
          <div className="space-y-2">
            <Label htmlFor="groupFee">Group Class Fee (per hour) * ₹</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="groupFee"
                placeholder="Enter hourly rate"
                value={formData.groupFee}
                onChange={(e) => handleInputChange("groupFee", e.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Rate for group classes (2+ students)
            </p>
          </div>

          {/* Home Visit Fee - Only for visit_student */}
          {formData.classType === "visit_student" && (
            <div className="space-y-2">
              <Label htmlFor="homeTuitionFee">Home Visit Fee (per hour) * ₹</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="homeTuitionFee"
                  placeholder="Enter hourly rate"
                  value={formData.homeTuitionFee}
                  onChange={(e) => handleInputChange("homeTuitionFee", e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Rate for visiting student's home (includes travel)
              </p>
            </div>
          )}

          {/* Tutor Home Fee - Only for tutor_home */}
          {formData.classType === "tutor_home" && (
            <div className="space-y-2">
              <Label htmlFor="homeTuitionFee">Tutor Home Fee (per hour) * ₹</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="homeTuitionFee"
                  placeholder="Enter hourly rate"
                  value={formData.homeTuitionFee}
                  onChange={(e) => handleInputChange("homeTuitionFee", e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Rate for students coming to your place
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Demo Class</Label>
            <RadioGroup value={formData.demoClass} onValueChange={(value) => handleInputChange("demoClass", value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="free" id="demo-free" />
                <Label htmlFor="demo-free">Free</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paid" id="demo-paid" />
                <Label htmlFor="demo-paid">Paid</Label>
              </div>
            </RadioGroup>
          </div>

          {formData.demoClass === "paid" && (
            <div className="space-y-2">
              <Label htmlFor="demoClassFee">Demo Class Fee ₹</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="demoClassFee"
                  placeholder="Enter demo class fee"
                  value={formData.demoClassFee}
                  onChange={(e) => handleInputChange("demoClassFee", e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Services */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Additional Services</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { key: "assignmentHelp", label: "Assignment Help" },
            { key: "testPreparation", label: "Test/Exam Preparation" },
            { key: "homeworkSupport", label: "Homework Support" },
            { key: "weekendClasses", label: "Weekend Classes" }
          ].map(({ key, label }) => (
            <div key={key} className="space-y-2">
              <Label>{label}</Label>
              <RadioGroup 
                value={formData[key as keyof TutorFormData] as string} 
                onValueChange={(value) => handleInputChange(key as keyof TutorFormData, value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id={`${key}-yes`} />
                  <Label htmlFor={`${key}-yes`}>Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id={`${key}-no`} />
                  <Label htmlFor={`${key}-no`}>No</Label>
                </div>
              </RadioGroup>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Profile & Verification</h2>
        <p className="text-muted-foreground">Complete your profile and upload verification documents</p>
      </div>

      {/* Profile Setup */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Profile Setup</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profilePhoto">Profile Photo *</Label>
            <Input
              id="profilePhoto"
              type="file"
              accept="image/*"
              onChange={(e) => handleInputChange("profilePhoto", e.target.files?.[0] || null)}
              className="h-12"
              required
            />
            <p className="text-xs text-muted-foreground">Square image recommended, max 5MB</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profileHeadline">Profile Headline * (100 chars max)</Label>
            <Input
              id="profileHeadline"
              placeholder="e.g., Experienced Math Tutor with 5+ years"
              value={formData.profileHeadline}
              onChange={(e) => handleInputChange("profileHeadline", e.target.value)}
              className="h-12"
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teachingMethodology">Teaching Methodology * (500 words max)</Label>
            <Textarea
              id="teachingMethodology"
              placeholder="Describe your teaching approach and methodology"
              value={formData.teachingMethodology}
              onChange={(e) => handleInputChange("teachingMethodology", e.target.value)}
              className="min-h-32"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whyChooseMe">Why Choose Me? (300 words max)</Label>
            <Textarea
              id="whyChooseMe"
              placeholder="What makes you unique as a tutor?"
              value={formData.whyChooseMe}
              onChange={(e) => handleInputChange("whyChooseMe", e.target.value)}
              className="min-h-24"
            />
          </div>

          <div className="space-y-2">
            <Label>Languages Known *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {languages.map((language) => (
                <div key={language} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`language-${language}`}
                    checked={formData.languages.includes(language)}
                    onCheckedChange={(checked) => handleArrayChange("languages", language, checked as boolean)}
                  />
                  <Label htmlFor={`language-${language}`} className="text-sm">{language}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Verification Documents */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Verification Documents</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="governmentId">Government ID * (Aadhaar/PAN/Passport)</Label>
            <Input
              id="governmentId"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleInputChange("governmentId", e.target.files?.[0] || null)}
              className="h-12"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressProof">Address Proof *</Label>
            <Input
              id="addressProof"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleInputChange("addressProof", e.target.files?.[0] || null)}
              className="h-12"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="educationalCertificates">Educational Certificates *</Label>
            <Input
              id="educationalCertificates"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              onChange={(e) => handleInputChange("educationalCertificates", Array.from(e.target.files || []))}
              className="h-12"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experienceCertificates">Experience Certificates</Label>
            <Input
              id="experienceCertificates"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              onChange={(e) => handleInputChange("experienceCertificates", Array.from(e.target.files || []))}
              className="h-12"
            />
          </div>
        </div>
      </div>

      {/* Video Introduction */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Video Introduction</h3>
        
        <div className="space-y-2">
          <Label htmlFor="videoIntroduction">Record/Upload Video (max 2 minutes)</Label>
          <Input
            id="videoIntroduction"
            type="file"
            accept="video/*"
            onChange={(e) => handleInputChange("videoIntroduction", e.target.files?.[0] || null)}
            className="h-12"
          />
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Video Guidelines:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Introduce yourself clearly</li>
              <li>• Mention your teaching experience</li>
              <li>• Explain your teaching methodology</li>
              <li>• Keep it under 2 minutes</li>
              <li>• Ensure good lighting and audio</li>
            </ul>
          </div>
          <Button variant="outline" className="w-full">
            Skip for now
          </Button>
        </div>
      </div>

      {/* Final Steps */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Final Steps</h3>
        
        <div className="bg-info/10 p-4 rounded-lg">
          <h4 className="font-medium mb-2">What happens next?</h4>
          <ul className="text-sm space-y-1">
            <li>• Email verification will be sent to your email</li>
            <li>• Mobile OTP verification required</li>
            <li>• Profile will be submitted for admin review</li>
            <li>• Review process takes 24-48 hours</li>
            <li>• You'll be notified once approved</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Review Your Profile</h2>
        <p className="text-muted-foreground">Please review your details before final submission</p>
      </div>

      {/* Profile Preview */}
      <div className="bg-white rounded-lg border p-6 space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Full Name:</span>
              <p className="text-sm">{formData.fullName}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Email:</span>
              <p className="text-sm">{formData.email}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Mobile:</span>
              <p className="text-sm">{formData.mobileNumber}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Date of Birth:</span>
              <p className="text-sm">{formData.dateOfBirth}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Gender:</span>
              <p className="text-sm">{formData.gender}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">City:</span>
              <p className="text-sm">{formData.city}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Area:</span>
              <p className="text-sm">{formData.area}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Pin Code:</span>
              <p className="text-sm">{formData.pinCode}</p>
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Education</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Highest Qualification:</span>
              <p className="text-sm">{formData.highestQualification}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">University:</span>
              <p className="text-sm">{formData.universityName}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Year of Passing:</span>
              <p className="text-sm">{formData.yearOfPassing}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Percentage:</span>
              <p className="text-sm">{formData.percentage}%</p>
            </div>
          </div>
        </div>

        {/* Teaching Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Teaching Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Experience:</span>
              <p className="text-sm">{formData.teachingExperience} years</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Currently Teaching:</span>
              <p className="text-sm">{formData.currentlyTeaching}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-sm font-medium text-muted-foreground">Previous Experience:</span>
              <p className="text-sm">{formData.previousExperience}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-sm font-medium text-muted-foreground">Current Teaching Place:</span>
              <p className="text-sm">{formData.currentTeachingPlace}</p>
            </div>
          </div>
        </div>

        {/* Subjects & Levels */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Subjects & Levels</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Subjects:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {formData.subjects.map((subject, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {subject}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Student Levels:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {formData.studentLevels.map((level, index) => (
                  <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    {level}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Curriculum:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {formData.curriculum.map((curriculum, index) => (
                  <span key={index} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                    {curriculum}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Languages:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {formData.languages.map((language, index) => (
                  <span key={index} className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                    {language}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Service Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Service Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Class Type:</span>
              <p className="text-sm">{formData.classType}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Max Travel Distance:</span>
              <p className="text-sm">{formData.maxTravelDistance} km</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Class Size:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {formData.classSize.map((size, index) => (
                  <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                    {size}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Available Days:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {formData.availableDays.map((day, index) => (
                  <span key={index} className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                    {day}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Fee Structure */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Fee Structure</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Individual Class Fee:</span>
              <p className="text-sm">₹{formData.individualFee}/hour</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Group Class Fee:</span>
              <p className="text-sm">₹{formData.groupFee}/hour</p>
            </div>
            {formData.classType === 'Home Tuition' && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Home Visit Fee:</span>
                <p className="text-sm">₹{formData.homeTuitionFee}/hour</p>
              </div>
            )}
            {formData.classType === 'Tutor Home' && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Tutor Home Fee:</span>
                <p className="text-sm">₹{formData.homeTuitionFee}/hour</p>
              </div>
            )}
            <div>
              <span className="text-sm font-medium text-muted-foreground">Demo Class Fee:</span>
              <p className="text-sm">₹{formData.demoClassFee}</p>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Profile Information</h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Profile Headline:</span>
              <p className="text-sm mt-1">{formData.profileHeadline}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Teaching Methodology:</span>
              <p className="text-sm mt-1">{formData.teachingMethodology}</p>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Additional Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Laptop Available:</span>
              <p className="text-sm">{formData.laptopAvailable}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Internet Available:</span>
              <p className="text-sm">{formData.internetAvailable}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Webcam Available:</span>
              <p className="text-sm">{formData.webcamAvailable}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Background Verification:</span>
              <p className="text-sm">{formData.backgroundVerification ? 'Agreed' : 'Not Agreed'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm font-bold">!</span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900">Ready to Submit?</h4>
            <p className="text-sm text-blue-700 mt-1">
              Please review all your information carefully. Once submitted, you'll receive an email to verify your account and complete the registration process.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Join as a Tutor
              </CardTitle>
              <CardDescription className="text-lg">
                Share your knowledge and help students excel
              </CardDescription>
              
              <div className="mt-6">
                <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="mb-8">
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}
                {currentStep === 5 && renderStep5()}
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>

                {currentStep < 4 ? (
                  <Button
                    onClick={handleNext}
                    disabled={!validateStep(currentStep)}
                    className="flex items-center space-x-2"
                  >
                    <span>Next</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : currentStep === 4 ? (
                  <Button
                    onClick={handleNext}
                    disabled={!validateStep(currentStep)}
                    className="flex items-center space-x-2"
                  >
                    <span>Review Profile</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>

              <div className="text-center mt-6">
                <p className="text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Sign in here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}