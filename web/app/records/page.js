'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function RecordsPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  
  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  
  // Form State for Add/Edit
  const [formData, setFormData] = useState({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login');
      } else {
        setSession(session);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/login');
      } else {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const fetchRecords = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      
      const res = await fetch(`/api/records?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      const result = await res.json();
      if (result.success) {
        setRecords(result.data);
      } else if (res.status === 401) {
        router.push('/login');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, session, router]);

  useEffect(() => {
    if (session) {
      fetchRecords();
    }
  }, [session, fetchRecords]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (session) fetchRecords();
    }, 500);
    return () => clearTimeout(handler);
  }, [search, fetchRecords, session]);

  const handleEdit = (record) => {
    setCurrentRecord(record);
    setFormData(record);
    setIsEditModalOpen(true);
  };

  const handleAdd = () => {
    setCurrentRecord(null);
    setFormData({
      date_received: '', agent_on_case: '', ccd_no: '', 
      nbi_ccn: '', complainant: '', nature_of_case: ''
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (record) => {
    setCurrentRecord(record);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!currentRecord || !session) return;
    try {
      await fetch(`/api/records/${currentRecord.id}`, { 
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
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
    if (!session) return;
    try {
      if (currentRecord) {
        // Edit
        await fetch(`/api/records/${currentRecord.id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`
          },
          body: JSON.stringify(formData)
        });
      } else {
        // Add
        await fetch(`/api/records`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`
          },
          body: JSON.stringify(formData)
        });
      }
      setIsEditModalOpen(false);
      fetchRecords();
    } catch (err) {
      console.error(err);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-[var(--bg-color)] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <svg className="w-12 h-12 text-[var(--nbi-blue)] animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <p className="text-[var(--text-muted)] font-medium">Verifying Secure Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg-color)]">
      {/* Action Bar */}
      <div className="action-bar flex flex-col gap-5 p-6 bg-[var(--panel-bg)] border-b border-[var(--border-color)] flex-shrink-0 shadow-sm z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-[var(--nbi-blue)] rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
              <h2 className="m-0 text-2xl font-extrabold text-[var(--nbi-blue)] tracking-tight">
                {session.user.user_metadata?.full_name || session.user.email}
              </h2>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold mt-1">Official Case Registry</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-formal hover:bg-gray-50" onClick={() => router.push('/')}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              Home
            </button>
            <button className="btn-formal btn-primary px-5 py-2 shadow-md shadow-blue-900/10" onClick={handleAdd}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add Record
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="relative">
            <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              className="form-input w-80 pl-10 bg-gray-50 focus:bg-white" 
              placeholder="Search NBI-CCN, CCD no, complainant..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Grid Workspace */}
      <div className="grid-workspace p-6 flex-1 overflow-auto bg-gray-50/50">
        <div className="bg-[var(--panel-bg)] rounded-xl border border-[var(--border-color)] overflow-hidden shadow-sm">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>CCD No.</th>
                <th>NBI-CCN</th>
                <th>Complainant</th>
                <th>Nature of Case</th>
                <th className="text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-12 text-[var(--text-muted)] font-medium">Loading official records...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-12 text-[var(--text-muted)] font-medium">No records found.</td></tr>
              ) : (
                records.map(record => (
                  <tr key={record.id} className="group transition-colors">
                    <td className="whitespace-nowrap font-medium text-gray-700">{record.date_received || '-'}</td>
                    <td className="font-semibold text-[var(--nbi-blue)]">{record.ccd_no || '-'}</td>
                    <td className="font-mono text-sm bg-gray-50 px-2 py-1 rounded inline-block mt-1.5 border border-gray-100">{record.nbi_ccn || '-'}</td>
                    <td className="font-medium text-gray-900">{record.complainant || '-'}</td>
                    <td className="max-w-[300px] truncate text-gray-600" title={record.nature_of_case}>{record.nature_of_case || '-'}</td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" onClick={() => handleEdit(record)} title="Edit Record">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors" onClick={() => handleDelete(record)} title="Delete Record">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[var(--panel-bg)] rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-6 border-b border-[var(--border-color)] pb-4">
              <h3 className="text-xl font-extrabold text-[var(--nbi-blue)] tracking-tight">{currentRecord ? 'Edit Official Record' : 'Add Official Record'}</h3>
              <button className="text-[var(--text-muted)] hover:text-black hover:bg-gray-100 rounded-full p-1 transition-colors" onClick={() => setIsEditModalOpen(false)}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={submitForm}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { key: 'date_received', label: 'Date', type: 'date' },
                  { key: 'agent_on_case', label: 'Agent on Case' },
                  { key: 'ccd_no', label: 'CCD No.' },
                  { key: 'nbi_ccn', label: 'NBI-CCN' },
                  { key: 'complainant', label: 'Complainant / RP' },
                  { key: 'nature_of_case', label: 'Nature of Case' }
                ].map(field => (
                  <div key={field.key} className="flex flex-col group">
                    <label className="text-xs font-bold text-[var(--text-main)] mb-1.5 uppercase tracking-wide">{field.label}</label>
                    <input 
                      type={field.type || 'text'} 
                      name={field.key} 
                      value={formData[field.key] || ''} 
                      onChange={handleFormChange} 
                      className="form-input bg-gray-50 focus:bg-white transition-colors" 
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-[var(--border-color)]">
                <button type="button" className="btn-formal hover:bg-gray-50" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-formal btn-primary shadow-lg shadow-blue-900/20 px-6">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[var(--panel-bg)] rounded-2xl p-8 w-full max-w-md shadow-2xl border border-red-100">
            <div className="flex items-center gap-3 mb-5 border-b border-red-100 pb-4">
              <div className="bg-red-100 p-2 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-[var(--red)] tracking-tight">Delete Record</h3>
            </div>
            <p className="text-sm text-gray-600 mb-8 leading-relaxed">
              Are you absolutely sure you want to permanently delete this record? This action cannot be undone and will be removed from the official registry.
            </p>
            <div className="flex justify-end gap-3">
              <button className="btn-formal hover:bg-gray-50" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
              <button className="btn-formal btn-danger px-6" onClick={confirmDelete}>Delete Permanently</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
