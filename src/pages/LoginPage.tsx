import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { Eye, EyeOff, Crown, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const demoCredentials = [
  // { email: 'admin@clothing.com', password: 'okpassword1234', label: 'Super Admin (God User)', isGod: true },
  { email: 'shopadmin@aneeclothing.com', password: 'password123', label: 'Shop Admin', isGod: false },
];

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoHint, setShowDemoHint] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(username, password);
    setIsLoading(false);

    if (result.success) {
      toast({ title: '✓ Login Successful', description: 'Welcome back!' });
      navigate('/dashboard', { replace: true });
    } else {
      toast({ title: 'Login Failed', description: result.error ?? 'Invalid credentials', variant: 'destructive' });
    }
  };

  const fillDemoCredentials = (demo: typeof demoCredentials[0]) => {
    setUsername(demo.email);
    setPassword(demo.password);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0" style={{ background: 'var(--gradient-hero)' }} />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-16 text-primary-foreground">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-accent-foreground" />
              </div>
              <span className="text-2xl font-display font-bold">GMS</span>
            </div>
            
            <h1 className="text-5xl font-display font-bold leading-tight mb-6">
              Garment<br />
              Management<br />
              <span className="text-accent">System</span>
            </h1>
            
            <p className="text-lg text-primary-foreground/70 max-w-md leading-relaxed">
              Enterprise-grade solution for garment manufacturing, inventory control, 
              and sales management. Multi-brand, multi-database architecture.
            </p>
            
            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i}
                    className="w-10 h-10 rounded-full bg-accent/20 border-2 border-primary flex items-center justify-center text-xs font-medium"
                  >
                    {i}
                  </div>
                ))}
              </div>
              <span className="text-sm text-primary-foreground/60">
                Trusted by 500+ garment manufacturers
              </span>
            </div>
          </motion.div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-20 right-20 w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
      </motion.div>

      {/* Right Panel - Login Form */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex-1 flex items-center justify-center p-8 bg-background"
      >
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-xl font-display font-bold">GMS</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <h2 className="text-3xl font-display font-bold text-foreground mb-2">
              Welcome back
            </h2>
            <p className="text-muted-foreground mb-8">
              Sign in to access your dashboard
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Username
                </label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="input-premium"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="input-premium pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-border" />
                  <span className="text-sm text-muted-foreground">Remember me</span>
                </label>
                <button type="button" className="text-sm text-accent hover:underline">
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full btn-accent-gradient h-12 text-base font-semibold"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-8">
              <button
                type="button"
                onClick={() => setShowDemoHint(!showDemoHint)}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {showDemoHint ? 'Hide' : 'Show'} demo credentials
              </button>
              
              <AnimatePresence>
                {showDemoHint && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 space-y-2"
                  >
                    {demoCredentials.map((demo) => (
                      <button
                        key={demo.email}
                        type="button"
                        onClick={() => fillDemoCredentials(demo)}
                        className={`w-full p-3 rounded-lg border text-left transition-all hover:border-accent hover:bg-accent/5 ${
                          demo.isGod 
                            ? 'border-accent/50 bg-accent/5' 
                            : 'border-border bg-card'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {demo.isGod && <Crown className="w-4 h-4 text-accent" />}
                          <span className="font-medium text-sm">{demo.label}</span>
                          {demo.isGod && (
                            <span className="god-mode-badge text-[10px]">GOD</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {demo.email} / {demo.password}
                        </p>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
