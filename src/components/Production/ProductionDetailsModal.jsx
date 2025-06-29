import React from 'react';
import { useData } from '../../contexts/DataContext';
import { X, Hammer, User, Calendar, Package, DollarSign } from 'lucide-react';

const ProductionDetailsModal = ({ production, onClose }) => {
  const { furniture, workers, materials } = useData();

  const furnitureItem = furniture.find(f => f.id === production.furnitureId);
  const mainWorker = workers.find(w => w.id === production.mainWorkerId);
  const coWorkers = workers.filter(w => production.coWorkerIds?.includes(w.id));

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Production #{production.id.slice(-6)}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status and Basic Info */}
          <div className="flex items-center justify-between">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(production.status)}`}>
              {production.status.replace('-', ' ')}
            </span>
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date(production.productionDate).toLocaleDateString()}
            </div>
          </div>

          {/* Furniture Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <Hammer className="w-5 h-5 mr-2" />
              Furniture Details
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-4">
                {furnitureItem?.images?.[0] && (
                  <img
                    src={furnitureItem.images[0]}
                    alt={furnitureItem.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{furnitureItem?.name || 'Unknown'}</h4>
                  <p className="text-sm text-gray-600 capitalize">{furnitureItem?.category || 'N/A'}</p>
                  <p className="text-sm text-gray-600">Quantity: {production.quantity}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Workers */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Workers Assigned
            </h3>
            <div className="space-y-3">
              {mainWorker && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{mainWorker.name}</p>
                    <p className="text-sm text-gray-600">Main Worker - {mainWorker.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-blue-600">
                      ₹{(furnitureItem?.mainWorkerRate * production.quantity || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Total payment</p>
                  </div>
                </div>
              )}
              
              {coWorkers.map(worker => (
                <div key={worker.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{worker.name}</p>
                    <p className="text-sm text-gray-600">Co-Worker - {worker.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-600">
                      ₹{(furnitureItem?.coWorkerRate * production.quantity || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Total payment</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Materials Used */}
          {furnitureItem?.materials && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Materials Used
              </h3>
              <div className="space-y-2">
                {furnitureItem.materials.map((material, index) => {
                  const materialDetails = materials.find(m => m.id === material.materialId);
                  const totalUsed = material.quantity * production.quantity;
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          {materialDetails?.name || 'Unknown Material'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {materialDetails?.subtype || 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {totalUsed} {materialDetails?.unit || 'units'}
                        </p>
                        <p className="text-sm text-gray-600">
                          ₹{materialDetails ? (materialDetails.pricePerUnit * totalUsed).toLocaleString() : '0'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cost Breakdown */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Cost Breakdown
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Material Cost:</span>
                <span className="font-medium">₹{production.materialCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Labor Cost:</span>
                <span className="font-medium">₹{production.laborCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-300">
                <span className="font-semibold text-gray-900">Total Cost:</span>
                <span className="font-semibold text-blue-600">₹{production.totalCost.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {production.notes && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Notes</h3>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{production.notes}</p>
            </div>
          )}

          {/* Finished Product Images */}
          {production.finishedImages && production.finishedImages.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Finished Product Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {production.finishedImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Finished product ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductionDetailsModal;