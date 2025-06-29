import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import {
  LogOut,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Bell,
  Settings,
  ChevronDown,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Calendar,
  Filter
} from 'lucide-react';
import FinancialCharts from './FinancialCharts';
import TransactionTable from './TransactionTable';
import CSVExportModal from './CSVExportModal';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import transactions from '../data/transactions.json';

interface UserResponse {
  user: {
    firstName: string;
    lastName: string;
  };
}

type Txn = {
  id: number;
  date: string;
  amount: number;
  category: string;
  status: string;
  user_id: string;
};

export default function Dashboard() {
  const [showExportModal, setShowExportModal] = useState(false);
  const { toast } = useToast();
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery<UserResponse, Error>({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await fetch('/api/protected', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json();
    }
  });

  const user = data?.user;

  // derive stats from transactions.json
  const stats = useMemo(() => {
    const txns: Txn[] = transactions;
    const totalRevenue = txns.filter(t => t.amount >= 0)
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = txns.filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const netProfit = totalRevenue - totalExpenses;
    const activeClients = new Set(txns.map(t => t.user_id)).size;

    // Calculate percentage changes (mock data for demo)
    const revenueChange = 12.5;
    const expenseChange = -8.2;
    const profitChange = 18.3;
    const clientChange = 5.7;

    return [
      {
        title: 'Total Revenue',
        value: `$${totalRevenue.toLocaleString()}`,
        change: revenueChange,
        icon: DollarSign,
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-950/20',
        iconBg: 'bg-emerald-500/20'
      },
      {
        title: 'Total Expenses',
        value: `$${totalExpenses.toLocaleString()}`,
        change: expenseChange,
        icon: TrendingDown,
        color: 'text-rose-400',
        bgColor: 'bg-rose-950/20',
        iconBg: 'bg-rose-500/20'
      },
      {
        title: 'Net Profit',
        value: `$${netProfit.toLocaleString()}`,
        change: profitChange,
        icon: netProfit >= 0 ? TrendingUp : TrendingDown,
        color: netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400',
        bgColor: netProfit >= 0 ? 'bg-emerald-950/20' : 'bg-rose-950/20',
        iconBg: netProfit >= 0 ? 'bg-emerald-500/20' : 'bg-rose-500/20'
      },
      {
        title: 'Active Clients',
        value: `${activeClients}`,
        change: clientChange,
        icon: Users,
        color: 'text-blue-400',
        bgColor: 'bg-blue-950/20',
        iconBg: 'bg-blue-500/20'
      }
    ];
  }, []);

  const handleExport = (config: unknown) => {
    console.log('Exporting with config:', config);
    toast({
      title: 'Export Started',
      description: 'Your CSV file is being generated and will download shortly.'
    });
    setShowExportModal(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="w-96 border-rose-500/30 bg-slate-800/90 backdrop-blur-xl">
          <CardContent className="p-6 text-center">
            <div className="text-rose-400 mb-4">
              <Activity className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Connection Error</h3>
            <p className="text-slate-300">Unable to load user data. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Enhanced Header */}
      <header className="bg-slate-800/90 backdrop-blur-md border-b border-slate-700/60 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                FinanceBoard
              </h1>
              <p className="text-sm text-slate-400 font-medium">Financial Analytics Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3 bg-slate-700/50 rounded-lg px-4 py-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-100">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-400">Administrator</p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>
            
           
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportModal(true)}
              className="flex items-center space-x-2 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 bg-emerald-950/20"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2 text-rose-400 border-rose-500/30 hover:bg-rose-500/10 bg-rose-950/20"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-3xl font-bold text-slate-100">
              Welcome back, {user?.firstName}! 👋
            </h2>
            <p className="text-slate-300 mt-1">Here's what's happening with your finances today.</p>
          </div>
          <div className="flex items-center space-x-3">
            
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            const isPositive = stat.change >= 0;
            const ChangeIcon = isPositive ? ArrowUpRight : ArrowDownRight;
            
            return (
              <Card
                key={idx}
                className="bg-slate-800/50 backdrop-blur-sm border-slate-700/60 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-200 hover:-translate-y-1 group"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-300">{stat.title}</p>
                        <div className={`p-2 rounded-lg ${stat.iconBg} group-hover:scale-110 transition-transform`}>
                          <Icon className={`h-5 w-5 ${stat.color}`} />
                        </div>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-100 mb-1">{stat.value}</p>
                        <div className="flex items-center space-x-1">
                          <ChangeIcon className={`h-4 w-4 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`} />
                          <span className={`text-sm font-medium ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {Math.abs(stat.change)}%
                          </span>
                          <span className="text-xs text-slate-400">vs last month</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Enhanced Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 p-4 bg-gradient-to-br from-slate-800/80 to-purple-800/40 backdrop-blur-lg rounded-xl border border-slate-700/30 shadow-xl">
  <TabsList className="bg-slate-800/90 backdrop-blur-md border border-slate-700/50 shadow-lg rounded-xl overflow-hidden flex w-full sm:w-auto hover:shadow-xl transition-all duration-300">
    <TabsTrigger
      value="dashboard"
      className="flex-1 sm:flex-initial relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:via-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-700/50 transition-all duration-200 py-3 px-4 group flex items-center justify-center text-slate-300"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-200 rounded-lg"></div>
      <Activity className="h-4 w-4 mr-2 relative z-10 group-hover:scale-110 transition-transform duration-200" />
      <span className="relative z-10 font-medium">Dashboard</span>
    </TabsTrigger>
    <TabsTrigger
      value="transactions"
      className="flex-1 sm:flex-initial relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:via-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-700/50 transition-all duration-200 py-3 px-4 group flex items-center justify-center text-slate-300"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-200 rounded-lg"></div>
      <DollarSign className="h-4 w-4 mr-2 relative z-10 group-hover:scale-110 transition-transform duration-200" />
      <span className="relative z-10 font-medium">Transactions</span>
    </TabsTrigger>
    <TabsTrigger
      value="analytics"
      className="flex-1 sm:flex-initial relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:via-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-700/50 transition-all duration-200 py-3 px-4 group flex items-center justify-center text-slate-300"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-200 rounded-lg"></div>
      <TrendingUp className="h-4 w-4 mr-2 relative z-10 group-hover:scale-110 transition-transform duration-200" />
      <span className="relative z-10 font-medium">Analytics</span>
    </TabsTrigger>
  </TabsList>
</div>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/60 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-slate-100 flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-blue-400" />
                        <span>Financial Overview</span>
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        Revenue and expense trends over time
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-blue-950/30 text-blue-400 border-blue-500/30">
                      Real-time
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <FinancialCharts />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/60 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-slate-100 flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-emerald-400" />
                      <span>Transaction History</span>
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Complete record of all financial transactions
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-slate-700/50 text-slate-300">
                      {transactions.length} transactions
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <TransactionTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/60 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-slate-100 flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-purple-400" />
                      <span>Advanced Analytics</span>
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Detailed financial insights and predictive trends
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-purple-950/30 text-purple-400 border-purple-500/30">
                    AI Powered
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <FinancialCharts />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <CSVExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
      />
    </div>
  );
}