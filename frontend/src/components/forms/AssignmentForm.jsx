import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { assignmentService } from '../../services/api';
import './Forms.css';

const AssignmentForm = ({ onClose, onSuccess, editData = null }) => {
  const { user } = useAuth();
  const isEdit = !!editData;
  
  // Generate a sample ObjectId for testing
  const sampleObjectId = '507f1f77bcf86cd799439011';
  
  const [formData, setFormData] = useState({
    personnel: editData?.personnel?._id || editData?.personnel || sampleObjectId,
    assignment: editData?.assignment || '',
    location: editData?.location || '',
    unit: editData?.unit || '',
    startDate: editData?.startDate?.split('T')[0] || '',
    endDate: editData?.endDate?.split('T')[0] || '',
    duties: editData?.duties?.join('\n') || '',
    priority: editData?.priority || 'Medium',
    description: editData?.description || ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.personnel) newErrors.personnel = 'Personnel ID is required';
    if (!formData.assignment) newErrors.assignment = 'Assignment title is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.unit) newErrors.unit = 'Unit is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.duties) newErrors.duties = 'Duties are required';
    
    // Validate ObjectId format (24 character hex string)
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (formData.personnel && !objectIdRegex.test(formData.personnel)) {
      newErrors.personnel = 'Personnel ID must be a valid 24-character MongoDB ObjectId';
    }
    
    // Validate dates
    if (formData.startDate && formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    
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
        personnel: formData.personnel,
        assignment: formData.assignment,
        location: formData.location,
        unit: formData.unit,
        startDate: formData.startDate,
        endDate: formData.endDate,
        duties: formData.duties.split('\n').filter(duty => duty.trim() !== ''),
        priority: formData.priority,
        description: formData.description,
        status: 'Pending'
      };

      if (isEdit) {
        await assignmentService.updateAssignment(editData._id || editData.id, submissionData);
        toast.success('Assignment updated successfully');
      } else {
        await assignmentService.createAssignment(submissionData);
        toast.success('Assignment created successfully');
      }

      onSuccess?.(); // Call success callback
      onClose?.(); // Close the form
    } catch (error) {
      console.error('Error submitting assignment:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'An error occurred while submitting the assignment';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const generateSampleId = () => {
    // Generate a new sample ObjectId
    const timestamp = Math.floor(Date.now() / 1000).toString(16);
    const randomHex = Math.random().toString(16).substr(2, 16);
    const newId = (timestamp + randomHex).substr(0, 24);
    setFormData(prev => ({ ...prev, personnel: newId }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Assignment' : 'Create New Assignment'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-group">
            <label htmlFor="personnel">Personnel ID* (MongoDB ObjectId)</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                id="personnel"
                name="personnel"
                value={formData.personnel}
                onChange={handleChange}
                className={errors.personnel ? 'error' : ''}
                disabled={loading}
                placeholder="24-character MongoDB ObjectId"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={generateSampleId}
                disabled={loading}
                style={{
                  padding: '0.5rem',
                  background: '#f5f5f5',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Generate Sample
              </button>
            </div>
            {errors.personnel && <span className="error-message">{errors.personnel}</span>}
            <small style={{ color: '#666', fontSize: '0.8rem' }}>
              Note: In production, this would be a dropdown to select from existing personnel.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="assignment">Assignment Title*</label>
            <input
              type="text"
              id="assignment"
              name="assignment"
              value={formData.assignment}
              onChange={handleChange}
              className={errors.assignment ? 'error' : ''}
              disabled={loading}
              placeholder="e.g., Security Detail, Training Mission"
            />
            {errors.assignment && <span className="error-message">{errors.assignment}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="unit">Unit*</label>
            <select
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className={errors.unit ? 'error' : ''}
              disabled={loading}
            >
              <option value="">Select Unit</option>
              <option value="Operations">Operations</option>
              <option value="Logistics">Logistics</option>
              <option value="Training">Training</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Intelligence">Intelligence</option>
              <option value="Medical">Medical</option>
            </select>
            {errors.unit && <span className="error-message">{errors.unit}</span>}
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
              disabled={loading}
              placeholder="Assignment location"
            />
            {errors.location && <span className="error-message">{errors.location}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="startDate">Start Date*</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className={errors.startDate ? 'error' : ''}
              disabled={loading}
            />
            {errors.startDate && <span className="error-message">{errors.startDate}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date*</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className={errors.endDate ? 'error' : ''}
              disabled={loading}
            />
            {errors.endDate && <span className="error-message">{errors.endDate}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="duties">Duties* (one per line)</label>
            <textarea
              id="duties"
              name="duties"
              value={formData.duties}
              onChange={handleChange}
              rows="4"
              className={errors.duties ? 'error' : ''}
              disabled={loading}
              placeholder="Enter duties, one per line&#10;e.g., Guard duty&#10;Equipment maintenance&#10;Report writing"
            />
            {errors.duties && <span className="error-message">{errors.duties}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              disabled={loading}
              placeholder="Additional assignment details..."
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
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEdit ? 'Update Assignment' : 'Create Assignment')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentForm; 