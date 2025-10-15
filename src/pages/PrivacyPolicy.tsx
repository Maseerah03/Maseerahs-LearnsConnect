import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, Lock, Users, Globe, Mail, Phone, Calendar } from 'lucide-react';

export default function PrivacyPolicy() {
  const lastUpdated = "January 1, 2025";

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-16 sm:pt-20 pb-12 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Privacy Policy
              </h1>
            </div>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Your privacy is important to us. Learn how we collect, use, and protect your personal information.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Last Updated: {lastUpdated}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                Version 1.0
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Introduction */}
            <Card className="border-none shadow-soft bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Eye className="h-6 w-6 text-primary" />
                  Introduction
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Ellen Information Technology Solutions Pvt. Ltd. ("we," "our," or "us") operates the LearnsConnect platform 
                  ("Service"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when 
                  you use our educational platform that connects students with tutors and institutions.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  By using our Service, you agree to the collection and use of information in accordance with this policy. 
                  If you do not agree with our policies and practices, please do not use our Service.
                </p>
              </CardContent>
            </Card>

            {/* Information We Collect */}
            <Card className="border-none shadow-soft bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  Information We Collect
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                      <li>Name, email address, phone number, and mailing address</li>
                      <li>Date of birth and age verification</li>
                      <li>Profile photographs and identification documents</li>
                      <li>Educational background and qualifications</li>
                      <li>Payment and billing information</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Educational Information</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                      <li>Subjects of interest and learning goals</li>
                      <li>Academic performance and progress tracking</li>
                      <li>Session recordings and chat logs</li>
                      <li>Assignment submissions and feedback</li>
                      <li>Learning preferences and accessibility needs</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Technical Information</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                      <li>IP address, browser type, and device information</li>
                      <li>Usage patterns and platform interactions</li>
                      <li>Cookies and similar tracking technologies</li>
                      <li>Location data (with your consent)</li>
                      <li>App performance and crash reports</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How We Use Information */}
            <Card className="border-none shadow-soft bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Globe className="h-6 w-6 text-primary" />
                  How We Use Your Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Service Delivery</h3>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                        <li>Matching students with appropriate tutors</li>
                        <li>Facilitating educational sessions</li>
                        <li>Processing payments and transactions</li>
                        <li>Providing customer support</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Communication</h3>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                        <li>Sending important service updates</li>
                        <li>Facilitating tutor-student communication</li>
                        <li>Responding to inquiries and support requests</li>
                        <li>Sharing educational resources</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Platform Improvement</h3>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                        <li>Analyzing usage patterns and preferences</li>
                        <li>Developing new features and services</li>
                        <li>Conducting research and analytics</li>
                        <li>Personalizing user experience</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Legal Compliance</h3>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                        <li>Meeting regulatory requirements</li>
                        <li>Preventing fraud and abuse</li>
                        <li>Enforcing terms of service</li>
                        <li>Protecting user safety and security</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Information Sharing */}
            <Card className="border-none shadow-soft bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-4">Information Sharing and Disclosure</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">With Service Providers</h3>
                    <p className="text-muted-foreground">
                      We may share your information with trusted third-party service providers who assist us in operating our platform, 
                      including payment processors, cloud storage providers, and analytics services. These providers are bound by 
                      confidentiality agreements and are prohibited from using your information for any other purpose.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">With Educational Partners</h3>
                    <p className="text-muted-foreground">
                      We may share relevant information with tutors and institutions to facilitate educational services. 
                      This includes profile information, learning preferences, and session-related data necessary for 
                      effective teaching and learning.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Legal Requirements</h3>
                    <p className="text-muted-foreground">
                      We may disclose your information if required by law, court order, or government regulation, 
                      or if we believe such disclosure is necessary to protect our rights, property, or safety, 
                      or that of our users or the public.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Business Transfers</h3>
                    <p className="text-muted-foreground">
                      In the event of a merger, acquisition, or sale of assets, your information may be transferred 
                      as part of the transaction. We will notify you of any such change in ownership or control.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card className="border-none shadow-soft bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Lock className="h-6 w-6 text-primary" />
                  Data Security
                </h2>
                
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    We implement appropriate technical and organizational security measures to protect your personal information 
                    against unauthorized access, alteration, disclosure, or destruction. These measures include:
                  </p>
                  
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>End-to-end encryption for sensitive data transmission</li>
                    <li>Secure data storage with access controls and monitoring</li>
                    <li>Regular security audits and vulnerability assessments</li>
                    <li>Employee training on data protection best practices</li>
                    <li>Incident response procedures for data breaches</li>
                    <li>Multi-factor authentication for administrative access</li>
                  </ul>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                    <p className="text-yellow-800 text-sm">
                      <strong>Important:</strong> While we strive to protect your information, no method of transmission 
                      over the internet or electronic storage is 100% secure. We cannot guarantee absolute security, 
                      but we continuously work to improve our security measures.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card className="border-none shadow-soft bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-4">Your Privacy Rights</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Access and Portability</h3>
                      <p className="text-muted-foreground text-sm">
                        You have the right to access your personal information and receive a copy of your data 
                        in a portable format.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Correction and Updates</h3>
                      <p className="text-muted-foreground text-sm">
                        You can update or correct your personal information at any time through your account settings.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Deletion</h3>
                      <p className="text-muted-foreground text-sm">
                        You may request deletion of your account and associated data, subject to legal and 
                        operational requirements.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Marketing Opt-out</h3>
                      <p className="text-muted-foreground text-sm">
                        You can opt out of marketing communications while still receiving important service updates.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Data Processing Objection</h3>
                      <p className="text-muted-foreground text-sm">
                        You have the right to object to certain types of data processing where legally applicable.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Withdraw Consent</h3>
                      <p className="text-muted-foreground text-sm">
                        You can withdraw consent for data processing activities that require your explicit consent.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cookies and Tracking */}
            <Card className="border-none shadow-soft bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-4">Cookies and Tracking Technologies</h2>
                
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    We use cookies and similar tracking technologies to enhance your experience on our platform. 
                    These technologies help us:
                  </p>
                  
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>Remember your preferences and login status</li>
                    <li>Analyze platform usage and performance</li>
                    <li>Provide personalized content and recommendations</li>
                    <li>Improve security and prevent fraud</li>
                    <li>Deliver relevant advertisements (with your consent)</li>
                  </ul>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <p className="text-blue-800 text-sm">
                      <strong>Cookie Management:</strong> You can control cookie settings through your browser preferences. 
                      However, disabling certain cookies may affect platform functionality.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Children's Privacy */}
            <Card className="border-none shadow-soft bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-4">Children's Privacy</h2>
                
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Our platform is designed to serve users of all ages, including children under 13. We are committed 
                    to protecting children's privacy and comply with applicable children's privacy laws, including COPPA.
                  </p>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2 text-green-800">Special Protections for Children</h3>
                    <ul className="list-disc list-inside text-green-700 space-y-1 ml-4">
                      <li>Parental consent required for children under 13</li>
                      <li>Limited data collection for child accounts</li>
                      <li>Enhanced security measures for child profiles</li>
                      <li>Parental access to child's account information</li>
                      <li>No behavioral advertising for children</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* International Transfers */}
            <Card className="border-none shadow-soft bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-4">International Data Transfers</h2>
                
                <p className="text-muted-foreground">
                  Your information may be transferred to and processed in countries other than your own. 
                  We ensure that such transfers comply with applicable data protection laws and implement 
                  appropriate safeguards, including standard contractual clauses and adequacy decisions.
                </p>
              </CardContent>
            </Card>

            {/* Policy Updates */}
            <Card className="border-none shadow-soft bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-4">Changes to This Privacy Policy</h2>
                
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time to reflect changes in our practices, 
                  technology, legal requirements, or other factors. We will notify you of any material changes 
                  through email, platform notifications, or other appropriate means at least 30 days before 
                  the changes take effect.
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="border-none shadow-soft bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Mail className="h-6 w-6 text-primary" />
                  Contact Us
                </h2>
                
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, 
                    please contact us:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" />
                        <span className="text-sm">
                          <strong>Email:</strong> privacy@learnsconnect.com
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-primary" />
                        <span className="text-sm">
                          <strong>Phone:</strong> +1 (555) 123-4567
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">Ellen Information Technology Solutions Pvt. Ltd.</p>
                      <p className="text-sm text-muted-foreground">
                        123 Education Street<br />
                        Learning City, LC 12345<br />
                        India
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                    <p className="text-gray-700 text-sm">
                      <strong>Response Time:</strong> We aim to respond to all privacy-related inquiries within 30 days. 
                      For urgent matters, please mark your email as "URGENT - Privacy Concern."
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>
    </div>
  );
}
