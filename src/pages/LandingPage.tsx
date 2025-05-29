import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useAnimation, useInView } from 'framer-motion';
import { BackgroundPaths } from '@/components/ui/background-paths';
import { Button } from '@/components/ui/button';
import { BookOpen, Edit, Share2, Users, FileText, Moon, Sun, MessageSquare, GitFork } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { GlowingEffect } from '@/components/ui/glowing-effect';

// ScrollReveal component to animate elements when they enter the viewport
interface ScrollRevealProps {
  children: React.ReactNode;
  width?: "fit-content" | "100%";
  delay?: number;
}

const ScrollReveal = ({ children, width = "fit-content", delay = 0 }: ScrollRevealProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const controls = useAnimation();
  
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);
  
  return (
    <motion.div
      ref={ref}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 }
      }}
      initial="hidden"
      animate={controls}
      transition={{ duration: 0.5, delay }}
      style={{ width }}
    >
      {children}
    </motion.div>
  );
};

// Text reveal animation
interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
}

const TextReveal = ({ text, className = "", delay = 0 }: TextRevealProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  
  return (
    <div ref={ref} className="overflow-hidden">
      <motion.p
        className={className}
        initial={{ y: 100, opacity: 0 }}
        animate={isInView ? { y: 0, opacity: 1 } : { y: 100, opacity: 0 }}
        transition={{ duration: 0.8, delay }}
      >
        {text}
      </motion.p>
    </div>
  );
};

// Navbar Component
const Navbar = () => {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md border-b border-slate-100 dark:border-neutral-800">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2 mr-6">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl text-slate-900 dark:text-white">ThreadSpire</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link to="/explore" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">
              Explore
            </Link>
            <a href="#features" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">
              Features
            </a>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleTheme} 
            className="rounded-full h-8 w-8"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="sm" className="rounded-full" asChild>
            <Link to="/login">Log In</Link>
          </Button>
          <Button size="sm" className="rounded-full" asChild>
            <Link to="/register">Sign Up</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

// Feature Card Component
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
  iconColor: string;
}

