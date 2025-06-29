import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Plus, Search, Hammer, Eye, Calendar, User, Edit2, Download } from 'lucide-react';
import { exportToExcel, exportToCSV, exportToPDF, exportProductionReport } from '../../utils/exportUtils';
import AddProductionModal from './AddProductionModal';
import ProductionDetailsModal from './ProductionDetailsModal';

const Production = () => {
  const { productions, furniture, workers, updateProduction } = useData();
  const { notifyProductionComplete } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingProduction, setViewingProduction] = useState(null);
  const [editingProduction, setEditingProduction] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');

  const statuses = ['all', 'planned', 'in-progress', 'completed', 'on-hold'];

  const filteredProductions = productions.filter(production => {
    const furnitureItem = furniture.find(f => f.id === production.furnitureId);
    const worker = workers.find(w => w.id === production.mainWorkerId);
    
    const matchesSearch = furnitureItem?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         production.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || production.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleView = (production) => {
    setViewingProduction(production);
  };

  const handleEdit = (production) => {
    setEditingProduction(production);
    setShowAddModal(true);
  };

  const handleStatusUpdate = (productionId, newStatus) => {
    updateProduction(productionId, { status: newStatus });
    if (newStatus === 'completed') {
      notifyProductionComplete(productionId);
    }
  };

  const handleExport = (format) => {
    const productionData = exportProductionReport(filteredProductions, furniture, workers);
    const filename = `production_report_${new Date().toISOString().split('T')[0]}`;
    
    switch (format) {
      case 'excel':
        exportToExcel(productionData, filename, 'Production');
        break;
      case 'csv':
        exportToCSV(productionData, filename);
        break;
      case 'pdf':
        const columns = ['Production ID', 'Furniture', 'Quantity', 'Status', 'Total Cost', 'Production Date'];
        exportToPDF(productionData, filename, 'Production Report', columns);
        break;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'planned':
        return 'bg-yellow-100 text-yellow-800';
      case 'on-hold':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Production</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Production</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search productions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
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

      {/* Production List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Production ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Furniture
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Main Worker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProductions.map((production) => {
                const furnitureItem = furniture.find(f => f.id === production.furnitureId);
                const mainWorker = workers.find(w => w.id === production.mainWorkerId);
                
                return (
                  <tr key={production.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{production.id.slice(-6)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                          {furnitureItem?.images?.[0] ? (
                            <img
                              src={furnitureItem.images[0]}
                              alt={furnitureItem.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <Hammer className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {furnitureItem?.name || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500 capitalize">
                            {furnitureItem?.category || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{production.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">
                          {mainWorker?.name || 'Unknown'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={production.status}
                        onChange={(e) => handleStatusUpdate(production.id, e.target.value)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border-0 ${getStatusColor(production.status)}`}
                      >
                        <option value="planned">Planned</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="on-hold">On Hold</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        {new Date(production.productionDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{production.totalCost.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleView(production)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(production)}
                          className="text-green-600 hover:text-green-900 text-sm font-medium"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredProductions.length === 0 && (
        <div className="text-center py-12">
          <Hammer className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No productions found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Try adjusting your search criteria' : 'Start by creating your first production order'}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            New Production
          </button>
        </div>
      )}

      {showAddModal && (
        <AddProductionModal
          production={editingProduction}
          onClose={() => {
            setShowAddModal(false);
            setEditingProduction(null);
          }}
        />
      )}

      {viewingProduction && (
        <ProductionDetailsModal
          production={viewingProduction}
          onClose={() => setViewingProduction(null)}
        />
      )}
    </div>
  );
};

export default Production;