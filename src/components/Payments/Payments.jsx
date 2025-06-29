import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Plus, Search, Wallet, Calendar, User, DollarSign, ArrowUpRight, ArrowDownRight, Edit2, Download } from 'lucide-react';
import { exportToExcel, exportToCSV, exportToPDF } from '../../utils/exportUtils';
import AddPaymentModal from './AddPaymentModal';

const Payments = () => {
  const { sales, workers, udharTransactions, addUdharTransaction, updateSale } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [editingPayment, setEditingPayment] = useState(null);

  const types = ['all', 'sale', 'worker', 'expense'];

  // Get pending payments from sales
  const pendingSales = sales.filter(sale => sale.paymentStatus !== 'paid');
  
  // Get worker payments (udhar transactions)
  const workerPayments = udharTransactions.filter(transaction => transaction.type === 'worker');

  // Combine all payment-related data
  const allPayments = [
    ...pendingSales.map(sale => ({
      id: sale.id,
      type: 'sale',
      title: `Sale to ${sale.customerName}`,
      amount: sale.totalAmount - sale.paidAmount,
      totalAmount: sale.totalAmount,
      paidAmount: sale.paidAmount,
      date: sale.saleDate,
      status: sale.paymentStatus,
      customerName: sale.customerName,
      customerPhone: sale.customerPhone,
    })),
    ...workerPayments.map(payment => ({
      id: payment.id,
      type: 'worker',
      title: `Payment to ${payment.workerName}`,
      amount: payment.amount,
      date: payment.date,
      status: payment.status || 'pending',
      workerName: payment.workerName,
      description: payment.description,
    }))
  ];

  const filteredPayments = allPayments.filter(payment => {
    const matchesSearch = payment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.workerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || payment.type === selectedType;
    return matchesSearch && matchesType;
  });

  const totalPending = filteredPayments
    .filter(p => p.status === 'pending' || p.status === 'partial')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const totalReceived = sales
    .reduce((sum, sale) => sum + sale.paidAmount, 0);

  const totalPaid = udharTransactions
    .filter(t => t.type === 'worker' && t.status === 'paid')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const updatePaymentStatus = (payment, newStatus, newAmount = null) => {
    if (payment.type === 'sale') {
      const updatedPaidAmount = newAmount !== null ? newAmount : payment.totalAmount;
      updateSale(payment.id, {
        paymentStatus: newStatus,
        paidAmount: updatedPaidAmount
      });
    } else if (payment.type === 'worker') {
      // Update udhar transaction status
      const updatedTransactions = udharTransactions.map(t => 
        t.id === payment.id ? { ...t, status: newStatus } : t
      );
      // This would need to be implemented in DataContext
    }
  };

  const handleExport = (format) => {
    const paymentsData = filteredPayments.map(payment => ({
      'Type': payment.type,
      'Description': payment.title,
      'Amount': payment.amount,
      'Status': payment.status,
      'Date': new Date(payment.date).toLocaleDateString(),
      'Customer/Worker': payment.customerName || payment.workerName || 'N/A',
      'Phone': payment.customerPhone || 'N/A',
    }));

    const filename = `payments_report_${new Date().toISOString().split('T')[0]}`;
    
    switch (format) {
      case 'excel':
        exportToExcel(paymentsData, filename, 'Payments');
        break;
      case 'csv':
        exportToCSV(paymentsData, filename);
        break;
      case 'pdf':
        const columns = ['Type', 'Description', 'Amount', 'Status', 'Date', 'Customer/Worker'];
        exportToPDF(paymentsData, filename, 'Payments Report', columns);
        break;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-red-100 text-red-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'sale':
        return <ArrowUpRight className="w-4 h-4 text-green-600" />;
      case 'worker':
        return <ArrowDownRight className="w-4 h-4 text-red-600" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Payment</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-red-600">₹{totalPending.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <ArrowDownRight className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Received</p>
              <p className="text-2xl font-bold text-green-600">₹{totalReceived.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Paid</p>
              <p className="text-2xl font-bold text-blue-600">₹{totalPaid.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {types.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
          <div className="relative group">
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 hidden group-hover:block">
              <button
                onClick={() => handleExport('excel')}
                className="block w-full text-left px-4 py-2 hover:bg-gray-50"
              >
                Excel
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="block w-full text-left px-4 py-2 hover:bg-gray-50"
              >
                CSV
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="block w-full text-left px-4 py-2 hover:bg-gray-50"
              >
                PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={`${payment.type}-${payment.id}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getTypeIcon(payment.type)}
                      <span className="ml-2 text-sm font-medium text-gray-900 capitalize">
                        {payment.type}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{payment.title}</div>
                    {payment.customerPhone && (
                      <div className="text-sm text-gray-500">{payment.customerPhone}</div>
                    )}
                    {payment.description && (
                      <div className="text-sm text-gray-500">{payment.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ₹{payment.amount.toLocaleString()}
                    </div>
                    {payment.totalAmount && (
                      <div className="text-xs text-gray-500">
                        of ₹{payment.totalAmount.toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={payment.status}
                      onChange={(e) => updatePaymentStatus(payment, e.target.value)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border-0 ${getStatusColor(payment.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="partial">Partial</option>
                      <option value="paid">Paid</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      {new Date(payment.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => setEditingPayment(payment)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredPayments.length === 0 && (
        <div className="text-center py-12">
          <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Try adjusting your search criteria' : 'No payment records available'}
          </p>
        </div>
      )}

      {showAddModal && (
        <AddPaymentModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
};

export default Payments;