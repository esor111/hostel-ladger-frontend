import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { KahaLogo } from "@/components/ui/KahaLogo";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Building2,
  CreditCard,
  BarChart3,
  Users,
  Star,
  Shield,
  CheckCircle,
  ArrowRight,
  Globe,
  Smartphone,
  Calendar,
  DollarSign,
  Zap,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  Clock,
  Heart
} from "lucide-react";

const Landing = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showDemoForm, setShowDemoForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({});
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [animatedStats, setAnimatedStats] = useState({
    hostels: 0,
    visibility: 0,
    bookings: 0,
    revenue: 0
  });
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [demoFormData, setDemoFormData] = useState({
    name: "",
    hostelName: "",
    location: "",
    email: "",
    phone: "",
    numberOfRooms: "",
    currentSystem: "",
    additionalInfo: ""
  });
  const navigate = useNavigate();

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({
              ...prev,
              [entry.target.id]: true
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll('[data-animate]');
    sections.forEach(section => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  // Animated counter effect
  useEffect(() => {
    if (isVisible['stats']) {
      const animateValue = (start: number, end: number, duration: number, key: string) => {
        const startTime = Date.now();
        const timer = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const current = Math.floor(start + (end - start) * progress);

          setAnimatedStats(prev => ({
            ...prev,
            [key]: current
          }));

          if (progress === 1) clearInterval(timer);
        }, 16);
      };

      animateValue(0, 500, 2000, 'hostels');
      animateValue(0, 300, 2500, 'visibility');
      animateValue(0, 150, 2200, 'bookings');
      animateValue(0, 250, 2800, 'revenue');
    }
  }, [isVisible['stats']]);

  // Auto-rotating testimonials
  useEffect(() => {
    const testimonials = [
      { name: "Ramesh Shrestha", hostel: "Himalayan Backpackers", text: "Kaha transformed our booking process completely!" },
      { name: "Sita Gurung", hostel: "Mountain View Lodge", text: "Revenue increased by 40% in just 3 months." },
      { name: "Bikash Tamang", hostel: "Heritage Hostel", text: "The best investment we made for our hostel business." }
    ];

    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      const verifiedSection = document.querySelector('[data-section="verified-profiling"]');
      if (verifiedSection) {
        const verifiedRect = verifiedSection.getBoundingClientRect();
        const hasReachedVerified = verifiedRect.top <= window.innerHeight;
        setShowScrollButton(hasReachedVerified);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const platformFeatures = [
    {
      icon: Building2,
      title: "Complete Hostel Management",
      description: "End-to-end solution for room management, bookings, and guest services with intuitive dashboard."
    },
    {
      icon: CreditCard,
      title: "Integrated Payment System",
      description: "Seamless payment processing, billing automation, and financial reporting in one platform."
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Real-time insights, occupancy tracking, and revenue optimization tools for data-driven decisions."
    },
    {
      icon: Smartphone,
      title: "Mobile-First Design",
      description: "Responsive platform that works perfectly on all devices, enabling management from anywhere."
    },
    {
      icon: Users,
      title: "Guest Experience Focus",
      description: "Digital check-in/out, automated notifications, and personalized guest communication tools."
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade security, data encryption, and compliance with international hospitality standards."
    }
  ];

  const managementTools = [
    { icon: Calendar, label: "Booking Management", description: "Real-time availability & reservations" },
    { icon: DollarSign, label: "Financial Ledger", description: "Complete accounting & billing system" },
    { icon: Users, label: "Guest Profiles", description: "Comprehensive guest management" },
    { icon: BarChart3, label: "Analytics Dashboard", description: "Performance insights & reports" },
    { icon: Zap, label: "Automation Tools", description: "Streamlined operations workflow" },
    { icon: Globe, label: "Multi-Platform", description: "Web, mobile & tablet support" }
  ];

  const sampleHostels = [
    { name: "Himalayan Backpackers", location: "Thamel, Kathmandu", rating: 4.8, rooms: 25 },
    { name: "Mountain View Lodge", location: "Pokhara", rating: 4.6, rooms: 18 },
    { name: "Heritage Hostel", location: "Bhaktapur", rating: 4.9, rooms: 32 },
    { name: "Everest Base Hostel", location: "Namche Bazaar", rating: 4.7, rooms: 15 }
  ];

  const handleLogin = () => {
    navigate('/admin');
  };

  const handleSearch = () => {
    console.log("Searching for:", searchQuery);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-green-50/30 relative overflow-hidden">
        {/* Global Background Elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#07A64F]/5 to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-[#1295D0]/5 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#07A64F]/3 to-[#1295D0]/3 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Fixed Floating Scroll to Top Button */}
        {showScrollButton && (
          <div className="fixed bottom-8 right-8 z-50 text-center">
            <button
              onClick={scrollToTop}
              className="bg-gradient-to-r from-[#07A64F] to-[#1295D0] hover:from-[#07A64F]/90 hover:to-[#1295D0]/90 text-white px-3 py-2 rounded-full shadow-2xl hover:shadow-3xl hover:shadow-[#07A64F]/30 transition-all duration-300 hover:scale-110 transform mb-2"
              aria-label="Scroll to top"
            >
              <div className="flex flex-col items-center">
                <svg className="h-4 w-4 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </div>
            </button>
            <p className="text-gray-600 text-xs font-medium bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-lg">
              Feeling lost?
            </p>
          </div>
        )}

        {/* Header */}
        <header className="bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-100/50 sticky top-0 z-50 transition-all duration-300 hover:shadow-xl hover:bg-white/98">
          <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-6">
                <div className="relative group cursor-pointer transform hover:scale-105 transition-all duration-300" onClick={scrollToTop}>
                  <KahaLogo size="lg" />
                  <div className="absolute -inset-3 bg-gradient-to-r from-[#07A64F]/20 to-[#1295D0]/20 rounded-2xl blur-lg -z-10 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#07A64F]/10 to-[#1295D0]/10 rounded-xl -z-10 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                </div>
                <div className="hidden md:block">
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Hostel Management Platform
                  </h1>
                  <p className="text-sm bg-gradient-to-r from-[#07A64F] to-[#1295D0] bg-clip-text text-transparent font-semibold tracking-wide">Kaha Inc</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => setShowDemoForm(true)}
                  variant="outline"
                  className="border-2 border-[#1295D0]/40 text-[#1295D0] hover:bg-[#1295D0] hover:text-white hover:border-[#1295D0] transition-all duration-300 hover:shadow-xl hover:shadow-[#1295D0]/30 px-8 py-3 font-semibold rounded-xl hover:scale-105 transform"
                >
                  Request Demo
                </Button>
                <Button
                  onClick={() => setShowLogin(!showLogin)}
                  className="bg-gradient-to-r from-[#07A64F] to-[#1295D0] hover:from-[#07A64F]/90 hover:to-[#1295D0]/90 text-white px-8 py-3 font-semibold shadow-xl hover:shadow-2xl hover:shadow-[#07A64F]/30 transition-all duration-300 hover:scale-105 transform rounded-xl"
                >
                  Hostel Owner Login
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Login Panel */}
        {showLogin && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-white shadow-2xl">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <KahaLogo size="md" className="mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900">Hostel Owner Portal</h2>
                  <p className="text-gray-600 mt-2">Access your management dashboard</p>
                  <div className="mt-3 px-4 py-2 bg-gradient-to-r from-[#07A64F]/10 to-[#1295D0]/10 rounded-lg">
                    <p className="text-xs text-gray-700 font-medium">
                      🏨 Manage your hostel with Kaha platform
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={handleLogin}
                    className="w-full bg-gradient-to-r from-[#07A64F] to-[#1295D0] hover:from-[#07A64F]/90 hover:to-[#1295D0]/90 text-white py-4 font-semibold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transform transition-all duration-300 rounded-xl"
                  >
                    Access Demo Dashboard
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Button>

                  <Button
                    onClick={() => setShowLogin(false)}
                    variant="outline"
                    className="w-full py-3 font-medium hover:bg-gray-50 transition-all duration-300 rounded-xl"
                  >
                    Cancel
                  </Button>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-500">
                    Demo access to Himalayan Backpackers Hostel dashboard
                  </p>
                  <div className="flex justify-center gap-4 mt-3">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Full Platform Access
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Live Demo Data
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Demo Request Form */}
        {showDemoForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <KahaLogo size="lg" className="mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900">Request Demo</h2>
                  <p className="text-gray-600 mt-2">Get a personalized demo</p>
                </div>

                <form className="space-y-4" onSubmit={(e) => {
                  e.preventDefault();
                  console.log('Demo request submitted:', demoFormData);
                  alert('Demo request submitted successfully! We will contact you soon.');
                  setShowDemoForm(false);
                  setDemoFormData({
                    name: "",
                    hostelName: "",
                    location: "",
                    email: "",
                    phone: "",
                    numberOfRooms: "",
                    currentSystem: "",
                    additionalInfo: ""
                  });
                }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name *
                      </label>
                      <Input
                        required
                        placeholder="Enter your full name"
                        value={demoFormData.name}
                        onChange={(e) => setDemoFormData({ ...demoFormData, name: e.target.value })}
                        className="border-2 border-gray-200 focus:border-[#1295D0] focus:ring-2 focus:ring-[#1295D0]/20 transition-all duration-300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hostel Name *
                      </label>
                      <Input
                        required
                        placeholder="Enter your hostel name"
                        value={demoFormData.hostelName}
                        onChange={(e) => setDemoFormData({ ...demoFormData, hostelName: e.target.value })}
                        className="border-2 border-gray-200 focus:border-[#1295D0] focus:ring-2 focus:ring-[#1295D0]/20 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <Input
                        required
                        type="email"
                        placeholder="your@email.com"
                        value={demoFormData.email}
                        onChange={(e) => setDemoFormData({ ...demoFormData, email: e.target.value })}
                        className="border-2 border-gray-200 focus:border-[#1295D0] focus:ring-2 focus:ring-[#1295D0]/20 transition-all duration-300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <Input
                        required
                        type="tel"
                        placeholder="+977 98-12345678"
                        value={demoFormData.phone}
                        onChange={(e) => setDemoFormData({ ...demoFormData, phone: e.target.value })}
                        className="border-2 border-gray-200 focus:border-[#1295D0] focus:ring-2 focus:ring-[#1295D0]/20 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Information
                    </label>
                    <Textarea
                      placeholder="Tell us about your specific needs, challenges, or questions..."
                      value={demoFormData.additionalInfo}
                      onChange={(e) => setDemoFormData({ ...demoFormData, additionalInfo: e.target.value })}
                      className="border-2 border-gray-200 focus:border-[#1295D0] focus:ring-2 focus:ring-[#1295D0]/20 transition-all duration-300 min-h-[100px]"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-[#07A64F] to-[#1295D0] hover:from-[#07A64F]/90 hover:to-[#1295D0]/90 text-white py-3 font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transform transition-all duration-300 rounded-xl"
                    >
                      Submit Demo Request
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>

                    <Button
                      type="button"
                      onClick={() => setShowDemoForm(false)}
                      variant="outline"
                      className="px-8 py-3 font-medium hover:bg-gray-50 transition-all duration-300 rounded-xl"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Hero Section */}
        <section className="relative py-20 px-6 sm:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto text-center">
            <div className="animate-float mb-8">
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Modern Hostel
                <span className="block bg-gradient-to-r from-[#07A64F] to-[#1295D0] bg-clip-text text-transparent animate-gradient">
                  Management Platform
                </span>
              </h1>
            </div>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Transform your hostel operations with our comprehensive management solution. 
              Streamline bookings, automate billing, and enhance guest experiences.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Button
                onClick={() => setShowLogin(true)}
                className="bg-gradient-to-r from-[#07A64F] to-[#1295D0] hover:from-[#07A64F]/90 hover:to-[#1295D0]/90 text-white px-12 py-4 text-lg font-semibold shadow-2xl hover:shadow-3xl hover:shadow-[#07A64F]/30 transition-all duration-300 hover:scale-105 transform rounded-2xl"
              >
                Start Managing Now
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
              
              <Button
                onClick={() => setShowDemoForm(true)}
                variant="outline"
                className="border-2 border-[#1295D0]/40 text-[#1295D0] hover:bg-[#1295D0] hover:text-white hover:border-[#1295D0] px-12 py-4 text-lg font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-[#1295D0]/30 hover:scale-105 transform rounded-2xl"
              >
                Watch Demo
              </Button>
            </div>

            {/* Stats Section */}
            <div id="stats" data-animate className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-[#07A64F] mb-2">{animatedStats.hostels}+</div>
                <div className="text-gray-600 font-medium">Active Hostels</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#1295D0] mb-2">{animatedStats.visibility}%</div>
                <div className="text-gray-600 font-medium">Visibility Increase</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#07A64F] mb-2">{animatedStats.bookings}%</div>
                <div className="text-gray-600 font-medium">More Bookings</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#1295D0] mb-2">{animatedStats.revenue}%</div>
                <div className="text-gray-600 font-medium">Revenue Growth</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 sm:px-8 lg:px-12 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Everything You Need to
                <span className="block bg-gradient-to-r from-[#07A64F] to-[#1295D0] bg-clip-text text-transparent">
                  Run Your Hostel
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our platform combines all essential hostel management tools in one intuitive interface
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {platformFeatures.map((feature, index) => (
                <Card key={index} className="group hover:shadow-2xl hover:shadow-[#07A64F]/10 transition-all duration-300 hover:scale-105 transform border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#07A64F] to-[#1295D0] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#07A64F]/30">
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Management Tools Section */}
        <section className="py-20 px-6 sm:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Powerful Management Tools
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Comprehensive suite of tools designed specifically for hostel operations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {managementTools.map((tool, index) => (
                <div key={index} className="group p-6 rounded-2xl bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 hover:shadow-xl hover:shadow-[#1295D0]/10 hover:scale-105 transform border border-gray-100/50">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#07A64F] to-[#1295D0] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#07A64F]/20">
                      <tool.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{tool.label}</h3>
                      <p className="text-sm text-gray-600">{tool.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sample Hostels Section */}
        <section data-section="verified-profiling" className="py-20 px-6 sm:px-8 lg:px-12 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Verified Hostel Profiles
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover amazing hostels managed through our platform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sampleHostels.map((hostel, index) => (
                <Card key={index} className="group hover:shadow-2xl hover:shadow-[#07A64F]/10 transition-all duration-300 hover:scale-105 transform border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-gradient-to-r from-[#07A64F] to-[#1295D0] text-white">
                        {hostel.rating} ⭐
                      </Badge>
                      <span className="text-sm text-gray-500">{hostel.rooms} rooms</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{hostel.name}</h3>
                    <p className="text-gray-600 text-sm flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {hostel.location}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16 px-6 sm:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-4 mb-6">
                  <KahaLogo size="lg" />
                  <div>
                    <h3 className="text-2xl font-bold">Kaha</h3>
                    <p className="text-gray-400">Hostel Management Platform</p>
                  </div>
                </div>
                <p className="text-gray-400 leading-relaxed max-w-md">
                  Empowering hostel owners with modern technology to streamline operations, 
                  increase bookings, and enhance guest experiences.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">Platform</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Demo</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">Contact</h4>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    hello@kaha.com
                  </li>
                  <li className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    +977 98-12345678
                  </li>
                  <li className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Kathmandu, Nepal
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-8 text-center">
              <p className="text-gray-400">
                © 2024 Kaha Inc. All rights reserved. Built with ❤️ for hostel owners.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Landing;