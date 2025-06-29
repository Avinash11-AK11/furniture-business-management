import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { X, Upload, User } from 'lucide-react';

const AddWorkerModal = ({ worker, onClose }) => {
  const { addWorker, updateWorker } = useData();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'carpenter',
    dailyWage: '',
    joinDate: new Date().toISOString().split('T')[0],
    address: '',
    isActive: true,
    photo: '',
  });

  useEffect(() => {
    if (worker) {
      setFormData({
        name: worker.name,
        phone: worker.phone,
        role: worker.role,
        dailyWage: worker.dailyWage.toString(),
        joinDate: new Date(worker.joinDate).toISOString().split('T')[0],
        address: worker.address || '',
        isActive: worker.isActive,
        photo: worker.photo || '',
      });
    }
  }, [worker]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          photo: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const workerData = {
      ...formData,
      dailyWage: parseFloat(formData.dailyWage),
      joinDate: new Date(formData.joinDate).toISOString(),
      totalEarnings: worker?.totalEarnings || 0,
      udharBalance: worker?.udharBalance || 0,
    };

    if (worker) {
      updateWorker(worker.id, workerData);
    } else {
      addWorker(workerData);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {worker ? 'Edit Worker' : 'Add New Worker'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Photo Upload */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
              {formData.photo ? (
                <img
                  src={formData.photo}
                  alt="Worker"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <label className="cursor-pointer">
              <span className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <Upload className="w-4 h-4" />
                <span>Upload Photo</span>
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter worker name"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+91 9876543210"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="carpenter">Carpenter</option>
                <option value="helper">Helper</option>
                <option value="painter">Painter</option>
                <option value="polisher">Polisher</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="dailyWage" className="block text-sm font-medium text-gray-700 mb-1">
                Daily Wage (₹)
              </label>
              <input
                type="number"
                id="dailyWage"
                name="dailyWage"
                required
                min="0"
                step="0.01"
                value={formData.dailyWage}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700 mb-1">
              Join Date
            </label>
            <input
              type="date"
              id="joinDate"
              name="joinDate"
              required
              value={formData.joinDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter address (optional)"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Active Worker
            </label>
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
              {worker ? 'Update' : 'Add'} Worker
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWorkerModal;