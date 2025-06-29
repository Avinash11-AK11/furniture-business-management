import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { X, Hammer, User, Upload, Plus, Trash2 } from 'lucide-react';

const AddProductionModal = ({ production, onClose }) => {
  const { addProduction, updateProduction, furniture, workers, materials } = useData();
  const [formData, setFormData] = useState({
    furnitureId: '',
    quantity: 1,
    productionDate: new Date().toISOString().split('T')[0],
    status: 'planned',
    notes: '',
    finishedImages: [],
  });
  const [selectedWorkers, setSelectedWorkers] = useState([]);

  useEffect(() => {
    if (production) {
      setFormData({
        furnitureId: production.furnitureId,
        quantity: production.quantity,
        productionDate: new Date(production.productionDate).toISOString().split('T')[0],
        status: production.status,
        notes: production.notes || '',
        finishedImages: production.finishedImages || [],
      });
      setSelectedWorkers(production.workers || []);
    }
  }, [production]);

  const handleChange = (e) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleAddWorker = () => {
    setSelectedWorkers([
      ...selectedWorkers,
      { workerId: '', role: 'main', customRate: 0 }
    ]);
  };

  const handleWorkerChange = (index, field, value) => {
    const updated = selectedWorkers.map((worker, i) => 
      i === index ? { ...worker, [field]: value } : worker
    );
    setSelectedWorkers(updated);
  };

  const handleRemoveWorker = (index) => {
    setSelectedWorkers(selectedWorkers.filter((_, i) => i !== index));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          finishedImages: [...prev.finishedImages, event.target.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      finishedImages: prev.finishedImages.filter((_, i) => i !== index)
    }));
  };

  const calculateCosts = () => {
    const selectedFurniture = furniture.find(f => f.id === formData.furnitureId);
    if (!selectedFurniture) return { materialCost: 0, laborCost: 0, totalCost: 0 };

    const materialCost = selectedFurniture.materialCost * formData.quantity;
    
    // Calculate labor cost based on selected workers and their custom rates
    const laborCost = selectedWorkers.reduce((total, worker) => {
      const workerData = workers.find(w => w.id === worker.workerId);
      const rate = worker.customRate > 0 ? worker.customRate : (workerData?.dailyWage || 0);
      return total + (rate * formData.quantity);
    }, 0);

    const totalCost = materialCost + laborCost;

    return { materialCost, laborCost, totalCost };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const { materialCost, laborCost, totalCost } = calculateCosts();
    
    const productionData = {
      ...formData,
      productionDate: new Date(formData.productionDate).toISOString(),
      workers: selectedWorkers.filter(w => w.workerId),
      materialCost,
      laborCost,
      totalCost,
    };

    if (production) {
      updateProduction(production.id, productionData);
    } else {
      addProduction(productionData);
    }

    onClose();
  };

  const selectedFurniture = furniture.find(f => f.id === formData.furnitureId);
  const { materialCost, laborCost, totalCost } = calculateCosts();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {production ? 'Edit Production Order' : 'New Production Order'}
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
              <label htmlFor="furnitureId" className="block text-sm font-medium text-gray-700 mb-1">
                Select Furniture
              </label>
              <select
                id="furnitureId"
                name="furnitureId"
                required
                value={formData.furnitureId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose furniture...</option>
                {furniture.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} - ₹{item.expectedPrice.toLocaleString()}
                  </option>
                ))}
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
                min="1"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {selectedFurniture && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Furniture Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Category:</span>
                  <span className="ml-2 font-medium capitalize">{selectedFurniture.category}</span>
                </div>
                <div>
                  <span className="text-gray-600">Expected Price:</span>
                  <span className="ml-2 font-medium">₹{selectedFurniture.expectedPrice.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Material Cost per Unit:</span>
                  <span className="ml-2 font-medium">₹{selectedFurniture.materialCost.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Required Materials:</span>
                  <span className="ml-2 font-medium">{selectedFurniture.materials?.length || 0} items</span>
                </div>
              </div>
            </div>
          )}

          {/* Workers Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Assign Workers</h3>
              <button
                type="button"
                onClick={handleAddWorker}
                className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Worker</span>
              </button>
            </div>

            <div className="space-y-3">
              {selectedWorkers.map((worker, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <select
                    value={worker.workerId}
                    onChange={(e) => handleWorkerChange(index, 'workerId', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Worker</option>
                    {workers.filter(w => w.isActive).map(workerOption => (
                      <option key={workerOption.id} value={workerOption.id}>
                        {workerOption.name} - {workerOption.role} (₹{workerOption.dailyWage}/day)
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={worker.role}
                    onChange={(e) => handleWorkerChange(index, 'role', e.target.value)}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="main">Main</option>
                    <option value="co-worker">Co-Worker</option>
                    <option value="helper">Helper</option>
                    <option value="specialist">Specialist</option>
                  </select>

                  <input
                    type="number"
                    placeholder="Custom Rate"
                    min="0"
                    step="0.01"
                    value={worker.customRate}
                    onChange={(e) => handleWorkerChange(index, 'customRate', parseFloat(e.target.value) || 0)}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  <button
                    type="button"
                    onClick={() => handleRemoveWorker(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {selectedWorkers.length === 0 && (
                <p className="text-gray-500 text-center py-4">No workers assigned yet</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="productionDate" className="block text-sm font-medium text-gray-700 mb-1">
                Production Date
              </label>
              <input
                type="date"
                id="productionDate"
                name="productionDate"
                required
                value={formData.productionDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="planned">Planned</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Any special instructions or notes..."
            />
          </div>

          {/* Finished Product Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Finished Product Images
            </label>
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> finished product images
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

              {formData.finishedImages.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {formData.finishedImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Finished product ${index + 1}`}
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
          {selectedFurniture && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Production Cost Summary</h3>
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
                  <span className="text-gray-600">Workers Assigned:</span>
                  <span className="font-medium">{selectedWorkers.length}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-blue-200">
                  <span className="font-semibold text-gray-900">Total Cost:</span>
                  <span className="font-semibold text-blue-600">₹{totalCost.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

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
              {production ? 'Update' : 'Create'} Production
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductionModal;