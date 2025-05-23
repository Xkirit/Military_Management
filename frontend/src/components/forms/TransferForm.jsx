import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Forms.css';

const TransferForm = ({ onSubmit, initialData = null, isEdit = false }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    equipmentId: initialData?.equipmentId || '',
    quantity: initialData?.quantity || '',
    sourceBaseId: initialData?.sourceBaseId || user.assignedBase,
    destinationBaseId: initialData?.destinationBaseId || '',
    transferDate: initialData?.transferDate || '',
    expectedArrivalDate: initialData?.expectedArrivalDate || '',
    reason: initialData?.reason || '',
    transportMethod: initialData?.transportMethod || 'Ground',
    priority: initialData?.priority || 'Normal',
    notes: initialData?.notes || ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.equipmentId) newErrors.equipmentId = 'Equipment ID is required';
    if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = 'Valid quantity is required';
    if (!formData.sourceBaseId) newErrors.sourceBaseId = 'Source base is required';
    if (!formData.destinationBaseId) newErrors.destinationBaseId = 'Destination base is required';
    if (formData.sourceBaseId === formData.destinationBaseId) {
      newErrors.destinationBaseId = 'Destination must be different from source';
    }
    if (!formData.transferDate) newErrors.transferDate = 'Transfer date is required';
    if (!formData.reason) newErrors.reason = 'Reason is required';
    
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
        status: 'Pending',
        requestedBy: user.id
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
        <label htmlFor="sourceBaseId">Source Base*</label>
        <input
          type="text"
          id="sourceBaseId"
          name="sourceBaseId"
          value={formData.sourceBaseId}
          onChange={handleChange}
          disabled={!isEdit}
          className={errors.sourceBaseId ? 'error' : ''}
        />
        {errors.sourceBaseId && <span className="error-message">{errors.sourceBaseId}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="destinationBaseId">Destination Base*</label>
        <input
          type="text"
          id="destinationBaseId"
          name="destinationBaseId"
          value={formData.destinationBaseId}
          onChange={handleChange}
          className={errors.destinationBaseId ? 'error' : ''}
        />
        {errors.destinationBaseId && <span className="error-message">{errors.destinationBaseId}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="transferDate">Transfer Date*</label>
        <input
          type="date"
          id="transferDate"
          name="transferDate"
          value={formData.transferDate}
          onChange={handleChange}
          className={errors.transferDate ? 'error' : ''}
        />
        {errors.transferDate && <span className="error-message">{errors.transferDate}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="expectedArrivalDate">Expected Arrival Date</label>
        <input
          type="date"
          id="expectedArrivalDate"
          name="expectedArrivalDate"
          value={formData.expectedArrivalDate}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="transportMethod">Transport Method</label>
        <select
          id="transportMethod"
          name="transportMethod"
          value={formData.transportMethod}
          onChange={handleChange}
        >
          <option value="Ground">Ground</option>
          <option value="Air">Air</option>
          <option value="Sea">Sea</option>
          <option value="Rail">Rail</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="priority">Priority</label>
        <select
          id="priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
        >
          <option value="Low">Low</option>
          <option value="Normal">Normal</option>
          <option value="High">High</option>
          <option value="Urgent">Urgent</option>
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
          {isEdit ? 'Update Transfer' : 'Submit Transfer Request'}
        </button>
      </div>
    </form>
  );
};

export default TransferForm; 