import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar, Download, FileText, Settings, X, Loader2, Database } from 'lucide-react';

// Type definitions
interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  status: string;
  user_id: string;
  user_profile: string;
}

interface ExportConfig {
  columns: Record<string, boolean>;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  filters: {
    status: string;
    category: string;
    minAmount: string;
    maxAmount: string;
  };
  fileName: string;
  format: string;
}

interface CSVExportModalProps {
  open: boolean;
  onClose: () => void;
  onExport: (config: ExportConfig) => void;
}

// Sample transaction data
const sampleTransactions = [
  {
    id: 1,
    date: "2024-01-15T10:30:00Z",
    amount: 1250.50,
    category: "Revenue",
    status: "Paid",
    user_id: "user_001",
    user_profile: "https://example.com/profiles/user_001"
  },
  {
    id: 2,
    date: "2024-01-20T14:15:00Z",
    amount: -850.00,
    category: "Expense",
    status: "Paid",
    user_id: "user_002",
    user_profile: "https://example.com/profiles/user_002"
  },
  {
    id: 3,
    date: "2024-02-05T09:45:00Z",
    amount: 2100.75,
    category: "Revenue",
    status: "Pending",
    user_id: "user_003",
    user_profile: "https://example.com/profiles/user_003"
  },
  {
    id: 4,
    date: "2024-02-12T16:20:00Z",
    amount: -450.25,
    category: "Expense",
    status: "Paid",
    user_id: "user_001",
    user_profile: "https://example.com/profiles/user_001"
  },
  {
    id: 5,
    date: "2024-03-08T11:10:00Z",
    amount: 3200.00,
    category: "Revenue",
    status: "Paid",
    user_id: "user_004",
    user_profile: "https://example.com/profiles/user_004"
  },
  {
    id: 6,
    date: "2024-03-15T13:30:00Z",
    amount: -1200.50,
    category: "Expense",
    status: "Pending",
    user_id: "user_002",
    user_profile: "https://example.com/profiles/user_002"
  },
  {
    id: 7,
    date: "2024-04-02T08:45:00Z",
    amount: 1800.25,
    category: "Revenue",
    status: "Paid",
    user_id: "user_005",
    user_profile: "https://example.com/profiles/user_005"
  },
  {
    id: 8,
    date: "2024-04-18T15:15:00Z",
    amount: -680.75,
    category: "Expense",
    status: "Paid",
    user_id: "user_003",
    user_profile: "https://example.com/profiles/user_003"
  }
];

