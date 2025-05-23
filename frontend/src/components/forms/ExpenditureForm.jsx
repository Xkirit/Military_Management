import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Forms.css';

const ExpenditureForm = ({ onSubmit, initialData = null, isEdit = false }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    equipmentId: initialData?.equipmentId || '',
    quantity: initialData?.quantity || '',
    expenditureDate: initialData?.expenditureDate || '',
    reason: initialData?.reason || '',
    authorizedBy: initialData?.authorizedBy || '',
    expenditureType: initialData?.expenditureType || 'Consumption',
    notes: initialData?.notes || ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.equipmentId) newErrors.equipmentId = 'Equipment ID is required';
    if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = 'Valid quantity is required';
    if (!formData.expenditureDate) newErrors.expenditureDate = 'Expenditure date is required';
    if (!formData.reason) newErrors.reason = 'Reason is required';
    if (!formData.authorizedBy) newErrors.authorizedBy = 'Authorization is required';
    
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
        recordedBy: user.id
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <div className="form-group">
        <label htmlFor="equipmentId">Equipment ID*</label>
        <input
          type="text"
          id="equipmentId"
          name="equipmentId"
          value={formData.equipmentId}
          onChange={handleChange}
          className={errors.equipmentId ? 'error' : ''}
        />
        {errors.equipmentId && <span className="error-message">{errors.equipmentId}</span>}
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
        <label htmlFor="expenditureDate">Expenditure Date*</label>
        <input
          type="date"
          id="expenditureDate"
          name="expenditureDate"
          value={formData.expenditureDate}
          onChange={handleChange}
          className={errors.expenditureDate ? 'error' : ''}
        />
        {errors.expenditureDate && <span className="error-message">{errors.expenditureDate}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="expenditureType">Expenditure Type*</label>
        <select
          id="expenditureType"
          name="expenditureType"
          value={formData.expenditureType}
          onChange={handleChange}
        >
          <option value="Consumption">Consumption</option>
          <option value="Loss">Loss</option>
          <option value="Damage">Damage</option>
          <option value="Obsolescence">Obsolescence</option>
          <option value="Transfer">Transfer</option>
        </select>
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
        />
        {errors.reason && <span className="error-message">{errors.reason}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="authorizedBy">Authorized By*</label>
        <input
          type="text"
          id="authorizedBy"
          name="authorizedBy"
          value={formData.authorizedBy}
          onChange={handleChange}
          className={errors.authorizedBy ? 'error' : ''}
        />
        {errors.authorizedBy && <span className="error-message">{errors.authorizedBy}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="notes">Additional Notes</label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="3"
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="submit-button">
          {isEdit ? 'Update Expenditure' : 'Record Expenditure'}
        </button>
      </div>
    </form>
  );
};

export default ExpenditureForm; 