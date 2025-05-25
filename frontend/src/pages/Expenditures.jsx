import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useExpenditures, useDeleteExpenditure } from '../hooks/useQueries';
import { usePermissions } from '../hooks/usePermissions';
import ExpenditureForm from '../components/forms/ExpenditureForm';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash,
  FaCalendarAlt
} from 'react-icons/fa';
import '../styles/Table.css';

const Expenditures = () => {
  const { canUpdateExpenditure, canDeleteExpenditure, canCreateExpenditure } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);

  // Use React Query for caching
  const { 
    data: expenditures = [], 
    isLoading: loading,
    error 
  } = useExpenditures({
    search: searchTerm,
    category: categoryFilter
  });

  const deleteExpenditureMutation = useDeleteExpenditure();

  // Handle API errors
  React.useEffect(() => {
    if (error) {
      toast.error('Failed to fetch expenditures');
    }
  }, [error]);

  // Filter expenditures based on search and category
  const filteredExpenditures = expenditures.filter(expenditure => {
    const matchesSearch = !searchTerm || 
      expenditure.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expenditure.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expenditure.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expenditure.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expenditure.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !categoryFilter || expenditure.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Handle record expenditure click
  const handleRecordClick = () => {
    setEditData(null);
    setShowForm(true);
  };

  // Handle edit click
  const handleEditClick = (expenditure) => {
    setEditData(expenditure);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expenditure?')) {
      try {
        await deleteExpenditureMutation.mutateAsync(id);
        toast.success('Expenditure deleted successfully');
        // Data will automatically refresh due to query invalidation
      } catch (error) {
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            'Failed to delete expenditure';
        toast.error(errorMessage);
      }
    }
  };

  // Handle form close
  const handleFormClose = () => {
    setShowForm(false);
    setEditData(null);
  };

  // Handle form success - no need to manually refresh, React Query will handle it
  const handleFormSuccess = () => {
    // Data will automatically refresh due to query invalidation in mutations
  };

  return (
    <div className="page-container">
      {showForm && (
        <ExpenditureForm
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
          editData={editData}
        />
      )}

      <div className="page-header">
        <div className="page-title-section">
          <h1>
            Financial Expenditures
          </h1>
          <p className="page-subtitle">Track and manage financial expenditures across departments</p>
        </div>
        {canCreateExpenditure() && (
          <button className="primary-button" onClick={handleRecordClick}>
            <FaPlus />
            Record Expenditure
          </button>
        )}
      </div>

      <div className="filters-section">
        <div className="search-group">
          <input
            type="text"
            placeholder="Search expenditures..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Equipment">Equipment</option>
            <option value="Training">Training</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Operations">Operations</option>
            <option value="Personnel">Personnel</option>
            <option value="Medical">Medical</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header">
          <h3>
            Expenditure Records ({filteredExpenditures.length})
          </h3>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="loading-message">
              <div className="loading-spinner"></div>
              Loading expenditures...
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Department</th>
                  <th>Budget Year</th>
                  <th>Quarter</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenditures.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="no-data-message">
                      <div>No expenditures found</div>
                      <small>Try adjusting your search or filters</small>
                    </td>
                  </tr>
                ) : (
                  filteredExpenditures.map((expenditure) => (
                    <tr key={expenditure._id || expenditure.id}>
                      <td>
                        <code className="code-cell">
                          {expenditure._id?.slice(-6) || expenditure.id}
                        </code>
                      </td>
                      <td>
                        <span className={`category-${expenditure.category?.toLowerCase()}`}>
                          {expenditure.category}
                        </span>
                      </td>
                      <td className="text-cell">
                        <div className="item-name">{expenditure.description}</div>
                        {expenditure.receiptNumber && (
                          <small className="item-details">
                            Receipt: {expenditure.receiptNumber}
                          </small>
                        )}
                      </td>
                      <td className="currency-cell warning-text">
                        ${expenditure.amount?.toLocaleString() || '0'}
                      </td>
                      <td>
                        <span className="primary-text">{expenditure.department}</span>
                      </td>
                      <td className="center-cell secondary-text">
                        {expenditure.budgetYear}
                      </td>
                      <td className="center-cell">
                        <span className="warning-text">Q{expenditure.quarter}</span>
                      </td>
                      <td>
                        <span className={`payment-${expenditure.paymentMethod?.toLowerCase().replace(' ', '-')}`}>
                          {expenditure.paymentMethod}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {canUpdateExpenditure(expenditure.recordedBy?._id || expenditure.recordedBy) && (
                            <button 
                              className="action-button edit"
                              onClick={() => handleEditClick(expenditure)}
                              title="Edit Expenditure"
                            >
                              <FaEdit />
                            </button>
                          )}
                          {canDeleteExpenditure(expenditure.recordedBy?._id || expenditure.recordedBy) && (
                            <button 
                              className="action-button delete"
                              onClick={() => handleDelete(expenditure._id || expenditure.id)}
                              title="Delete Expenditure"
                            >
                              <FaTrash />
                            </button>
                          )}
                          {!canUpdateExpenditure(expenditure.recordedBy?._id || expenditure.recordedBy) && !canDeleteExpenditure(expenditure.recordedBy?._id || expenditure.recordedBy) && (
                            <span className="no-actions">No actions available</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Expenditures; 