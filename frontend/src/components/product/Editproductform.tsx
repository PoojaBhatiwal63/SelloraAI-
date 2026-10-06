import { useState } from "react";
import { Trash2, FileText, SlidersHorizontal, CloudUpload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProductLinksEditor from "./Productlinkseditor";
import ProductPreviewCard from "./Productpreviewcard";
import { PRODUCT_TYPES, type Product, type ProductLinkItem, type ProductStatus, type ProductType } from "./Types";
import { toast } from "sonner";

interface EditProductFormProps {
  product: Product;
  onSave: (product: Product) => void;
  onDelete: (product: Product) => void;
  onCancel: () => void;
}

export default function EditProductForm({
  product,
  onSave,
  onDelete,
  onCancel,
}: EditProductFormProps) {
  // Pre-fill state from the product passed in.
  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description);
  const [type, setType] = useState<ProductType>(product.type);
  const [price, setPrice] = useState(String(product.price));
  const [links, setLinks] = useState<ProductLinkItem[]>(product.links ?? []);
  const [status, setStatus] = useState<ProductStatus>(product.status);

  const buildProduct = (overrideStatus?: ProductStatus): Product => ({
    ...product,
    title,
    description,
    type,
    price: Number(price),
    links,
    status: overrideStatus ?? status,
  });

  const handleSave = () => {
    if (!title || !description || !price) {
      toast.success("Please fill all required fields.");
      return;
    }
    onSave(buildProduct());
  };

  // Toggles status every time it's clicked:
  // draft -> published on the first click, published -> draft on the next.
  const handleTogglePublish = () => {
    const nextStatus: ProductStatus = status === "published" ? "draft" : "published";
    setStatus(nextStatus);
    onSave(buildProduct(nextStatus));
  };

  const isPublished = status === "published";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <p className="text-sm text-slate-400 mb-1">Products &gt; Edit Product</p>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Edit Product</h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Update your product information and settings.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => onDelete(product)}
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 gap-1.5 w-full sm:w-auto"
          >
            <Trash2 className="h-4 w-4" />
            Delete Product
          </Button>
          <Button
            onClick={handleTogglePublish}
            className={
              isPublished
                ? "bg-slate-600 hover:bg-slate-700 w-full sm:w-auto"
                : "bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
            }
          >
            {isPublished ? "Move to Draft" : "Publish Product"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 rounded-xl border bg-white shadow-sm">
          <div className="p-4 sm:p-8 space-y-8 sm:space-y-10">
            {/* Basic Information */}
            <section className="space-y-5">
              <div className="flex items-center gap-2 border-b pb-3">
                <FileText className="h-4 w-4 text-indigo-600" />
                <h2 className="text-lg font-semibold text-slate-900">Basic Information</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="title">
                    Product Title <span className="text-red-500">*</span>
                  </Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
               
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  rows={5}
                  placeholder="Briefly describe your product."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </section>

            {/* Pricing & Configuration */}
            <section className="space-y-5">
              <div className="flex items-center gap-2 border-b pb-3">
                <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
                <h2 className="text-lg font-semibold text-slate-900">Pricing &amp; Configuration</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label>
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select value={type} onValueChange={(value) => setType(value as ProductType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_TYPES.map((productType) => (
                        <SelectItem key={productType.value} value={productType.value}>
                          {productType.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="price">
                    Price (USD) <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center rounded-md border bg-white overflow-hidden focus-within:ring-1 focus-within:ring-indigo-500">
                    <span className="pl-3 pr-2 text-sm text-slate-400">$</span>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="border-0 focus-visible:ring-0 shadow-none pl-0"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Guidance note before Product Links */}
            <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3.5 flex gap-3">
              <CloudUpload className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-slate-900">Where do I host my product files?</p>
                <p className="text-slate-500 mt-0.5">
                  Upload your product (files, folders, source code, etc.) to Google Drive, set
                  sharing to <span className="font-medium text-slate-700">&quot;Anyone with the link&quot;</span>,
                  then paste that link below — e.g. title it &quot;Download&quot; and add the Drive URL as
                  a Product Link.
                </p>
              </div>
            </div>

            <ProductLinksEditor links={links} onChange={setLinks} />
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t px-4 sm:px-8 py-5 bg-slate-50 rounded-b-xl">
            <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </div>
        </div>

        {/* Live preview */}
        <div>
          <ProductPreviewCard
            title={title}
            price={Number(price) || 0}
            type={type}
            description={description}
            status={status}
          />
        </div>
      </div>
    </div>
  );
}