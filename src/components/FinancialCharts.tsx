import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import transactions from '@/data/transactions.json';

const FinancialCharts = () => {
  const data = transactions.map(t => ({
    ...t,
    date: new Date(t.date)
  }));

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const revenueData = monthNames.map((m, i) => {
    const monthTrans = data.filter(t => t.date.getMonth() === i);
    const revenue = monthTrans
      .filter(t => t.category === 'Revenue')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthTrans
      .filter(t => t.category === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return { month: m, revenue, expenses, profit: revenue - expenses };
  });

  const categoryTotals = data.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  const categoryData = Object.entries(categoryTotals).map(([name, value], i) => ({
    name,
    value,
    color: ['#3B82F6', '#10B981'][i % 2]
  }));

  const cashFlowData = [1, 2, 3, 4].map(week => {
    const weekTrans = data.filter(t => Math.ceil(t.date.getDate() / 7) === week);
    const inflow = weekTrans
      .filter(t => t.category === 'Revenue')
      .reduce((sum, t) => sum + t.amount, 0);
    const outflow = weekTrans
      .filter(t => t.category === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return { week: `Week ${week}`, inflow, outflow };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Trend */}
      <Card className="lg:col-span-2 bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-800">Revenue & Expenses Trend</CardTitle>
          <CardDescription className="text-slate-600">
            Monthly financial performance over the past year
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3B82F6" 
                fillOpacity={1} 
                fill="url(#colorRevenue)"
                name="Revenue"
              />
              <Area 
                type="monotone" 
                dataKey="expenses" 
                stroke="#EF4444" 
                fillOpacity={1} 
                fill="url(#colorExpenses)"
                name="Expenses"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Profit Chart */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-800">Monthly Profit</CardTitle>
          <CardDescription className="text-slate-600">
            Net profit trends throughout the year
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                }}
              />
              <Bar dataKey="profit" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Expense Categories */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-800">Expense Categories</CardTitle>
          <CardDescription className="text-slate-600">
            Breakdown of expenses by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cash Flow */}
      <Card className="lg:col-span-2 bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-800">Weekly Cash Flow</CardTitle>
          <CardDescription className="text-slate-600">
            Money coming in vs going out on a weekly basis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cashFlowData} barGap={10}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="week" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="inflow" fill="#10B981" radius={[4, 4, 0, 0]} name="Cash Inflow" />
              <Bar dataKey="outflow" fill="#EF4444" radius={[4, 4, 0, 0]} name="Cash Outflow" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialCharts;
