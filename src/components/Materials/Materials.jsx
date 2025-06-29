import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Plus, Search, Package, AlertTriangle, Edit2, Trash2, Download } from 'lucide-react';
import { exportToExcel, exportToCSV, exportToPDF, exportInventoryReport } from '../../utils/exportUtils';
import AddMaterialModal from './AddMaterialModal';

const Materials = () => {
  const { materials, deleteMaterial } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);

  const filteredMaterials = materials.filter(material =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.subtype.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setShowAddModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      deleteMaterial(id);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingMaterial(null);
  };

  const handleExport = (format) => {
    const materialsData = exportInventoryReport(filteredMaterials);
    const filename = `materials_inventory_${new Date().toISOString().split('T')[0]}`;
    
    switch (format) {
      case 'excel':
        exportToExcel(materialsData, filename, 'Materials');
        break;
      case 'csv':
        exportToCSV(materialsData, filename);
        break;
      case 'pdf':
        const columns = ['Material Name', 'Subtype', 'Quantity', 'Unit', 'Price per Unit', 'Total Value', 'Stock Status'];
        exportToPDF(materialsData, filename, 'Materials Inventory Report', columns);
        break;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Materials</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Material</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
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

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((material) => (
          <div key={material.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{material.name}</h3>
                  <p className="text-sm text-gray-600">{material.subtype}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(material)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(material.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Quantity</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">
                    {material.quantity} {material.unit}
                  </span>
                  {material.quantity <= material.lowStockThreshold && (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Price per unit</span>
                <span className="font-medium text-gray-900">
                  ₹{material.pricePerUnit.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Value</span>
                <span className="font-semibold text-green-600">
                  ₹{material.totalValue.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Supplier</span>
                <span className="font-medium text-gray-900">{material.supplier}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Purchase Date</span>
                <span className="text-sm text-gray-900">
                  {new Date(material.purchaseDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            {material.quantity <= material.lowStockThreshold && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-700">Low Stock Alert</span>
                </div>
                <p className="text-xs text-red-600 mt-1">
                  Below threshold of {material.lowStockThreshold} {material.unit}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No materials found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Try adjusting your search criteria' : 'Start by adding your first material'}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Material
          </button>
        </div>
      )}

      {showAddModal && (
        <AddMaterialModal
          material={editingMaterial}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Materials;