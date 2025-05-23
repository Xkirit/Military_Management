import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Forms.css';

const AssignmentForm = ({ onSubmit, initialData = null, isEdit = false }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    personnelId: initialData?.personnelId || '',
    equipmentId: initialData?.equipmentId || '',
    quantity: initialData?.quantity || '',
    assignmentDate: initialData?.assignmentDate || '',
    expectedReturnDate: initialData?.expectedReturnDate || '',
    purpose: initialData?.purpose || '',
    location: initialData?.location || '',
    specialInstructions: initialData?.specialInstructions || ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.personnelId) newErrors.personnelId = 'Personnel ID is required';
    if (!formData.equipmentId) newErrors.equipmentId = 'Equipment ID is required';
    if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = 'Valid quantity is required';
    if (!formData.assignmentDate) newErrors.assignmentDate = 'Assignment date is required';
    if (!formData.purpose) newErrors.purpose = 'Purpose is required';
    if (!formData.location) newErrors.location = 'Location is required';
    
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
        status: 'Active',
        assignedBy: user.id
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <div className="form-group">
        <label htmlFor="personnelId">Personnel ID*</label>
        <input
          type="text"
          id="personnelId"
          name="personnelId"
          value={formData.personnelId}
          onChange={handleChange}
          className={errors.personnelId ? 'error' : ''}
        />
        {errors.personnelId && <span className="error-message">{errors.personnelId}</span>}
      </div>

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
        <label htmlFor="assignmentDate">Assignment Date*</label>
        <input
          type="date"
          id="assignmentDate"
          name="assignmentDate"
          value={formData.assignmentDate}
          onChange={handleChange}
          className={errors.assignmentDate ? 'error' : ''}
        />
        {errors.assignmentDate && <span className="error-message">{errors.assignmentDate}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="expectedReturnDate">Expected Return Date</label>
        <input
          type="date"
          id="expectedReturnDate"
          name="expectedReturnDate"
          value={formData.expectedReturnDate}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="purpose">Purpose*</label>
        <select
          id="purpose"
          name="purpose"
          value={formData.purpose}
          onChange={handleChange}
          className={errors.purpose ? 'error' : ''}
        >
          <option value="">Select Purpose</option>
          <option value="Training">Training</option>
          <option value="Mission">Mission</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Field Exercise">Field Exercise</option>
          <option value="Other">Other</option>
        </select>
        {errors.purpose && <span className="error-message">{errors.purpose}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="location">Location*</label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className={errors.location ? 'error' : ''}
        />
        {errors.location && <span className="error-message">{errors.location}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="specialInstructions">Special Instructions</label>
        <textarea
          id="specialInstructions"
          name="specialInstructions"
          value={formData.specialInstructions}
          onChange={handleChange}
          rows="3"
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="submit-button">
          {isEdit ? 'Update Assignment' : 'Create Assignment'}
        </button>
      </div>
    </form>
  );
};

export default AssignmentForm; 