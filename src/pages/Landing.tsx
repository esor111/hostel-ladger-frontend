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

    // Observe all sections
    const sections = document.querySelectorAll('[data-animate]');
    sections.forEach(section => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  // Animated counter effect
  useEffect(() => {
    if (isVisible['stats']) {
      const animateValue = (start, end, duration, key) => {
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

  // Scroll listener to show button from Verified Profiling onwards (including footer)
  useEffect(() => {
    const handleScroll = () => {
      const verifiedSection = document.querySelector('[data-section="verified-profiling"]');

      if (verifiedSection) {
        const verifiedRect = verifiedSection.getBoundingClientRect();

        // Show button when user has reached Verified Profiling section and keep it visible
        const hasReachedVerified = verifiedRect.top <= window.innerHeight;

        setShowScrollButton(hasReachedVerified);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state
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
    // Navigate to demo hostel dashboard
    navigate('/admin');
  };

  const handleSearch = () => {
    // For demo, show sample results
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

        {/* Fixed Floating Scroll to Top Button - Shows after Verified Profiling */}
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
        {/* Header - World Class Design */}
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
                  <div className="mt-3 px-4 py-2 bg-gradient-to-r from-[#07A64F]/10 to-[#1295D0]/10 rounded-lg">
                    <p className="text-xs text-gray-700 font-medium">
                      Fill this form and hold your seat to see how a modern hostel runs
                    </p>
                  </div>
                </div>

                <form className="space-y-4" onSubmit={(e) => {
                  e.preventDefault();
                  console.log('Demo request submitted:', demoFormData);
                  // Here you would typically send the data to your backend
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
                      {demoFormData.name && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-xs text-green-700">
                            <span className="font-semibold">AI:</span> Great! {demoFormData.name.split(' ')[0]} sounds like a hostel owner who means business! 🎯
                          </p>
                        </div>
                      )}
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
                      {demoFormData.hostelName && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs text-blue-700">
                            <span className="font-semibold">AI:</span> "{demoFormData.hostelName}" - I can already imagine the Kaha dashboard with your branding! ✨
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location *
                      </label>
                      <Input
                        required
                        placeholder="City, Country"
                        value={demoFormData.location}
                        onChange={(e) => setDemoFormData({ ...demoFormData, location: e.target.value })}
                        className="border-2 border-gray-200 focus:border-[#1295D0] focus:ring-2 focus:ring-[#1295D0]/20 transition-all duration-300"
                      />
                      {demoFormData.location && (
                        <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded-lg">
                          <p className="text-xs text-purple-700">
                            <span className="font-semibold">AI:</span> {demoFormData.location}! Perfect - we'll customize the demo with local currency and regulations 🌍
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Rooms
                      </label>
                      <Input
                        type="number"
                        placeholder="e.g., 25"
                        value={demoFormData.numberOfRooms}
                        onChange={(e) => setDemoFormData({ ...demoFormData, numberOfRooms: e.target.value })}
                        className="border-2 border-gray-200 focus:border-[#1295D0] focus:ring-2 focus:ring-[#1295D0]/20 transition-all duration-300"
                      />
                      {demoFormData.numberOfRooms && (
                        <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                          <p className="text-xs text-orange-700">
                            <span className="font-semibold">AI:</span> {parseInt(demoFormData.numberOfRooms) > 50 ?
                              `${demoFormData.numberOfRooms} rooms?! You're running a hostel empire! 👑 Kaha scales beautifully for large operations.` :
                              parseInt(demoFormData.numberOfRooms) > 20 ?
                                `${demoFormData.numberOfRooms} rooms is the sweet spot! Perfect size for maximizing Kaha's ROI 📈` :
                                `${demoFormData.numberOfRooms} rooms - cozy and manageable! Kaha will make operations super smooth 🏠`
                            }
                          </p>
                        </div>
                      )}
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
                      {demoFormData.email && (
                        <div className="mt-2 p-2 bg-indigo-50 border border-indigo-200 rounded-lg">
                          <p className="text-xs text-indigo-700">
                            <span className="font-semibold">AI:</span> {demoFormData.email.includes('@gmail') ?
                              'Gmail user detected! We love the classics 📧' :
                              demoFormData.email.includes('@') ?
                                'Professional email - I can tell you take your business seriously! 💼' :
                                'Almost there with that email! 📮'
                            }
                          </p>
                        </div>
                      )}
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
                      {demoFormData.phone && (
                        <div className="mt-2 p-2 bg-teal-50 border border-teal-200 rounded-lg">
                          <p className="text-xs text-teal-700">
                            <span className="font-semibold">AI:</span> {demoFormData.phone.length > 8 ?
                              'Perfect! Our demo team will call you faster than a guest checking in! ⚡' :
                              'Keep typing that number - we promise not to call during your coffee break ☕'
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Management System
                    </label>
                    <Input
                      placeholder="e.g., Excel sheets, other software, or manual"
                      value={demoFormData.currentSystem}
                      onChange={(e) => setDemoFormData({ ...demoFormData, currentSystem: e.target.value })}
                      className="border-2 border-gray-200 focus:border-[#1295D0] focus:ring-2 focus:ring-[#1295D0]/20 transition-all duration-300"
                    />
                    {demoFormData.currentSystem && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs text-yellow-700">
                          <span className="font-semibold">AI:</span> {demoFormData.currentSystem.toLowerCase().includes('excel') ?
                            'Excel warrior detected! 📊 We\'ll show you how to escape spreadsheet hell with style!' :
                            demoFormData.currentSystem.toLowerCase().includes('manual') ?
                              'Manual system? You\'re basically a hostel superhero! 🦸‍♂️ Time to get some superpowers with Kaha!' :
                              demoFormData.currentSystem.toLowerCase().includes('paper') ?
                                'Paper-based? Respect for the old school! 📝 Ready to go digital without losing that personal touch?' :
                                `"${demoFormData.currentSystem}" - interesting! We\'ll show you how Kaha compares and improves on what you\'re using 🚀`
                          }
                        </p>
                      </div>
                    )}
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
                    {demoFormData.additionalInfo && (
                      <div className="mt-2 p-2 bg-pink-50 border border-pink-200 rounded-lg">
                        <p className="text-xs text-pink-700">
                          <span className="font-semibold">AI:</span> {demoFormData.additionalInfo.length > 100 ?
                            'Wow, you\'re thorough! 📚 Our demo team loves detailed requests - you\'ll get an amazing personalized demo!' :
                            demoFormData.additionalInfo.length > 20 ?
                              'Great details! The more you tell us, the better we can tailor your demo experience 🎯' :
                              'Every word helps us create the perfect demo for you! Keep going... 💭'
                          }
                        </p>
                      </div>
                    )}
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

                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-500">
                    We'll contact you within 24 hours to schedule your personalized demo
                  </p>
                  <div className="flex justify-center gap-4 mt-3">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Free Demo
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      No Commitment
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Personalized Setup
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Hero Section - World Class Design */}
        <section className="relative py-16 px-6 sm:px-8 lg:px-12 overflow-hidden">
          {/* Enhanced Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-64 -right-64 w-96 h-96 bg-gradient-to-br from-[#07A64F]/8 to-[#1295D0]/8 rounded-full animate-pulse blur-3xl"></div>
            <div className="absolute -bottom-64 -left-64 w-96 h-96 bg-gradient-to-br from-[#1295D0]/8 to-[#07A64F]/8 rounded-full animate-pulse delay-1000 blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-[#07A64F]/3 to-[#1295D0]/3 rounded-full animate-pulse delay-500 blur-3xl"></div>
          </div>

          <div className="max-w-8xl mx-auto relative z-10">
            <div className="text-center mb-12" data-animate id="hero">
              <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight tracking-tight transition-all duration-1000 ${isVisible['hero'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}>
                Modern Hostel Management
                <span className="block bg-gradient-to-r from-[#07A64F] to-[#1295D0] bg-clip-text text-transparent mt-1">
                  Made Simple
                </span>
              </h1>
              <p className={`text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed font-light transition-all duration-1000 delay-300 ${isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}>
                Empower your hostel with Kaha's comprehensive management platform.
                <span className="block mt-1">Streamline operations, boost revenue, and enhance guest experiences.</span>
              </p>

              {/* Interactive Search Section - Enhanced */}
              <div className={`max-w-4xl mx-auto mb-10 transition-all duration-1000 delay-500 ${isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}>
                <div className="flex gap-6">
                  <div className="flex-1 relative group">
                    <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6 group-focus-within:text-[#1295D0] transition-colors duration-300" />
                    <Input
                      placeholder="Search hostels using Kaha platform..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-14 py-6 text-xl border-2 border-gray-200/50 focus:border-[#1295D0] focus:ring-4 focus:ring-[#1295D0]/10 transition-all duration-300 hover:border-gray-300 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl font-medium"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    {searchQuery && (
                      <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-2xl mt-3 shadow-2xl z-10">
                        <div className="p-6">
                          <p className="text-sm text-gray-600 mb-4 font-medium">Suggested hostels:</p>
                          {sampleHostels.filter(h => h.name.toLowerCase().includes(searchQuery.toLowerCase())).map((hostel, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 hover:bg-gray-50/80 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02]">
                              <Building2 className="h-5 w-5 text-[#1295D0]" />
                              <span className="text-base font-medium">{hostel.name} - {hostel.location}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={handleSearch}
                    size="lg"
                    className="bg-gradient-to-r from-[#07A64F] to-[#1295D0] hover:from-[#07A64F]/90 hover:to-[#1295D0]/90 text-white px-12 py-6 text-xl font-bold transform hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:shadow-[#07A64F]/30 rounded-2xl relative overflow-hidden group"
                  >
                    <span className="relative z-10">Search</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Button>
                </div>
                <p className="text-base text-gray-500 mt-4 animate-pulse font-medium">
                  Discover hostels powered by Kaha management system
                </p>
              </div>

              {/* Interactive Hostels Using Kaha Platform - Enhanced */}
              <div className={`mb-10 transition-all duration-1000 delay-700 ${isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}>
                <h3 className="text-2xl md:text-3xl font-bold text-center mb-4 text-gray-900 tracking-tight">Hostels Using Kaha Platform</h3>
                <p className="text-base md:text-lg text-gray-600 text-center mb-8 max-w-2xl mx-auto font-light">
                  Join hundreds of successful hostels already using our platform
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {sampleHostels.map((hostel, index) => (
                    <Card
                      key={index}
                      className="group relative bg-white/90 backdrop-blur-sm border-2 border-gray-100/50 hover:border-[#1295D0]/30 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 cursor-pointer rounded-2xl overflow-hidden"
                      onClick={() => console.log(`Viewing ${hostel.name}`)}
                    >
                      {/* Animated gradient background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#07A64F]/0 via-[#1295D0]/0 to-[#07A64F]/0 group-hover:from-[#07A64F]/5 group-hover:via-[#1295D0]/5 group-hover:to-[#07A64F]/5 transition-all duration-700"></div>

                      {/* Top accent bar */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#07A64F] to-[#1295D0] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

                      <CardContent className="p-6 relative z-10">
                        {/* Header with icon and name */}
                        <div className="flex items-start gap-3 mb-4">
                          <div className="flex-shrink-0 p-3 bg-gradient-to-br from-[#07A64F]/10 to-[#1295D0]/10 group-hover:from-[#07A64F]/20 group-hover:to-[#1295D0]/20 rounded-xl transition-all duration-300 group-hover:scale-110">
                            <Building2 className="h-6 w-6 text-[#1295D0] group-hover:text-[#07A64F] transition-colors duration-300" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-lg text-gray-900 group-hover:text-[#1295D0] transition-colors duration-300 truncate">
                              {hostel.name}
                            </h4>
                            <div className="flex items-center gap-1 mt-1">
                              <MapPin className="h-4 w-4 text-gray-400 group-hover:text-[#07A64F] transition-colors duration-300" />
                              <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300 truncate">
                                {hostel.location}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Rating and rooms info */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2 bg-yellow-50 group-hover:bg-yellow-100 px-3 py-1.5 rounded-full transition-colors duration-300">
                            <Star className="h-4 w-4 text-yellow-500 fill-current group-hover:scale-110 transition-transform duration-300" />
                            <span className="text-sm font-bold text-gray-900">{hostel.rating}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500 group-hover:text-gray-700 transition-colors duration-300">
                            <Users className="h-4 w-4" />
                            <span className="text-sm font-medium">{hostel.rooms} rooms</span>
                          </div>
                        </div>

                        {/* Interactive rating bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                              Guest Satisfaction
                            </span>
                            <span className="text-xs font-bold text-[#07A64F] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                              {Math.round((hostel.rating / 5) * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-[#07A64F] to-[#1295D0] h-2 rounded-full transition-all duration-1000 shadow-sm transform scale-x-0 group-hover:scale-x-100 origin-left"
                              style={{ '--tw-scale-x': `${(hostel.rating / 5)}` } as React.CSSProperties}
                            ></div>
                          </div>
                        </div>

                        {/* Status indicators */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-[#07A64F] rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium text-gray-600 group-hover:text-[#07A64F] transition-colors duration-300">
                              Active on
                            </span>
                            <KahaLogo size="sm" className="group-hover:scale-110 transition-transform duration-300" />
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <ArrowRight className="h-4 w-4 text-[#1295D0] transform group-hover:translate-x-1 transition-transform duration-300" />
                          </div>
                        </div>

                        {/* Additional info that appears on hover - no overlap */}
                        <div className="border-t border-gray-100 pt-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-[#07A64F]" />
                              <span className="text-gray-600 font-medium">Verified Partner</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-3 w-3 text-[#1295D0]" />
                              <span className="text-gray-600 font-medium">Growing</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Animated Statistics Section - World Class Design */}
        <section className="py-16 bg-gradient-to-r from-[#07A64F]/8 via-white/50 to-[#1295D0]/8 relative overflow-hidden" data-animate id="stats">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2307A64F' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>

          <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 tracking-tight">Proven Results</h2>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto font-light">
                Join thousands of successful hostels already transforming their business
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              <div className="text-center group">
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:scale-110 hover:-translate-y-3 border border-white/30 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#07A64F]/10 to-[#1295D0]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="text-4xl md:text-5xl font-bold text-[#07A64F] mb-4 group-hover:scale-110 transition-transform duration-300">
                      {animatedStats.hostels}+
                    </div>
                    <p className="text-gray-600 font-semibold text-lg">Active Hostels</p>
                    <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-[#07A64F] to-[#07A64F]/80 h-3 rounded-full w-full transition-all duration-1000 shadow-lg"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center group">
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:scale-110 hover:-translate-y-3 border border-white/30 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1295D0]/10 to-[#07A64F]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="text-4xl md:text-5xl font-bold text-[#1295D0] mb-4 group-hover:scale-110 transition-transform duration-300">
                      {animatedStats.visibility}%
                    </div>
                    <p className="text-gray-600 font-semibold text-lg">Visibility Increase</p>
                    <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-[#1295D0] to-[#1295D0]/80 h-3 rounded-full w-full transition-all duration-1000 shadow-lg"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center group">
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:scale-110 hover:-translate-y-3 border border-white/30 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#07A64F]/10 to-[#1295D0]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="text-4xl md:text-5xl font-bold text-[#07A64F] mb-4 group-hover:scale-110 transition-transform duration-300">
                      {animatedStats.bookings}%
                    </div>
                    <p className="text-gray-600 font-semibold text-lg">More Bookings</p>
                    <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-[#07A64F] to-[#1295D0] h-3 rounded-full w-full transition-all duration-1000 shadow-lg"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center group">
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:scale-110 hover:-translate-y-3 border border-white/30 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1295D0]/10 to-[#07A64F]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="text-4xl md:text-5xl font-bold text-[#1295D0] mb-4 group-hover:scale-110 transition-transform duration-300">
                      {animatedStats.revenue}%
                    </div>
                    <p className="text-gray-600 font-semibold text-lg">Revenue Growth</p>
                    <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-[#1295D0] to-[#07A64F] h-3 rounded-full w-full transition-all duration-1000 shadow-lg"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section - Social Proof */}
        <section className="py-16 bg-gradient-to-r from-[#07A64F]/5 to-[#1295D0]/5 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Don't Just Take Our Word For It
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Real hostel owners sharing their success stories with Kaha
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                </div>
                <blockquote className="text-gray-700 mb-6 italic">
                  "Before Kaha, I was losing 40% of potential bookings because guests couldn't find us online. Now we're booked solid 3 months in advance!"
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#07A64F] to-[#1295D0] rounded-full flex items-center justify-center text-white font-bold text-lg">
                    R
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-gray-900">Ramesh Shrestha</p>
                    <p className="text-sm text-gray-600">Himalayan Backpackers, Thamel</p>
                    <p className="text-xs text-[#07A64F] font-semibold">+300% bookings in 6 months</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                </div>
                <blockquote className="text-gray-700 mb-6 italic">
                  "Kaha saved me 4 hours every day on paperwork. Now I focus on what matters - making guests happy and growing my business."
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#07A64F] to-[#1295D0] rounded-full flex items-center justify-center text-white font-bold text-lg">
                    S
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-gray-900">Sita Gurung</p>
                    <p className="text-sm text-gray-600">Mountain View Lodge, Pokhara</p>
                    <p className="text-xs text-[#07A64F] font-semibold">4 hours saved daily</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                </div>
                <blockquote className="text-gray-700 mb-6 italic">
                  "My revenue doubled in the first year with Kaha. The automated billing alone pays for the platform 10 times over."
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#07A64F] to-[#1295D0] rounded-full flex items-center justify-center text-white font-bold text-lg">
                    B
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-gray-900">Bikash Tamang</p>
                    <p className="text-sm text-gray-600">Heritage Hostel, Bhaktapur</p>
                    <p className="text-xs text-[#07A64F] font-semibold">200% revenue increase</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-6 bg-white/80 backdrop-blur-sm px-8 py-4 rounded-full shadow-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-[#07A64F]" />
                  <span className="text-sm font-semibold text-gray-700">500+ Verified Reviews</span>
                </div>
                <div className="w-px h-6 bg-gray-300"></div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#1295D0]" />
                  <span className="text-sm font-semibold text-gray-700">Bank-Grade Security</span>
                </div>
                <div className="w-px h-6 bg-gray-300"></div>
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-semibold text-gray-700">98% Satisfaction Rate</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Complete Hostel Management Solution Section - World Class Design */}
        <section className="py-16 bg-gradient-to-br from-white via-gray-50/30 to-white relative overflow-hidden" data-animate id="features">
          {/* Subtle background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 -left-32 w-64 h-64 bg-gradient-to-br from-[#07A64F]/5 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-gradient-to-br from-[#1295D0]/5 to-transparent rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
            <div className={`text-center mb-12 transition-all duration-1000 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
                Complete Hostel Management
                <span className="block bg-gradient-to-r from-[#07A64F] to-[#1295D0] bg-clip-text text-transparent">
                  Solution
                </span>
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto font-light leading-relaxed">
                Everything you need to run a successful hostel business, all in one powerful platform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {platformFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={index}
                    className={`bg-white shadow-lg border-0 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 cursor-pointer group ${isVisible.features ? `opacity-100 translate-y-0 delay-${index * 100}` : 'opacity-0 translate-y-10'
                      }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="p-8 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#07A64F]/5 to-[#1295D0]/5 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500"></div>
                      <div className="bg-gradient-to-br from-[#07A64F]/10 to-[#1295D0]/10 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300">
                        <Icon className="h-8 w-8 text-[#07A64F] group-hover:scale-110 transition-transform" />
                      </div>
                      <h3 className="text-xl font-semibold mb-4 group-hover:text-[#1295D0] transition-colors">{feature.title}</h3>
                      <p className="text-gray-600 group-hover:text-gray-700 transition-colors">{feature.description}</p>
                      <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="h-5 w-5 text-[#1295D0] animate-bounce" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Verified Profiling Section */}
        <section className="py-16 bg-white" data-section="verified-profiling">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-[#07A64F] to-[#1295D0] p-3 rounded-full">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Verified Profiling</h2>
              </div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Every hostel on our platform goes through comprehensive verification, ensuring authentic and trustworthy experiences for travelers and reliable business partnerships.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8 text-center">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">Builds User Trust</h3>
                  <p className="text-gray-600">
                    Verified profiles create confidence among travelers, leading to higher booking rates and positive reviews for your hostel business.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8 text-center">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">Reduces Risk of Scams</h3>
                  <p className="text-gray-600">
                    Our verification process eliminates fraudulent listings and protects both travelers and legitimate hostel owners from misinformation.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8 text-center">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">Improves Credibility</h3>
                  <p className="text-gray-600">
                    Verified hostels gain enhanced visibility and credibility, attracting quality guests and building long-term business reputation.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Additional Benefits */}
            <div className="bg-gradient-to-r from-[#07A64F]/5 to-[#1295D0]/5 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">Additional Verification Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                    <Star className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2">Quality Assurance</h4>
                    <p className="text-sm text-gray-600">Maintains high standards across all listed properties</p>
                  </div>
                </div>

                <div className="text-center">
                  <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                    <Users className="h-8 w-8 text-[#1295D0] mx-auto mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2">Community Safety</h4>
                    <p className="text-sm text-gray-600">Creates a safer environment for all platform users</p>
                  </div>
                </div>

                <div className="text-center">
                  <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                    <Globe className="h-8 w-8 text-[#07A64F] mx-auto mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2">Global Standards</h4>
                    <p className="text-sm text-gray-600">Meets international hospitality verification requirements</p>
                  </div>
                </div>

                <div className="text-center">
                  <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                    <Building2 className="h-8 w-8 text-[#1295D0] mx-auto mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2">Business Growth</h4>
                    <p className="text-sm text-gray-600">Verified status leads to increased bookings and revenue</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Process */}
            <div className="mt-16 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Our Verification Process</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="relative">
                  <div className="bg-gradient-to-br from-[#07A64F] to-[#07A64F]/80 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    1
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Document Review</h4>
                  <p className="text-sm text-gray-600">Business license and legal documentation verification</p>
                </div>

                <div className="relative">
                  <div className="bg-gradient-to-br from-[#1295D0] to-[#1295D0]/80 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    2
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Location Validation</h4>
                  <p className="text-sm text-gray-600">Physical address and KAHA tag verification</p>
                </div>

                <div className="relative">
                  <div className="bg-gradient-to-br from-[#07A64F] to-[#1295D0] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    3
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Quality Assessment</h4>
                  <p className="text-sm text-gray-600">Facility standards and service quality evaluation</p>
                </div>

                <div className="relative">
                  <div className="bg-gradient-to-br from-[#1295D0] to-[#07A64F] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    4
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Certification</h4>
                  <p className="text-sm text-gray-600">Official verification badge and platform listing</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Kaha App Visibility Section */}
        <section className="py-16 bg-gradient-to-br from-[#07A64F]/5 via-white to-[#1295D0]/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="bg-gradient-to-br from-[#07A64F]/10 to-[#1295D0]/10 p-4 rounded-2xl border border-[#07A64F]/20">
                  <KahaLogo size="md" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Kaha App Increases Your Hostel Visibility</h2>
              </div>
              <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto mb-8">
                Get discovered by thousands of travelers through the Kaha App ecosystem. Our integrated platform ensures your hostel reaches the right audience at the right time.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-10">



            </div>

            {/* How It Works */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">How Kaha App Boosts Your Visibility</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-gradient-to-br from-[#07A64F] to-[#07A64F]/80 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Smart App Integration</h4>
                  <p className="text-gray-600">
                    Your hostel automatically appears in the Kaha App with rich profiles, photos, and real-time availability.
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-gradient-to-br from-[#1295D0] to-[#1295D0]/80 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Location Intelligence</h4>
                  <p className="text-gray-600">
                    KAHA tags enable precise location discovery, making it easier for travelers to find and navigate to your hostel.
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-gradient-to-br from-[#07A64F] to-[#1295D0] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Performance Analytics</h4>
                  <p className="text-gray-600">
                    Track your visibility metrics and optimize your listing based on real user engagement data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-[#07A64F]/10 to-[#1295D0]/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Stop Losing Money to Empty Beds</h2>
              <p className="text-base md:text-lg text-gray-600 mb-4">Every day you wait is revenue walking out the door</p>
              <div className="inline-flex items-center gap-2 bg-red-50 px-4 py-2 rounded-full border border-red-200 mb-6">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-red-700">
                  Your competitors are already using Kaha to steal your guests
                </span>
              </div>

              <div className="flex justify-center mb-8">
                <Button
                  onClick={() => setShowDemoForm(true)}
                  size="lg"
                  className="bg-gradient-to-r from-[#07A64F] to-[#1295D0] hover:from-[#07A64F]/90 hover:to-[#1295D0]/90 text-white px-8 py-4 text-lg transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl relative overflow-hidden group"
                >
                  <span className="relative z-10">Request Demo</span>
                  <ArrowRight className="ml-2 h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-8 text-center">
                  <TrendingUp className="h-12 w-12 text-[#07A64F] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Increase Revenue</h3>
                  <p className="text-gray-600">Average 25% revenue increase in first 6 months</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 text-[#1295D0] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Better Guest Experience</h3>
                  <p className="text-gray-600">Streamlined check-in and personalized service</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-8 text-center">
                  <Clock className="h-12 w-12 text-[#07A64F] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Save Time</h3>
                  <p className="text-gray-600">Automate 80% of daily management tasks</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Powered by Kaha Inc Section */}
        <section className="py-16 bg-gradient-to-r from-[#07A64F]/5 to-[#1295D0]/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-6">
                <KahaLogo size="md" />
                <h2 className="text-3xl font-bold bg-gradient-to-r from-[#07A64F] to-[#1295D0] bg-clip-text text-transparent">
                  Powered by Kaha Inc
                </h2>
              </div>

              <div className="max-w-4xl mx-auto mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  One product, unlimited solutions from KAHA
                </h3>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Kaha, as the word describes itself, means "where" in Nepali. That's the question we aim to answer.
                  Mostly when people are directed to a certain location in Nepal, due to the unnamed houses, we often
                  get a call back asking "ya bata kaha ho?" or "where is it exactly?".
                </p>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  This is where we introduce Kaha. Kaha is a simple solution to location identification which allows
                  individuals, businesses, and professionals to tag their specific location through KAHA tagging and
                  create a digital identity. The unique identity of individuals, businesses, and professionals created
                  can be easily shared over this platform and across platforms.
                </p>

                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">Get KAHA Tag for your Business</h4>
                  <p className="text-gray-600">
                    Kaha, as the word describes itself, means "where" in Nepali. That's the question we aim to answer.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-white shadow-lg border-0 text-center p-6">
                <div className="bg-gradient-to-br from-[#07A64F]/10 to-[#07A64F]/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-6 w-6 text-[#07A64F]" />
                </div>
                <h3 className="font-semibold mb-2">Location Tagging</h3>
                <p className="text-sm text-gray-600">Digital identity for every location</p>
              </Card>

              <Card className="bg-white shadow-lg border-0 text-center p-6">
                <div className="bg-gradient-to-br from-[#1295D0]/10 to-[#1295D0]/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-6 w-6 text-[#1295D0]" />
                </div>
                <h3 className="font-semibold mb-2">Business Solutions</h3>
                <p className="text-sm text-gray-600">Comprehensive management tools</p>
              </Card>

              <Card className="bg-white shadow-lg border-0 text-center p-6">
                <div className="bg-gradient-to-br from-[#07A64F]/10 to-[#1295D0]/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-6 w-6 text-[#07A64F]" />
                </div>
                <h3 className="font-semibold mb-2">Cross-Platform</h3>
                <p className="text-sm text-gray-600">Share across all platforms</p>
              </Card>

              <Card className="bg-white shadow-lg border-0 text-center p-6">
                <div className="bg-gradient-to-br from-[#1295D0]/10 to-[#07A64F]/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="h-6 w-6 text-[#1295D0]" />
                </div>
                <h3 className="font-semibold mb-2">Digital Identity</h3>
                <p className="text-sm text-gray-600">Unique business identification</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer - Clean Two-Row Design */}
        <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden" data-section="footer">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>

          {/* Gradient Overlays */}
          <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-[#07A64F]/10 to-transparent"></div>
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#1295D0]/10 to-transparent"></div>

          <div className="relative z-10 max-w-8xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
            {/* First Row - Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">

              {/* Left Side - Logo and App Downloads */}
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                {/* Logo and App Store Buttons Side by Side */}
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
                  {/* Logo Section */}
                  <div className="flex flex-col items-center lg:items-start">
                    <div className="relative mb-2">
                      <KahaLogo size="xl" />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#07A64F]/20 to-[#1295D0]/20 blur-xl -z-10 scale-110"></div>
                    </div>
                    <p className="text-sm text-gray-300 text-center lg:text-left mb-4 max-w-xs">KAHA is a location tracking app for your business and personal use.</p>
                  </div>

                  {/* App Store Buttons - Right next to logo */}
                  <div className="flex flex-col items-center lg:items-start">
                    <div className="space-y-3">
                      <div className="group cursor-pointer">
                        <div className="bg-gradient-to-r from-[#07A64F]/20 to-[#1295D0]/20 border border-white/20 rounded-lg px-4 py-2 hover:from-[#07A64F]/30 hover:to-[#1295D0]/30 hover:border-white/40 transition-all duration-300 hover:scale-105">
                          <div className="flex items-center gap-3">
                            <svg className="h-6 w-6 text-white group-hover:text-[#07A64F] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L17.194 12l.505-.491zM5.864 2.658L16.802 8.99 14.5 11.293 5.864 2.658z" />
                            </svg>
                            <div className="text-left">
                              <p className="text-xs text-gray-400">GET IT ON</p>
                              <p className="text-sm font-bold text-white">Google Play</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="group cursor-pointer">
                        <div className="bg-gradient-to-r from-[#07A64F]/20 to-[#1295D0]/20 border border-white/20 rounded-lg px-4 py-2 hover:from-[#07A64F]/30 hover:to-[#1295D0]/30 hover:border-white/40 transition-all duration-300 hover:scale-105">
                          <div className="flex items-center gap-3">
                            <svg className="h-6 w-6 text-white group-hover:text-[#1295D0] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                            </svg>
                            <div className="text-left">
                              <p className="text-xs text-gray-400">Download on the</p>
                              <p className="text-sm font-bold text-white">App Store</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Contact Details */}
              <div className="text-center lg:text-right">
                <h3 className="text-xl font-bold text-white mb-6">Contact Details</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-center lg:justify-end gap-3">
                    <Phone className="h-5 w-5 text-[#07A64F]" />
                    <span className="text-gray-300 font-medium">+977 9801138780</span>
                  </div>

                  <div className="flex items-center justify-center lg:justify-end gap-3">
                    <Phone className="h-5 w-5 text-[#1295D0]" />
                    <span className="text-gray-300 font-medium">+977 1-5907701</span>
                  </div>

                  <div className="flex items-center justify-center lg:justify-end gap-3">
                    <Mail className="h-5 w-5 text-[#07A64F]" />
                    <span className="text-gray-300 font-medium">info@kaha.com.np</span>
                  </div>

                  <div className="flex items-center justify-center lg:justify-end gap-3">
                    <MapPin className="h-5 w-5 text-[#1295D0]" />
                    <span className="text-gray-300 font-medium">Anamnagar, Kathmandu Nepal</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Second Row - Copyright */}
            <div className="border-t border-gray-700 pt-8">
              <div className="text-center">
                <p className="text-gray-400 text-sm font-medium">
                  © 2025 Kaha Incorporation Pvt. Ltd.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Landing;