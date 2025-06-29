import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { FileText, Download, Calendar, TrendingUp, DollarSign, Package, Users, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

const Reports = () => {
  const { sales, materials, workers, productions, furniture } = useData();
  const { t } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('overview');

  const periods = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
  ];

  const reportTypes = [
    { value: 'overview', label: 'Business Overview', icon: BarChart3 },
    { value: 'sales', label: 'Sales Report', icon: TrendingUp },
    { value: 'inventory', label: 'Inventory Report', icon: Package },
    { value: 'workers', label: 'Workers Report', icon: Users },
    { value: 'production', label: 'Production Report', icon: FileText },
  ];

  // Calculate metrics based on selected period
  const getFilteredData = (data, dateField) => {
    const now = new Date();
    const startDate = new Date();

    switch (selectedPeriod) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    return data.filter(item => new Date(item[dateField]) >= startDate);
  };

  const filteredSales = getFilteredData(sales, 'saleDate');
  const filteredProductions = getFilteredData(productions, 'productionDate');

  const metrics = {
    totalSales: filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0),
    totalProfit: filteredSales.reduce((sum, sale) => sum + sale.profit, 0),
    totalOrders: filteredSales.length,
    totalProduction: filteredProductions.reduce((sum, prod) => sum + prod.quantity, 0),
    lowStockItems: materials.filter(m => m.quantity <= m.lowStockThreshold).length,
    activeWorkers: workers.filter(w => w.isActive).length,
  };

  // Chart data preparation
  const salesTrendData = filteredSales.slice(-10).map((sale, index) => ({
    name: `Day ${index + 1}`,
    sales: sale.totalAmount,
    profit: sale.profit,
    date: new Date(sale.saleDate).toLocaleDateString()
  }));

  const productionTrendData = filteredProductions.slice(-10).map((prod, index) => ({
    name: `Day ${index + 1}`,
    quantity: prod.quantity,
    cost: prod.totalCost,
    date: new Date(prod.productionDate).toLocaleDateString()
  }));

  const categoryDistribution = [
    { name: 'Bed', value: 30, color: '#8884d8' },
    { name: 'Table', value: 25, color: '#82ca9d' },
    { name: 'Chair', value: 20, color: '#ffc658' },
    { name: 'Cupboard', value: 15, color: '#ff7300' },
    { name: 'Sofa', value: 10, color: '#00ff00' }
  ];

  const workerPerformanceData = workers.slice(0, 5).map(worker => ({
    name: worker.name.substring(0, 10),
    earnings: worker.totalEarnings || 0,
    wage: worker.dailyWage,
    efficiency: Math.floor(Math.random() * 100) + 50 // Mock efficiency data
  }));

  const topSellingFurniture = furniture
    .map(item => {
      const salesCount = filteredSales.reduce((count, sale) => {
        const itemSales = sale.items?.filter(saleItem => saleItem.furnitureId === item.id) || [];
        return count + itemSales.reduce((sum, saleItem) => sum + saleItem.quantity, 0);
      }, 0);
      return { ...item, salesCount };
    })
    .filter(item => item.salesCount > 0)
    .sort((a, b) => b.salesCount - a.salesCount)
    .slice(0, 5);

  const renderOverviewReport = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('totalSales')}</p>
              <p className="text-2xl font-bold text-green-600">₹{metrics.totalSales.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('totalProfit')}</p>
              <p className="text-2xl font-bold text-blue-600">₹{metrics.totalProfit.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('totalOrders')}</p>
              <p className="text-2xl font-bold text-purple-600">{metrics.totalOrders}</p>
            </div>
            <FileText className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sales Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey="profit" stroke="#82ca9d" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Category Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Selling Furniture */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Selling Furniture</h3>
        <div className="space-y-3">
          {topSellingFurniture.map((item, index) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{item.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900 dark:text-white">{item.salesCount} sold</p>
                <p className="text-sm text-green-600">₹{(item.expectedPrice * item.salesCount).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSalesReport = () => (
    <div className="space-y-6">
      {/* Sales Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sales Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="sales" stackId="1" stroke="#8884d8" fill="#8884d8" />
              <Area type="monotone" dataKey="profit" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#8884d8" />
              <Bar dataKey="profit" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sales Summary Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Sales</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Profit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSales.slice(0, 10).map((sale) => (
                <tr key={sale.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {sale.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ₹{sale.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    ₹{sale.profit.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(sale.saleDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderInventoryReport = () => (
    <div className="space-y-6">
      {/* Inventory Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Stock Levels</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={materials.slice(0, 8).map(m => ({ name: m.name.substring(0, 8), stock: m.quantity, threshold: m.lowStockThreshold }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="stock" fill="#8884d8" />
              <Bar dataKey="threshold" fill="#ff7300" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Material Value Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={materials.slice(0, 5).map(m => ({ name: m.name.substring(0, 8), value: m.totalValue }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {materials.slice(0, 5).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${index * 72}, 70%, 50%)`} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Low Stock Alert */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Low Stock Alert</h3>
        <div className="space-y-3">
          {materials
            .filter(m => m.quantity <= m.lowStockThreshold)
            .map((material) => (
              <div key={material.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{material.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{material.subtype}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-red-600">
                    {material.quantity} {material.unit} remaining
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Threshold: {material.lowStockThreshold} {material.unit}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  const renderWorkersReport = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Worker Performance</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={workerPerformanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="earnings" fill="#8884d8" />
            <Bar dataKey="wage" fill="#82ca9d" />
            <Bar dataKey="efficiency" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderProductionReport = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Production Trends</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={productionTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="quantity" stackId="1" stroke="#8884d8" fill="#8884d8" />
            <Area type="monotone" dataKey="cost" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderReport = () => {
    switch (selectedReport) {
      case 'sales':
        return renderSalesReport();
      case 'inventory':
        return renderInventoryReport();
      case 'workers':
        return renderWorkersReport();
      case 'production':
        return renderProductionReport();
      default:
        return renderOverviewReport();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('reports')}</h1>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Download className="w-5 h-5" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Report Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Report Type</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {reportTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => setSelectedReport(type.value)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedReport === type.value
                        ? 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time Period</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              {periods.map(period => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {renderReport()}
    </div>
  );
};

export default Reports;