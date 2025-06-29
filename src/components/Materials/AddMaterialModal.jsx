import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { X } from 'lucide-react';

const AddMaterialModal = ({ material, onClose }) => {
  const { addMaterial, updateMaterial } = useData();
  const [formData, setFormData] = useState({
    name: '',
    subtype: '',
    unit: 'feet',
    quantity: '',
    pricePerUnit: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    supplier: '',
    lowStockThreshold: '',
  });

  useEffect(() => {
    if (material) {
      setFormData({
        name: material.name,
        subtype: material.subtype,
        unit: material.unit,
        quantity: material.quantity.toString(),
        pricePerUnit: material.pricePerUnit.toString(),
        purchaseDate: new Date(material.purchaseDate).toISOString().split('T')[0],
        supplier: material.supplier,
        lowStockThreshold: material.lowStockThreshold.toString(),
      });
    }
  }, [material]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const materialData = {
      ...formData,
      quantity: parseFloat(formData.quantity),
      pricePerUnit: parseFloat(formData.pricePerUnit),
      lowStockThreshold: parseFloat(formData.lowStockThreshold),
      purchaseDate: new Date(formData.purchaseDate).toISOString(),
    };

    if (material) {
      updateMaterial(material.id, materialData);
    } else {
      addMaterial(materialData);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {material ? 'Edit Material' : 'Add New Material'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Material Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Plywood"
            />
          </div>

          <div>
            <label htmlFor="subtype" className="block text-sm font-medium text-gray-700 mb-1">
              Subtype
            </label>
            <input
              type="text"
              id="subtype"
              name="subtype"
              required
              value={formData.subtype}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 19mm MDF"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="feet">Feet</option>
                <option value="meter">Meter</option>
                <option value="kg">Kilogram</option>
                <option value="liter">Liter</option>
                <option value="piece">Piece</option>
                <option value="sheet">Sheet</option>
              </select>
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                required
                min="0"
                step="0.01"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="100"
              />
            </div>
          </div>

          <div>
            <label htmlFor="pricePerUnit" className="block text-sm font-medium text-gray-700 mb-1">
              Price per Unit (₹)
            </label>
            <input
              type="number"
              id="pricePerUnit"
              name="pricePerUnit"
              required
              min="0"
              step="0.01"
              value={formData.pricePerUnit}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="150.00"
            />
          </div>

          <div>
            <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-1">
              Supplier
            </label>
            <input
              type="text"
              id="supplier"
              name="supplier"
              required
              value={formData.supplier}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Supplier name"
            />
          </div>

          <div>
            <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 mb-1">
              Purchase Date
            </label>
            <input
              type="date"
              id="purchaseDate"
              name="purchaseDate"
              required
              value={formData.purchaseDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-gray-700 mb-1">
              Low Stock Threshold
            </label>
            <input
              type="number"
              id="lowStockThreshold"
              name="lowStockThreshold"
              required
              min="0"
              step="0.01"
              value={formData.lowStockThreshold}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="10"
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {material ? 'Update' : 'Add'} Material
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMaterialModal;