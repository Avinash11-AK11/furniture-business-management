import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { X, Plus, Trash2, Upload } from 'lucide-react';

const AddFurnitureModal = ({ furniture, onClose }) => {
  const { addFurniture, updateFurniture, materials } = useData();
  const [formData, setFormData] = useState({
    name: '',
    category: 'table',
    expectedPrice: '',
    mainWorkerRate: '',
    coWorkerRate: '',
    description: '',
    images: [],
  });
  const [selectedMaterials, setSelectedMaterials] = useState([]);

  useEffect(() => {
    if (furniture) {
      setFormData({
        name: furniture.name,
        category: furniture.category,
        expectedPrice: furniture.expectedPrice.toString(),
        mainWorkerRate: furniture.mainWorkerRate.toString(),
        coWorkerRate: furniture.coWorkerRate.toString(),
        description: furniture.description || '',
        images: furniture.images || [],
      });
      setSelectedMaterials(furniture.materials || []);
    }
  }, [furniture]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddMaterial = () => {
    setSelectedMaterials([
      ...selectedMaterials,
      { materialId: '', quantity: 0 }
    ]);
  };

  const handleMaterialChange = (index, field, value) => {
    const updated = selectedMaterials.map((material, i) => 
      i === index ? { ...material, [field]: value } : material
    );
    setSelectedMaterials(updated);
  };

  const handleRemoveMaterial = (index) => {
    setSelectedMaterials(selectedMaterials.filter((_, i) => i !== index));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, event.target.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const calculateCosts = () => {
    const materialCost = selectedMaterials.reduce((total, material) => {
      const materialData = materials.find(m => m.id === material.materialId);
      return total + (materialData ? materialData.pricePerUnit * material.quantity : 0);
    }, 0);

    const laborCost = parseFloat(formData.mainWorkerRate || 0) + parseFloat(formData.coWorkerRate || 0);

    return { materialCost, laborCost };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const { materialCost, laborCost } = calculateCosts();
    
    const furnitureData = {
      ...formData,
      expectedPrice: parseFloat(formData.expectedPrice),
      mainWorkerRate: parseFloat(formData.mainWorkerRate),
      coWorkerRate: parseFloat(formData.coWorkerRate),
      materials: selectedMaterials.filter(m => m.materialId && m.quantity > 0),
      materialCost,
      laborCost,
    };

    if (furniture) {
      updateFurniture(furniture.id, furnitureData);
    } else {
      addFurniture(furnitureData);
    }

    onClose();
  };

  const { materialCost, laborCost } = calculateCosts();
  const expectedProfit = parseFloat(formData.expectedPrice || 0) - materialCost - laborCost;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {furniture ? 'Edit Furniture' : 'Add New Furniture'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Furniture Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Queen Size Bed"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="bed">Bed</option>
                <option value="table">Table</option>
                <option value="chair">Chair</option>
                <option value="cupboard">Cupboard</option>
                <option value="sofa">Sofa</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the furniture..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="expectedPrice" className="block text-sm font-medium text-gray-700 mb-1">
                Expected Price (₹)
              </label>
              <input
                type="number"
                id="expectedPrice"
                name="expectedPrice"
                required
                min="0"
                step="0.01"
                value={formData.expectedPrice}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="15000"
              />
            </div>

            <div>
              <label htmlFor="mainWorkerRate" className="block text-sm font-medium text-gray-700 mb-1">
                Main Worker Rate (₹)
              </label>
              <input
                type="number"
                id="mainWorkerRate"
                name="mainWorkerRate"
                required
                min="0"
                step="0.01"
                value={formData.mainWorkerRate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="2000"
              />
            </div>

            <div>
              <label htmlFor="coWorkerRate" className="block text-sm font-medium text-gray-700 mb-1">
                Co-Worker Rate (₹)
              </label>
              <input
                type="number"
                id="coWorkerRate"
                name="coWorkerRate"
                required
                min="0"
                step="0.01"
                value={formData.coWorkerRate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1000"
              />
            </div>
          </div>

          {/* Materials Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Required Materials</h3>
              <button
                type="button"
                onClick={handleAddMaterial}
                className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Material</span>
              </button>
            </div>

            <div className="space-y-3">
              {selectedMaterials.map((material, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <select
                    value={material.materialId}
                    onChange={(e) => handleMaterialChange(index, 'materialId', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Material</option>
                    {materials.map(mat => (
                      <option key={mat.id} value={mat.id}>
                        {mat.name} - {mat.subtype} (₹{mat.pricePerUnit}/{mat.unit})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Quantity"
                    min="0"
                    step="0.01"
                    value={material.quantity}
                    onChange={(e) => handleMaterialChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveMaterial(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Images Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images
            </label>
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG or JPEG</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cost Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Cost Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Material Cost:</span>
                <span className="font-medium">₹{materialCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Labor Cost:</span>
                <span className="font-medium">₹{laborCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expected Price:</span>
                <span className="font-medium">₹{parseFloat(formData.expectedPrice || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-300">
                <span className="font-semibold text-gray-900">Expected Profit:</span>
                <span className={`font-semibold ${expectedProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{expectedProfit.toLocaleString()}
                </span>
              </div>
            </div>
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
              {furniture ? 'Update' : 'Add'} Furniture
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFurnitureModal;