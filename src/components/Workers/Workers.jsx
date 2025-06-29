import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Plus, Search, Users, Edit2, Trash2, User, DollarSign, Download } from 'lucide-react';
import { exportToExcel, exportToCSV, exportToPDF, exportWorkersReport } from '../../utils/exportUtils';
import AddWorkerModal from './AddWorkerModal';

const Workers = () => {
  const { workers, deleteWorker, updateWorker } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [selectedRole, setSelectedRole] = useState('all');

  const roles = ['all', 'carpenter', 'helper', 'painter', 'polisher', 'other'];

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.phone.includes(searchTerm) ||
                         worker.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || worker.role.toLowerCase() === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleEdit = (worker) => {
    setEditingWorker(worker);
    setShowAddModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this worker?')) {
      deleteWorker(id);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingWorker(null);
  };

  const toggleWorkerStatus = (worker) => {
    updateWorker(worker.id, { isActive: !worker.isActive });
  };

  const handleExport = (format) => {
    const workersData = exportWorkersReport(filteredWorkers);
    const filename = `workers_report_${new Date().toISOString().split('T')[0]}`;
    
    switch (format) {
      case 'excel':
        exportToExcel(workersData, filename, 'Workers');
        break;
      case 'csv':
        exportToCSV(workersData, filename);
        break;
      case 'pdf':
        const columns = ['Worker Name', 'Phone', 'Role', 'Daily Wage', 'Status', 'Join Date'];
        exportToPDF(workersData, filename, 'Workers Report', columns);
        break;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Workers</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Worker</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search workers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {roles.map(role => (
              <option key={role} value={role}>
                {role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
          <div className="relative">
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

      {/* Workers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkers.map((worker) => (
          <div key={worker.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  {worker.photo ? (
                    <img
                      src={worker.photo}
                      alt={worker.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{worker.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">{worker.role}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(worker)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(worker.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Phone</span>
                <span className="font-medium text-gray-900">{worker.phone}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Daily Wage</span>
                <span className="font-medium text-gray-900">
                  ₹{worker.dailyWage.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Join Date</span>
                <span className="text-sm text-gray-900">
                  {new Date(worker.joinDate).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  worker.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {worker.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {worker.address && (
                <div className="flex items-start justify-between">
                  <span className="text-sm text-gray-600">Address</span>
                  <span className="text-sm text-gray-900 text-right max-w-32">
                    {worker.address}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Earnings</span>
                <span className="font-semibold text-green-600">
                  ₹{worker.totalEarnings?.toLocaleString() || '0'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Udhar Balance</span>
                <span className={`font-semibold ${
                  (worker.udharBalance || 0) > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  ₹{worker.udharBalance?.toLocaleString() || '0'}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => toggleWorkerStatus(worker)}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                  worker.isActive
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                }`}
              >
                {worker.isActive ? 'Mark Inactive' : 'Mark Active'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredWorkers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No workers found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Try adjusting your search criteria' : 'Start by adding your first worker'}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Worker
          </button>
        </div>
      )}

      {showAddModal && (
        <AddWorkerModal
          worker={editingWorker}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Workers;