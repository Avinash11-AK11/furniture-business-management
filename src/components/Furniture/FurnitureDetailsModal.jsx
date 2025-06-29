import React from 'react';
import { useData } from '../../contexts/DataContext';
import { X, Package, Users, DollarSign } from 'lucide-react';

const FurnitureDetailsModal = ({ furniture, onClose }) => {
  const { materials } = useData();

  const getMaterialDetails = (materialId) => {
    return materials.find(m => m.id === materialId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{furniture.name}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Images */}
          {furniture.images && furniture.images.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {furniture.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${furniture.name} ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Pricing
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Expected Price:</span>
                  <span className="font-semibold text-green-600">₹{furniture.expectedPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Material Cost:</span>
                  <span className="font-medium">₹{furniture.materialCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Labor Cost:</span>
                  <span className="font-medium">₹{furniture.laborCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-semibold">Expected Profit:</span>
                  <span className="font-semibold text-blue-600">
                    ₹{(furniture.expectedPrice - furniture.materialCost - furniture.laborCost).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Labor Rates
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Main Worker:</span>
                  <span className="font-medium">₹{furniture.mainWorkerRate.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Co-Worker:</span>
                  <span className="font-medium">₹{furniture.coWorkerRate.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium capitalize">{furniture.category}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {furniture.description && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
              <p className="text-gray-600">{furniture.description}</p>
            </div>
          )}

          {/* Materials */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Required Materials
            </h3>
            <div className="space-y-3">
              {furniture.materials.map((material, index) => {
                const materialDetails = getMaterialDetails(material.materialId);
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {materialDetails ? materialDetails.name : 'Unknown Material'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {materialDetails ? materialDetails.subtype : 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {material.quantity} {materialDetails ? materialDetails.unit : 'units'}
                      </p>
                      <p className="text-sm text-gray-600">
                        ₹{materialDetails ? (materialDetails.pricePerUnit * material.quantity).toLocaleString() : '0'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FurnitureDetailsModal;