import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { transferService } from '../../services/api';
import './Forms.css';

const TransferForm = ({ onClose, onSuccess, editData = null }) => {
  const { user } = useAuth();
  const isEdit = !!editData;
  
  const [formData, setFormData] = useState({
    equipment: editData?.equipment || '',
    quantity: editData?.quantity || 1,
    fromLocation: editData?.fromLocation || '',
    toLocation: editData?.toLocation || '',
    sourceBaseId: editData?.sourceBaseId || user?.base || '',
    destinationBaseId: editData?.destinationBaseId || '',
    expectedDate: editData?.expectedDate ? new Date(editData.expectedDate).toISOString().split('T')[0] : '',
    reason: editData?.reason || '',
    transportMethod: editData?.transportMethod || 'Ground Transport',
    description: editData?.description || ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const baseOptions = ['Base A', 'Base B', 'Base C', 'Base D', 'Headquarters'];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.equipment.trim()) newErrors.equipment = 'Equipment name is required';
    if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = 'Valid quantity is required';
    if (!formData.sourceBaseId) newErrors.sourceBaseId = 'Source base is required';
    if (!formData.destinationBaseId) newErrors.destinationBaseId = 'Destination base is required';
    if (formData.sourceBaseId === formData.destinationBaseId) {
      newErrors.destinationBaseId = 'Destination must be different from source';
    }
    if (!formData.fromLocation.trim()) newErrors.fromLocation = 'Source location is required';
    if (!formData.toLocation.trim()) newErrors.toLocation = 'Destination location is required';
    if (!formData.expectedDate) newErrors.expectedDate = 'Expected date is required';
    if (!formData.reason.trim()) newErrors.reason = 'Reason is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const submissionData = {
        ...formData,
        quantity: parseInt(formData.quantity)
      };

      if (isEdit) {
        await transferService.updateTransfer(editData._id || editData.id, submissionData);
        toast.success('Transfer updated successfully');
      } else {
        await transferService.createTransfer(submissionData);
        toast.success('Transfer created successfully');
      }

      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error('Error submitting transfer:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'An error occurred while submitting the transfer';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Transfer' : 'Create New Transfer'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-group">
            <label htmlFor="equipment">Equipment Name*</label>
            <input
              type="text"
              id="equipment"
              name="equipment"
              value={formData.equipment}
              onChange={handleChange}
              className={errors.equipment ? 'error' : ''}
              disabled={loading}
              placeholder="e.g., M16 Rifles, Medical Supplies, Radios"
            />
            {errors.equipment && <span className="error-message">{errors.equipment}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Quantity*</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              className={errors.quantity ? 'error' : ''}
              disabled={loading}
            />
            {errors.quantity && <span className="error-message">{errors.quantity}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="sourceBaseId">Source Base*</label>
              <select
                id="sourceBaseId"
                name="sourceBaseId"
                value={formData.sourceBaseId}
                onChange={handleChange}
                className={errors.sourceBaseId ? 'error' : ''}
                disabled={loading}
              >
                <option value="">Select Source Base</option>
                {baseOptions.map(base => (
                  <option key={base} value={base}>{base}</option>
                ))}
              </select>
              {errors.sourceBaseId && <span className="error-message">{errors.sourceBaseId}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="destinationBaseId">Destination Base*</label>
              <select
                id="destinationBaseId"
                name="destinationBaseId"
                value={formData.destinationBaseId}
                onChange={handleChange}
                className={errors.destinationBaseId ? 'error' : ''}
                disabled={loading}
              >
                <option value="">Select Destination Base</option>
                {baseOptions.map(base => (
                  <option key={base} value={base}>{base}</option>
                ))}
              </select>
              {errors.destinationBaseId && <span className="error-message">{errors.destinationBaseId}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="fromLocation">Source Location*</label>
            <input
              type="text"
              id="fromLocation"
              name="fromLocation"
              value={formData.fromLocation}
              onChange={handleChange}
              className={errors.fromLocation ? 'error' : ''}
              disabled={loading}
              placeholder="e.g., Warehouse 1, Storage Room 2"
            />
            {errors.fromLocation && <span className="error-message">{errors.fromLocation}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="toLocation">Destination Location*</label>
            <input
              type="text"
              id="toLocation"
              name="toLocation"
              value={formData.toLocation}
              onChange={handleChange}
              className={errors.toLocation ? 'error' : ''}
              disabled={loading}
              placeholder="e.g., Warehouse 1, Storage Room 2"
            />
            {errors.toLocation && <span className="error-message">{errors.toLocation}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="expectedDate">Expected Date*</label>
            <input
              type="date"
              id="expectedDate"
              name="expectedDate"
              value={formData.expectedDate}
              onChange={handleChange}
              className={errors.expectedDate ? 'error' : ''}
              disabled={loading}
            />
            {errors.expectedDate && <span className="error-message">{errors.expectedDate}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="reason">Reason*</label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className={errors.reason ? 'error' : ''}
              rows="3"
              disabled={loading}
            />
            {errors.reason && <span className="error-message">{errors.reason}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="transportMethod">Transport Method</label>
            <select
              id="transportMethod"
              name="transportMethod"
              value={formData.transportMethod}
              onChange={handleChange}
              className={errors.transportMethod ? 'error' : ''}
              disabled={loading}
            >
              <option value="Ground">Ground</option>
              <option value="Air">Air</option>
              <option value="Sea">Sea</option>
              <option value="Rail">Rail</option>
            </select>
            {errors.transportMethod && <span className="error-message">{errors.transportMethod}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Additional Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              disabled={loading}
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Saving...' : (isEdit ? 'Update Transfer' : 'Create Transfer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferForm; 