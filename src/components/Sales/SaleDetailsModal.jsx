import React from 'react';
import { useData } from '../../contexts/DataContext';
import { X, User, Calendar, DollarSign, Package, Phone, MapPin } from 'lucide-react';

const SaleDetailsModal = ({ sale, onClose }) => {
  const { furniture } = useData();

  const getFurnitureDetails = (furnitureId) => {
    return furniture.find(f => f.id === furnitureId);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Sale #{sale.id.slice(-6)}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status and Date */}
          <div className="flex items-center justify-between">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(sale.paymentStatus)}`}>
              {sale.paymentStatus}
            </span>
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date(sale.saleDate).toLocaleDateString()}
            </div>
          </div>

          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Customer Information
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center">
                <User className="w-4 h-4 text-gray-400 mr-2" />
                <span className="font-medium">{sale.customerName}</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 text-gray-400 mr-2" />
                <span>{sale.customerPhone}</span>
              </div>
              {sale.customerAddress && (
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                  <span className="text-sm">{sale.customerAddress}</span>
                </div>
              )}
            </div>
          </div>

          {/* Sale Items */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Sale Items
            </h3>
            <div className="space-y-3">
              {sale.items?.map((item, index) => {
                const furnitureDetails = getFurnitureDetails(item.furnitureId);
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {furnitureDetails?.images?.[0] && (
                        <img
                          src={furnitureDetails.images[0]}
                          alt={furnitureDetails.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {furnitureDetails?.name || 'Unknown Item'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ₹{item.sellingPrice.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Total: ₹{(item.sellingPrice * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Summary */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Payment Summary
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-medium">₹{sale.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Paid Amount:</span>
                <span className="font-medium text-green-600">₹{sale.paidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Balance:</span>
                <span className="font-medium text-red-600">
                  ₹{(sale.totalAmount - sale.paidAmount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Cost:</span>
                <span className="font-medium">₹{sale.totalCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-300">
                <span className="font-semibold text-gray-900">Profit:</span>
                <span className={`font-semibold ${sale.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{sale.profit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {sale.notes && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Notes</h3>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{sale.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaleDetailsModal;