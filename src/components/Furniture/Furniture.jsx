import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Plus, Search, Hammer, Edit2, Trash2, Eye, Download } from 'lucide-react';
import { exportToExcel, exportToCSV, exportToPDF } from '../../utils/exportUtils';
import AddFurnitureModal from './AddFurnitureModal';
import FurnitureDetailsModal from './FurnitureDetailsModal';

const Furniture = () => {
  const { furniture, deleteFurniture } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFurniture, setEditingFurniture] = useState(null);
  const [viewingFurniture, setViewingFurniture] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'bed', 'table', 'chair', 'cupboard', 'sofa', 'other'];

  const filteredFurniture = furniture.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (furnitureItem) => {
    setEditingFurniture(furnitureItem);
    setShowAddModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this furniture item?')) {
      deleteFurniture(id);
    }
  };

  const handleView = (furnitureItem) => {
    setViewingFurniture(furnitureItem);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingFurniture(null);
  };

  const handleExport = (format) => {
    const furnitureData = filteredFurniture.map(item => ({
      'Furniture Name': item.name,
      'Category': item.category,
      'Expected Price': item.expectedPrice,
      'Material Cost': item.materialCost,
      'Labor Cost': item.laborCost,
      'Expected Profit': item.expectedPrice - item.materialCost - item.laborCost,
      'Materials Required': item.materials?.length || 0,
      'Main Worker Rate': item.mainWorkerRate,
      'Co-Worker Rate': item.coWorkerRate,
    }));

    const filename = `furniture_catalog_${new Date().toISOString().split('T')[0]}`;
    
    switch (format) {
      case 'excel':
        exportToExcel(furnitureData, filename, 'Furniture');
        break;
      case 'csv':
        exportToCSV(furnitureData, filename);
        break;
      case 'pdf':
        const columns = ['Furniture Name', 'Category', 'Expected Price', 'Material Cost', 'Labor Cost', 'Expected Profit'];
        exportToPDF(furnitureData, filename, 'Furniture Catalog', columns);
        break;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Furniture Catalog</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Furniture</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search furniture..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
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

      {/* Furniture Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFurniture.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-w-16 aspect-h-9 bg-gray-100">
              {item.images && item.images.length > 0 ? (
                <img
                  src={item.images[0]}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 flex items-center justify-center bg-gray-100">
                  <Hammer className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">{item.category}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleView(item)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Expected Price</span>
                  <span className="font-semibold text-green-600">
                    ₹{item.expectedPrice.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Material Cost</span>
                  <span className="font-medium text-gray-900">
                    ₹{item.materialCost.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Labor Cost</span>
                  <span className="font-medium text-gray-900">
                    ₹{item.laborCost.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Materials</span>
                  <span className="text-sm text-gray-900">
                    {item.materials?.length || 0} items
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Expected Profit</span>
                    <span className="font-semibold text-blue-600">
                      ₹{(item.expectedPrice - item.materialCost - item.laborCost).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredFurniture.length === 0 && (
        <div className="text-center py-12">
          <Hammer className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No furniture found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Try adjusting your search criteria' : 'Start by adding your first furniture item'}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Furniture
          </button>
        </div>
      )}

      {showAddModal && (
        <AddFurnitureModal
          furniture={editingFurniture}
          onClose={handleCloseModal}
        />
      )}

      {viewingFurniture && (
        <FurnitureDetailsModal
          furniture={viewingFurniture}
          onClose={() => setViewingFurniture(null)}
        />
      )}
    </div>
  );
};

export default Furniture;