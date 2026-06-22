'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import { logout } from '../login/actions';
import ThemeToggle from '../../components/ThemeToggle';

export default function RecordsPage() {
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [agentFilter, setAgentFilter] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 20;

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [currentRecord, setCurrentRecord] = useState(null);
  
  // Form State for Add/Edit
  const [formData, setFormData] = useState({});
  const [agentName, setAgentName] = useState('Loading...');

  const supabase = createClient();

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('page', page);
      params.append('limit', limit);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (agentFilter) params.append('agent', agentFilter);
      
      const res = await fetch(`/api/records?${params.toString()}`);
      const result = await res.json();
      if (result.success) {
        setRecords(result.data);
        setTotalCount(result.count || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, page, limit, startDate, endDate, agentFilter]);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.user_metadata && user.user_metadata.name) {
        setAgentName(user.user_metadata.name);
      } else if (user) {
        setAgentName(user.email);
      } else {
        setAgentName('Guest');
      }
    }
    getUser();
    fetchRecords();
  }, [fetchRecords, supabase.auth]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1); // Reset to first page on new search
      fetchRecords();
    }, 500);
    return () => clearTimeout(handler);
  }, [search, startDate, endDate, agentFilter]);

  useEffect(() => {
    fetchRecords();
  }, [page]);

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
    if (!currentRecord) return;
    try {
      await fetch(`/api/records/${currentRecord.id}`, { method: 'DELETE' });
      setIsDeleteModalOpen(false);
      fetchRecords();
    } catch (err) {
      console.error(err);
    }
  };

  const submitForm = async (e) => {
    e.preventDefault();
    try {
      if (currentRecord) {
        await fetch(`/api/records/${currentRecord.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
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

  const handleExportCSV = () => {
    const headers = ['Date', 'CCD No.', 'NBI-CCN', 'Complainant', 'Nature of Case'];
    const csvContent = [
      headers.join(','),
      ...records.map(r => [
        `"${r.date_received || ''}"`,
        `"${r.ccd_no || ''}"`,
        `"${r.nbi_ccn || ''}"`,
        `"${r.complainant || ''}"`,
        `"${(r.nature_of_case || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `records_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    import('jspdf').then(({ default: jsPDF }) => {
      import('jspdf-autotable').then(({ default: autoTable }) => {
        const doc = new jsPDF();
        doc.text('Cybercrime Division - Official Records', 14, 15);
        autoTable(doc, {
          startY: 20,
          head: [['Date', 'CCD No.', 'NBI-CCN', 'Complainant', 'Nature of Case']],
          body: records.map(r => [
            r.date_received || '',
            r.ccd_no || '',
            r.nbi_ccn || '',
            r.complainant || '',
            r.nature_of_case || ''
          ]),
          styles: { fontSize: 8 },
        });
        doc.save(`records_export_${new Date().toISOString().split('T')[0]}.pdf`);
      });
    });
  };

  const viewAuditLogs = async (record) => {
    setCurrentRecord(record);
    setIsAuditModalOpen(true);
    setAuditLogs([]);
    try {
      const res = await fetch(`/api/records/${record.id}/audit`);
      const result = await res.json();
      if (result.success) {
        setAuditLogs(result.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg-color)]">
      <div className="action-bar flex flex-col gap-5 p-6 bg-[var(--panel-bg)] border-b border-[var(--border-color)] flex-shrink-0 shadow-sm z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-[var(--nbi-gold)] rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-[var(--bg-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
              <h2 className="m-0 text-2xl font-extrabold text-[var(--text-accent)] tracking-tight">
                {agentName}
              </h2>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold mt-1">Official Case Registry</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="w-px h-6 bg-[var(--border-color)] mx-1"></div>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[var(--text-main)] bg-[var(--icon-circle-bg)] hover:bg-[var(--hover-translucent)] rounded-full transition-all border border-transparent hover:border-[var(--border-color)]" onClick={() => router.push('/')}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              Home
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[var(--text-main)] bg-[var(--icon-circle-bg)] hover:bg-[var(--hover-translucent)] rounded-full transition-all border border-transparent hover:border-[var(--border-color)]" onClick={() => setShowFilters(!showFilters)}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              Filters
            </button>
            <div className="relative group z-20">
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[var(--text-main)] bg-[var(--icon-circle-bg)] hover:bg-[var(--hover-translucent)] rounded-full transition-all border border-transparent hover:border-[var(--border-color)]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                Export
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div className="absolute right-0 mt-2 w-40 bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col py-2 overflow-hidden">
                <button className="w-full text-left px-4 py-2.5 text-sm text-[var(--text-main)] hover:bg-[var(--hover-translucent)] flex items-center gap-2" onClick={handleExportCSV}>
                  <span className="font-mono text-[10px] bg-[var(--icon-circle-bg)] px-1.5 py-0.5 rounded text-[var(--text-muted)]">CSV</span> Data Export
                </button>
                <button className="w-full text-left px-4 py-2.5 text-sm text-[var(--text-main)] hover:bg-[var(--hover-translucent)] flex items-center gap-2" onClick={handleExportPDF}>
                  <span className="font-mono text-[10px] bg-[var(--icon-circle-bg)] px-1.5 py-0.5 rounded text-[var(--text-muted)]">PDF</span> Report Form
                </button>
              </div>
            </div>
            <div className="w-px h-6 bg-[var(--border-color)] mx-1"></div>
            <button className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-[#0b1d3a] bg-[var(--nbi-gold)] hover:bg-[#FFB800] hover:-translate-y-0.5 rounded-full transition-all shadow-[0_4px_12px_var(--focus-ring)] ml-1" onClick={handleAdd}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
              Add Record
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[var(--red)] bg-red-500/10 hover:bg-red-500/20 rounded-full transition-all ml-1" onClick={() => logout()}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Logout
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <input type="text" className="form-input w-80" placeholder="Search NBI-CCN, CCD no..." value={search} onChange={(e) => setSearch(e.target.value)} />
          {showFilters && (
            <div className="flex items-end gap-4 p-4 bg-[var(--panel-translucent)] rounded-xl border border-[var(--border-color)] mt-2">
              <div className="flex flex-col flex-1">
                <label className="text-xs font-bold text-[var(--text-muted)] mb-1.5 uppercase">Start Date</label>
                <input type="date" className="form-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="flex flex-col flex-1">
                <label className="text-xs font-bold text-[var(--text-muted)] mb-1.5 uppercase">End Date</label>
                <input type="date" className="form-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
              <div className="flex flex-col flex-1">
                <label className="text-xs font-bold text-[var(--text-muted)] mb-1.5 uppercase">Agent</label>
                <input type="text" className="form-input" value={agentFilter} onChange={e => setAgentFilter(e.target.value)} />
              </div>
              <button className="btn-formal text-[var(--text-main)] h-[42px]" onClick={() => { setStartDate(''); setEndDate(''); setAgentFilter(''); }}>Clear</button>
            </div>
          )}
        </div>
      </div>

      <div className="grid-workspace p-6 flex-1 overflow-auto bg-[var(--bg-secondary)]">
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
                <tr><td colSpan="6" className="text-center py-12 text-[var(--text-muted)] font-medium">Loading...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-12 text-[var(--text-muted)] font-medium">No records found.</td></tr>
              ) : (
                records.map(record => (
                  <tr key={record.id} className="group">
                    <td className="font-semibold text-[var(--nbi-gold)]">{record.date_received ? new Date(record.date_received).toLocaleDateString() : '-'}</td>
                    <td className="font-mono text-sm text-[var(--text-muted)] bg-[var(--hover-translucent)] px-2 py-1 rounded inline-block mt-2">
                      {record.ccd_no || '-'}
                    </td>
                    <td className="font-mono text-[var(--text-main)] font-semibold">{record.nbi_ccn || '-'}</td>
                    <td className="font-medium text-[var(--text-main)]">{record.complainant || '-'}</td>
                    <td className="max-w-[300px] truncate text-[var(--text-muted)]" title={record.nature_of_case}>{record.nature_of_case || '-'}</td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--hover-translucent)] rounded-md" onClick={() => viewAuditLogs(record)}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></button>
                        <button className="p-1.5 text-blue-500 hover:bg-[var(--hover-translucent)] rounded-md" onClick={() => handleEdit(record)}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                        <button className="p-1.5 text-[var(--red)] hover:bg-[var(--hover-translucent)] rounded-md" onClick={() => handleDelete(record)}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="flex items-center justify-between p-4 border-t border-[var(--border-color)]">
            <span className="text-sm text-[var(--text-muted)]">Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalCount)} of {totalCount} entries</span>
            <div className="flex items-center gap-2">
              <button className="btn-formal text-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
              <button className="btn-formal text-sm" onClick={() => setPage(p => p + 1)} disabled={page * limit >= totalCount}>Next</button>
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-[var(--panel-bg)] rounded-2xl p-8 w-full max-w-md shadow-2xl border border-[var(--border-color)]">
            <h3 className="text-xl font-bold text-[var(--text-main)] mb-6">{currentRecord ? 'Edit Record' : 'Add New Record'}</h3>
            <form onSubmit={submitForm} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] mb-1 uppercase tracking-wide block">NBI CCN</label>
                <input type="text" className="form-input w-full" value={formData.nbi_ccn || ''} onChange={e => setFormData({...formData, nbi_ccn: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] mb-1 uppercase tracking-wide block">CCD No</label>
                <input type="text" className="form-input w-full" value={formData.ccd_no || ''} onChange={e => setFormData({...formData, ccd_no: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] mb-1 uppercase tracking-wide block">Date Received</label>
                <input type="date" className="form-input w-full" value={formData.date_received || ''} onChange={e => setFormData({...formData, date_received: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] mb-1 uppercase tracking-wide block">Complainant</label>
                <input type="text" className="form-input w-full" value={formData.complainant || ''} onChange={e => setFormData({...formData, complainant: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] mb-1 uppercase tracking-wide block">Nature of Case</label>
                <textarea className="form-input w-full" rows="3" value={formData.nature_of_case || ''} onChange={e => setFormData({...formData, nature_of_case: e.target.value})}></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" className="btn-formal text-[var(--text-main)] hover:bg-[var(--hover-translucent)]" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-formal btn-primary">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[var(--panel-bg)] rounded-2xl p-8 w-full max-w-sm shadow-2xl border border-[var(--border-color)] text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-[var(--red)] mx-auto mb-4">
              <svg className="w-8 h-8 text-[var(--red)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">Delete Record?</h3>
            <p className="text-[var(--text-muted)] text-sm mb-8">This action cannot be undone. Are you sure you want to permanently delete this case record?</p>
            <div className="flex justify-center gap-3">
              <button className="btn-formal text-[var(--text-main)] hover:bg-[var(--hover-translucent)]" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
              <button className="btn-formal btn-danger px-6" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Modal */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[var(--panel-bg)] rounded-2xl p-8 w-full max-w-3xl shadow-2xl border border-[var(--border-color)] flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6 border-b border-[var(--border-color)] pb-4">
              <h3 className="text-xl font-extrabold text-[var(--nbi-gold)] tracking-tight">Audit Logs</h3>
              <button className="text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--hover-translucent)] rounded-full p-1 transition-colors" onClick={() => setIsAuditModalOpen(false)}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-auto pr-2 space-y-4">
              {auditLogs.length === 0 ? (
                <p className="text-center text-[var(--text-muted)] py-8">No audit logs found for this record.</p>
              ) : (
                auditLogs.map(log => (
                  <div key={log.id} className="bg-[var(--panel-translucent)] border border-[var(--border-color)] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          log.action_type === 'CREATE' ? 'bg-green-500/10 text-green-600 border border-green-500/30' :
                          log.action_type === 'UPDATE' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/30' :
                          'bg-red-500/10 text-[var(--red)] border border-red-500/30'
                        }`}>
                          {log.action_type}
                        </span>
                        <span className="text-[var(--text-main)] font-medium">{log.agent_name}</span>
                      </div>
                      <span className="text-xs text-[var(--text-muted)]">{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                    {log.details && log.details.message && (
                      <p className="text-sm text-[var(--text-muted)] mt-2">{log.details.message}</p>
                    )}
                  </div>
                ))
              )}
            </div>
            
            <div className="flex justify-end mt-6 pt-4 border-t border-[var(--border-color)]">
              <button className="btn-formal hover:bg-[var(--hover-translucent)] text-[var(--text-main)]" onClick={() => setIsAuditModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