const FeatureCard = ({ icon, title, description, delay = 0, iconColor }: FeatureCardProps) => {
  return (
    <ScrollReveal width="100%" delay={delay * 0.2}>
      <div className="relative group">
        <GlowingEffect spread={50} glow={true} disabled={false} proximity={80} inactiveZone={0.01} borderWidth={3} />
        <div className="relative z-10">
          <div className="bg-white dark:bg-neutral-950 border border-slate-100 dark:border-neutral-800 rounded-lg shadow-md overflow-hidden h-full p-8 transition-all duration-300 group-hover:shadow-lg group-hover:translate-y-[-3px]">
            <div className={`w-16 h-16 flex items-center justify-center rounded-full ${iconColor} mb-6 shadow-lg transform transition-transform duration-300 group-hover:scale-110`}>
              <div className="scale-110">
                {icon}
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white transition-colors duration-300 group-hover:text-primary">{title}</h3>
            <p className="text-base text-slate-700 dark:text-slate-300">{description}</p>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
};

// Features Section
const Features = () => {
  return (
    <section id="features" className="py-24 bg-white dark:bg-neutral-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.03)_0,rgba(255,255,255,0)_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0,rgba(0,0,0,0)_70%)]"></div>
      
      <div className="container mx-auto px-4 flex flex-col items-center relative z-10">
        <motion.h2 
          className="text-4xl md:text-5xl font-bold mb-6 text-center text-slate-900 dark:text-white"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Powerful Features
        </motion.h2>
        <motion.p 
          className="text-lg text-slate-700 dark:text-slate-300 mb-16 text-center max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Create, share, and discover thought-provoking threads with our innovative platform.
        </motion.p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard 
            icon={<Edit className="h-8 w-8 text-white" />}
            title="Rich Thread Creation"
            description="Create beautiful, multi-segment threads with our powerful editor featuring rich text formatting."
            delay={1}
            iconColor="bg-indigo-500"
          />
          <FeatureCard 
            icon={<Share2 className="h-8 w-8 text-white" />}
            title="Easy Sharing"
            description="Share your threads with the world or keep them private until you're ready to publish."
            delay={2}
            iconColor="bg-blue-500"
          />
          <FeatureCard 
            icon={<Users className="h-8 w-8 text-white" />}
            title="Grow Your Audience"
            description="Build a following with your thought-provoking content and connect with like-minded individuals."
            delay={3}
            iconColor="bg-emerald-500"
          />
          <FeatureCard 
            icon={<FileText className="h-8 w-8 text-white" />}
            title="Organize Collections"
            description="Group related threads into collections for better organization and discovery."
            delay={4}
            iconColor="bg-amber-500"
          />
          <FeatureCard 
            icon={<GitFork className="h-8 w-8 text-white" />}
            title="Remix Threads"
            description="Build upon existing ideas by remixing threads and adding your own unique perspective."
            delay={5}
            iconColor="bg-purple-500"
          />
          <FeatureCard 
            icon={<MessageSquare className="h-8 w-8 text-white" />}
            title="Engage with Reactions"
            description="Express your thoughts with reactions and see how others respond to your content."
            delay={6}
            iconColor="bg-rose-500"
          />
        </div>
      </div>
    </section>
  );
};

// Benefits section with staggered text reveals
const Benefits = () => {
  return (
    <section className="py-20 bg-white dark:bg-neutral-950">
      <div className="container mx-auto px-4 flex flex-col items-center">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold mb-12 text-center mx-auto text-slate-900 dark:text-white"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Why Choose ThreadSpire?
        </motion.h2>
        
        <div className="w-full space-y-8">
          <div className="flex flex-col md:flex-row gap-6 items-start w-full bg-slate-50 dark:bg-neutral-900/50 p-6 rounded-lg border border-slate-100 dark:border-neutral-800">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
              <motion.div
                initial={{ rotate: 0 }}
                whileInView={{ rotate: 360 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                viewport={{ once: true }}
              >
                <Edit className="h-8 w-8" />
              </motion.div>
            </div>
            <div className="flex-1">
              <TextReveal 
                text="Enhanced Creativity" 
                className="text-2xl font-semibold mb-2 text-left text-slate-900 dark:text-white" 
                delay={0.1}
              />
              <TextReveal 
                text="Our intuitive editor empowers you to express complex ideas with clarity and style, enabling better storytelling and knowledge sharing." 
                className="text-slate-700 dark:text-slate-300 text-left" 
                delay={0.2}
              />
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 items-start w-full bg-slate-50 dark:bg-neutral-900/50 p-6 rounded-lg border border-slate-100 dark:border-neutral-800">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
              <motion.div
                initial={{ scale: 0.5 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                <Users className="h-8 w-8" />
              </motion.div>
            </div>
            <div className="flex-1">
              <TextReveal 
                text="Community Growth" 
                className="text-2xl font-semibold mb-2 text-left text-slate-900 dark:text-white" 
                delay={0.1}
              />
              <TextReveal 
                text="Connect with a global community of thinkers, writers, and creators who share your passions and can help amplify your ideas." 
                className="text-slate-700 dark:text-slate-300 text-left" 
                delay={0.2}
              />
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 items-start w-full bg-slate-50 dark:bg-neutral-900/50 p-6 rounded-lg border border-slate-100 dark:border-neutral-800">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <GitFork className="h-8 w-8" />
              </motion.div>
            </div>
            <div className="flex-1">
              <TextReveal 
                text="Collaborative Innovation" 
                className="text-2xl font-semibold mb-2 text-left text-slate-900 dark:text-white" 
                delay={0.1}
              />
              <TextReveal 
                text="Build on each other's ideas with our unique remixing feature, allowing concepts to evolve and improve through collective intelligence." 
                className="text-slate-700 dark:text-slate-300 text-left" 
                delay={0.2}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="bg-white dark:bg-neutral-950 border-t border-slate-100 dark:border-neutral-800 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl text-slate-900 dark:text-white">ThreadSpire</span>
            </Link>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Empowering thoughtful conversations through beautifully crafted threads.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-slate-900 dark:text-white">Platform</h4>
            <ul className="space-y-2">
              <li><Link to="/explore" className="text-sm text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">Explore</Link></li>
              <li><a href="#features" className="text-sm text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">Features</a></li>
              <li><Link to="/pricing" className="text-sm text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">Pricing</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-slate-900 dark:text-white">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">About</Link></li>
              <li><Link to="/blog" className="text-sm text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">Blog</Link></li>
              <li><Link to="/careers" className="text-sm text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">Careers</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-slate-900 dark:text-white">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-sm text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/cookies" className="text-sm text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-100 dark:border-neutral-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            &copy; {new Date().getFullYear()} ThreadSpire. All rights reserved.
          </p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Main Landing Page Component
const LandingPage = () => {
  // Add smooth scrolling behavior to the page
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero Section with BackgroundPaths */}
      <div className="pt-16 mb-12">
        <BackgroundPaths 
          title="Share Your Thoughts" 
          subtext="A platform for thoughtful conversations and knowledge sharing."
        />
      </div>
      
      {/* Main content */}
      <main>
        {/* Features Section */}
        <Features />
        
        {/* Benefits Section */}
        <Benefits />
        
        {/* Call to Action Section */}
        <section className="py-20 bg-white dark:bg-neutral-950 border-t border-slate-100 dark:border-neutral-900">
          <div className="container mx-auto px-4 flex flex-col items-center">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-4 text-center text-slate-900 dark:text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Ready to Start Your Journey?
            </motion.h2>
            <motion.p 
              className="text-lg text-slate-700 dark:text-slate-300 mb-8 text-center max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Join thousands of creators who are sharing their knowledge and building their audience with ThreadSpire.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Button size="lg" className="rounded-full" asChild>
                <Link to="/register">Get Started for Free</Link>
              </Button>
              <Button variant="outline" size="lg" className="rounded-full" asChild>
                <Link to="/explore">Explore Threads</Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage; 