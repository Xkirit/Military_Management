import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { useCreateTransfer, useUpdateTransfer } from '../../hooks/useQueries';
import { purchaseService } from '../../services/api';
import './Forms.css';

const TransferForm = ({ onClose, onSuccess, editData = null }) => {
  const { user } = useAuth();
  const isEdit = !!editData;
  
  const createTransferMutation = useCreateTransfer();
  const updateTransferMutation = useUpdateTransfer();

  // Refs for click outside detection
  const equipmentDropdownRef = useRef(null);
  const fromLocationDropdownRef = useRef(null);
  const toLocationDropdownRef = useRef(null);

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
  const loading = createTransferMutation.isPending || updateTransferMutation.isPending;

  // Equipment search state
  const [equipmentSearch, setEquipmentSearch] = useState(editData?.equipment || '');
  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [showEquipmentDropdown, setShowEquipmentDropdown] = useState(false);
  const [equipmentLoading, setEquipmentLoading] = useState(false);

  // Location suggestions
  const [showFromLocationDropdown, setShowFromLocationDropdown] = useState(false);
  const [showToLocationDropdown, setShowToLocationDropdown] = useState(false);
  
  const locationSuggestions = [
    'Warehouse 1', 'Warehouse 2', 'Warehouse 3',
    'Storage Room A', 'Storage Room B', 'Storage Room C',
    'Armory 1', 'Armory 2', 'Main Armory',
    'Supply Depot', 'Equipment Bay', 'Vehicle Bay',
    'Medical Storage', 'Communications Center', 'Maintenance Shop'
  ];

  // Debounce refs
  const equipmentSearchTimeout = useRef(null);

  const baseOptions = ['Base A', 'Base B', 'Base C', 'Base D', 'Headquarters'];

  // Search equipment function
  const searchEquipment = async (searchTerm) => {
    setEquipmentLoading(true);
    try {
      const response = await purchaseService.getAvailableEquipment({ 
        search: searchTerm,
        limit: 20 
      });
      setAvailableEquipment(response.data);
    } catch (error) {
      // Don't show error toast for equipment search as it's optional
    } finally {
      setEquipmentLoading(false);
    }
  };

  // Load available equipment on component mount
  useEffect(() => {
    searchEquipment('');
  }, []);

  // Click outside detection
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (equipmentDropdownRef.current && !equipmentDropdownRef.current.contains(event.target)) {
        setShowEquipmentDropdown(false);
      }
      if (fromLocationDropdownRef.current && !fromLocationDropdownRef.current.contains(event.target)) {
        setShowFromLocationDropdown(false);
      }
      if (toLocationDropdownRef.current && !toLocationDropdownRef.current.contains(event.target)) {
        setShowToLocationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      clearTimeout(equipmentSearchTimeout.current);
    };
  }, []);

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

  // Handle equipment search input
  const handleEquipmentSearch = (e) => {
    const value = e.target.value;
    setEquipmentSearch(value);
    setFormData(prev => ({ ...prev, equipment: value }));
    setShowEquipmentDropdown(true);
    
    // Clear error when user starts typing
    if (errors.equipment) {
      setErrors(prev => ({ ...prev, equipment: '' }));
    }
    
    // Debounce search
    clearTimeout(equipmentSearchTimeout.current);
    equipmentSearchTimeout.current = setTimeout(() => searchEquipment(value), 300);
  };

  // Handle equipment selection
  const handleEquipmentSelect = (equipment) => {
    const equipmentName = equipment.item;
    setEquipmentSearch(equipmentName);
    setFormData(prev => ({ ...prev, equipment: equipmentName }));
    setShowEquipmentDropdown(false);
    
    // Clear equipment error if it exists
    if (errors.equipment) {
      setErrors(prev => ({ ...prev, equipment: '' }));
    }
  };

  // Handle location suggestions
  const handleLocationSelect = (location, type) => {
    if (type === 'from') {
      setFormData(prev => ({ ...prev, fromLocation: location }));
      setShowFromLocationDropdown(false);
      if (errors.fromLocation) {
        setErrors(prev => ({ ...prev, fromLocation: '' }));
      }
    } else {
      setFormData(prev => ({ ...prev, toLocation: location }));
      setShowToLocationDropdown(false);
      if (errors.toLocation) {
        setErrors(prev => ({ ...prev, toLocation: '' }));
      }
    }
  };

  // Filter location suggestions based on input
  const getFilteredLocations = (searchTerm) => {
    if (!searchTerm) return locationSuggestions;
    return locationSuggestions.filter(location => 
      location.toLowerCase().includes(searchTerm.toLowerCase())
    );
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

    // Handle location dropdowns
    if (name === 'fromLocation') {
      setShowFromLocationDropdown(value.length > 0);
    } else if (name === 'toLocation') {
      setShowToLocationDropdown(value.length > 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const submissionData = {
        ...formData,
        quantity: parseInt(formData.quantity)
      };

      if (isEdit) {
        await updateTransferMutation.mutateAsync({ 
          id: editData._id || editData.id, 
          data: submissionData 
        });
        toast.success('Transfer updated successfully');
      } else {
        await createTransferMutation.mutateAsync(submissionData);
        toast.success('Transfer created successfully');
      }

      onSuccess?.();
      onClose?.();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'An error occurred while submitting the transfer';
      toast.error(errorMessage);
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
            <div className="personnel-search-container">
              <input
                type="text"
                id="equipment"
                name="equipment"
                value={equipmentSearch}
                onChange={handleEquipmentSearch}
                onFocus={() => setShowEquipmentDropdown(true)}
                className={errors.equipment ? 'error' : ''}
                disabled={loading}
                placeholder="e.g., M16 Rifles, Medical Supplies, Radios"
              />
              
              {showEquipmentDropdown && (
                <div className="personnel-dropdown" ref={equipmentDropdownRef}>
                  {equipmentLoading ? (
                    <div className="personnel-option loading">Loading equipment...</div>
                  ) : availableEquipment.length === 0 ? (
                    <div className="personnel-option loading">No equipment found</div>
                  ) : (
                    availableEquipment.map((equipment) => (
                      <div
                        key={equipment._id}
                        className="personnel-option"
                        onClick={() => handleEquipmentSelect(equipment)}
                      >
                        <div className="personnel-name">
                          {equipment.item}
                        </div>
                        <div className="personnel-details">
                          {equipment.category} • Available: {equipment.quantityAvailable} • Supplier: {equipment.supplier}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
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
            <div className="personnel-search-container">
              <input
                type="text"
                id="fromLocation"
                name="fromLocation"
                value={formData.fromLocation}
                onChange={handleChange}
                onFocus={() => setShowFromLocationDropdown(true)}
                className={errors.fromLocation ? 'error' : ''}
                disabled={loading}
                placeholder="e.g., Warehouse 1, Storage Room 2"
              />
              
              {showFromLocationDropdown && (
                <div className="personnel-dropdown" ref={fromLocationDropdownRef}>
                  {getFilteredLocations(formData.fromLocation).map((location) => (
                    <div
                      key={location}
                      className="personnel-option"
                      onClick={() => handleLocationSelect(location, 'from')}
                    >
                      <div className="personnel-name">{location}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.fromLocation && <span className="error-message">{errors.fromLocation}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="toLocation">Destination Location*</label>
            <div className="personnel-search-container">
              <input
                type="text"
                id="toLocation"
                name="toLocation"
                value={formData.toLocation}
                onChange={handleChange}
                onFocus={() => setShowToLocationDropdown(true)}
                className={errors.toLocation ? 'error' : ''}
                disabled={loading}
                placeholder="e.g., Warehouse 1, Storage Room 2"
              />
              
              {showToLocationDropdown && (
                <div className="personnel-dropdown" ref={toLocationDropdownRef}>
                  {getFilteredLocations(formData.toLocation).map((location) => (
                    <div
                      key={location}
                      className="personnel-option"
                      onClick={() => handleLocationSelect(location, 'to')}
                    >
                      <div className="personnel-name">{location}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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