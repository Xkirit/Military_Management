import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { assignmentService } from '../services/api';
import AssignmentForm from '../components/forms/AssignmentForm';
import '../styles/Table.css';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);

  // Fetch assignments
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await assignmentService.getAllAssignments();
      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // Filter assignments based on search and status
  const filteredAssignments = assignments.filter(assignment => {
    const personnelName = assignment.personnel ? 
      `${assignment.personnel.firstName || ''} ${assignment.personnel.lastName || ''}`.trim() : 
      'N/A';
    
    const matchesSearch = !searchTerm || 
      personnelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.assignment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.unit?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || assignment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Handle create assignment click
  const handleCreateClick = () => {
    setEditData(null);
    setShowForm(true);
  };

  // Handle view click
  const handleViewClick = (id) => {
    // TODO: Implement view details modal or navigation
    toast.info(`View assignment ${id} details coming soon`);
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
        await assignmentService.deleteAssignment(id);
        toast.success('Assignment deleted successfully');
        fetchAssignments(); // Refresh the list
      } catch (error) {
        console.error('Error deleting assignment:', error);
        toast.error('Failed to delete assignment');
      }
    }
  };

  // Handle status update
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await assignmentService.updateStatus(id, { status: newStatus });
      toast.success('Assignment status updated successfully');
      fetchAssignments(); // Refresh the list
    } catch (error) {
      console.error('Error updating assignment status:', error);
      toast.error('Failed to update assignment status');
    }
  };

  // Handle form close
  const handleFormClose = () => {
    setShowForm(false);
    setEditData(null);
  };

  // Handle form success
  const handleFormSuccess = () => {
    fetchAssignments();
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
        <h1>Assignments</h1>
        <button className="primary-button" onClick={handleCreateClick}>
          Create Assignment
        </button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search assignments..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
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

      <div className="table-container">
        {loading ? (
          <div className="loading-message">Loading assignments...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Personnel</th>
                <th>Rank</th>
                <th>Assignment</th>
                <th>Unit</th>
                <th>Location</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan="11" className="no-data-message">
                    No assignments found
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((assignment) => (
                  <tr key={assignment._id || assignment.id}>
                    <td>{assignment._id?.slice(-6) || assignment.id}</td>
                    <td>
                      {assignment.personnel 
                        ? `${assignment.personnel.firstName || ''} ${assignment.personnel.lastName || ''}`.trim()
                        : 'N/A'
                      }
                    </td>
                    <td>{assignment.personnel?.rank || 'N/A'}</td>
                    <td>{assignment.assignment}</td>
                    <td>{assignment.unit}</td>
                    <td>{assignment.location}</td>
                    <td>{new Date(assignment.startDate).toLocaleDateString()}</td>
                    <td>{new Date(assignment.endDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`priority-badge ${assignment.priority?.toLowerCase()}`}>
                        {assignment.priority}
                      </span>
                    </td>
                    <td>
                      <select
                        className={`status-select ${assignment.status.toLowerCase()}`}
                        value={assignment.status}
                        onChange={(e) => handleStatusUpdate(assignment._id || assignment.id, e.target.value)}
                      >
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                        <option value="Pending">Pending</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-button view"
                          onClick={() => handleViewClick(assignment._id || assignment.id)}
                        >
                          View
                        </button>
                        <button 
                          className="action-button edit"
                          onClick={() => handleEditClick(assignment)}
                        >
                          Edit
                        </button>
                        <button 
                          className="action-button delete"
                          onClick={() => handleDelete(assignment._id || assignment.id)}
                        >
                          Delete
                        </button>
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
  );
};

export default Assignments; 