import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { purchaseService } from '../../services/api';
import './Forms.css';

const PurchaseForm = ({ onClose, onSuccess, editData = null }) => {
  const { user } = useAuth();
  const isEdit = !!editData;
  
  const [formData, setFormData] = useState({
    item: editData?.item || '',
    category: editData?.category || '',
    quantity: editData?.quantity || '',
    unitPrice: editData?.unitPrice || '',
    supplier: editData?.supplier || '',
    requestDate: editData?.requestDate || new Date().toISOString().split('T')[0],
    requiredDate: editData?.requiredDate || '',
    justification: editData?.justification || '',
    specifications: editData?.specifications || ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.item) newErrors.item = 'Item name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = 'Valid quantity is required';
    if (!formData.unitPrice || formData.unitPrice <= 0) newErrors.unitPrice = 'Valid unit price is required';
    if (!formData.supplier) newErrors.supplier = 'Supplier is required';
    if (!formData.requestDate) newErrors.requestDate = 'Request date is required';
    if (!formData.requiredDate) newErrors.requiredDate = 'Required date is required';
    if (!formData.justification) newErrors.justification = 'Justification is required';
    
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
      const submitData = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        unitPrice: parseFloat(formData.unitPrice),
        department: user.department,
        requestedBy: user._id,
        status: editData?.status || 'Pending'
      };

      if (isEdit) {
        await purchaseService.updatePurchase(editData._id, submitData);
        toast.success('Purchase updated successfully');
      } else {
        await purchaseService.createPurchase(submitData);
        toast.success('Purchase request created successfully');
      }

      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error('Error submitting purchase:', error);
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} purchase: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Purchase Request' : 'New Purchase Request'}</h2>
          <button 
            className="close-button"
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-group">
            <label htmlFor="item">Item Name*</label>
            <input
              type="text"
              id="item"
              name="item"
              value={formData.item}
              onChange={handleChange}
              className={errors.item ? 'error' : ''}
              disabled={loading}
            />
            {errors.item && <span className="error-message">{errors.item}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="category">Category*</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={errors.category ? 'error' : ''}
              disabled={loading}
            >
              <option value="">Select Category</option>
              <option value="Weapons">Weapons</option>
              <option value="Vehicles">Vehicles</option>
              <option value="Communications">Communications</option>
              <option value="Medical">Medical</option>
              <option value="Protective">Protective</option>
              <option value="Office Supplies">Office Supplies</option>
              <option value="Other">Other</option>
            </select>
            {errors.category && <span className="error-message">{errors.category}</span>}
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

          <div className="form-group">
            <label htmlFor="unitPrice">Unit Price ($)*</label>
            <input
              type="number"
              id="unitPrice"
              name="unitPrice"
              value={formData.unitPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={errors.unitPrice ? 'error' : ''}
              disabled={loading}
            />
            {errors.unitPrice && <span className="error-message">{errors.unitPrice}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="supplier">Supplier*</label>
            <input
              type="text"
              id="supplier"
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              className={errors.supplier ? 'error' : ''}
              disabled={loading}
            />
            {errors.supplier && <span className="error-message">{errors.supplier}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="requestDate">Request Date*</label>
            <input
              type="date"
              id="requestDate"
              name="requestDate"
              value={formData.requestDate}
              onChange={handleChange}
              className={errors.requestDate ? 'error' : ''}
              disabled={loading}
            />
            {errors.requestDate && <span className="error-message">{errors.requestDate}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="requiredDate">Required Date*</label>
            <input
              type="date"
              id="requiredDate"
              name="requiredDate"
              value={formData.requiredDate}
              onChange={handleChange}
              className={errors.requiredDate ? 'error' : ''}
              disabled={loading}
            />
            {errors.requiredDate && <span className="error-message">{errors.requiredDate}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="justification">Justification*</label>
            <textarea
              id="justification"
              name="justification"
              value={formData.justification}
              onChange={handleChange}
              className={errors.justification ? 'error' : ''}
              rows="3"
              disabled={loading}
            />
            {errors.justification && <span className="error-message">{errors.justification}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="specifications">Specifications</label>
            <textarea
              id="specifications"
              name="specifications"
              value={formData.specifications}
              onChange={handleChange}
              rows="3"
              disabled={loading}
            />
          </div>

          <div className="total-amount">
            <strong>Total Amount: ${(formData.quantity * formData.unitPrice || 0).toFixed(2)}</strong>
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
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Submitting...' : (isEdit ? 'Update Purchase' : 'Submit Purchase Request')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseForm; 