import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { XCircle, Save } from "lucide-react";

interface ModalFormLayoutProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (e: React.FormEvent) => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  formError?: string;
  formSuccess?: string;
  isMutating?: boolean;
  submitText?: string;
  submitIcon?: React.ReactNode;
  children: React.ReactNode;
  hideSubmitButton?: boolean;
  showCancelButton?: boolean;
  cancelText?: string;
}

export const ModalFormLayout: React.FC<ModalFormLayoutProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  subtitle,
  icon,
  formError,
  formSuccess,
  isMutating = false,
  submitText = "Guardar",
  submitIcon = <Save className="w-4 h-4" />,
  children,
  hideSubmitButton = false,
  showCancelButton = false,
  cancelText = "Cancelar",
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-default w-full h-full border-none outline-none"
            onClick={onClose}
            aria-label="Cerrar modal"
          />

          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] sm:max-h-[85vh] relative z-10"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 shrink-0 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  {icon && <span className="text-brand">{icon}</span>}
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              {formError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold p-4 rounded-xl text-center mb-6 shadow-sm">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold p-4 rounded-xl text-center mb-6 shadow-sm">
                  {formSuccess}
                </div>
              )}

              {onSubmit ? (
                <form id="modal-form" onSubmit={onSubmit} className="space-y-6">
                  {children}
                </form>
              ) : (
                <div className="space-y-6">{children}</div>
              )}
            </div>

            {/* Footer with Submit Button */}
            {!hideSubmitButton && (
              <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0 flex gap-4">
                <button
                  type="submit"
                  form="modal-form"
                  disabled={isMutating}
                  onClick={(e) => {
                    if (!onSubmit) e.preventDefault();
                  }}
                  className="flex-1 bg-brand text-white text-[11px] h-12 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-dark transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-brand/15"
                >
                  {submitIcon}
                  {isMutating ? "Procesando..." : submitText}
                </button>
                {showCancelButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-[11px] h-12 rounded-xl font-black uppercase tracking-widest flex items-center justify-center border border-slate-200 transition-all cursor-pointer"
                  >
                    {cancelText}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
