import React from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { 
  TrendingUp, 
  Package, 
  Users, 
  ShoppingCart, 
  AlertTriangle, 
  DollarSign,
  Hammer,
  Clock
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { dashboardMetrics, materials, workers, sales, productions, furniture } = useData();
  const { t } = useLanguage();
  const { notifyLowStock } = useNotifications();

  // Check for low stock and notify
  React.useEffect(() => {
    materials.forEach(material => {
      if (material.quantity <= material.lowStockThreshold) {
        notifyLowStock(material.name, material.quantity, material.lowStockThreshold);
      }
    });
  }, [materials, notifyLowStock]);

  const statsCards = [
    {
      title: t('totalSales'),
      value: `₹${dashboardMetrics.totalSales.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+12.5%',
      changeType: 'positive'
    },
    {
      title: t('totalProfit'),
      value: `₹${dashboardMetrics.totalProfit.toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-blue-500',
      change: '+8.2%',
      changeType: 'positive'
    },
    {
      title: t('materialValue'),
      value: `₹${dashboardMetrics.totalMaterialValue.toLocaleString()}`,
      icon: Package,
      color: 'bg-purple-500',
      change: '-2.1%',
      changeType: 'negative'
    },
    {
      title: t('activeWorkers'),
      value: dashboardMetrics.activeWorkers,
      icon: Users,
      color: 'bg-orange-500',
      change: '+1',
      changeType: 'positive'
    },
    {
      title: t('lowStockItems'),
      value: dashboardMetrics.lowStockItems,
      icon: AlertTriangle,
      color: 'bg-red-500',
      change: '+3',
      changeType: 'negative'
    },
    {
      title: t('pendingPayments'),
      value: dashboardMetrics.pendingPayments,
      icon: Clock,
      color: 'bg-yellow-500',
      change: '-2',
      changeType: 'positive'
    },
    {
      title: t('thisMonthProduction'),
      value: dashboardMetrics.thisMonthProduction,
      icon: Hammer,
      color: 'bg-indigo-500',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: t('totalOrders'),
      value: sales.length,
      icon: ShoppingCart,
      color: 'bg-emerald-500',
      change: '+5',
      changeType: 'positive'
    }
  ];

  // Prepare chart data
  const salesData = sales.slice(-6).map((sale, index) => ({
    name: `Sale ${index + 1}`,
    sales: sale.totalAmount,
    profit: sale.profit,
    date: new Date(sale.saleDate).toLocaleDateString()
  }));

  const productionData = productions.slice(-6).map((prod, index) => ({
    name: `Prod ${index + 1}`,
    quantity: prod.quantity,
    cost: prod.totalCost,
    date: new Date(prod.productionDate).toLocaleDateString()
  }));

  const materialStockData = materials.slice(0, 5).map(material => ({
    name: material.name.substring(0, 10),
    stock: material.quantity,
    threshold: material.lowStockThreshold,
    value: material.totalValue
  }));

  // Calculate actual category distribution from furniture data
  const categoryDistribution = furniture.reduce((acc, item) => {
    const category = item.category;
    const existing = acc.find(cat => cat.name === category);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({
        name: category.charAt(0).toUpperCase() + category.slice(1),
        value: 1,
        color: `hsl(${acc.length * 72}, 70%, 50%)`
      });
    }
    return acc;
  }, []);

  const recentSales = sales.slice(-5).reverse();
  const recentProductions = productions.slice(-5).reverse();
  const lowStockMaterials = materials.filter(m => m.quantity <= m.lowStockThreshold).slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('dashboard')}</h1>
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
                  </div>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sales Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
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

        {/* Production Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Production Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantity" fill="#8884d8" />
              <Bar dataKey="cost" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Material Stock Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Material Stock Levels</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={materialStockData}>
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

        {/* Category Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Furniture Categories</h3>
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

      {/* Recent Activity and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Sales</h3>
          <div className="space-y-3">
            {recentSales.length > 0 ? (
              recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{sale.customerName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ₹{sale.totalAmount.toLocaleString()} • {sale.paymentStatus}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(sale.saleDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-green-600">+₹{sale.profit.toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No sales recorded yet</p>
            )}
          </div>
        </div>

        {/* Recent Production */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Production</h3>
          <div className="space-y-3">
            {recentProductions.length > 0 ? (
              recentProductions.map((production) => (
                <div key={production.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Production #{production.id.slice(-6)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Qty: {production.quantity} • {production.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(production.productionDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-blue-600">₹{production.totalCost.toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No production recorded yet</p>
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            Low Stock Alert
          </h3>
          <div className="space-y-3">
            {lowStockMaterials.length > 0 ? (
              lowStockMaterials.map((material) => (
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
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">All materials are well stocked</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;