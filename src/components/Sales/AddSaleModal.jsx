import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { X, Plus, Trash2, User } from 'lucide-react';

const AddSaleModal = ({ sale, onClose }) => {
  const { addSale, updateSale, furniture } = useData();
  const { notifyNewSale } = useNotifications();
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    saleDate: new Date().toISOString().split('T')[0],
    paymentStatus: 'pending',
    paidAmount: '',
    notes: '',
  });
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    if (sale) {
      setFormData({
        customerName: sale.customerName,
        customerPhone: sale.customerPhone,
        customerAddress: sale.customerAddress || '',
        saleDate: new Date(sale.saleDate).toISOString().split('T')[0],
        paymentStatus: sale.paymentStatus,
        paidAmount: sale.paidAmount.toString(),
        notes: sale.notes || '',
      });
      setSelectedItems(sale.items || []);
    }
  }, [sale]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddItem = () => {
    setSelectedItems([
      ...selectedItems,
      { furnitureId: '', quantity: 1, sellingPrice: 0 }
    ]);
  };

  const handleItemChange = (index, field, value) => {
    const updated = selectedItems.map((item, i) => {
      if (i === index) {
        const newItem = { ...item, [field]: value };
        
        // Auto-fill selling price when furniture is selected
        if (field === 'furnitureId' && value) {
          const selectedFurniture = furniture.find(f => f.id === value);
          if (selectedFurniture) {
            newItem.sellingPrice = selectedFurniture.expectedPrice;
          }
        }
        
        return newItem;
      }
      return item;
    });
    setSelectedItems(updated);
  };

  const handleRemoveItem = (index) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const totalAmount = selectedItems.reduce((sum, item) => {
      return sum + (item.sellingPrice * item.quantity);
    }, 0);

    // Fixed profit calculation
    const totalCost = selectedItems.reduce((sum, item) => {
      const furnitureItem = furniture.find(f => f.id === item.furnitureId);
      if (furnitureItem) {
        // Use the actual cost from furniture (material + labor cost)
        const itemCost = (furnitureItem.materialCost + furnitureItem.laborCost) * item.quantity;
        return sum + itemCost;
      }
      return sum;
    }, 0);

    const profit = totalAmount - totalCost;
    
    return { totalAmount, totalCost, profit };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const { totalAmount, totalCost, profit } = calculateTotals();
    
    const saleData = {
      ...formData,
      paidAmount: parseFloat(formData.paidAmount || 0),
      saleDate: new Date(formData.saleDate).toISOString(),
      items: selectedItems.filter(item => item.furnitureId && item.quantity > 0),
      totalAmount,
      totalCost,
      profit,
    };

    if (sale) {
      updateSale(sale.id, saleData);
    } else {
      addSale(saleData);
      notifyNewSale(saleData.customerName, saleData.totalAmount);
    }

    onClose();
  };

  const { totalAmount, totalCost, profit } = calculateTotals();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {sale ? 'Edit Sale' : 'New Sale'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  required
                  value={formData.customerName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="customerPhone"
                  name="customerPhone"
                  required
                  value={formData.customerPhone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+91 9876543210"
                />
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="customerAddress" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                id="customerAddress"
                name="customerAddress"
                value={formData.customerAddress}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Customer address (optional)"
              />
            </div>
          </div>

          {/* Sale Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Sale Items</h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-3">
              {selectedItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <select
                    value={item.furnitureId}
                    onChange={(e) => handleItemChange(index, 'furnitureId', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Furniture</option>
                    {furniture.map(furnitureItem => (
                      <option key={furnitureItem.id} value={furnitureItem.id}>
                        {furnitureItem.name} - ₹{furnitureItem.expectedPrice.toLocaleString()}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Qty"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    min="0"
                    step="0.01"
                    value={item.sellingPrice}
                    onChange={(e) => handleItemChange(index, 'sellingPrice', parseFloat(e.target.value) || 0)}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Sale Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="saleDate" className="block text-sm font-medium text-gray-700 mb-1">
                Sale Date
              </label>
              <input
                type="date"
                id="saleDate"
                name="saleDate"
                required
                value={formData.saleDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700 mb-1">
                Payment Status
              </label>
              <select
                id="paymentStatus"
                name="paymentStatus"
                value={formData.paymentStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            <div>
              <label htmlFor="paidAmount" className="block text-sm font-medium text-gray-700 mb-1">
                Paid Amount (₹)
              </label>
              <input
                type="number"
                id="paidAmount"
                name="paidAmount"
                min="0"
                step="0.01"
                value={formData.paidAmount}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
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
              placeholder="Any additional notes..."
            />
          </div>

          {/* Sale Summary */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Sale Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-medium">₹{totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Cost:</span>
                <span className="font-medium">₹{totalCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Paid Amount:</span>
                <span className="font-medium">₹{parseFloat(formData.paidAmount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Balance:</span>
                <span className="font-medium text-red-600">
                  ₹{(totalAmount - parseFloat(formData.paidAmount || 0)).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-blue-200">
                <span className="font-semibold text-gray-900">Profit:</span>
                <span className={`font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{profit.toLocaleString()}
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
              {sale ? 'Update' : 'Create'} Sale
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSaleModal;