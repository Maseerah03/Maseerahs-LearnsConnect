import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { GraduationCap, Users, BookOpen, Target, Building2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function SignUpChoice() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Join LearnsConnect
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              Choose how you'd like to be part of our learning community
            </p>
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2 text-green-800 text-sm font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Sign-up is free for Students, Tutors, and Institutions.
              </div>
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 text-blue-800 text-sm font-medium">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                First 10 leads are free! Tutors: ₹9/lead, Institutions: ₹19/lead
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Student Card */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">I'm a Student</CardTitle>
                <CardDescription className="text-lg">
                  Find the perfect tutor for your learning journey
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground">Discover qualified tutors</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Target className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground">Set your learning goals</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground">Choose online or offline classes</span>
                  </div>
                </div>
                
                <Link to="/student-signup" className="block">
                  <Button className="w-full h-12 text-lg font-semibold mt-6">
                    Start Learning
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Tutor Card */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">I'm a Tutor</CardTitle>
                <CardDescription className="text-lg">
                  Share your knowledge and help students excel
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground">Teach your expertise</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Target className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground">Set your own rates</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground">Flexible teaching schedule</span>
                  </div>
                </div>
                
                <Link to="/tutor-signup" className="block">
                  <Button className="w-full h-12 text-lg font-semibold mt-6">
                    Start Earning
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Institution Card */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">I'm an Institution</CardTitle>
                <CardDescription className="text-lg">
                  Offer your educational services to students
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground">Manage multiple tutors</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Target className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground">Scale your services</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground">Reach more students</span>
                  </div>
                </div>
                
                <Link to="/institution-signup" className="block">
                  <Button className="w-full h-12 text-lg font-semibold mt-6">
                    Start Branding
                  </Button>
                </Link>
              </CardContent>
            </Card>

          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground text-lg">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}