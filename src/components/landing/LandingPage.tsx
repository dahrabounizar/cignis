import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Linkedin, 
  TrendingUp, 
  Users, 
  BarChart3, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  Star,
  Quote,
  Sun,
  Moon,
  Shield,
  Target,
  Rocket
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { initiateLinkedInAuth } from '../../services/linkedin';

interface NavigationProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
  onStartGrowing: () => void;
}

const Navigation = ({ activeSection, onNavigate, isDark, toggleTheme, onStartGrowing }: NavigationProps) => {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-colors ${
        isDark 
          ? 'bg-black/80 border-gray-800' 
          : 'bg-white/80 border-gray-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Linkedin size={20} className="text-white" />
            </div>
            <span className={`text-xl font-bold transition-colors ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>ProfileBoost</span>
          </motion.div>

          <div className="hidden md:flex items-center space-x-8">
            {['solutions', 'benefits', 'success'].map((section) => (
              <button
                key={section}
                onClick={() => onNavigate(section)}
                className={`text-sm font-medium transition-colors capitalize ${
                  activeSection === section 
                    ? 'text-blue-500' 
                    : isDark 
                      ? 'text-gray-300 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {section}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <motion.button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'hover:bg-gray-700 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>
            
            <Button
              onClick={onStartGrowing}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

const HeroSection = ({ isDark, onStartGrowing }: { isDark: boolean; onStartGrowing: () => void }) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className={`min-h-screen relative overflow-hidden flex items-center transition-colors ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900'
    }`}>
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className={`absolute inset-0 ${
          isDark 
            ? 'bg-[radial-gradient(circle_at_30%_70%,rgba(59,130,246,0.1),transparent_50%)]'
            : 'bg-[radial-gradient(circle_at_30%_70%,rgba(59,130,246,0.05),transparent_50%)]'
        }`} />
        <div className={`absolute inset-0 ${
          isDark 
            ? 'bg-[radial-gradient(circle_at_70%_30%,rgba(147,51,234,0.1),transparent_50%)]'
            : 'bg-[radial-gradient(circle_at_70%_30%,rgba(147,51,234,0.05),transparent_50%)]'
        }`} />
      </div>

      <motion.div 
        style={{ y, opacity }}
        className="relative z-10 max-w-7xl mx-auto px-6 py-20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`inline-flex items-center space-x-2 backdrop-blur-sm px-4 py-2 rounded-full border transition-colors ${
                isDark 
                  ? 'bg-gray-800/50 border-gray-700' 
                  : 'bg-white/50 border-gray-200'
              }`}
            >
              <Rocket size={16} className="text-blue-500" />
              <span className={`text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>Professional networking made simple</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl lg:text-7xl font-bold leading-tight"
            >
              Elevate your{' '}
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                professional presence
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`text-xl leading-relaxed max-w-2xl ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              Transform your LinkedIn strategy with intelligent insights, automated engagement tracking, and data-driven growth recommendations that deliver real results.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                onClick={onStartGrowing}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-8 py-4 text-lg"
              >
                Start Your Journey
              </Button>
              <Button
                variant="outline"
                size="lg"
                className={`px-8 py-4 text-lg transition-colors ${
                  isDark 
                    ? 'border-gray-600 text-white hover:bg-gray-800' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explore Solutions
                <ArrowRight size={20} className="ml-2" />
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-8 pt-8"
            >
              <div className="text-center">
                <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>50K+</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Active Users</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>300%</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Avg Growth</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>24/7</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Support</div>
              </div>
            </motion.div>
          </div>

          {/* Visual Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: 15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="relative"
          >
            <div className={`backdrop-blur-xl rounded-3xl p-8 shadow-2xl transition-colors ${
              isDark 
                ? 'bg-gray-900/50 border border-gray-700' 
                : 'bg-white/80 border border-gray-200'
            }`}>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold">PB</span>
                  </div>
                  <div>
                    <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>ProfileBoost Dashboard</div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Analytics Overview</div>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
              </div>

              {/* Metrics Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className={`rounded-xl p-4 ${isDark ? 'bg-blue-500/20' : 'bg-blue-50'}`}>
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>1.2K</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Profile Views</div>
                  <div className="text-green-500 text-xs">+25%</div>
                </div>
                <div className={`rounded-xl p-4 ${isDark ? 'bg-purple-500/20' : 'bg-purple-50'}`}>
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>89</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>New Connections</div>
                  <div className="text-green-500 text-xs">+18%</div>
                </div>
              </div>

              {/* Activity Feed */}
              <div className={`rounded-xl p-4 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                <div className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Recent Activity</div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Content published successfully</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>12 new profile interactions</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Weekly report generated</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

const SolutionsSection = ({ isDark }: { isDark: boolean }) => {
  const solutions = [
    {
      icon: Shield,
      title: 'Secure Analytics',
      description: 'Enterprise-grade security with comprehensive data protection and privacy controls',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Target,
      title: 'Smart Targeting',
      description: 'AI-powered audience insights to connect with the right professionals in your industry',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: TrendingUp,
      title: 'Growth Optimization',
      description: 'Data-driven strategies to maximize your professional network expansion',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: BarChart3,
      title: 'Performance Insights',
      description: 'Detailed analytics and reporting to track your networking success metrics',
      color: 'from-orange-500 to-red-500',
    }
  ];

  return (
    <section id="solutions" className={`py-20 transition-colors ${
      isDark 
        ? 'bg-gray-900 text-white' 
        : 'bg-white text-gray-900'
    }`}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Powerful{' '}
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Solutions
            </span>{' '}
            for Growth
          </h2>
          <p className={`text-xl max-w-3xl mx-auto ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Comprehensive tools designed to amplify your professional networking with intelligent automation and insights
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {solutions.map((solution, index) => (
            <motion.div
              key={solution.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group"
            >
              <div className={`p-6 h-full transition-all duration-300 rounded-2xl border ${
                isDark 
                  ? 'bg-gray-800/80 border-gray-700 hover:border-gray-600 shadow-xl' 
                  : 'bg-white border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl'
              }`}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${solution.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <solution.icon size={24} className="text-white" />
                </div>
                <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{solution.title}</h3>
                <p className={`leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{solution.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const BenefitsSection = ({ isDark, onStartGrowing }: { isDark: boolean; onStartGrowing: () => void }) => {
  const benefits = [
    {
      title: 'Professional Growth',
      description: 'Accelerate your career with strategic networking and enhanced visibility',
      features: [
        'Enhanced profile visibility',
        'Strategic connection building',
        'Industry thought leadership',
        'Career opportunity alerts'
      ]
    },
    {
      title: 'Business Development',
      description: 'Drive business growth through meaningful professional relationships',
      features: [
        'Lead generation tools',
        'Partnership opportunities',
        'Market insights',
        'Competitive analysis'
      ]
    },
    {
      title: 'Brand Building',
      description: 'Establish your personal or company brand as an industry authority',
      features: [
        'Content strategy optimization',
        'Engagement analytics',
        'Brand monitoring',
        'Reputation management'
      ]
    }
  ];

  return (
    <section id="benefits" className={`py-20 transition-colors ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Unlock Your{' '}
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Potential
            </span>
          </h2>
          <p className={`text-xl max-w-3xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Discover how our platform transforms your professional networking approach
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div 
                className={`p-8 h-full rounded-2xl border transition-all duration-300 ${
                  isDark 
                    ? 'bg-gray-800/70 border-gray-700 shadow-lg hover:shadow-xl' 
                    : 'bg-white border-gray-200 shadow-lg hover:shadow-xl'
                }`}
              >
                <div className="text-center mb-8">
                  <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{benefit.title}</h3>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{benefit.description}</p>
                </div>

                <div className="space-y-4 mb-8">
                  {benefit.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-3">
                      <CheckCircle size={20} className="text-blue-500 flex-shrink-0" />
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={onStartGrowing}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3"
                >
                  Get Started
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const SuccessSection = ({ isDark }: { isDark: boolean }) => {
  const testimonials = [
    {
      name: 'Alex Thompson',
      role: 'Tech Lead',
      company: 'InnovateCorp',
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
      content: 'ProfileBoost revolutionized my networking approach. I\'ve connected with industry leaders and secured three new business partnerships.',
      rating: 5
    },
    {
      name: 'Maria Rodriguez',
      role: 'Marketing Director',
      company: 'GrowthLab',
      image: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
      content: 'The insights provided helped me optimize my content strategy. My engagement increased by 400% in just two months.',
      rating: 5
    },
    {
      name: 'David Chen',
      role: 'Entrepreneur',
      company: 'StartupVision',
      image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
      content: 'This platform gave me the competitive edge I needed. I\'ve built a network of 500+ quality connections in my industry.',
      rating: 5
    }
  ];

  return (
    <section id="success" className={`py-20 transition-colors ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Success{' '}
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Stories
            </span>
          </h2>
          <p className={`text-xl max-w-3xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Join thousands of professionals who have transformed their careers with our platform
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className={`p-6 h-full rounded-2xl border transition-all duration-300 ${
                isDark 
                  ? 'bg-gray-800/80 border-gray-700 hover:border-gray-600 shadow-lg hover:shadow-xl' 
                  : 'bg-white border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl'
              }`}>
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <Quote size={24} className="text-blue-500 mb-4" />
                
                <p className={`mb-6 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center space-x-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{testimonial.name}</div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const LandingPage = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [isDark, setIsDark] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'solutions', 'benefits', 'success'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigate = (section: string) => {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const handleStartGrowing = () => {
    setShowSignIn(true);
  };

  if (showSignIn) {
    return <SignInPage isDark={isDark} toggleTheme={toggleTheme} onBack={() => setShowSignIn(false)} />;
  }

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-black' : 'bg-white'}`}>
      <Navigation 
        activeSection={activeSection} 
        onNavigate={handleNavigate} 
        isDark={isDark}
        toggleTheme={toggleTheme}
        onStartGrowing={handleStartGrowing}
      />
      
      <div id="hero">
        <HeroSection isDark={isDark} onStartGrowing={handleStartGrowing} />
      </div>
      
      <div id="solutions">
        <SolutionsSection isDark={isDark} />
      </div>
      
      <div id="benefits">
        <BenefitsSection isDark={isDark} onStartGrowing={handleStartGrowing} />
      </div>
      
      <div id="success">
        <SuccessSection isDark={isDark} />
      </div>

      {/* Footer */}
      <footer className={`border-t py-12 transition-colors ${
        isDark 
          ? 'bg-black border-gray-800' 
          : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Linkedin size={20} className="text-white" />
              </div>
              <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>ProfileBoost</span>
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              © 2024 ProfileBoost. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const SignInPage = ({ isDark, toggleTheme, onBack }: { isDark: boolean; toggleTheme: () => void; onBack: () => void }) => {
  const [step, setStep] = useState<'signin' | 'basic-auth' | 'dma-auth' | 'complete'>('signin');
  const [isLoading, setIsLoading] = useState(false);

  const handleBasicAuth = async () => {
    setIsLoading(true);
    setStep('basic-auth');
    // Simulate auth process
    setTimeout(() => {
      initiateLinkedInAuth('basic');
    }, 1000);
  };

  const handleDMAAuth = async () => {
    setIsLoading(true);
    setStep('dma-auth');
    // Simulate auth process
    setTimeout(() => {
      initiateLinkedInAuth('dma');
    }, 1000);
  };

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-black' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      {/* Navigation */}
      <nav className={`backdrop-blur-xl border-b transition-colors ${
        isDark 
          ? 'bg-black/80 border-gray-800' 
          : 'bg-white/80 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className={`flex items-center space-x-2 transition-colors ${
                isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowRight size={20} className="rotate-180" />
              <span>Back to Home</span>
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Linkedin size={20} className="text-white" />
              </div>
              <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>ProfileBoost</span>
            </div>

            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'hover:bg-gray-700 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Sign In Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <div className={`p-8 rounded-2xl border transition-all duration-300 ${
            isDark 
              ? 'bg-gray-800/90 border-gray-700 shadow-2xl' 
              : 'bg-white border-gray-200 shadow-2xl'
          }`}>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Linkedin size={32} className="text-white" />
              </div>
              <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Connect with LinkedIn
              </h2>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Link your LinkedIn profile to unlock powerful networking insights
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleBasicAuth}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3"
              >
                <Linkedin size={20} className="mr-2" />
                {isLoading ? 'Connecting...' : 'Connect with LinkedIn'}
              </Button>
              
              <p className={`text-xs text-center ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                By connecting, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};