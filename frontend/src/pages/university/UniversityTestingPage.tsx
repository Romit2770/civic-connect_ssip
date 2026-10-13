import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Plus,
  ShieldCheck,
  Award,
  Layers,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export default function UniversityTestingPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/university/testing-logs');
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (err) {
      console.warn('Fallback testing logs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#133054] text-amber-400 flex items-center justify-center font-bold shadow-xs shrink-0">
            <FlaskConical size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Testing & Laboratory Validation
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Multi-tiered validation pipeline: Bench Simulation → Industry Test Bench → Municipal Field Pilot.
            </p>
          </div>
        </div>

        <button
          onClick={() => loadLogs()}
          className="p-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-xs cursor-pointer"
          title="Refresh Logs"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Validation Pipeline Stepper */}
      <div className="gov-card bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
          University Validation Workflow:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
          {[
            { step: '1. Prototype', desc: 'Hardware/AI Ready', status: 'done' },
            { step: '2. University Lab', desc: 'Bench Calibration', status: 'done' },
            { step: '3. Industry Testing', desc: 'Corporate Testbed', status: 'active' },
            { step: '4. Community Pilot', desc: 'Ward Field Trial', status: 'active' },
            { step: '5. ULB Validation', desc: 'Municipal Sign-off', status: 'pending' },
            { step: '6. Deployment', desc: 'City-wide Scale', status: 'pending' },
          ].map((s, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-lg border text-center ${
                s.status === 'done'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : s.status === 'active'
                  ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <span className="block font-bold text-[11px]">{s.step}</span>
              <span className="text-[10px] block opacity-80">{s.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Testing Logs Table */}
      <div className="gov-card bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900">
            Validated Laboratory Test Records
          </h3>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            ISO / NABL Standard Compliance
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#133054] text-white uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="px-4 py-3">Test Log ID</th>
                <th className="px-4 py-3">Innovation Project</th>
                <th className="px-4 py-3">Validation Stage</th>
                <th className="px-4 py-3">Performance Telemetry</th>
                <th className="px-4 py-3">Attesting Faculty</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-center">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3.5 font-mono font-bold text-blue-900 whitespace-nowrap">
                    {log.id}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-900">{log.project}</td>
                  <td className="px-4 py-3.5 text-blue-900 font-semibold">{log.stage}</td>
                  <td className="px-4 py-3.5 text-slate-600 font-mono text-[11px]">{log.metrics}</td>
                  <td className="px-4 py-3.5 text-slate-700 whitespace-nowrap">{log.verifiedBy}</td>
                  <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">{log.date}</td>
                  <td className="px-4 py-3.5 text-center whitespace-nowrap">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {log.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
