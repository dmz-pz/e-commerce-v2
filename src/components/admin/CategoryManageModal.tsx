import React, { useState, useEffect } from "react";
import { FolderPlus, ListTree, Tag, Save } from "lucide-react";
import { Category } from "../../types/index.ts";
import { categoryService } from "../../services/categoryService.ts";
import { Input } from "../ui/Input.tsx";
import { Select } from "../ui/Select.tsx";
import { ModalFormLayout } from "../ui/ModalFormLayout.tsx";

interface CategoryManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CategoryManageModal: React.FC<CategoryManageModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<"category" | "subcategory">("category");
  const [isMutating, setIsMutating] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  const [categoryName, setCategoryName] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      const categoriesList = Array.isArray(data) ? data : [];
      setCategories(categoriesList);
      
      const firstCategory = categoriesList[0];
      if (firstCategory && !selectedCategoryId) {
        setSelectedCategoryId(firstCategory.id);
      }
    } catch (error) {
      console.error("Error cargando categorías", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      setFormError("");
      setFormSuccess("");
      setCategoryName("");
      setSubcategoryName("");
    }
  }, [isOpen]);

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    
    if (!categoryName.trim()) {
      setFormError("El nombre de la categoría es obligatorio.");
      return;
    }

    setIsMutating(true);
    try {
      await categoryService.createCategory(categoryName.trim());
      setFormSuccess(`Categoría "${categoryName}" creada exitosamente.`);
      setCategoryName("");
      await loadCategories();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      setFormError(error.message || "Error al crear la categoría.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleSubcategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!selectedCategoryId) {
      setFormError("Debes seleccionar una categoría principal.");
      return;
    }

    if (!subcategoryName.trim()) {
      setFormError("El nombre de la subcategoría es obligatorio.");
      return;
    }

    setIsMutating(true);
    try {
      await categoryService.createSubcategory(subcategoryName.trim(), selectedCategoryId);
      setFormSuccess(`Subcategoría "${subcategoryName}" creada exitosamente.`);
      setSubcategoryName("");
      await loadCategories();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      setFormError(error.message || "Error al crear la subcategoría.");
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <ModalFormLayout
      isOpen={isOpen}
      onClose={onClose}
      title="Estructura del Catálogo"
      subtitle="Gestiona Categorías y Subcategorías"
      icon={<ListTree className="w-5 h-5" />}
      formError={formError}
      formSuccess={formSuccess}
      hideSubmitButton={true}
    >
      <div className="flex bg-slate-50 border border-slate-200 p-1.5 rounded-2xl gap-1 mb-6">
        <button
          type="button"
          onClick={() => { setActiveTab("category"); setFormError(""); setFormSuccess(""); }}
          className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === "category"
              ? "bg-brand text-white shadow shadow-brand/20"
              : "text-slate-500 hover:bg-slate-100 hover:text-brand"
          }`}
        >
          <FolderPlus className="w-4 h-4" />
          Categoría Principal
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab("subcategory"); setFormError(""); setFormSuccess(""); }}
          className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === "subcategory"
              ? "bg-brand text-white shadow shadow-brand/20"
              : "text-slate-500 hover:bg-slate-100 hover:text-brand"
          }`}
        >
          <Tag className="w-4 h-4" />
          Subcategoría
        </button>
      </div>

      {activeTab === "category" ? (
        <form onSubmit={handleCategorySubmit} className="space-y-6">
          <Input
            label="Nombre de la Categoría *"
            placeholder="ej. Abarrotes, Carnicería, Bebidas..."
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
          />
          <div className="pt-2">
            <button
              type="submit"
              disabled={isMutating}
              className="w-full bg-brand text-white text-[11px] h-12 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-dark transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-brand/15"
            >
              <Save className="w-4 h-4" />
              {isMutating ? "Guardando..." : "Crear Categoría"}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubcategorySubmit} className="space-y-6">
          <Select
            label="Categoría Padre *"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            required
          >
            {categories.length === 0 && <option value="">Sin categorías disponibles</option>}
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>
          
          <Input
            label="Nombre de la Subcategoría *"
            placeholder="ej. Arroz, Lácteos, Gaseosas..."
            value={subcategoryName}
            onChange={(e) => setSubcategoryName(e.target.value)}
            required
          />
          
          <div className="pt-2">
            <button
              type="submit"
              disabled={isMutating}
              className="w-full bg-brand text-white text-[11px] h-12 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-dark transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-brand/15"
            >
              <Save className="w-4 h-4" />
              {isMutating ? "Guardando..." : "Crear Subcategoría"}
            </button>
          </div>
        </form>
      )}
    </ModalFormLayout>
  );
};
