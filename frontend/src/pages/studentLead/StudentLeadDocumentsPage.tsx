import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Download,
  Eye,
  Plus,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  FileCode2,
  FileCheck,
  Calendar,
  Lock,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export default function StudentLeadDocumentsPage() {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

  // Upload Form State
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('Testing');
  const [docDescription, setDocDescription] = useState('');
  const [docVersion, setDocVersion] = useState('v1.0');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [activeTab]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (activeTab !== 'all') params.type = activeTab;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await apiClient.get('/student-lead/documents', { params });
      if (res.data.success) {
        setDocuments(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDocuments();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      const allowed = ['.pdf', '.docx', '.xlsx', '.pptx', '.zip', '.csv', '.txt'];
      if (!allowed.includes(ext)) {
        setUploadError(`Unsupported format "${ext}". Allowed: PDF, DOCX, XLSX, PPTX, ZIP, CSV, TXT.`);
        setSelectedFile(null);
        return;
      }
      if (file.size > 25 * 1024 * 1024) {
        setUploadError('File size exceeds 25 MB limit.');
        setSelectedFile(null);
        return;
      }
      setUploadError(null);
      setSelectedFile(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) {
      setUploadError('Document name is required.');
      return;
    }
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', docName.trim());
      formData.append('type', docType);
      formData.append('description', docDescription.trim());
      formData.append('version', docVersion.trim() || 'v1.0');

      const res = await apiClient.post('/student-lead/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setUploadSuccess(`Document "${res.data.data.name}" uploaded successfully.`);
        setTimeout(() => {
          setUploadSuccess(null);
          setShowUploadModal(false);
          setDocName('');
          setDocDescription('');
          setSelectedFile(null);
          fetchDocuments();
        }, 1500);
      }
    } catch (err: any) {
      setUploadError(err?.response?.data?.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (doc: any) => {
    // Direct file download from backend
    const filename = `${doc.name.replace(/\s+/g, '_')}_${doc.version}.${doc.fileType.toLowerCase()}`;
    const url = `/api/student-lead/documents/download/${encodeURIComponent(filename)}`;
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold bg-blue-900 text-white px-2 py-0.5 rounded">
              DOCUMENT REPOSITORY
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              PRJ-CH-2026-089
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
            PROJECT DOCUMENTS
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            Maintain versioned project specifications, circuit schematics, testing reports, and deliverables.
          </p>
        </div>

        <button
          onClick={() => {
            setShowUploadModal(true);
            setUploadError(null);
            setUploadSuccess(null);
          }}
          className="gov-button-primary text-xs px-4 h-9 font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Upload size={14} />
          <span>+ Upload Project Document</span>
        </button>
      </div>

      {/* 2. Tabs */}
      <div className="flex items-center border-b border-slate-200 overflow-x-auto pb-px">
        <div className="flex items-center gap-1 min-w-max">
          {[
            { id: 'all', label: 'All Documents' },
            { id: 'proposal', label: 'Proposal' },
            { id: 'research', label: 'Research' },
            { id: 'prototype', label: 'Prototype' },
            { id: 'testing', label: 'Testing' },
            { id: 'progress', label: 'Progress Reports' },
            { id: 'final', label: 'Final Reports' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-blue-900 text-blue-900 bg-blue-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Search Bar */}
      <form onSubmit={handleSearch} className="relative w-full sm:w-80">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by document name, author, format..."
          className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none bg-white"
        />
        <Search size={14} className="absolute left-2.5 top-2 text-slate-400" />
      </form>

      {/* 4. Table */}
      <div className="gov-card bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10.5px]">
                <th className="py-3 px-3.5">Document Name</th>
                <th className="py-3 px-3.5">Type</th>
                <th className="py-3 px-3.5">Uploaded By</th>
                <th className="py-3 px-3.5">Version</th>
                <th className="py-3 px-3.5">Uploaded Date</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No documents found in this section.
                  </td>
                </tr>
              ) : (
                documents.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Document Name */}
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded bg-blue-50 text-blue-900 border border-blue-200 flex items-center justify-center font-bold text-[10px] shrink-0">
                          {d.fileType}
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 block">{d.name}</span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {d.id} • {d.fileSize}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {d.type}
                      </span>
                    </td>

                    {/* Uploaded By */}
                    <td className="py-3 px-3.5 whitespace-nowrap font-medium text-slate-700">
                      {d.uploadedBy}
                    </td>

                    {/* Version */}
                    <td className="py-3 px-3.5 whitespace-nowrap font-mono font-bold text-blue-950">
                      {d.version}
                    </td>

                    {/* Uploaded Date */}
                    <td className="py-3 px-3.5 whitespace-nowrap font-mono text-slate-600">
                      {d.uploadedDate}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          d.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                            : d.status === 'Under Review'
                            ? 'bg-amber-50 text-amber-900 border border-amber-300'
                            : 'bg-slate-100 text-slate-700 border border-slate-300'
                        }`}
                      >
                        {d.status === 'Approved' && <CheckCircle2 size={10} className="text-emerald-700" />}
                        <span>{d.status}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                      <button
                        onClick={() => setSelectedDoc(d)}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded font-semibold text-xs cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                        title="View Document Details"
                      >
                        <Eye size={12} />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => handleDownload(d)}
                        className="px-2.5 py-1 bg-blue-900 hover:bg-blue-800 text-white rounded font-bold text-xs cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                        title="Download Document"
                      >
                        <Download size={12} />
                        <span>Download</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODAL: View Document Details */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-blue-900" />
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Document Overview • {selectedDoc.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-md cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="font-extrabold text-slate-900 text-sm block">
                  {selectedDoc.name}
                </span>
                <p className="text-slate-600 text-xs">
                  {selectedDoc.description || 'No extended description provided.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Document Category</span>
                  <span className="font-bold text-slate-900">{selectedDoc.type}</span>
                </div>

                <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Release Version</span>
                  <span className="font-mono font-bold text-blue-900">{selectedDoc.version}</span>
                </div>

                <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Uploaded By</span>
                  <span className="font-medium text-slate-800">{selectedDoc.uploadedBy}</span>
                </div>

                <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">File Details</span>
                  <span className="font-mono text-slate-800">{selectedDoc.fileType} • {selectedDoc.fileSize}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedDoc(null)}
                  className="gov-button-secondary text-xs px-3 h-8 font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(selectedDoc)}
                  className="gov-button-primary text-xs px-4 h-8 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Download size={13} />
                  <span>Download Actual File</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: Upload Project Document */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload size={18} className="text-blue-900" />
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  UPLOAD PROJECT DOCUMENT
                </h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-md cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-5 space-y-4 text-xs">
              {uploadError && (
                <div className="p-2.5 bg-red-50 border border-red-300 text-red-900 rounded text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="text-red-700 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded text-xs flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-700 shrink-0" />
                  <span>{uploadSuccess}</span>
                </div>
              )}

              {/* Document Name */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Document Name *</label>
                <input
                  type="text"
                  required
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. Ultrasonic Sensor Bench Calibration Report"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none bg-white font-medium"
                />
              </div>

              {/* Type & Version */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Document Type *</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                  >
                    <option value="Proposal">Proposal</option>
                    <option value="Research">Research</option>
                    <option value="Prototype">Prototype</option>
                    <option value="Testing">Testing</option>
                    <option value="Progress Reports">Progress Reports</option>
                    <option value="Final Reports">Final Reports</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Version *</label>
                  <input
                    type="text"
                    required
                    value={docVersion}
                    onChange={(e) => setDocVersion(e.target.value)}
                    placeholder="e.g. v1.0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono bg-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={docDescription}
                  onChange={(e) => setDocDescription(e.target.value)}
                  placeholder="Summary of document contents and technical scope..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>

              {/* File Upload */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">File Upload *</label>
                <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <input
                    type="file"
                    id="doc-file-input"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.docx,.xlsx,.pptx,.zip,.csv,.txt"
                  />
                  <label htmlFor="doc-file-input" className="cursor-pointer space-y-1 block">
                    <Upload size={20} className="mx-auto text-blue-900" />
                    <span className="font-bold text-blue-900 block text-xs">
                      {selectedFile ? selectedFile.name : 'Click to select project file'}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Allowed formats: PDF, DOCX, XLSX, PPTX, ZIP, CSV (Max 25 MB)
                    </span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="gov-button-secondary text-xs px-3 h-8 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="gov-button-primary text-xs px-4 h-8 font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Upload size={13} />
                  <span>{uploading ? 'Uploading...' : 'Upload Document'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
