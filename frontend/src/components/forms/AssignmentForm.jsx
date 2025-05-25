import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { useCreateAssignment, useUpdateAssignment, useUsers } from '../../hooks/useQueries';
import { purchaseService } from '../../services/api';
import './Forms.css';

const AssignmentForm = ({ onClose, onSuccess, editData = null }) => {
  const { user } = useAuth();
  const isEdit = !!editData;
  
  const createAssignmentMutation = useCreateAssignment();
  const updateAssignmentMutation = useUpdateAssignment();

  // Personnel search with React Query
  const [personnelSearchTerm, setPersonnelSearchTerm] = useState('');
  const { 
    data: searchResults, 
    isLoading: searchLoading, 
    error: searchError,
    isEnabled: searchEnabled
  } = useUsers({ 
    search: personnelSearchTerm,
    limit: 20 
  });

  // Ensure searchResults is always an array
  const safeSearchResults = Array.isArray(searchResults) ? searchResults : [];

  useEffect(() => {
    // React Query state monitoring for personnel search
  }, [personnelSearchTerm, safeSearchResults, searchLoading, searchError, searchEnabled]);

  // Refs for click outside detection
  const personnelDropdownRef = useRef(null);
  const equipmentDropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    personnel: editData?.personnel?._id || editData?.personnel || '',
    assignment: editData?.assignment || '',
    unit: editData?.unit || '',
    duties: editData?.duties?.join('\n') || '',
    description: editData?.description || '',
    equipmentPurchase: editData?.equipmentPurchase?._id || editData?.equipmentPurchase || '',
    equipmentQuantity: editData?.equipmentQuantity || 1
  });

  const [errors, setErrors] = useState({});
  const loading = createAssignmentMutation.isPending || updateAssignmentMutation.isPending;
  
  // Personnel search state
  const [personnelSearch, setPersonnelSearch] = useState('');
  const [showPersonnelDropdown, setShowPersonnelDropdown] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState(null);

  // Equipment search state
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [showEquipmentDropdown, setShowEquipmentDropdown] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [equipmentLoading, setEquipmentLoading] = useState(false);

  // Debounce refs
  const personnelSearchTimeout = useRef(null);
  const equipmentSearchTimeout = useRef(null);

  // Initialize selected personnel if editing
  useEffect(() => {
    if (editData?.personnel && typeof editData.personnel === 'object') {
      setSelectedPersonnel(editData.personnel);
      setPersonnelSearch(`${editData.personnel.firstName} ${editData.personnel.lastName} (${editData.personnel.role})`);
    }
  }, [editData]);

  // Initialize selected equipment if editing
  useEffect(() => {
    if (editData?.equipmentPurchase && typeof editData.equipmentPurchase === 'object') {
      setSelectedEquipment(editData.equipmentPurchase);
      setEquipmentSearch(`${editData.equipmentPurchase.item} (${editData.equipmentPurchase.category})`);
    }
  }, [editData]);

  // Load available equipment on component mount
  useEffect(() => {
    searchEquipment('');
  }, []);

  // Handle search errors
  useEffect(() => {
    if (searchError) {
      toast.error('Failed to search personnel: ' + (searchError.response?.data?.message || searchError.message));
    }
  }, [searchError]);

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
      toast.error('Failed to search equipment: ' + (error.response?.data?.message || error.message));
    } finally {
      setEquipmentLoading(false);
    }
  };

  // Click outside detection
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (personnelDropdownRef.current && !personnelDropdownRef.current.contains(event.target)) {
        setShowPersonnelDropdown(false);
      }
      if (equipmentDropdownRef.current && !equipmentDropdownRef.current.contains(event.target)) {
        setShowEquipmentDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      // Cleanup timeouts
      clearTimeout(personnelSearchTimeout.current);
      clearTimeout(equipmentSearchTimeout.current);
    };
  }, []);

  // Handle personnel search input
  const handlePersonnelSearch = (e) => {
    const value = e.target.value;
    setPersonnelSearch(value);
    setShowPersonnelDropdown(true);
    
    // Clear selected personnel if user is typing
    if (selectedPersonnel) {
      setSelectedPersonnel(null);
      setFormData(prev => ({ ...prev, personnel: '' }));
    }
    
    // Debounce search with React Query
    clearTimeout(personnelSearchTimeout.current);
    personnelSearchTimeout.current = setTimeout(() => {
      setPersonnelSearchTerm(value);
    }, 300);
  };

  // Handle equipment search input
  const handleEquipmentSearch = (e) => {
    const value = e.target.value;
    setEquipmentSearch(value);
    setShowEquipmentDropdown(true);
    
    // Clear selected equipment if user is typing
    if (selectedEquipment) {
      setSelectedEquipment(null);
      setFormData(prev => ({ ...prev, equipmentPurchase: '', equipmentQuantity: 1 }));
    }
    
    // Debounce search
    clearTimeout(equipmentSearchTimeout.current);
    equipmentSearchTimeout.current = setTimeout(() => searchEquipment(value), 300);
  };

  // Handle personnel selection
  const handlePersonnelSelect = (personnel) => {
    setSelectedPersonnel(personnel);
    setPersonnelSearch(`${personnel.firstName} ${personnel.lastName} (${personnel.role})`);
    setFormData(prev => ({ ...prev, personnel: personnel._id }));
    setShowPersonnelDropdown(false);
    
    // Clear personnel error if it exists
    if (errors.personnel) {
      setErrors(prev => ({ ...prev, personnel: '' }));
    }
  };

  // Handle equipment selection
  const handleEquipmentSelect = (equipment) => {
    setSelectedEquipment(equipment);
    setEquipmentSearch(`${equipment.item} (${equipment.category})`);
    setFormData(prev => ({ 
      ...prev, 
      equipmentPurchase: equipment._id,
      equipmentQuantity: 1
    }));
    setShowEquipmentDropdown(false);
    
    // Clear equipment error if it exists
    if (errors.equipmentQuantity) {
      setErrors(prev => ({ ...prev, equipmentQuantity: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.personnel) newErrors.personnel = 'Personnel selection is required';
    if (!formData.assignment) newErrors.assignment = 'Assignment title is required';
    if (!formData.unit) newErrors.unit = 'Unit is required';
    if (!formData.duties) newErrors.duties = 'Duties are required';
    if (!formData.equipmentQuantity || formData.equipmentQuantity <= 0) {
      newErrors.equipmentQuantity = 'Equipment quantity is required and must be at least 1';
    }
    
    // Validate equipment quantity if equipment is selected
    if (selectedEquipment && formData.equipmentQuantity > selectedEquipment.quantityAvailable) {
      newErrors.equipmentQuantity = `Only ${selectedEquipment.quantityAvailable} units available`;
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
        equipmentQuantity: parseInt(formData.equipmentQuantity)
      };

      if (isEdit) {
        await updateAssignmentMutation.mutateAsync({ 
          id: editData._id || editData.id, 
          data: submissionData 
        });
        toast.success('Assignment updated successfully');
      } else {
        await createAssignmentMutation.mutateAsync(submissionData);
        toast.success('Assignment created successfully');
      }

      onSuccess?.();
      onClose?.();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'An error occurred while submitting the assignment';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Assignment' : 'Create New Assignment'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="form-container">
          {/* Personnel Search Section */}
          <div className="form-group">
            <label htmlFor="personnelSearch">Search & Select Personnel*</label>
            <div className="personnel-search-container">
              <input
                type="text"
                id="personnelSearch"
                value={personnelSearch}
                onChange={handlePersonnelSearch}
                onFocus={() => setShowPersonnelDropdown(true)}
                className={errors.personnel ? 'error' : ''}
                disabled={loading}
                placeholder="Type at least 2 characters to search by name, email, or rank..."
              />
              
              {showPersonnelDropdown && (
                <div className="personnel-dropdown" ref={personnelDropdownRef}>
                  {searchLoading ? (
                    <div className="personnel-option loading">Searching...</div>
                  ) : personnelSearchTerm.length < 2 ? (
                    <div className="personnel-option loading">Type at least 2 characters to search...</div>
                  ) : safeSearchResults.length === 0 ? (
                    <div className="personnel-option loading">No personnel found</div>
                  ) : (
                    safeSearchResults.map((person) => (
                      <div
                        key={person._id}
                        className="personnel-option"
                        onClick={() => handlePersonnelSelect(person)}
                      >
                        <div className="personnel-name">
                          {person.firstName} {person.lastName}
                        </div>
                        <div className="personnel-details">
                          {person.role} • {person.department} • {person.email}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            {errors.personnel && <span className="error-message">{errors.personnel}</span>}
            
            {selectedPersonnel && (
              <div className="selected-personnel">
                <strong>Selected:</strong> {selectedPersonnel.firstName} {selectedPersonnel.lastName} 
                ({selectedPersonnel.role}) - {selectedPersonnel.department}
              </div>
            )}
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
              placeholder="e.g., Security Detail, Training Mission, Equipment Maintenance"
            />
            {errors.assignment && <span className="error-message">{errors.assignment}</span>}
          </div>

          <div className="form-row">
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
              placeholder="Enter duties, one per line&#10;e.g., Guard duty&#10;Equipment maintenance&#10;Report writing&#10;Training new personnel"
            />
            {errors.duties && <span className="error-message">{errors.duties}</span>}
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
              placeholder="Additional assignment details, special instructions, or notes..."
            />
          </div>

          {/* Equipment Assignment Section */}
          <div className="equipment-section">
            <h3>Equipment Assignment (Optional)</h3>
            
            <div className="form-group">
              <label htmlFor="equipmentSearch">Search & Select Equipment</label>
              <div className="personnel-search-container">
                <input
                  type="text"
                  id="equipmentSearch"
                  value={equipmentSearch}
                  onChange={handleEquipmentSearch}
                  onFocus={() => setShowEquipmentDropdown(true)}
                  disabled={loading}
                  placeholder="Type to search available equipment..."
                />
                
                {showEquipmentDropdown && (
                  <div className="personnel-dropdown" ref={equipmentDropdownRef}>
                    {equipmentLoading ? (
                      <div className="personnel-option loading">Loading equipment...</div>
                    ) : availableEquipment.length === 0 ? (
                      <div className="personnel-option loading">No available equipment found</div>
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
              
              {selectedEquipment && (
                <div className="selected-personnel">
                  <strong>Selected Equipment:</strong> {selectedEquipment.item} ({selectedEquipment.category})
                  <br />
                  <small>Available: {selectedEquipment.quantityAvailable} units • Supplier: {selectedEquipment.supplier}</small>
                </div>
              )}
            </div>

            {selectedEquipment && (
              <div className="form-group">
                <label htmlFor="equipmentQuantity">Equipment Quantity*</label>
                <input
                  type="number"
                  id="equipmentQuantity"
                  name="equipmentQuantity"
                  value={formData.equipmentQuantity}
                  onChange={handleChange}
                  min="1"
                  max={selectedEquipment?.quantityAvailable || 999}
                  className={errors.equipmentQuantity ? 'error' : ''}
                  disabled={loading}
                  placeholder="1"
                />
                {errors.equipmentQuantity && <span className="error-message">{errors.equipmentQuantity}</span>}
                <small>Maximum available: {selectedEquipment.quantityAvailable} units</small>
              </div>
            )}
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