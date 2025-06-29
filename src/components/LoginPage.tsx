// File: frontend/src/components/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Lock, Mail, User, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [data, setData] = useState({ email: '', password: '', firstName: '', lastName: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();
  const { toast } = useToast();

  const handleChange = e => setData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
  e.preventDefault();
  setLoading(true);

  const endpoint = isLogin
    ? 'https://finanancedashboard.onrender.com/api/auth/login'
    : 'https://finanancedashboard.onrender.com/api/auth/register';

  // Construct payload
  const payload = isLogin
    ? {
        email: data.email,
        password: data.password
      }
    : {
        username: `${data.firstName}${data.lastName}`.toLowerCase(), // <-- generate username
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword
      };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Unknown error');

    if (isLogin) {
      login(result.token);
      toast({ title: 'Login successful' });
      nav('/dashboard');
    } else {
      toast({ title: 'Registration successful', description: 'Check your email.' });
      setIsLogin(true);
    }
  } catch (err) {
    toast({ title: 'Error', description: err.message });
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-violet-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 bg-white/20 rounded-full animate-pulse`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          ></div>
        ))}
      </div>

      <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl relative z-10 transition-all duration-500 hover:shadow-3xl hover:bg-white/15">
        {/* Card glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-lg blur-xl"></div>
        
        <CardHeader className="text-center relative z-10 pb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent mb-2">
            {isLogin ? 'Welcome Back' : 'Join Us Today'}
          </CardTitle>
          <CardDescription className="text-blue-100/80 text-base">
            {isLogin
              ? 'Sign in to access your personalized dashboard'
              : 'Create your account and start your journey with us'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="relative z-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-300/60 group-focus-within:text-blue-300 transition-colors" />
                  <Input
                    name="firstName"
                    placeholder="First Name"
                    value={data.firstName}
                    onChange={handleChange}
                    required
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-blue-100/50 focus:border-blue-400 focus:bg-white/15 transition-all duration-300"
                  />
                </div>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-300/60 group-focus-within:text-blue-300 transition-colors" />
                  <Input
                    name="lastName"
                    placeholder="Last Name"
                    value={data.lastName}
                    onChange={handleChange}
                    required
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-blue-100/50 focus:border-blue-400 focus:bg-white/15 transition-all duration-300"
                  />
                </div>
              </div>
            )}
            
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-300/60 group-focus-within:text-blue-300 transition-colors" />
              <Input
                name="email"
                type="email"
                placeholder="Email Address"
                value={data.email}
                onChange={handleChange}
                required
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-blue-100/50 focus:border-blue-400 focus:bg-white/15 transition-all duration-300"
              />
            </div>
            
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-300/60 group-focus-within:text-blue-300 transition-colors" />
              <Input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={data.password}
                onChange={handleChange}
                required
                className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-blue-100/50 focus:border-blue-400 focus:bg-white/15 transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300/60 hover:text-blue-300 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            {!isLogin && (
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-300/60 group-focus-within:text-blue-300 transition-colors" />
                <Input
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  value={data.confirmPassword}
                  onChange={handleChange}
                  required
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-blue-100/50 focus:border-blue-400 focus:bg-white/15 transition-all duration-300"
                />
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 font-semibold text-lg rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 border-0 relative overflow-hidden group"
              disabled={loading}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <span className="relative z-10">
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Please wait...
                  </div>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </span>
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-blue-100/60">or</span>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="mt-6 text-blue-300 hover:text-white font-medium transition-all duration-300 hover:scale-105 relative group"
            >
              <span className="relative z-10">
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </span>
              <div className="absolute inset-0 bg-white/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 opacity-0 group-hover:opacity-100"></div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
