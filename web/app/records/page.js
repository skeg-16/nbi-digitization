'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function RecordsPage() {
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  
  // Form State for Add/Edit
  const [formData, setFormData] = useState({});

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      
      const res = await fetch(`/api/records?${params.toString()}`);
      const result = await res.json();
      if (result.success) {
        setRecords(result.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchRecords();
    }, 500);
    return () => clearTimeout(handler);
  }, [search, fetchRecords]);

  const handleEdit = (record) => {
    setCurrentRecord(record);
    setFormData(record);
    setIsEditModalOpen(true);
  };

  const handleAdd = () => {
    setCurrentRecord(null);
    setFormData({
      record_no: '', date_received: '', ccd_no: '', nbi_ccn: '',
      nature_of_case: '', complainant: '', subject: '', agent_on_case: '',
      age_gender: '', contact_no: '', status: '', re_assigned: ''
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (record) => {
    setCurrentRecord(record);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!currentRecord) return;
    try {
      await fetch(`/api/records/${currentRecord.id}`, { method: 'DELETE' });
      setIsDeleteModalOpen(false);
      fetchRecords();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const submitForm = async (e) => {
    e.preventDefault();
    try {
      if (currentRecord) {
        // Edit
        await fetch(`/api/records/${currentRecord.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        // Add
        await fetch(`/api/records`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      setIsEditModalOpen(false);
      fetchRecords();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg-color)]">
      {/* Action Bar */}
      <div className="action-bar flex flex-col gap-4 p-5 bg-[var(--panel-bg)] border-b border-[var(--border-color)] flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="m-0 text-xl font-semibold text-[var(--text-main)] tracking-wide" style={{ color: "var(--nbi-blue)" }}>
              Complaint Registry
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-formal" onClick={() => router.push('/')}>Home</button>
            <button className="btn-formal btn-primary px-4 py-2" onClick={handleAdd}>+ Add Record</button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input 
              type="text" 
              className="form-input w-72" 
              placeholder="Search complainant, subject, CCD no..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select 
              className="form-select w-40"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Waiting">Waiting</option>
              <option value="Serving">Serving</option>
              <option value="Served">Served</option>
              <option value="Skipped">Skipped</option>
              <option value="No-show">No-show</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Workspace */}
      <div className="grid-workspace p-5 flex-1 overflow-auto">
        <div className="bg-[var(--panel-bg)] rounded-lg border border-[var(--border-color)] overflow-hidden shadow-sm">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date Received</th>
                <th>Record No.</th>
                <th>CCD No.</th>
                <th>Complainant</th>
                <th>Subject</th>
                <th>Nature of Case</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="text-center py-8">Loading data...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-8 text-[var(--text-muted)]">No records found.</td></tr>
              ) : (
                records.map(record => (
                  <tr key={record.id}>
                    <td>{record.date_received || '-'}</td>
                    <td className="font-medium">{record.record_no}</td>
                    <td>{record.ccd_no}</td>
                    <td>{record.complainant}</td>
                    <td>{record.subject}</td>
                    <td className="max-w-[200px] truncate">{record.nature_of_case}</td>
                    <td>
                      <span className="status-badge" data-status={record.status || 'Waiting'}>
                        {record.status || '-'}
                      </span>
                    </td>
                    <td className="text-center space-x-2">
                      <button className="btn-formal text-xs py-1 px-2" onClick={() => handleEdit(record)}>Edit</button>
                      <button className="btn-formal btn-danger text-xs py-1 px-2" onClick={() => handleDelete(record)}>Del</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-[var(--panel-bg)] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-5 border-b border-[var(--border-color)] pb-3">
              <h3 className="text-lg font-bold text-[var(--text-main)]">{currentRecord ? 'Edit Record' : 'Add Record'}</h3>
              <button className="text-[var(--text-muted)] hover:text-black text-xl" onClick={() => setIsEditModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={submitForm}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'record_no', label: 'Record No.' },
                  { key: 'date_received', label: 'Date Received', type: 'date' },
                  { key: 'ccd_no', label: 'CCD No.' },
                  { key: 'nbi_ccn', label: 'NBI-CCN' },
                  { key: 'nature_of_case', label: 'Nature of Case' },
                  { key: 'complainant', label: 'Complainant' },
                  { key: 'subject', label: 'Subject' },
                  { key: 'agent_on_case', label: 'Agent on Case' },
                  { key: 'age_gender', label: 'Age/Gender' },
                  { key: 'contact_no', label: 'Contact No.' },
                  { key: 're_assigned', label: 'Re-assigned' }
                ].map(field => (
                  <div key={field.key} className="flex flex-col">
                    <label className="text-xs font-semibold text-[var(--text-muted)] mb-1">{field.label}</label>
                    <input 
                      type={field.type || 'text'} 
                      name={field.key} 
                      value={formData[field.key] || ''} 
                      onChange={handleFormChange} 
                      className="form-input" 
                    />
                  </div>
                ))}
                
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-[var(--text-muted)] mb-1">Status</label>
                  <select name="status" value={formData.status || ''} onChange={handleFormChange} className="form-select">
                    <option value="">Select Status</option>
                    <option value="Waiting">Waiting</option>
                    <option value="Serving">Serving</option>
                    <option value="Served">Served</option>
                    <option value="Skipped">Skipped</option>
                    <option value="No-show">No-show</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[var(--border-color)]">
                <button type="button" className="btn-formal" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-formal btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-[var(--panel-bg)] rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4 border-b border-[var(--border-color)] pb-3">
              <h3 className="text-lg font-bold text-[var(--red)]">Delete Record</h3>
              <button className="text-[var(--text-muted)] hover:text-black text-xl" onClick={() => setIsDeleteModalOpen(false)}>&times;</button>
            </div>
            <p className="text-sm text-[var(--text-main)] mb-6">
              Are you absolutely sure you want to permanently delete record <strong>{currentRecord?.record_no}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button className="btn-formal" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
              <button className="btn-formal btn-danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
