import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { useCreatePurchase, useUpdatePurchase } from '../../hooks/useQueries';
import { purchaseService } from '../../services/api';
import './Forms.css';

const PurchaseForm = ({ onClose, onSuccess, editData = null }) => {
  const { user } = useAuth();
  const isEdit = !!editData;
  
  const createPurchaseMutation = useCreatePurchase();
  const updatePurchaseMutation = useUpdatePurchase();

  // Refs for click outside detection
  const itemDropdownRef = useRef(null);
  const supplierDropdownRef = useRef(null);

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
  const loading = createPurchaseMutation.isPending || updatePurchaseMutation.isPending;

  // Search states
  const [itemSearch, setItemSearch] = useState(editData?.item || '');
  const [supplierSearch, setSupplierSearch] = useState(editData?.supplier || '');
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [availableItems, setAvailableItems] = useState([]);
  const [itemSearchLoading, setItemSearchLoading] = useState(false);

  // Predefined suppliers based on category
  const supplierSuggestions = {
    'Weapons': ['Defense Systems Inc', 'Military Arms Corp', 'Tactical Equipment Ltd'],
    'Vehicles': ['Defense Motors', 'Military Vehicle Systems', 'Tactical Transport Co'],
    'Communications': ['Defense Communications', 'Military Radio Corp', 'Tactical Comms Ltd'],
    'Medical': ['Medical Supply Corp', 'Healthcare Systems Inc', 'Emergency Medical Ltd'],
    'Protective': ['Body Armor Corp', 'Protection Systems Inc', 'Safety Equipment Ltd'],
    'Office Supplies': ['Office Depot', 'Staples', 'Corporate Supplies Inc'],
    'Other': ['General Supply Corp', 'Multi-Purpose Equipment Inc']
  };

  // Category-based item suggestions
  const itemSuggestions = {
    'Weapons': ['M16 Rifle', 'M4 Carbine', 'Glock 19', 'Ammunition 5.56mm', 'Holsters'],
    'Vehicles': ['Humvee', 'Transport Truck', 'Motorcycle', 'ATV', 'Maintenance Vehicle'],
    'Communications': ['Radio Handset', 'Satellite Phone', 'Antenna System', 'Encryption Device'],
    'Medical': ['First Aid Kit', 'Trauma Kit', 'Medical Supplies', 'Defibrillator', 'Stretcher'],
    'Protective': ['Bulletproof Vest', 'Helmet', 'Knee Pads', 'Safety Goggles', 'Gas Mask'],
    'Office Supplies': ['Computers', 'Printers', 'Paper', 'Stationery', 'Furniture'],
    'Other': ['Tools', 'Equipment Parts', 'Maintenance Supplies', 'Training Materials']
  };

  // Debounce refs
  const itemSearchTimeout = useRef(null);

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

  // Search available items
  const searchItems = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setAvailableItems([]);
      return;
    }

    setItemSearchLoading(true);
    try {
      const response = await purchaseService.getAvailableEquipment({ 
        search: searchTerm,
        limit: 15 
      });
      setAvailableItems(response.data);
    } catch (error) {
      // Don't show error toast as this is optional
    } finally {
      setItemSearchLoading(false);
    }
  };

  // Click outside detection
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (itemDropdownRef.current && !itemDropdownRef.current.contains(event.target)) {
        setShowItemDropdown(false);
      }
      if (supplierDropdownRef.current && !supplierDropdownRef.current.contains(event.target)) {
        setShowSupplierDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      clearTimeout(itemSearchTimeout.current);
    };
  }, []);

  // Handle item search
  const handleItemSearch = (e) => {
    const value = e.target.value;
    setItemSearch(value);
    setFormData(prev => ({ ...prev, item: value }));
    setShowItemDropdown(true);
    
    // Clear error when user starts typing
    if (errors.item) {
      setErrors(prev => ({ ...prev, item: '' }));
    }
    
    // Debounce search
    clearTimeout(itemSearchTimeout.current);
    itemSearchTimeout.current = setTimeout(() => searchItems(value), 300);
  };

  // Handle item selection
  const handleItemSelect = (item) => {
    const itemName = typeof item === 'string' ? item : item.item;
    setItemSearch(itemName);
    setFormData(prev => ({ ...prev, item: itemName }));
    setShowItemDropdown(false);
    
    // Auto-fill category if available
    if (typeof item === 'object' && item.category && !formData.category) {
      setFormData(prev => ({ ...prev, category: item.category }));
    }
    
    // Clear item error if it exists
    if (errors.item) {
      setErrors(prev => ({ ...prev, item: '' }));
    }
  };

  // Handle supplier search
  const handleSupplierSearch = (e) => {
    const value = e.target.value;
    setSupplierSearch(value);
    setFormData(prev => ({ ...prev, supplier: value }));
    setShowSupplierDropdown(value.length > 0);
    
    // Clear error when user starts typing
    if (errors.supplier) {
      setErrors(prev => ({ ...prev, supplier: '' }));
    }
  };

  // Handle supplier selection
  const handleSupplierSelect = (supplier) => {
    setSupplierSearch(supplier);
    setFormData(prev => ({ ...prev, supplier }));
    setShowSupplierDropdown(false);
    
    // Clear supplier error if it exists
    if (errors.supplier) {
      setErrors(prev => ({ ...prev, supplier: '' }));
    }
  };

  // Get filtered suggestions
  const getFilteredItems = () => {
    const suggestions = formData.category ? itemSuggestions[formData.category] || [] : [];
    if (!itemSearch) return suggestions;
    return suggestions.filter(item => 
      item.toLowerCase().includes(itemSearch.toLowerCase())
    );
  };

  const getFilteredSuppliers = () => {
    const suggestions = formData.category ? supplierSuggestions[formData.category] || [] : 
                       Object.values(supplierSuggestions).flat();
    if (!supplierSearch) return suggestions;
    return suggestions.filter(supplier => 
      supplier.toLowerCase().includes(supplierSearch.toLowerCase())
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

    // Update item search when category changes
    if (name === 'category') {
      setShowItemDropdown(itemSearch.length > 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const submitData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        unitPrice: parseFloat(formData.unitPrice),
        department: user.department,
        requestedBy: user._id,
        status: editData?.status || 'Pending'
      };

      if (isEdit) {
        await updatePurchaseMutation.mutateAsync({ 
          id: editData._id, 
          data: submitData 
        });
        toast.success('Purchase updated successfully');
      } else {
        await createPurchaseMutation.mutateAsync(submitData);
        toast.success('Purchase created successfully');
      }

      onSuccess?.();
      onClose?.();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'An error occurred while submitting the purchase';
      toast.error(errorMessage);
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
            <div className="personnel-search-container">
              <input
                type="text"
                id="item"
                name="item"
                value={itemSearch}
                onChange={handleItemSearch}
                onFocus={() => setShowItemDropdown(true)}
                className={errors.item ? 'error' : ''}
                disabled={loading}
                placeholder="Type to search or select from suggestions..."
              />
              
              {showItemDropdown && (
                <div className="personnel-dropdown" ref={itemDropdownRef}>
                  {itemSearchLoading ? (
                    <div className="personnel-option loading">Searching items...</div>
                  ) : (
                    <>
                      {/* Show available equipment from API */}
                      {availableItems.length > 0 && (
                        <>
                          <div className="dropdown-section-header">Available Equipment</div>
                          {availableItems.map((item) => (
                            <div
                              key={item._id}
                              className="personnel-option"
                              onClick={() => handleItemSelect(item)}
                            >
                              <div className="personnel-name">{item.item}</div>
                              <div className="personnel-details">
                                {item.category} • Available: {item.quantityAvailable} • ${item.unitPrice || 'N/A'}
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                      
                      {/* Show category-based suggestions */}
                      {getFilteredItems().length > 0 && (
                        <>
                          <div className="dropdown-section-header">
                            {formData.category ? `${formData.category} Suggestions` : 'Common Items'}
                          </div>
                          {getFilteredItems().map((item) => (
                            <div
                              key={item}
                              className="personnel-option"
                              onClick={() => handleItemSelect(item)}
                            >
                              <div className="personnel-name">{item}</div>
                            </div>
                          ))}
                        </>
                      )}
                      
                      {availableItems.length === 0 && getFilteredItems().length === 0 && (
                        <div className="personnel-option loading">No items found</div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
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
            <div className="personnel-search-container">
              <input
                type="text"
                id="supplier"
                name="supplier"
                value={supplierSearch}
                onChange={handleSupplierSearch}
                onFocus={() => setShowSupplierDropdown(true)}
                className={errors.supplier ? 'error' : ''}
                disabled={loading}
                placeholder="Type to search or select from suggestions..."
              />
              
              {showSupplierDropdown && (
                <div className="personnel-dropdown" ref={supplierDropdownRef}>
                  {getFilteredSuppliers().length > 0 ? (
                    <>
                      <div className="dropdown-section-header">
                        {formData.category ? `${formData.category} Suppliers` : 'Suggested Suppliers'}
                      </div>
                      {getFilteredSuppliers().map((supplier) => (
                        <div
                          key={supplier}
                          className="personnel-option"
                          onClick={() => handleSupplierSelect(supplier)}
                        >
                          <div className="personnel-name">{supplier}</div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="personnel-option loading">No suppliers found</div>
                  )}
                </div>
              )}
            </div>
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