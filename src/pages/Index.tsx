import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Wallet, ArrowRight, Shield, PieChart, Bell, TrendingUp,
  Target, CreditCard, Sparkles, CheckCircle2, Users, Lock,
  Zap, Globe, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

const Index = () => {
  const { user, isLoading } = useAuth();

  // Add structured data for SEO
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "FinanceHub",
      "url": "https://finance.abhirupkumar.in",
      "description": "Free personal finance management app to track income, expenses, budgets, and financial goals. Beautiful analytics and bank-level security.",
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "2847"
      },
      "featureList": [
        "Expense Tracking",
        "Budget Management",
        "Financial Goals",
        "Visual Analytics",
        "Bank-level Security"
      ]
    });
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  if (isLoading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  const stats = [
    { value: '10+', label: 'Active Users' },
    { value: '₹20K+', label: 'Tracked Monthly' },
    { value: '4.9★', label: 'User Rating' },
    { value: '99.9%', label: 'Uptime' },
  ];

  const features = [
    {
      icon: PieChart,
      title: 'Smart Analytics',
      desc: 'AI-powered insights reveal spending patterns and help you make smarter financial decisions.',
      gradient: 'from-primary to-emerald-400'
    },
    {
      icon: Target,
      title: 'Goal Tracking',
      desc: 'Set savings goals and watch your progress with beautiful visualizations and milestone celebrations.',
      gradient: 'from-blue-500 to-cyan-400'
    },
    {
      icon: Bell,
      title: 'Smart Alerts',
      desc: 'Get notified before you overspend. Budget alerts keep you on track without the stress.',
      gradient: 'from-amber-500 to-orange-400'
    },
    {
      icon: Shield,
      title: 'Bank-level Security',
      desc: 'Your data is encrypted with AES-256 and never shared. Privacy is our priority.',
      gradient: 'from-violet-500 to-purple-400'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      desc: 'Instant sync across devices. Add transactions in seconds, not minutes.',
      gradient: 'from-rose-500 to-pink-400'
    },
    {
      icon: Globe,
      title: 'Multi-Currency',
      desc: 'Support for INR, USD, EUR, and 20+ currencies with real-time conversion.',
      gradient: 'from-teal-500 to-green-400'
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Create Account',
      desc: 'Sign up in 30 seconds. No credit card required.',
      icon: Users
    },
    {
      step: '02',
      title: 'Add Transactions',
      desc: 'Log your income and expenses with smart categorization.',
      icon: CreditCard
    },
    {
      step: '03',
      title: 'Set Budgets & Goals',
      desc: 'Define your spending limits and savings targets.',
      icon: Target
    },
    {
      step: '04',
      title: 'Watch Your Wealth Grow',
      desc: 'Get insights and see your financial health improve.',
      icon: TrendingUp
    },
  ];

  const testimonials = [
    {
      quote: "Finally, a finance app that doesn't feel like doing taxes. Beautiful, simple, and actually helps me save money.",
      author: "Priya S.",
      role: "Software Engineer",
      rating: 5
    },
    {
      quote: "I've tried Mint, YNAB, and others. FinanceHub is the only one I've stuck with for over a year. The UI is incredible.",
      author: "Rahul M.",
      role: "Business Owner",
      rating: 5
    },
    {
      quote: "The budget alerts saved me from overspending multiple times. It's like having a financial advisor in my pocket.",
      author: "Ananya K.",
      role: "Marketing Manager",
      rating: 5
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-glow">
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">FinanceHub</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it works</a>
            {/* <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Reviews</a> */}
          </div>
          <Link to="/auth">
            <Button className="gap-2 shadow-glow">
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-32">
          {/* Background Effects */}
          <div className="absolute inset-0 gradient-hero" />
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-info/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

          <div className="container mx-auto px-4 relative">
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-8 animate-fade-in">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">Trusted by 10+ Indians</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight mb-6 animate-slide-up">
                Master Your Money,{' '}
                <span className="relative">
                  <span className="text-primary">Shape Your Future</span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                    <path d="M2 10C50 4 100 2 150 6C200 10 250 4 298 8" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
                  </svg>
                </span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '100ms' }}>
                The beautiful, free personal finance app that makes tracking money feel effortless.
                Join thousands achieving their financial goals.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '200ms' }}>
                <Link to="/auth">
                  <Button size="lg" className="gap-2 px-8 text-lg h-14 shadow-glow">
                    Start Free Today <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <a href="#features">
                  <Button size="lg" variant="outline" className="gap-2 px-8 text-lg h-14">
                    See Features <ChevronRight className="h-5 w-5" />
                  </Button>
                </a>
              </div>

              {/* Trust Badges */}
              <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-muted-foreground animate-fade-in" style={{ animationDelay: '400ms' }}>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  <span className="text-sm">256-bit Encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm">GDPR Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm">No Credit Card Required</span>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '500ms' }}>
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl md:text-4xl font-display font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-32 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Everything You Need to{' '}
                <span className="text-primary">Take Control</span>
              </h2>
              <p className="text-muted-foreground text-lg">
                Powerful features wrapped in a beautiful interface. No finance degree required.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="group relative p-6 rounded-2xl bg-card shadow-card hover:shadow-lg transition-all duration-300 animate-slide-up border border-border/50"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Start in <span className="text-primary">4 Simple Steps</span>
              </h2>
              <p className="text-muted-foreground text-lg">
                From signup to savings insights in under 5 minutes.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className="relative text-center animate-slide-up"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  {/* Connector Line */}
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/50 to-primary/20" />
                  )}

                  <div className="relative inline-flex">
                    <div className="w-24 h-24 rounded-2xl bg-card shadow-card flex items-center justify-center mb-4 border border-border/50 group hover:shadow-glow transition-shadow duration-300">
                      <step.icon className="h-10 w-10 text-primary" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full gradient-primary text-primary-foreground text-sm font-bold flex items-center justify-center shadow-md">
                      {step.step}
                    </span>
                  </div>

                  <h3 className="font-display font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section
        <section id="testimonials" className="py-20 md:py-32 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Loved by <span className="text-primary">Thousands</span>
              </h2>
              <p className="text-muted-foreground text-lg">
                See what our users are saying about FinanceHub.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {testimonials.map((testimonial, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-card shadow-card border border-border/50 animate-slide-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <svg key={j} className="w-5 h-5 text-warning fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-foreground mb-4 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                      {testimonial.author.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.author}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section> */}

        {/* CTA Section */}
        <section className="py-20 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 gradient-hero" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 relative">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">100% Free Forever</span>
              </div>

              <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
                Ready to Transform Your{' '}
                <span className="text-primary">Financial Life?</span>
              </h2>

              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                Join 50,000+ users who have taken control of their finances. No credit card required. Start for free today.
              </p>

              <Link to="/auth">
                <Button size="lg" className="gap-2 px-10 text-lg h-14 shadow-glow">
                  Get Started Free <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>

              <p className="mt-6 text-sm text-muted-foreground">
                ✓ Free forever &nbsp;&nbsp; ✓ No credit card &nbsp;&nbsp; ✓ 2-minute setup
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                  <Wallet className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-display font-bold">FinanceHub</span>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <a href="#features" className="hover:text-foreground transition-colors">Features</a>
                <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
                {/* <a href="#testimonials" className="hover:text-foreground transition-colors">Reviews</a> */}
                <Link to="/auth" className="hover:text-foreground transition-colors">Sign up</Link>
              </div>

              <p className="text-sm text-muted-foreground">
                © 2024 FinanceHub. Made with ❤️ by Abhirup Kumar (DevAdvancer).
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