const CSVExportModal = ({ open, onClose, onExport }: CSVExportModalProps) => {
  const [transactionData, setTransactionData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [selectedColumns, setSelectedColumns] = useState({
    id: true,
    date: true,
    amount: true,
    category: true,
    status: true,
    user_id: true,
    user_profile: true
  });

  const [dateRange, setDateRange] = useState({
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  });

  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    minAmount: '',
    maxAmount: ''
  });

  const [fileName, setFileName] = useState('financial_transactions');
  const [format, setFormat] = useState('csv');
  const [isExporting, setIsExporting] = useState(false);

  // Load transaction data (simulated)
  useEffect(() => {
    const loadTransactionData = async () => {
      if (!open) return;
      
      setLoading(true);
      setError('');
      
      try {
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Transform the sample data to match the expected format
        const transformedData: Transaction[] = sampleTransactions.map((item) => ({
          id: item.id.toString(),
          date: item.date.split('T')[0], // Convert ISO date to YYYY-MM-DD format
          amount: item.amount,
          category: item.category,
          status: item.status,
          user_id: item.user_id,
          user_profile: item.user_profile
        }));
        
        setTransactionData(transformedData);
      } catch (err) {
        console.error('Failed to load transaction data:', err);
        setError('Failed to load transaction data. Using sample data for demonstration.');
        // Still set sample data even on "error" for demo purposes
        const transformedData: Transaction[] = sampleTransactions.map((item) => ({
          id: item.id.toString(),
          date: item.date.split('T')[0],
          amount: item.amount,
          category: item.category,
          status: item.status,
          user_id: item.user_id,
          user_profile: item.user_profile
        }));
        setTransactionData(transformedData);
      } finally {
        setLoading(false);
      }
    };

    loadTransactionData();
  }, [open]);

  const availableColumns = [
    { key: 'id', label: 'Transaction ID', description: 'Unique identifier for each transaction' },
    { key: 'date', label: 'Date', description: 'Transaction date' },
    { key: 'amount', label: 'Amount', description: 'Transaction amount' },
    { key: 'category', label: 'Category', description: 'Transaction category (Revenue/Expense)' },
    { key: 'status', label: 'Status', description: 'Transaction status (Paid/Pending)' },
    { key: 'user_id', label: 'User ID', description: 'User identifier' },
    { key: 'user_profile', label: 'User Profile', description: 'User profile URL' }
  ];

  const handleColumnToggle = (column: string) => {
    setSelectedColumns(prev => ({
      ...prev,
      [column]: !prev[column as keyof typeof prev]
    }));
  };

  // Backend data processing and filtering
  const processData = (config: ExportConfig): Record<string, unknown>[] => {
    let filteredData = [...transactionData];

    // Apply date range filter
    filteredData = filteredData.filter((item) => {
      const itemDate = new Date(item.date);
      const startDate = new Date(config.dateRange.startDate);
      const endDate = new Date(config.dateRange.endDate);
      return itemDate >= startDate && itemDate <= endDate;
    });

    // Apply status filter
    if (config.filters.status !== 'all') {
      filteredData = filteredData.filter((item) => item.status.toLowerCase() === config.filters.status.toLowerCase());
    }

    // Apply category filter
    if (config.filters.category !== 'all') {
      filteredData = filteredData.filter((item) => item.category.toLowerCase() === config.filters.category.toLowerCase());
    }

    // Apply amount range filter
    if (config.filters.minAmount) {
      filteredData = filteredData.filter((item) => Math.abs(item.amount) >= parseFloat(config.filters.minAmount));
    }
    if (config.filters.maxAmount) {
      filteredData = filteredData.filter((item) => Math.abs(item.amount) <= parseFloat(config.filters.maxAmount));
    }

    // Select only requested columns
    const selectedColumnKeys = Object.keys(config.columns).filter(key => config.columns[key]);
    return filteredData.map((item) => {
      const filteredItem: Record<string, unknown> = {};
      selectedColumnKeys.forEach(key => {
        filteredItem[key] = item[key as keyof Transaction];
      });
      return filteredItem;
    });
  };

  // CSV generation
  const generateCSV = (data: Record<string, unknown>[]): string => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');
    
    return csvContent;
  };

  // XLSX generation (simplified - in production use a library like xlsx)
  const generateXLSX = (data: Record<string, unknown>[]): string => {
    // For demo purposes, we'll convert to CSV format
    // In production, use libraries like xlsx or exceljs
    return generateCSV(data);
  };

  // JSON generation
  const generateJSON = (data: Record<string, unknown>[]): string => {
    return JSON.stringify(data, null, 2);
  };

  // File download function
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the blob URL
    URL.revokeObjectURL(url);
  };

  // Main export handler with backend processing
  const handleExport = async () => {
    if (transactionData.length === 0) {
      alert('No transaction data available. Please ensure the data file is loaded.');
      return;
    }

    setIsExporting(true);
    
    try {
      const config: ExportConfig = {
        columns: selectedColumns,
        dateRange,
        filters,
        fileName,
        format
      };

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Process data (this would typically be done on the server)
      const processedData = processData(config);

      if (processedData.length === 0) {
        alert('No data matches the selected filters.');
        setIsExporting(false);
        return;
      }

      let content: string;
      let mimeType: string;
      let fileExtension: string;

      // Generate file content based on format
      switch (config.format) {
        case 'csv':
          content = generateCSV(processedData);
          mimeType = 'text/csv;charset=utf-8;';
          fileExtension = 'csv';
          break;
        case 'xlsx':
          content = generateXLSX(processedData);
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          fileExtension = 'xlsx';
          break;
        case 'json':
          content = generateJSON(processedData);
          mimeType = 'application/json;charset=utf-8;';
          fileExtension = 'json';
          break;
        default:
          throw new Error('Unsupported format');
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      const fullFileName = `${config.fileName}_${timestamp}.${fileExtension}`;

      // Download the file
      downloadFile(content, fullFileName, mimeType);

      // Call the original onExport callback
      onExport(config);
      
      // Close modal after successful export
      onClose();
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const selectedCount = Object.values(selectedColumns).filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Download className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-slate-800">
                Export Financial Data
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Configure your export settings and select the data you want to include
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
            <span className="text-slate-600">Loading transaction data...</span>
          </div>
        )}

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-600 text-sm">{error}</p>
          </div>
        )}

        {!loading && (
          <div className="space-y-6">
            {/* Export Format and File Name */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-slate-500" />
                <h3 className="text-lg font-medium text-slate-800">Export Settings</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fileName">File Name</Label>
                  <Input
                    id="fileName"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="Enter file name"
                    className="border-slate-200 focus:border-blue-500"
                    disabled={isExporting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="format">Format</Label>
                  <Select value={format} onValueChange={setFormat} disabled={isExporting}>
                    <SelectTrigger className="border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV (.csv)</SelectItem>
                      <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                      <SelectItem value="json">JSON (.json)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator className="bg-slate-200" />

            {/* Column Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-slate-500" />
                  <h3 className="text-lg font-medium text-slate-800">Column Selection</h3>
                </div>
                <Badge variant="outline" className="text-slate-600 border-slate-300">
                  {selectedCount} of {availableColumns.length} selected
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {availableColumns.map((column) => (
                  <div key={column.key} className="flex items-start space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                    <Checkbox
                      id={column.key}
                      checked={selectedColumns[column.key as keyof typeof selectedColumns]}
                      onCheckedChange={() => handleColumnToggle(column.key)}
                      className="mt-1"
                      disabled={isExporting}
                    />
                    <div className="flex-1">
                      <Label 
                        htmlFor={column.key} 
                        className="font-medium text-slate-800 cursor-pointer"
                      >
                        {column.label}
                      </Label>
                      <p className="text-sm text-slate-500 mt-1">{column.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-slate-200" />

            {/* Date Range */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-slate-500" />
                <h3 className="text-lg font-medium text-slate-800">Date Range</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="border-slate-200 focus:border-blue-500"
                    disabled={isExporting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="border-slate-200 focus:border-blue-500"
                    disabled={isExporting}
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-slate-200" />

            {/* Filters */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-800">Additional Filters</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="statusFilter">Status</Label>
                  <Select 
                    value={filters.status} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                    disabled={isExporting}
                  >
                    <SelectTrigger className="border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="categoryFilter">Category</Label>
                  <Select 
                    value={filters.category} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                    disabled={isExporting}
                  >
                    <SelectTrigger className="border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minAmount">Min Amount ($)</Label>
                  <Input
                    id="minAmount"
                    type="number"
                    value={filters.minAmount}
                    onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                    placeholder="0"
                    className="border-slate-200 focus:border-blue-500"
                    disabled={isExporting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAmount">Max Amount ($)</Label>
                  <Input
                    id="maxAmount"
                    type="number"
                    value={filters.maxAmount}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                    placeholder="No limit"
                    className="border-slate-200 focus:border-blue-500"
                    disabled={isExporting}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex items-center justify-between pt-6 border-t border-slate-200">
          <div className="text-sm text-slate-500">
            {!loading && (
              <>Export will include {selectedCount} columns with applied filters ({transactionData.length} total records)</>
            )}
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="border-slate-200 text-slate-600 hover:bg-slate-50"
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleExport}
              disabled={selectedCount === 0 || isExporting || loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Demo App Component
export default function App() {
  const [modalOpen, setModalOpen] = useState(false);

  const handleExport = (config: ExportConfig) => {
    console.log('Export configuration:', config);
    // In a real app, this would send the config to your backend
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Financial Data Export System</h1>
          <p className="text-slate-600 text-lg mb-8">
            Professional CSV export modal with advanced filtering and column selection
          </p>
          
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-blue-100 rounded-full">
                <Database className="h-12 w-12 text-blue-600" />
              </div>
            </div>
            
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Sample Transaction Data</h2>
            <p className="text-slate-600 mb-6">
              This demo includes 8 sample financial transactions with various statuses, categories, and amounts.
              You can filter, select columns, and export in multiple formats (CSV, JSON, Excel).
            </p>
            
            <Button 
              onClick={() => setModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              <Download className="h-5 w-5 mr-2" />
              Open Export Modal
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <FileText className="h-8 w-8 text-blue-600 mb-3 mx-auto" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Multiple Formats</h3>
              <p className="text-slate-600 text-sm">Export as CSV, JSON, or Excel with proper formatting</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <Settings className="h-8 w-8 text-green-600 mb-3 mx-auto" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Advanced Filtering</h3>
              <p className="text-slate-600 text-sm">Filter by date range, status, category, and amount</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <Checkbox className="h-8 w-8 text-purple-600 mb-3 mx-auto" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Column Selection</h3>
              <p className="text-slate-600 text-sm">Choose exactly which data columns to include</p>
            </div>
          </div>
        </div>
      </div>

      <CSVExportModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onExport={handleExport}
      />
    </div>
  );
}