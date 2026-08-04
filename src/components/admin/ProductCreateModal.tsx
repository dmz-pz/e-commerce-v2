import React, { useState, useEffect } from "react";
import { Package, Save, DollarSign, Image as ImageIcon, Barcode, Percent } from "lucide-react";
import { Category, Subcategory } from "../../types/index.ts";
import { categoryService } from "../../services/categoryService.ts";
import { productService } from "../../services/productService.ts";
import { Input } from "../ui/Input.tsx";
import { Select } from "../ui/Select.tsx";
import { ModalFormLayout } from "../ui/ModalFormLayout.tsx";

interface ProductCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productPayload: Parameters<typeof import('../../services/productService.ts').productService.createProduct>[0]) => Promise<void>;
}

export const ProductCreateModal: React.FC<ProductCreateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [isMutating, setIsMutating] = useState(false);
  const [formError, setFormError] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [availableSubcategories, setAvailableSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [taxRates, setTaxRates] = useState<any[]>([]);

  const [newProduct, setNewProduct] = useState({
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

  useEffect(() => {
    if (isOpen) {
      categoryService
        .getCategories()
        .then((data: Category[]) => {
          setCategories(data);
          if (data.length > 0) {
            const firstCat = data[0];
            if (firstCat) {
              setSelectedCategoryId(firstCat.id);
              setAvailableSubcategories(firstCat.subcategories || []);
              if (firstCat.subcategories && firstCat.subcategories.length > 0) {
                setNewProduct((prev) => ({
                  ...prev,
                  subcategoryId: firstCat.subcategories![0]?.id || "",
                }));
              }
            }
          }
        })
        .catch((err) => console.error("Error al cargar categorías:", err));
        
      productService
        .getTaxRates()
        .then((data) => {
          setTaxRates(data);
          if (data.length > 0) {
            setNewProduct((prev) => ({ ...prev, taxRateId: data[0].id }));
          }
        })
        .catch((err) => console.error("Error al cargar impuestos:", err));
    }
  }, [isOpen]);

  const handleCategoryChange = (catId: string) => {
    setSelectedCategoryId(catId);
    const category = categories.find((c) => c.id === catId);
    const subs = category?.subcategories || [];
    setAvailableSubcategories(subs);
    setNewProduct((prev) => ({
      ...prev,
      subcategoryId: subs.length > 0 ? (subs[0]?.id || "") : "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsMutating(true);

    if (
      !newProduct.name ||
      !newProduct.price ||
      !imageFile ||
      !newProduct.subcategoryId ||
      !newProduct.taxRateId
    ) {
      setFormError("Nombre, Precio, Imagen, Subcategoría e Impuesto son requeridos.");
      setIsMutating(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("description", newProduct.description);
      formData.append("price", String(newProduct.price));
      
      const parsedDiscount = Number(newProduct.discountPrice);
      if (parsedDiscount > 0) {
        formData.append("discountPrice", String(parsedDiscount));
      }
      
      formData.append("stock", String(newProduct.stock));
      formData.append("subcategoryId", newProduct.subcategoryId);
      formData.append("taxRateId", newProduct.taxRateId);
      if (newProduct.brand) formData.append("brand", newProduct.brand);
      if (newProduct.barcode) formData.append("barcode", newProduct.barcode);
      formData.append("unit", newProduct.unit);
      formData.append("isRecommended", String(newProduct.isRecommended));
      formData.append("isActive", String(newProduct.isActive));
      
      // Añadir la imagen
      formData.append("image", imageFile);

      await onSubmit(formData);

      setNewProduct({
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
        taxRateId: taxRates[0]?.id || "",
      });
      setImageFile(null);
      onClose();
    } catch (error) {
      const err = error as Error;
      setFormError(err.message || "No se pudo crear el producto.");
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <ModalFormLayout
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Cargar Nuevo Producto"
      subtitle="Expande el catálogo de la sucursal"
      icon={<Package className="w-5 h-5" />}
      formError={formError}
      isMutating={isMutating}
      submitText="Guardar Producto"
      submitIcon={<Save className="w-4 h-4" />}
      showCancelButton={true}
      cancelText="Cancelar"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Nombre Comercial */}
        <div className="sm:col-span-2">
          <Input
            label="Nombre Comercial *"
            placeholder="ej. Arroz Extra Primor 1kg"
            required
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          />
        </div>

        {/* Código de Barras */}
        <div>
          <Input
            label="Código de Barras"
            placeholder="750123456789"
            leftIcon={<Barcode className="w-4 h-4" />}
            value={newProduct.barcode}
            onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
          />
        </div>

        {/* Marca */}
        <div>
          <Input
            label="Marca"
            placeholder="ej. Primor"
            value={newProduct.brand}
            onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
          />
        </div>

        {/* Precio Unitario */}
        <div>
          <Input
            type="number"
            step="0.01"
            label="Precio Unitario ($) *"
            placeholder="0.00"
            required
            leftIcon={<DollarSign className="w-4 h-4" />}
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
          />
        </div>

        {/* Precio Descuento */}
        <div>
          <Input
            type="number"
            step="0.01"
            label="Precio Oferta (Opcional)"
            placeholder="0.00"
            leftIcon={<DollarSign className="w-4 h-4" />}
            value={newProduct.discountPrice}
            onChange={(e) => setNewProduct({ ...newProduct, discountPrice: e.target.value })}
          />
        </div>

        {/* Stock */}
        <div>
          <Input
            type="number"
            label="Stock Disponible *"
            placeholder="0"
            required
            value={newProduct.stock}
            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
          />
        </div>

        {/* Categoría Principal */}
        <div>
          <Select
            label="Categoría Principal *"
            value={selectedCategoryId}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>
        </div>

        {/* Subcategoría */}
        <div>
          <Select
            label="Subcategoría *"
            value={newProduct.subcategoryId}
            onChange={(e) => setNewProduct({ ...newProduct, subcategoryId: e.target.value })}
          >
            {availableSubcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </Select>
        </div>

        {/* Unidad de Medida */}
        <div>
          <Select
            label="Unidad de Medida"
            value={newProduct.unit}
            onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
          >
            <option value="UNID">Unidad (UNID)</option>
            <option value="KG">Kilogramo (KG)</option>
            <option value="GR">Gramo (GR)</option>
          </Select>
        </div>

        {/* Tasa de Impuesto */}
        <div>
          <Select
            label="Tasa de Impuesto *"
            leftIcon={<Percent className="w-4 h-4" />}
            required
            value={newProduct.taxRateId}
            onChange={(e) => setNewProduct({ ...newProduct, taxRateId: e.target.value })}
          >
            {taxRates.map((tax) => (
              <option key={tax.id} value={tax.id}>
                {tax.name} ({tax.percentage}%)
              </option>
            ))}
          </Select>
        </div>

        {/* Imagen URL -> File Upload */}
        <div className="sm:col-span-2">
          <Input
            type="file"
            accept="image/*"
            label="Imagen del Producto *"
            required
            leftIcon={<ImageIcon className="w-4 h-4" />}
            onChange={(e) => {
              const file = e.target.files?.[0];
              setImageFile(file || null);
            }}
          />
          {imageFile && (
            <p className="text-[10px] text-brand mt-1 ml-1 font-bold">
              Archivo seleccionado: {imageFile.name}
            </p>
          )}
        </div>

        {/* Descripción */}
        <div className="sm:col-span-2 flex flex-col gap-1.5">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
            Descripción Comercial
          </label>
          <textarea
            rows={3}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-4 text-xs font-bold text-slate-800 placeholder:text-slate-400 shadow-inner focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            placeholder="Describe las características principales del producto..."
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
          />
        </div>

        {/* Switchees de estado */}
        <div className="sm:col-span-2 flex items-center justify-between bg-slate-50/50 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isRecommended"
              className="w-4.5 h-4.5 accent-brand rounded border-slate-300 focus:ring-brand cursor-pointer"
              checked={newProduct.isRecommended}
              onChange={(e) => setNewProduct({ ...newProduct, isRecommended: e.target.checked })}
            />
            <label
              htmlFor="isRecommended"
              className="text-[10px] font-black text-slate-700 uppercase tracking-wider cursor-pointer select-none"
            >
              ¿Destacar?
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              className="w-4.5 h-4.5 accent-emerald-500 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
              checked={newProduct.isActive}
              onChange={(e) => setNewProduct({ ...newProduct, isActive: e.target.checked })}
            />
            <label
              htmlFor="isActive"
              className="text-[10px] font-black text-slate-700 uppercase tracking-wider cursor-pointer select-none"
            >
              ¿Vender ya?
            </label>
          </div>
        </div>
      </div>
    </ModalFormLayout>
  );
};
