import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAssignments, useDeleteAssignment, useUpdateAssignment, useUpdateAssignmentStatus } from '../hooks/useQueries';
import { usePermissions } from '../hooks/usePermissions';
import AssignmentForm from '../components/forms/AssignmentForm';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash
} from 'react-icons/fa';
import '../styles/Table.css';

const Assignments = () => {
  const { canUpdateAssignment, canDeleteAssignment, canCreateAssignment, canUpdateAssignmentStatus } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);

  // Use React Query for caching
  const { 
    data: assignments = [], 
    isLoading: loading,
    error 
  } = useAssignments({
    search: searchTerm,
    status: statusFilter
  });

  const deleteAssignmentMutation = useDeleteAssignment();
  const updateAssignmentMutation = useUpdateAssignment();
  const updateAssignmentStatusMutation = useUpdateAssignmentStatus();

  // Handle API errors
  React.useEffect(() => {
    if (error) {
      toast.error('Failed to fetch assignments');
    }
  }, [error]);

  // Filter assignments based on search and status
  const filteredAssignments = assignments.filter(assignment => {
    const personnelName = assignment.personnel ? 
      `${assignment.personnel.firstName || ''} ${assignment.personnel.lastName || ''}`.trim() : 
      'N/A';
    
    const equipmentName = assignment.equipmentPurchase?.item || assignment.equipment || '';
    const equipmentCategory = assignment.equipmentPurchase?.category || assignment.equipmentType || '';
    
    const matchesSearch = !searchTerm || 
      personnelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.assignment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.unit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipmentCategory.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || assignment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Handle create assignment click
  const handleCreateClick = () => {
    setEditData(null);
    setShowForm(true);
  };

  // Handle edit click
  const handleEditClick = (assignment) => {
    setEditData(assignment);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await deleteAssignmentMutation.mutateAsync(id);
        toast.success('Assignment deleted successfully');
        // Data will automatically refresh due to query invalidation
      } catch (error) {
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            'Failed to delete assignment';
        toast.error(errorMessage);
      }
    }
  };

  // Handle status update
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateAssignmentStatusMutation.mutateAsync({ 
        id, 
        status: newStatus 
      });
      toast.success('Assignment status updated successfully');
      // Data will automatically refresh due to query invalidation
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to update assignment status';
      toast.error(errorMessage);
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
        <AssignmentForm
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
          editData={editData}
        />
      )}

      <div className="page-header">
        <div className="page-title-section">
          <h1>
            Personnel Assignments
          </h1>
          <p className="page-subtitle">Manage personnel assignments and equipment allocation</p>
        </div>
        {canCreateAssignment() && (
          <button className="primary-button" onClick={handleCreateClick}>
            <FaPlus />
            Create Assignment
          </button>
        )}
      </div>

      <div className="filters-section">
        <div className="search-group">
          <input
            type="text"
            placeholder="Search assignments, personnel, equipment..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header">
          <h3>
            Assignment Records ({filteredAssignments.length})
          </h3>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="loading-message">
              <div className="loading-spinner"></div>
              Loading assignments...
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Personnel</th>
                  <th>Role</th>
                  <th>Assignment</th>
                  <th>Unit</th>
                  <th>Equipment</th>
                  <th>Qty</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="no-data-message">
                      <div>No assignments found</div>
                      <small>Try adjusting your search or filters</small>
                    </td>
                  </tr>
                ) : (
                  filteredAssignments.map((assignment) => (
                    <tr key={assignment._id || assignment.id}>
                      <td>
                        <code className="code-cell">
                          {assignment._id?.slice(-6) || assignment.id}
                        </code>
                      </td>
                      <td className="text-cell">
                        {assignment.personnel 
                          ? `${assignment.personnel.firstName || ''} ${assignment.personnel.lastName || ''}`.trim()
                          : 'N/A'
                        }
                      </td>
                      <td>
                        <span className="primary-text">
                          {assignment.personnel?.role || 'N/A'}
                        </span>
                      </td>
                      <td className="text-cell">{assignment.assignment}</td>
                      <td>{assignment.unit}</td>
                      <td className="text-cell">
                        {assignment.equipmentPurchase ? (
                          <>
                            <div className="item-name">
                              {assignment.equipmentPurchase.item}
                            </div>
                          </>
                        ) : assignment.equipmentType || assignment.equipment ? (
                          <>
                            {assignment.equipmentType && (
                              <span className="item-name">{assignment.equipmentType}</span>
                            )}
                            {assignment.equipment && (
                              <div className="item-details">{assignment.equipment}</div>
                            )}
                          </>
                        ) : (
                          <span className="secondary-text">No Equipment</span>
                        )}
                      </td>
                      <td className="center-cell">{assignment.equipmentQuantity || 'N/A'}</td>
                      <td>
                        {canUpdateAssignmentStatus(assignment.assignedBy?._id || assignment.assignedBy) ? (
                          <select
                            className={`status-select status-${assignment.status.toLowerCase()}`}
                            value={assignment.status}
                            onChange={(e) => handleStatusUpdate(assignment._id || assignment.id, e.target.value)}
                          >
                            <option value="Active">Active</option>
                            <option value="Completed">Completed</option>
                            <option value="Pending">Pending</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        ) : (
                          <span className={`status-badge status-${assignment.status.toLowerCase()}`}>
                            {assignment.status}
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          {canUpdateAssignment(assignment.assignedBy?._id || assignment.assignedBy) && (
                            <button 
                              className="action-button edit"
                              onClick={() => handleEditClick(assignment)}
                              title="Edit Assignment"
                            >
                              <FaEdit />
                            </button>
                          )}
                          {canDeleteAssignment(assignment.assignedBy?._id || assignment.assignedBy) && (
                            <button 
                              className="action-button delete"
                              onClick={() => handleDelete(assignment._id || assignment.id)}
                              title="Delete Assignment"
                            >
                              <FaTrash />
                            </button>
                          )}
                          {!canUpdateAssignment(assignment.assignedBy?._id || assignment.assignedBy) && !canDeleteAssignment(assignment.assignedBy?._id || assignment.assignedBy) && (
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

export default Assignments; 