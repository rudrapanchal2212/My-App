import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { AlertOctagon, CheckCircle2, Clock } from 'lucide-react';

const AdminComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [status, setStatus] = useState('resolved');
  const [updating, setUpdating] = useState(false);

  const fetchComplaints = async () => {
    try {
      const { data } = await api.get('/admin/complaints');
      if (data.success) {
        setComplaints(data.complaints);
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleUpdateComplaint = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const { data } = await api.put(`/admin/complaints/${selectedComplaint._id}`, {
        status,
        adminNotes,
      });
      if (data.success) {
        toast.success('Complaint status updated.');
        setSelectedComplaint(null);
        fetchComplaints();
      }
    } catch (err) {
      toast.error('Failed to update complaint.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Customer Complaints & Disputes</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Investigate reported order issues and record administrative resolutions.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-xs text-slate-400">Loading complaints...</p>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No active complaints on file.</p>
            <p className="text-xs text-slate-400 mt-1">Platform orders running smoothly.</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {complaints.map((c) => (
              <div key={c._id} className="p-6 flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        c.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : c.status === 'investigating'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {c.status}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900">{c.subject}</h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{c.message}</p>

                  <p className="text-[11px] text-slate-400 pt-1">
                    Filed by <span className="font-semibold text-slate-700">{c.customer?.name}</span> ({c.customer?.email}) • Shop: <span className="font-semibold text-slate-700">{c.shop?.name}</span> • Order: #{c.order?.orderNumber}
                  </p>

                  {c.adminNotes && (
                    <div className="mt-2 p-2.5 bg-stone-50 rounded-xl text-xs text-purple-800 border border-purple-100">
                      <span className="font-bold">Admin Resolution Note:</span> {c.adminNotes}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setSelectedComplaint(c);
                    setStatus(c.status);
                    setAdminNotes(c.adminNotes || '');
                  }}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-slate-800 font-bold text-xs rounded-xl transition flex-shrink-0"
                >
                  Update Status
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolution Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-100">
            <h3 className="text-base font-bold text-slate-900">Resolve Complaint</h3>
            <p className="text-xs text-slate-500 mt-1">{selectedComplaint.subject}</p>

            <form onSubmit={handleUpdateComplaint} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white"
                >
                  <option value="open">Open</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Resolution Notes</label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-purple-500"
                  placeholder="Record dispute resolution, refund confirmation, or shop notice..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md"
                >
                  {updating ? 'Saving...' : 'Save Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminComplaintsPage;
