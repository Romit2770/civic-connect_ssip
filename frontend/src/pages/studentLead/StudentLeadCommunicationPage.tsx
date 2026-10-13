import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import {
  MessageSquare,
  Send,
  Paperclip,
  CheckCircle,
  Clock,
  User,
  Building2,
  Users,
  Shield,
  FileText,
  AlertCircle,
  Download,
  Info
} from 'lucide-react';

interface IMessage {
  id: string;
  projectId: string;
  channel: 'faculty' | 'industry' | 'team';
  senderName: string;
  senderRole: string;
  message: string;
  timestamp: string;
  attachments: { name: string; size: string; url: string }[];
  isUnread?: boolean;
}

export default function StudentLeadCommunicationPage() {
  const [activeChannel, setActiveChannel] = useState<'faculty' | 'industry' | 'team'>('faculty');
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [attachmentName, setAttachmentName] = useState('');

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/student-lead/communication?channel=${activeChannel}`);
      if (res.data?.success) {
        setMessages(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load communication messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [activeChannel]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const attachments = attachmentName.trim()
        ? [
            {
              name: attachmentName.trim(),
              size: '1.4 MB',
              url: `/uploads/documents/${attachmentName.trim().replace(/\s+/g, '_')}`,
            },
          ]
        : [];

      const res = await apiClient.post('/student-lead/communication', {
        channel: activeChannel,
        message: newMessage.trim(),
        attachments,
      });

      if (res.data?.success) {
        setNewMessage('');
        setAttachmentName('');
        await fetchMessages();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to dispatch message.');
    } finally {
      setSending(false);
    }
  };

  const channelMetadata = {
    faculty: {
      title: 'Faculty Mentor Channel',
      primaryContact: 'Prof. Ananya Sen',
      role: 'Faculty Mentor & Academic Advisor',
      department: 'Computer Science & Engineering',
      institution: 'National Institute of Technology Jamshedpur',
      badge: 'Academic Authority',
      desc: 'Official channel for milestone reviews, research validation, academic approvals, and institutional compliance.',
      icon: User,
    },
    industry: {
      title: 'Industry Partner Channel',
      primaryContact: 'Tata Steel Utilities & Infrastructure (TSUISL)',
      role: 'Industry Mentor & Municipal SCADA Lead',
      department: 'Water & Urban Utilities Division',
      institution: 'Jamshedpur Field Pilot Operations',
      badge: 'Industry Supervisor',
      desc: 'Field pilot coordination, pipe pressure telemetry calibration, telemetry gateway deployment, and site access clearances.',
      icon: Building2,
    },
    team: {
      title: 'Student Team Channel',
      primaryContact: 'Smart Water Guild',
      role: 'Core Student Research & Engineering Team (6 Members)',
      department: 'Interdisciplinary Engineering',
      institution: 'NIT Jamshedpur Innovation Cell',
      badge: 'Execution Team',
      desc: 'Internal day-to-day task synchronization, sprint updates, hardware debugging notes, and laboratory testing logs.',
      icon: Users,
    },
  };

  const currentMeta = channelMetadata[activeChannel];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200 rounded">
              Institutional Dispatch
            </span>
            <span className="text-xs text-slate-500 font-mono">PRJ-CH-2026-089</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">Project Communication Module</h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Archival communication channel with Faculty Mentor, Industry Partner, and the student engineering team.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-2 rounded">
          <Shield className="w-4 h-4 text-emerald-700" />
          <span>
            Compliant with <strong>Academic Audit Standards 2026–27</strong>
          </span>
        </div>
      </div>

      {/* Main Grid: Channels List & Conversation Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Channels List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
            <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span>COMMUNICATION CHANNELS</span>
              <span className="text-[11px] font-normal text-slate-500">3 Active</span>
            </div>

            <div className="divide-y divide-slate-100">
              {/* Channel 1: Faculty Mentor */}
              <button
                type="button"
                onClick={() => setActiveChannel('faculty')}
                className={`w-full text-left p-4 transition-colors flex items-start gap-3 ${
                  activeChannel === 'faculty'
                    ? 'bg-blue-50/70 border-l-4 border-l-[#133054]'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="w-9 h-9 rounded bg-[#133054] text-white flex items-center justify-center shrink-0 font-bold text-sm">
                  AS
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 truncate">Prof. Ananya Sen</h4>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.5 rounded border border-amber-200">
                      Faculty Mentor
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 truncate mt-0.5">Computer Science & Engineering</p>
                  <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" /> Academic Reviews & approvals
                  </p>
                </div>
              </button>

              {/* Channel 2: Industry Partner */}
              <button
                type="button"
                onClick={() => setActiveChannel('industry')}
                className={`w-full text-left p-4 transition-colors flex items-start gap-3 ${
                  activeChannel === 'industry'
                    ? 'bg-blue-50/70 border-l-4 border-l-[#133054]'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="w-9 h-9 rounded bg-emerald-800 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                  TS
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 truncate">Tata Steel Utilities (TSUISL)</h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded border border-emerald-200">
                      Industry
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 truncate mt-0.5">Municipal Water & SCADA Lead</p>
                  <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-slate-400" /> Ward 4 Bistupur Pilot Node
                  </p>
                </div>
              </button>

              {/* Channel 3: Student Team */}
              <button
                type="button"
                onClick={() => setActiveChannel('team')}
                className={`w-full text-left p-4 transition-colors flex items-start gap-3 ${
                  activeChannel === 'team'
                    ? 'bg-blue-50/70 border-l-4 border-l-[#133054]'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="w-9 h-9 rounded bg-indigo-700 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                  SW
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 truncate">Smart Water Guild</h4>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 font-semibold px-1.5 py-0.5 rounded border border-indigo-200">
                      6 Members
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 truncate mt-0.5">Student Engineering Guild</p>
                  <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-400" /> Daily Task & Lab Coordination
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Institutional Compliance Notice */}
          <div className="bg-amber-50/70 border border-amber-200 rounded p-3 text-xs text-amber-900 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-950">
              <Info className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Institutional Protocol</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800">
              All messages transmitted through this console are logged and accessible during academic milestone evaluations and national Smart India Hackathon audits. Keep communications formal and objective.
            </p>
          </div>
        </div>

        {/* Right Column: Institutional Conversation Stream & Composer */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-slate-200 rounded shadow-sm flex flex-col min-h-[580px]">
            {/* Header of Active Channel */}
            <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-[#133054] text-white flex items-center justify-center font-bold text-sm">
                  {activeChannel === 'faculty' && 'AS'}
                  {activeChannel === 'industry' && 'TS'}
                  {activeChannel === 'team' && 'SW'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{currentMeta.primaryContact}</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-200 text-slate-800 rounded">
                      {currentMeta.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{currentMeta.role} • {currentMeta.department}</p>
                </div>
              </div>

              <div className="hidden sm:flex flex-col items-end text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Project Communication</span>
                <span>Security Level: Official</span>
              </div>
            </div>

            {/* Description Banner */}
            <div className="px-4 py-2 bg-blue-50/40 border-b border-blue-100 text-[11px] text-blue-900 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-blue-700 shrink-0" />
              <span>{currentMeta.desc}</span>
            </div>

            {/* Message History */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/30">
              {loading ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  <div className="animate-spin w-6 h-6 border-2 border-[#133054] border-t-transparent rounded-full mx-auto mb-2"></div>
                  Loading archived communication logs...
                </div>
              ) : messages.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  No dispatches recorded in this channel yet. Use the dispatch form below to initiate communication.
                </div>
              ) : (
                messages.map((msg) => {
                  const isStudentLead = msg.senderRole.toLowerCase().includes('student lead');
                  return (
                    <div
                      key={msg.id}
                      className={`p-3.5 rounded border text-xs max-w-[85%] ${
                        isStudentLead
                          ? 'ml-auto bg-blue-50/60 border-blue-200 text-slate-900'
                          : 'mr-auto bg-white border-slate-200 text-slate-900 shadow-sm'
                      }`}
                    >
                      {/* Sender Meta */}
                      <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-slate-200/60">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className={isStudentLead ? 'text-[#133054]' : 'text-slate-800'}>
                            {msg.senderName}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
                              isStudentLead
                                ? 'bg-[#133054] text-white'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {msg.senderRole}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 whitespace-nowrap">
                          {new Date(msg.timestamp).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>

                      {/* Message Content */}
                      <p className="leading-relaxed whitespace-pre-line text-slate-800 font-sans">
                        {msg.message}
                      </p>

                      {/* Attachments */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200/80 space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            Attached Documents:
                          </span>
                          {msg.attachments.map((att, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between bg-white border border-slate-200 px-2.5 py-1.5 rounded text-[11px]"
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <FileText className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                                <span className="font-medium text-slate-800 truncate">{att.name}</span>
                                <span className="text-slate-400 text-[10px]">({att.size})</span>
                              </div>
                              <a
                                href={att.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 text-[10px] ml-2 shrink-0"
                              >
                                <Download className="w-3 h-3" /> View
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Composer */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  OFFICIAL DISPATCH COMPOSER
                </label>
                <textarea
                  rows={3}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Write official dispatch to ${currentMeta.primaryContact}...`}
                  className="w-full text-xs border border-slate-300 rounded p-2.5 focus:outline-none focus:ring-1 focus:ring-[#133054] focus:border-[#133054] bg-slate-50/50"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Optional attachment filename (e.g. Test_Log_24Sep.pdf)"
                      value={attachmentName}
                      onChange={(e) => setAttachmentName(e.target.value)}
                      className="text-xs border border-slate-200 rounded px-2.5 py-1.5 w-64 focus:outline-none focus:ring-1 focus:ring-[#133054]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#133054] hover:bg-[#0e2440] text-white text-xs font-semibold rounded shadow-sm disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {sending ? 'Dispatching...' : 'Dispatch Message'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
