import React, { useState, useMemo } from 'react';
import transactions from '../data/transactions.json';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Search, ArrowUpDown, ChevronLeft, ChevronRight, Calendar, DollarSign, TrendingUp, TrendingDown, Eye, X, Sparkles,
  Filter, Download, RefreshCw, BarChart3, PieChart, Activity, ArrowUp, ArrowDown, Users, CreditCard
} from 'lucide-react';

type Txn = {
  id: number;
  date: string;
  amount: number;
  category: string;
  status: string;
  user_id: string;
};

export default function TransactionTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Txn>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const itemsPerPage = 10;

  const txns: Txn[] = transactions;

  const uniqueCategories = useMemo(
    () => Array.from(new Set(txns.map(t => t.category))).sort(),
    [txns]
  );

  const filtered = useMemo(() => {
    let result = txns.filter(t => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        t.id.toString().includes(term) ||
        t.category.toLowerCase().includes(term) ||
        t.user_id.toLowerCase().includes(term);
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
      const dt = new Date(t.date);
      const matchesDate =
        (!startDate || dt >= new Date(startDate)) &&
        (!endDate || dt <= new Date(endDate));
      const absAmt = Math.abs(t.amount);
      const matchesAmount =
        (!minAmount || absAmt >= Number(minAmount)) &&
        (!maxAmount || absAmt <= Number(maxAmount));
      return matchesSearch && matchesStatus && matchesCategory && matchesDate && matchesAmount;
    });

    // Sort the filtered results
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === 'date') {
        aVal = new Date(a.date).getTime();
        bVal = new Date(b.date).getTime();
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [txns, searchTerm, statusFilter, categoryFilter, startDate, endDate, minAmount, maxAmount, sortField, sortDirection]);

  const summary = useMemo(() => {
    const income = filtered.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const expenses = filtered.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const uniqueUsers = new Set(filtered.map(t => t.user_id)).size;
    const avgTransaction = filtered.length > 0 ? (income + expenses) / filtered.length : 0;
    return { 
      income, 
      expenses, 
      net: income - expenses, 
      count: filtered.length,
      uniqueUsers,
      avgTransaction
    };
  }, [filtered]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const pageData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const clearAll = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
    setCurrentPage(1);
  };

  const handleSort = (field: keyof Txn) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const badgeClass = (status: string) =>
    status === 'Paid'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200'
      : 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200';

  const formatAmt = (amt: number) => (
    <div className={`flex items-center gap-2 font-semibold ${amt < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
      <div className={`p-1 rounded-full ${amt < 0 ? 'bg-rose-100' : 'bg-emerald-100'}`}>
        {amt < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
      </div>
      <span>{amt < 0 ? '-' : '+'}${Math.abs(amt).toLocaleString()}</span>
    </div>
  );

  const SortIcon = ({ field }: { field: keyof Txn }) => (
    <button 
      onClick={() => handleSort(field)}
      className="ml-2 p-1 hover:bg-slate-100 rounded transition-colors"
    >
      {sortField === field ? (
        sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
      ) : (
        <ArrowUpDown className="h-4 w-4 text-slate-400" />
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/40 p-4">
      {/* Enhanced Header */}
      <div className="text-center space-y-6 mb-8">
        <div className="flex justify-center items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Transaction Analytics
            </h1>
            <p className="text-slate-600 text-lg font-medium">Advanced financial insights and transaction management</p>
          </div>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-200 hover:-translate-y-1 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Income</p>
                <p className="text-2xl font-bold text-emerald-600">${summary.income.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">From {filtered.filter(t => t.amount > 0).length} transactions</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 hover:shadow-lg hover:shadow-rose-100/50 transition-all duration-200 hover:-translate-y-1 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Expenses</p>
                <p className="text-2xl font-bold text-rose-600">${summary.expenses.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">From {filtered.filter(t => t.amount < 0).length} transactions</p>
              </div>
              <div className="p-3 bg-rose-100 rounded-xl group-hover:scale-110 transition-transform">
                <TrendingDown className="h-6 w-6 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-200 hover:-translate-y-1 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Net Amount</p>
                <p className={`text-2xl font-bold ${summary.net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  ${summary.net.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-1">Current balance</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl group-hover:scale-110 transition-transform">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-200 hover:-translate-y-1 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Active Users</p>
                <p className="text-2xl font-bold text-purple-600">{summary.uniqueUsers}</p>
                <p className="text-xs text-slate-500 mt-1">Unique participants</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Main Card */}
      <Card className="bg-white/90 backdrop-blur-md shadow-xl border-slate-200/60">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-slate-800">Transaction History</CardTitle>
                <CardDescription className="text-slate-600 font-medium">
                  {summary.count} transactions • Average: ${summary.avgTransaction.toFixed(0)}
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
                Live Data
              </Badge>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Enhanced Filter Section */}
          <div className="bg-slate-50/50 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Search
              </h3>
              <Button variant="outline" size="sm" onClick={clearAll} className="gap-2 text-slate-600">
                <X className="h-4 w-4" />
                Clear All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-white border-slate-200">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Paid">✅ Paid</SelectItem>
                  <SelectItem value="Pending">⏳ Pending</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="bg-white border-slate-200">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>📁 {cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                <Calendar className="h-5 w-5 text-slate-500" />
                <span className="text-sm font-medium text-slate-600">Date Range:</span>
                <Input 
                  type="date" 
                  value={startDate} 
                  onChange={e => setStartDate(e.target.value)}
                  className="border-none bg-transparent text-sm"
                />
                <span className="text-slate-400">to</span>
                <Input 
                  type="date" 
                  value={endDate} 
                  onChange={e => setEndDate(e.target.value)}
                  className="border-none bg-transparent text-sm"
                />
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                <DollarSign className="h-5 w-5 text-slate-500" />
                <span className="text-sm font-medium text-slate-600">Amount Range:</span>
                <Input 
                  type="number" 
                  placeholder="Min" 
                  value={minAmount} 
                  onChange={e => setMinAmount(e.target.value)}
                  className="border-none bg-transparent text-sm"
                />
                <span className="text-slate-400">to</span>
                <Input 
                  type="number" 
                  placeholder="Max" 
                  value={maxAmount} 
                  onChange={e => setMaxAmount(e.target.value)}
                  className="border-none bg-transparent text-sm"
                />
              </div>
            </div>
          </div>

          {/* Enhanced Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-blue-50/30 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <div className="flex items-center font-semibold text-slate-700">
                        ID
                        <SortIcon field="id" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <div className="flex items-center font-semibold text-slate-700">
                        Date
                        <SortIcon field="date" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <div className="flex items-center font-semibold text-slate-700">
                        Category
                        <SortIcon field="category" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <div className="flex items-center font-semibold text-slate-700">
                        Amount
                        <SortIcon field="amount" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <div className="flex items-center font-semibold text-slate-700">
                        Status
                        <SortIcon field="status" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <div className="flex items-center font-semibold text-slate-700">
                        User ID
                        <SortIcon field="user_id" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pageData.map((t, index) => (
                    <tr key={t.id} className={`hover:bg-blue-50/30 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                            <CreditCard className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="font-medium text-slate-700">#{t.id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-700 font-medium">
                          {new Date(t.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: '2-digit', 
                            year: 'numeric' 
                          })}
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(t.date).toLocaleDateString('en-US', { weekday: 'long' })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700">
                          {t.category}
                        </div>
                      </td>
                      <td className="px-6 py-4">{formatAmt(t.amount)}</td>
                      <td className="px-6 py-4">
                        <Badge className={`${badgeClass(t.status)} font-medium`}>
                          {t.status === 'Paid' ? '✅' : '⏳'} {t.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">
                          {t.user_id}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Enhanced Pagination */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <p className="text-sm text-slate-600 font-medium">
                Showing <span className="font-bold text-slate-800">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                <span className="font-bold text-slate-800">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of{' '}
                <span className="font-bold text-slate-800">{filtered.length}</span> transactions
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
                disabled={currentPage === 1}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-10 h-10"
                    >
                      {page}
                    </Button>
                  );
                })}
                {totalPages > 5 && <span className="px-2 text-slate-400">...</span>}
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
                disabled={currentPage === totalPages}
                className="gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}