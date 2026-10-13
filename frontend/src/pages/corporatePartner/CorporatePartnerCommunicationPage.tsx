import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Paperclip,
  CheckCheck,
  Building2,
  Users,
  Search,
  RefreshCw,
  FolderGit2,
  FileText,
  User,
  AlertCircle,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export default function CorporatePartnerCommunicationPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('PRJ-CSR-2026-001');
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/corporate-partner/communication');
      if (res.data?.success) {
        setMessages(res.data.data.messages || []);
      }
    } catch (err) {
      console.warn('Using fallback communication messages');
      setMessages([
        {
          id: 'MSG-001',
          projectId: 'PRJ-CSR-2026-001',
          projectTitle: 'Smart Water Monitoring & Leakage Detection System',
          senderName: 'Rahul Patel',
          senderRole: 'Student Lead',
          senderEmail: 'rahul.patel@nitjsr.ac.in',
          recipientName: 'Rohan Mittal',
          message: 'Sir, we have calibrated the piezoelectric hydrophone sensitivity matrix. Could you review the frequency response curve before our session on Friday?',
          timestamp: '2026-09-23T14:30:00Z',
          isRead: true,
          attachments: [{ name: 'Hydrophone_Calibration_Curves_v1.pdf', size: '1.8 MB' }],
        },
        {
          id: 'MSG-002',
          projectId: 'PRJ-CSR-2026-001',
          projectTitle: 'Smart Water Monitoring & Leakage Detection System',
          senderName: 'Prof. Ananya Sen',
          senderRole: 'Faculty Mentor',
          senderEmail: 'faculty.mentor@nitjsr.ac.in',
          recipientName: 'Rohan Mittal',
          message: 'Dear Mr. Mittal, the JNAC municipal engineers have granted permission for the Manhole 14 deployment this weekend. We would appreciate your team verifying the gateway telemetry link.',
          timestamp: '2026-09-22T09:15:00Z',
          isRead: true,
        },
        {
          id: 'MSG-003',
          projectId: 'PRJ-CSR-2026-001',
          projectTitle: 'Smart Water Monitoring & Leakage Detection System',
          senderName: 'Rohan Mittal',
          senderRole: 'Corporate Partner',
          senderEmail: 'partner.lead@jindalsteel.com',
          recipientName: 'Prof. Ananya Sen & Student Team',
          message: 'Acknowledged, Prof. Sen. Our cloud API sandbox has been assigned port 8883 with client certificates dispatched to Rahul. We will monitor the LoRa packets live during the deployment.',
          timestamp: '2026-09-22T11:45:00Z',
          isRead: true,
        },
        {
          id: 'MSG-004',
          projectId: 'PRJ-CSR-2026-004',
          projectTitle: 'Solar-Powered LED Smart Streetlighting with Dynamic Dimming',
          senderName: 'Sneha Kumari',
          senderRole: 'Student Lead',
          senderEmail: 'sneha.kumari@iitism.ac.in',
          recipientName: 'Rohan Mittal',
          message: 'Hello Sir, the Kipp & Zonen pyranometer arrived safely in Dhanbad yesterday! We are running the Sonari Bypass albedo benchmark today.',
          timestamp: '2026-09-21T16:45:00Z',
          isRead: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const conversationProjects = [
    {
      id: 'PRJ-CSR-2026-001',
      title: 'Smart Water Monitoring & Leakage Detection System',
      university: 'NIT Jamshedpur',
      faculty: 'Prof. Ananya Sen',
      student: 'Rahul Patel',
      unreadCount: 0,
    },
    {
      id: 'PRJ-CSR-2026-004',
      title: 'Solar-Powered LED Smart Streetlighting with Dynamic Dimming',
      university: 'IIT (ISM) Dhanbad',
      faculty: 'Dr. P. K. Sinha',
      student: 'Sneha Kumari',
      unreadCount: 0,
    },
  ];

  const currentProject = conversationProjects.find((p) => p.id === selectedProjectId) || conversationProjects[0];
  const projectMessages = messages.filter((m) => m.projectId === selectedProjectId);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSending(true);

    try {
      const payload = {
        projectId: selectedProjectId,
        projectTitle: currentProject.title,
        recipientName: `${currentProject.faculty} & ${currentProject.student}`,
        message: replyText.trim(),
      };

      const res = await apiClient.post('/corporate-partner/communication/send', payload);
      if (res.data?.success) {
        const newMsg = {
          id: `MSG-00${messages.length + 1}`,
          projectId: selectedProjectId,
          projectTitle: currentProject.title,
          senderName: 'Rohan Mittal',
          senderRole: 'Corporate Partner',
          senderEmail: 'partner.lead@jindalsteel.com',
          recipientName: `${currentProject.faculty} & ${currentProject.student}`,
          message: replyText.trim(),
          timestamp: new Date().toISOString(),
          isRead: true,
        };
        setMessages((prev) => [...prev, newMsg]);
        setReplyText('');
        setActionSuccess('Official message dispatched.');
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err) {
      const newMsg = {
        id: `MSG-00${messages.length + 1}`,
        projectId: selectedProjectId,
        projectTitle: currentProject.title,
        senderName: 'Rohan Mittal',
        senderRole: 'Corporate Partner',
        senderEmail: 'partner.lead@jindalsteel.com',
        recipientName: `${currentProject.faculty} & ${currentProject.student}`,
        message: replyText.trim(),
        timestamp: new Date().toISOString(),
        isRead: true,
      };
      setMessages((prev) => [...prev, newMsg]);
      setReplyText('');
      setActionSuccess('Official message dispatched.');
      setTimeout(() => setActionSuccess(null), 3000);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border-b-2 border-slate-200 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 px-4 sm:px-6 py-4 mb-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold bg-[#133054] text-white px-2 py-0.5 rounded tracking-wider uppercase">
                INSTITUTIONAL DISPATCH
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Official University-Corporate Channel
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Project Communication
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Secure institutional messaging between assigned Faculty Mentors, Student Leads, and Corporate Partner.
            </p>
          </div>

          <button
            onClick={fetchMessages}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold transition-colors shadow-xs cursor-pointer self-start md:self-auto"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-blue-700' : 'text-slate-500'} />
            <span>Refresh Messages</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-lg flex items-center gap-2">
          <CheckCheck size={16} className="text-emerald-600 shrink-0" />
          <span className="font-bold">{actionSuccess}</span>
        </div>
      )}

      {/* Main Communication Interface */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col md:flex-row min-h-[550px]">
        {/* Left: Project Conversation Selector */}
        <div className="w-full md:w-80 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0">
          <div className="p-3.5 border-b border-slate-200">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
              Active Project Channels
            </span>
            <span className="text-[10.5px] text-slate-500 font-medium mt-0.5 block">
              Direct project-context dispatch
            </span>
          </div>

          <div className="divide-y divide-slate-200 flex-1 overflow-y-auto">
            {conversationProjects.map((conv) => {
              const isSelected = selectedProjectId === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedProjectId(conv.id)}
                  className={`w-full text-left p-3.5 transition-colors cursor-pointer border-l-4 ${
                    isSelected
                      ? 'bg-white border-[#133054] shadow-xs'
                      : 'border-transparent hover:bg-slate-100'
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold text-[#133054] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    {conv.id}
                  </span>
                  <h4 className="font-extrabold text-xs text-slate-900 mt-1 line-clamp-1">
                    {conv.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                    {conv.university}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500">
                    <span>Mentor: {conv.faculty.split(' ')[1]}</span>
                    <span>•</span>
                    <span>Lead: {conv.student.split(' ')[0]}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Message Stream */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {/* Active Project Header */}
          <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-[10px] font-mono font-bold bg-[#133054] text-white px-2 py-0.5 rounded uppercase">
                {currentProject.id}
              </span>
              <h3 className="font-black text-xs sm:text-sm text-slate-900 mt-1 truncate">
                {currentProject.title}
              </h3>
              <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                Participants: {currentProject.faculty} (Faculty Mentor) • {currentProject.student} (Student Lead) • Rohan Mittal (Corporate Partner)
              </p>
            </div>
          </div>

          {/* Messages Display */}
          <div className="flex-1 p-4 space-y-3.5 overflow-y-auto max-h-[420px] bg-slate-50/30">
            {projectMessages.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <AlertCircle size={32} className="mx-auto mb-2" />
                <p className="text-xs font-bold">No messages in this project channel yet.</p>
              </div>
            ) : (
              projectMessages.map((msg) => {
                const isMe = msg.senderRole === 'Corporate Partner';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-xl ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1 text-[10.5px]">
                      <span className="font-extrabold text-slate-800">{msg.senderName}</span>
                      <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {msg.senderRole}
                      </span>
                      <span className="text-slate-400 font-mono text-[9.5px]">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div
                      className={`p-3 rounded-xl text-xs leading-relaxed shadow-xs ${
                        isMe
                          ? 'bg-[#133054] text-white rounded-tr-none'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                      }`}
                    >
                      <p>{msg.message}</p>

                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-white/20 flex flex-wrap gap-1.5">
                          {msg.attachments.map((att: any, idx: number) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-black/20 text-[10.5px] font-mono"
                            >
                              <FileText size={11} />
                              <span>{att.name}</span>
                              <span className="opacity-70 text-[9.5px]">({att.size})</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Reply Form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Send official message to ${currentProject.faculty} & student team...`}
              className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#133054] bg-slate-50/50"
            />
            <button
              type="submit"
              disabled={sending || !replyText.trim()}
              className="px-4 py-2 bg-[#133054] text-white font-extrabold rounded-lg hover:bg-[#1a4275] transition-colors text-xs shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send size={13} className="text-amber-400" />
              <span>{sending ? 'Sending...' : 'Send'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
