import React, { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HelpCircle, Phone, Mail, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

const HelpContactPage = () => {
  const [orderId, setOrderId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!orderId || !subject || !message) {
      toast.error('Please complete all complaint fields.');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/orders/complaints', {
        orderId,
        subject,
        message,
      });

      if (data.success) {
        setSubmitted(true);
        toast.success('Your report has been submitted to Super Admin.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report. Verify Order ID.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-10 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Help & Customer Support</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            We are here to assist with your food orders, delivery questions, and merchant issues.
          </p>
        </div>

        {/* Support Channels */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-stone-200 space-y-2">
            <Phone className="w-6 h-6 text-brand-500" />
            <h3 className="font-bold text-sm text-slate-900">Delivery Helpline</h3>
            <p className="text-xs text-slate-500">Toll-free 24/7 hotline for live order dispatch issues.</p>
            <p className="text-xs font-bold text-brand-600 pt-1">+91 1800-QUICK-BITE</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-stone-200 space-y-2">
            <Mail className="w-6 h-6 text-purple-500" />
            <h3 className="font-bold text-sm text-slate-900">Email Support</h3>
            <p className="text-xs text-slate-500">For billing inquiries, account security, and general help.</p>
            <p className="text-xs font-bold text-purple-600 pt-1">support@quickbite.com</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-stone-200 space-y-2">
            <MessageSquare className="w-6 h-6 text-emerald-500" />
            <h3 className="font-bold text-sm text-slate-900">Super Admin Review</h3>
            <p className="text-xs text-slate-500">Disputes and refunds reviewed directly by Super Admin.</p>
            <p className="text-xs font-bold text-emerald-600 pt-1">Escalations Portal</p>
          </div>
        </div>

        {/* Dispute / Complaint Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200">
          <h2 className="text-lg font-bold text-slate-900 mb-1">File a Complaint or Order Dispute</h2>
          <p className="text-xs text-slate-500 mb-6">
            If you received incorrect food, missing items, or experienced delivery issues, report it below for admin investigation.
          </p>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="text-sm font-bold text-emerald-900">Complaint Submitted Successfully</h4>
              <p className="text-xs text-emerald-700">
                Ticket #CMP-{Date.now().toString().slice(-4)} has been logged. Our administrative team will review your order details and contact you.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-3 text-xs font-bold text-emerald-800 underline"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitComplaint} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Order Database ID (Available on order tracking page)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 67104b901a0d..."
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Missing garlic naan in delivery / Spill damage"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Please describe the issue in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting...' : 'Send Complaint to Admin'}</span>
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default HelpContactPage;
