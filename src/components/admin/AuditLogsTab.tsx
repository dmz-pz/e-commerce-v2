import React from 'react';
import { motion } from 'motion/react';
import { ClipboardList, Activity, User } from 'lucide-react';
import { AuditLog } from '../../types/index.ts';

interface AuditLogsTabProps {
  auditLogs: AuditLog[];
}

export const AuditLogsTab: React.FC<AuditLogsTabProps> = ({ auditLogs }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      key="audit-panel"
      className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm p-6 md:p-10"
      id="audit-logs-panel"
    >
      <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-8">
        <ClipboardList className="w-5 h-5 text-brand" />
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Pista de Auditoría Reciente</h2>
      </div>

      {auditLogs.length === 0 ? (
        <div className="py-20 text-center">
          <Activity className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="font-bold text-slate-400">Sin logs de auditoría recolectados</p>
        </div>
      ) : (
        <div className="relative border-l-2 border-slate-100 pl-6 space-y-8 ml-3">
          {auditLogs.map((log) => (
            <div key={log.id} className="relative">
              {/* Timeline Dot Indicator */}
              <span className="absolute -left-9 top-1 w-5 h-5 bg-white border-2 border-brand rounded-full flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-brand rounded-full" />
              </span>

              <div>
                {/* Audit Details */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-black text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
                    {log.action}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-bold text-slate-500">Ejecutado por: </span>
                  <span className="text-xs font-black text-slate-700">{log.performedByName} (ID: {log.performedById})</span>
                </div>

                {log.orderId && (
                  <div className="text-[10px] font-mono text-brand font-semibold mt-1 bg-brand/5 px-2 py-0.5 rounded w-fit uppercase">
                    Orden: {log.orderId}
                  </div>
                )}

                {/* State comparison details if available */}
                {(log.previousState || log.newState) && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 max-w-4xl animate-fade-in">
                    {log.previousState && (
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Estado Anterior</span>
                        <pre className="text-[10px] font-mono text-slate-600 bg-white p-3 rounded-xl border border-slate-200 overflow-x-auto max-h-36">
                          {JSON.stringify(log.previousState, null, 2)}
                        </pre>
                      </div>
                    )}
                    {log.newState && (
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1 text-emerald-600">Nuevo Estado</span>
                        <pre className="text-[10px] font-mono text-slate-700 bg-white p-3 rounded-xl border border-emerald-100 overflow-x-auto max-h-36">
                          {JSON.stringify(log.newState, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
