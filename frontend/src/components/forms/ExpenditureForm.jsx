import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { useCreateExpenditure, useUpdateExpenditure } from '../../hooks/useQueries';
import './Forms.css';

const ExpenditureForm = ({ onClose, onSuccess, editData = null }) => {
  const { user } = useAuth();
  const isEdit = !!editData;
  
  const createExpenditureMutation = useCreateExpenditure();
  const updateExpenditureMutation = useUpdateExpenditure();

  const [formData, setFormData] = useState({
    category: editData?.category || '',
    amount: editData?.amount || '',
    description: editData?.description || '',
    department: editData?.department || '',
    paymentMethod: editData?.paymentMethod || 'Bank Transfer',
    budgetYear: editData?.budgetYear || new Date().getFullYear(),
    quarter: editData?.quarter || Math.ceil((new Date().getMonth() + 1) / 3),
    receiptNumber: editData?.receiptNumber || '',
    notes: editData?.notes || ''
  });

  const [errors, setErrors] = useState({});
  const loading = createExpenditureMutation.isPending || updateExpenditureMutation.isPending;

  const validateForm = () => {
    const newErrors = {};
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Valid amount is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.paymentMethod) newErrors.paymentMethod = 'Payment method is required';
    if (!formData.budgetYear) newErrors.budgetYear = 'Budget year is required';
    if (!formData.quarter || formData.quarter < 1 || formData.quarter > 4) {
      newErrors.quarter = 'Quarter must be between 1 and 4';
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

    try {
      const submissionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        budgetYear: parseInt(formData.budgetYear),
        quarter: parseInt(formData.quarter)
      };

      if (isEdit) {
        await updateExpenditureMutation.mutateAsync({ 
          id: editData._id || editData.id, 
          data: submissionData 
        });
        toast.success('Expenditure updated successfully');
      } else {
        await createExpenditureMutation.mutateAsync(submissionData);
        toast.success('Expenditure created successfully');
      }

      onSuccess?.();
      onClose?.();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'An error occurred while submitting the expenditure';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Expenditure' : 'Record New Expenditure'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="form-container">
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
              <option value="Equipment">Equipment</option>
              <option value="Training">Training</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Operations">Operations</option>
              <option value="Personnel">Personnel</option>
              <option value="Medical">Medical</option>
              <option value="Other">Other</option>
            </select>
            {errors.category && <span className="error-message">{errors.category}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount*</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={errors.amount ? 'error' : ''}
              disabled={loading}
              placeholder="Enter amount in dollars"
            />
            {errors.amount && <span className="error-message">{errors.amount}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description*</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={errors.description ? 'error' : ''}
              disabled={loading}
              rows="3"
              placeholder="Describe the expenditure purpose"
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="department">Department*</label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={errors.department ? 'error' : ''}
              disabled={loading}
            >
              <option value="">Select Department</option>
              <option value="Operations">Operations</option>
              <option value="Logistics">Logistics</option>
              <option value="Training">Training</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Intelligence">Intelligence</option>
              <option value="Medical">Medical</option>
            </select>
            {errors.department && <span className="error-message">{errors.department}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="paymentMethod">Payment Method*</label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className={errors.paymentMethod ? 'error' : ''}
              disabled={loading}
            >
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Other">Other</option>
            </select>
            {errors.paymentMethod && <span className="error-message">{errors.paymentMethod}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="budgetYear">Budget Year*</label>
            <input
              type="number"
              id="budgetYear"
              name="budgetYear"
              value={formData.budgetYear}
              onChange={handleChange}
              min="2020"
              max="2030"
              className={errors.budgetYear ? 'error' : ''}
              disabled={loading}
            />
            {errors.budgetYear && <span className="error-message">{errors.budgetYear}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="quarter">Quarter*</label>
            <select
              id="quarter"
              name="quarter"
              value={formData.quarter}
              onChange={handleChange}
              className={errors.quarter ? 'error' : ''}
              disabled={loading}
            >
              <option value={1}>Q1 (Jan-Mar)</option>
              <option value={2}>Q2 (Apr-Jun)</option>
              <option value={3}>Q3 (Jul-Sep)</option>
              <option value={4}>Q4 (Oct-Dec)</option>
            </select>
            {errors.quarter && <span className="error-message">{errors.quarter}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="receiptNumber">Receipt Number</label>
            <input
              type="text"
              id="receiptNumber"
              name="receiptNumber"
              value={formData.receiptNumber}
              onChange={handleChange}
              disabled={loading}
              placeholder="Receipt or reference number"
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Additional Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              disabled={loading}
              rows="3"
              placeholder="Any additional information..."
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
              {loading ? 'Saving...' : (isEdit ? 'Update Expenditure' : 'Record Expenditure')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenditureForm; 