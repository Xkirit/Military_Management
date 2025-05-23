import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Forms.css';

const PurchaseForm = ({ onSubmit, initialData = null, isEdit = false }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    equipmentName: initialData?.equipmentName || '',
    category: initialData?.category || '',
    quantity: initialData?.quantity || '',
    unitPrice: initialData?.unitPrice || '',
    vendor: initialData?.vendor || '',
    requestDate: initialData?.requestDate || '',
    requiredDate: initialData?.requiredDate || '',
    justification: initialData?.justification || '',
    specifications: initialData?.specifications || ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.equipmentName) newErrors.equipmentName = 'Equipment name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = 'Valid quantity is required';
    if (!formData.unitPrice || formData.unitPrice <= 0) newErrors.unitPrice = 'Valid unit price is required';
    if (!formData.vendor) newErrors.vendor = 'Vendor is required';
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        baseId: user.assignedBase,
        status: 'Pending',
        totalAmount: formData.quantity * formData.unitPrice
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <div className="form-group">
        <label htmlFor="equipmentName">Equipment Name*</label>
        <input
          type="text"
          id="equipmentName"
          name="equipmentName"
          value={formData.equipmentName}
          onChange={handleChange}
          className={errors.equipmentName ? 'error' : ''}
        />
        {errors.equipmentName && <span className="error-message">{errors.equipmentName}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="category">Category*</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={errors.category ? 'error' : ''}
        >
          <option value="">Select Category</option>
          <option value="Weapons">Weapons</option>
          <option value="Vehicles">Vehicles</option>
          <option value="Communications">Communications</option>
          <option value="Medical">Medical</option>
          <option value="Protective">Protective</option>
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
        />
        {errors.unitPrice && <span className="error-message">{errors.unitPrice}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="vendor">Vendor*</label>
        <input
          type="text"
          id="vendor"
          name="vendor"
          value={formData.vendor}
          onChange={handleChange}
          className={errors.vendor ? 'error' : ''}
        />
        {errors.vendor && <span className="error-message">{errors.vendor}</span>}
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
        />
      </div>

      <div className="total-amount">
        <strong>Total Amount: ${(formData.quantity * formData.unitPrice || 0).toFixed(2)}</strong>
      </div>

      <div className="form-actions">
        <button type="submit" className="submit-button">
          {isEdit ? 'Update Purchase Request' : 'Submit Purchase Request'}
        </button>
      </div>
    </form>
  );
};

export default PurchaseForm; 