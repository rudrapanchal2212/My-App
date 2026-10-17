import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FileText, ShieldCheck } from 'lucide-react';

const AdminAuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data } = await api.get('/admin/audit-logs');
        if (data.success) {
          setLogs(data.logs);
        }
      } catch (err) {
        console.error('Error fetching audit logs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Administrative Audit Logs</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Immutable audit trail recording all platform approvals, rejections, suspensions, and security events.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-xs text-slate-400">Loading audit trail...</p>
        ) : logs.length === 0 ? (
          <p className="p-8 text-center text-xs text-slate-400">No audit logs recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Target Entity</th>
                  <th className="py-3.5 px-4">Admin Performed By</th>
                  <th className="py-3.5 px-4">IP & Client</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-stone-50/70 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md text-[11px]">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {log.targetType}: <span className="text-slate-600 font-semibold">{log.targetName || log.targetId}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{log.admin?.name || 'Super Admin'}</p>
                      <p className="text-[11px] text-slate-400">{log.admin?.email}</p>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminAuditLogsPage;
