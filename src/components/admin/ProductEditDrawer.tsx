import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { X, Save, DollarSign, Image as ImageIcon, Barcode, Package } from "lucide-react";
import { Category, Subcategory, Product } from "../../types/index.ts";
import { categoryService } from "../../services/categoryService.ts";
import { productService } from "../../services/productService.ts";
import { Input } from "../ui/Input.tsx";
import { Select } from "../ui/Select.tsx";
import { motion, AnimatePresence } from "motion/react";
import { OptimizedImage } from "../ui/OptimizedImage.tsx";

interface ProductEditDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: () => void;
}

export const ProductEditDrawer: React.FC<ProductEditDrawerProps> = ({
  isOpen,
  onClose,
  product,
  onSave,
}) => {
  const [isMutating, setIsMutating] = useState(false);
  const [formError, setFormError] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [availableSubcategories, setAvailableSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [taxRates, setTaxRates] = useState<any[]>([]);

  const [editProduct, setEditProduct] = useState({
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    stock: "",
    subcategoryId: "",
    brand: "",
    barcode: "",
    unit: "UNID",
    isRecommended: false,
    isActive: true,
    taxRateId: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      categoryService.getCategories().then(setCategories).catch(console.error);
      productService.getTaxRates().then(setTaxRates).catch(console.error);
    }
  }, [isOpen]);

  // Load product data when opened or product changes
  useEffect(() => {
    if (isOpen && product) {
      setEditProduct({
        name: product.name,
        description: product.description || "",
        price: product.price.toString(),
        discountPrice: product.discountPrice ? product.discountPrice.toString() : "",
        stock: product.stock.toString(),
        subcategoryId: product.subcategoryId,
        brand: product.brand || "",
        barcode: product.barcode || "",
        unit: product.unit,
        isRecommended: product.isRecommended ?? false,
        isActive: product.isActive ?? true,
        taxRateId: product.taxRateId || "",
      });
      
      const imageUrl = product.images?.[0]?.url || null;
      setImagePreview(imageUrl);
      setImageFile(null);
      
      // Determine category from subcategory
      if (product.subcategory?.categoryId) {
        setSelectedCategoryId(product.subcategory.categoryId);
      }
    }
  }, [isOpen, product]);

  // Update available subcategories when category or categories list changes
  useEffect(() => {
    if (selectedCategoryId && categories.length > 0) {
      const category = categories.find((c) => c.id === selectedCategoryId);
      setAvailableSubcategories(category?.subcategories || []);
    }
  }, [selectedCategoryId, categories]);

  const handleCategoryChange = (catId: string) => {
    setSelectedCategoryId(catId);
    const category = categories.find((c) => c.id === catId);
    const subs = category?.subcategories || [];
    setAvailableSubcategories(subs);
    setEditProduct((prev) => ({
      ...prev,
      subcategoryId: subs.length > 0 ? (subs[0]?.id || "") : "",
    }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!product) return;
    
    setFormError("");
    setIsMutating(true);

    if (!editProduct.name || !editProduct.price || !editProduct.subcategoryId || !editProduct.taxRateId) {
      setFormError("Por favor, completa los campos requeridos.");
      setIsMutating(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", editProduct.name.trim());
      formData.append("description", editProduct.description.trim());
      formData.append("price", parseFloat(editProduct.price).toString());
      if (editProduct.discountPrice) {
        formData.append("discountPrice", parseFloat(editProduct.discountPrice).toString());
      }
      formData.append("stock", parseInt(editProduct.stock).toString());
      formData.append("subcategoryId", editProduct.subcategoryId);
      formData.append("taxRateId", editProduct.taxRateId);
      formData.append("brand", editProduct.brand.trim());
      formData.append("barcode", editProduct.barcode.trim());
      formData.append("unit", editProduct.unit);
      formData.append("isRecommended", String(editProduct.isRecommended));
      formData.append("isActive", String(editProduct.isActive));

      if (imageFile) {
        formData.append("image", imageFile);
      }

      await productService.updateProduct(product.id, formData);
      onSave();
      onClose();
    } catch (err: any) {
      console.error("Error al actualizar producto:", err);
      setFormError(err.message || "No se pudo actualizar el producto.");
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 transition-opacity"
          />
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full md:w-[500px] lg:w-[600px] bg-white shadow-2xl z-50 flex flex-col border-l border-slate-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <h2 className="font-black text-lg text-slate-800 tracking-tight leading-none mb-1">
                    Editar Producto
                  </h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    ID: {product?.id.slice(0,8)}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Form */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {formError && (
                <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium border border-rose-100">
                  {formError}
                </div>
              )}

              <form id="edit-product-form" onSubmit={handleSubmit} className="space-y-8">
                
                {/* Bloque 1: Identificación e Imagen */}
                <section>
                  <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-4">Detalles Generales</h3>
                  
                  <div className="flex flex-col md:flex-row gap-6 mb-4">
                    <div className="shrink-0">
                      <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 relative group flex items-center justify-center">
                        {imagePreview ? (
                          <OptimizedImage
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            containerClassName="w-full h-full"
                          />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-slate-300" />
                        )}
                        <label className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                          <span className="text-white text-xs font-bold px-3 py-1.5 bg-white/20 rounded-full backdrop-blur-md">
                            Cambiar Foto
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                    </div>

                    <div className="flex-1 space-y-4">
                      <Input
                        label="Nombre Comercial *"
                        required
                        value={editProduct.name}
                        onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                      />
                      <Input
                        label="Marca"
                        value={editProduct.brand}
                        onChange={(e) => setEditProduct({ ...editProduct, brand: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col">
                      <label className="text-xs font-bold text-slate-700 mb-1.5">Descripción</label>
                      <textarea
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none resize-none min-h-[80px] text-sm"
                        value={editProduct.description}
                        onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                      />
                    </div>
                    
                    <Input
                      label="Código de Barras"
                      leftIcon={<Barcode className="w-4 h-4" />}
                      value={editProduct.barcode}
                      onChange={(e) => setEditProduct({ ...editProduct, barcode: e.target.value })}
                    />
                  </div>
                </section>

                <div className="h-px bg-slate-100" />

                {/* Bloque 2: Clasificación */}
                <section>
                  <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-4">Clasificación</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Categoría Principal *"
                      value={selectedCategoryId}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </Select>
                    <Select
                      label="Subcategoría *"
                      value={editProduct.subcategoryId}
                      onChange={(e) => setEditProduct({ ...editProduct, subcategoryId: e.target.value })}
                    >
                      {availableSubcategories.map((sub) => (
                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                      ))}
                    </Select>
                  </div>
                </section>

                <div className="h-px bg-slate-100" />

                {/* Bloque 3: Finanzas e Inventario */}
                <section>
                  <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-4">Finanzas e Inventario</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <Input
                      type="number"
                      step="0.01"
                      label="Precio Regular *"
                      required
                      leftIcon={<DollarSign className="w-4 h-4" />}
                      value={editProduct.price}
                      onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                    />
                    <Input
                      type="number"
                      step="0.01"
                      label="Precio Descuento"
                      leftIcon={<DollarSign className="w-4 h-4" />}
                      value={editProduct.discountPrice}
                      onChange={(e) => setEditProduct({ ...editProduct, discountPrice: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Input
                      type="number"
                      label="Stock *"
                      required
                      value={editProduct.stock}
                      onChange={(e) => setEditProduct({ ...editProduct, stock: e.target.value })}
                    />
                    <Select
                      label="Unidad"
                      value={editProduct.unit}
                      onChange={(e) => setEditProduct({ ...editProduct, unit: e.target.value })}
                    >
                      <option value="UNID">Unidad</option>
                      <option value="KG">Kilogramo</option>
                      <option value="GR">Gramo</option>
                      <option value="LITRO">Litro</option>
                      <option value="CJ">Caja</option>
                    </Select>
                    <Select
                      label="Impuesto *"
                      value={editProduct.taxRateId}
                      onChange={(e) => setEditProduct({ ...editProduct, taxRateId: e.target.value })}
                    >
                      {taxRates.map((tax) => (
                        <option key={tax.id} value={tax.id}>{tax.name} ({tax.rate}%)</option>
                      ))}
                    </Select>
                  </div>
                </section>

                <div className="h-px bg-slate-100" />

                {/* Bloque 4: Configuración */}
                <section>
                  <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-4">Configuración de Catálogo</h3>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors flex-1">
                      <input
                        type="checkbox"
                        checked={editProduct.isActive}
                        onChange={(e) => setEditProduct({ ...editProduct, isActive: e.target.checked })}
                        className="w-5 h-5 rounded border-slate-300 text-brand focus:ring-brand"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">Producto Activo</span>
                        <span className="text-xs text-slate-500">Visible en tienda</span>
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-slate-100 hover:bg-brand/5 transition-colors flex-1">
                      <input
                        type="checkbox"
                        checked={editProduct.isRecommended}
                        onChange={(e) => setEditProduct({ ...editProduct, isRecommended: e.target.checked })}
                        className="w-5 h-5 rounded border-slate-300 text-brand focus:ring-brand"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">Recomendado</span>
                        <span className="text-xs text-slate-500">Sección portada</span>
                      </div>
                    </label>
                  </div>
                </section>

                {/* Spacing for footer */}
                <div className="h-20" />
              </form>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-slate-100 bg-white/80 backdrop-blur-md sticky bottom-0">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3.5 rounded-xl text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  form="edit-product-form"
                  disabled={isMutating}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand text-white font-bold hover:bg-brand-dark transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-brand/30"
                >
                  {isMutating ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
