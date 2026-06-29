import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { XCircle, Save, DollarSign, Image as ImageIcon } from 'lucide-react';

interface ProductCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productPayload: any) => Promise<void>;
}

export const ProductCreateModal: React.FC<ProductCreateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [isMutating, setIsMutating] = useState(false);
  const [formError, setFormError] = useState('');

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    stock: '',
    category: '',
    subcategory: '',
    brand: '',
    imageUrl: '',
    unit: 'unid',
    isRecommended: false,
    isActive: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsMutating(true);

    if (!newProduct.name || !newProduct.price || !newProduct.imageUrl) {
      setFormError('Nombre, Precio e Imagen URL son requeridos.');
      setIsMutating(false);
      return;
    }

    try {
      const productPayload = {
        name: newProduct.name,
        description: newProduct.description,
        price: Number(newProduct.price),
        discountPrice: newProduct.discountPrice ? Number(newProduct.discountPrice) : undefined,
        stock: Number(newProduct.stock),
        category: newProduct.category,
        subcategory: newProduct.subcategory,
        brand: newProduct.brand,
        imageUrl: newProduct.imageUrl,
        unit: newProduct.unit,
        isRecommended: newProduct.isRecommended,
        isActive: newProduct.isActive
      };

      await onSubmit(productPayload);

      // Reset form
      setNewProduct({
        name: '',
        description: '',
        price: '',
        discountPrice: '',
        stock: '',
        category: '',
        subcategory: '',
        brand: '',
        imageUrl: '',
        unit: 'unid',
        isRecommended: false,
        isActive: true
      });
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'No se pudo crear el producto.');
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6" id="product-create-modal">
          {/* Backdrop */}
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-default w-full h-full border-none outline-none"
            onClick={onClose}
            aria-label="Cerrar modal"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] sm:max-h-[85vh] relative z-10"
          >
            {/* Encabezado */}
            <div className="p-6 border-b border-slate-100 shrink-0 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Cargar Nuevo Producto</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Expande el catálogo de la sucursal</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Body Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              {formError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold p-4 rounded-xl text-center">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Nombre Comercial *</label>
                  <input 
                    type="text"
                    required
                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand/15"
                    placeholder="ej. Arroz Extra Primor 1kg"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Marca</label>
                  <input 
                    type="text"
                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand/15"
                    placeholder="ej. Primor"
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Precio Unitario ($) *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="number"
                      step="0.01"
                      required
                      className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 text-xs font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand/15"
                      placeholder="0.00"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    />
                  </div>
                </div>

                {/* Discount Price */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Precio Descuento (Opcional)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="number"
                      step="0.01"
                      className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 text-xs font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand/15"
                      placeholder="0.00"
                      value={newProduct.discountPrice}
                      onChange={(e) => setNewProduct({ ...newProduct, discountPrice: e.target.value })}
                    />
                  </div>
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Stock Disponible *</label>
                  <input 
                    type="number"
                    required
                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand/15"
                    placeholder="0"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Categoría Principal *</label>
                  <input 
                    type="text"
                    required
                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand/15"
                    placeholder="ej. Despensa, Lácteos"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  />
                </div>

                {/* Subcategory */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Subcategoría *</label>
                  <input 
                    type="text"
                    required
                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand/15"
                    placeholder="ej. Granos y Pastas, Leches"
                    value={newProduct.subcategory}
                    onChange={(e) => setNewProduct({ ...newProduct, subcategory: e.target.value })}
                  />
                </div>

                {/* Unit */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Unidad de Medida</label>
                  <select
                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/15"
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                  >
                    <option value="unid">Unidad (unid)</option>
                    <option value="kg">Kilogramo (kg)</option>
                    <option value="litro">Litro (l)</option>
                    <option value="pack">Paquete (pack)</option>
                  </select>
                </div>

                {/* Image URL */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Imagen URL (Unsplash o similar) *</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="text"
                      required
                      className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 text-xs font-bold text-slate-800 placeholder:text-slate-400/40 focus:outline-none focus:ring-2 focus:ring-brand/15"
                      placeholder="https://images.unsplash.com/..."
                      value={newProduct.imageUrl}
                      onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Descripción Comercial</label>
                  <textarea 
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand/15"
                    placeholder="Describe las características principales del producto..."
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  />
                </div>

                {/* Display switches */}
                <div className="sm:col-span-2 flex items-center justify-between bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      id="isRecommended"
                      className="w-4.5 h-4.5 accent-brand rounded border-slate-300 focus:ring-brand cursor-pointer"
                      checked={newProduct.isRecommended}
                      onChange={(e) => setNewProduct({ ...newProduct, isRecommended: e.target.checked })}
                    />
                    <label htmlFor="isRecommended" className="text-[10px] font-black text-slate-700 uppercase tracking-wider cursor-pointer select-none">¿Destacar?</label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      id="isActive"
                      className="w-4.5 h-4.5 accent-emerald-500 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                      checked={newProduct.isActive}
                      onChange={(e) => setNewProduct({ ...newProduct, isActive: e.target.checked })}
                    />
                    <label htmlFor="isActive" className="text-[10px] font-black text-slate-700 uppercase tracking-wider cursor-pointer select-none">¿Vender ya?</label>
                  </div>
                </div>
              </div>

              {/* Submission Row */}
              <div className="flex items-center gap-4 pt-4 border-t border-slate-100 shrink-0">
                <button
                  type="submit"
                  disabled={isMutating}
                  className="flex-1 bg-brand text-white text-[10px] h-12 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-dark transition-all disabled:opacity-50 cursor-pointer shadow shadow-brand/15"
                >
                  <Save className="w-4.5 h-4.5" />
                  {isMutating ? 'Procesando...' : 'Guardar Producto'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-slate-50 text-slate-550 hover:text-slate-800 hover:bg-slate-100 text-[10px] h-12 rounded-xl font-black uppercase tracking-widest flex items-center justify-center border border-slate-200 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
