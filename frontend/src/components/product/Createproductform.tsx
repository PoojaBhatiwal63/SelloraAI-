import { useState } from "react";
import { ArrowLeft, FileText, SlidersHorizontal, CloudUpload } from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ProductLinksEditor from "./Productlinkseditor";
import ProductPreviewCard from "./Productpreviewcard";
import { PRODUCT_TYPES, type Product, type ProductLinkItem, type ProductStatus, type ProductType } from "./Types";

interface CreateProductFormProps {
  onCreate: (product: Product) => void;
  onCancel: () => void;
}

export default function CreateProductForm({ onCreate, onCancel }: CreateProductFormProps) {
  // One state per field keeps this easy to follow for anyone new to the file.
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ProductType | "">("");
  const [price, setPrice] = useState("");
  const [links, setLinks] = useState<ProductLinkItem[]>([]);
  const [status, setStatus] = useState<ProductStatus>("draft");

  const handleSubmit = () => {
    if (!title || !slug || !description || !type || !price) {
      alert("Please fill all required fields.");
      return;
    }

    // No _id here — the backend creates it when the product is saved.
    onCreate({
      title,
      slug,
      description,
      type,
      price: Number(price),
      links,
      status,
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <button
          onClick={onCancel}
          className="h-9 w-9 shrink-0 rounded-md border bg-white flex items-center justify-center hover:bg-slate-50 mt-0.5"
        >
          <ArrowLeft className="h-4 w-4 text-slate-600" />
        </button>
        <div>
          <p className="text-sm text-slate-400 mb-1">Product &gt; Create</p>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Create Product</h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Add your digital product details to the catalog.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 rounded-xl border bg-white shadow-sm">
          <div className="p-4 sm:p-8 space-y-8 sm:space-y-10">
            {/* Basic Info */}
            <section className="space-y-5">
              <div className="flex items-center gap-2 border-b pb-3">
                <FileText className="h-4 w-4 text-indigo-600" />
                <h2 className="text-lg font-semibold text-slate-900">Basic Info</h2>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="title">
                  Product Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. Advanced Metrics Dashboard"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="slug">
                  Slug <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center rounded-md border bg-white overflow-hidden focus-within:ring-1 focus-within:ring-indigo-500">
                  <span className="pl-2 sm:pl-3 text-xs sm:text-sm text-slate-400 whitespace-nowrap bg-slate-50 self-stretch flex items-center pr-2 sm:pr-3 border-r">
                    sellora.ai/product/
                  </span>
                  <Input
                    id="slug"
                    placeholder="advanced-metrics"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="border-0 focus-visible:ring-0 shadow-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  rows={5}
                  placeholder="Briefly describe the product..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </section>

            {/* Product Details */}
            <section className="space-y-5">
              <div className="flex items-center gap-2 border-b pb-3">
                <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
                <h2 className="text-lg font-semibold text-slate-900">Product Details</h2>
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
                      placeholder="0.00"
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

            {/* Status */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900 border-b pb-3">Status</h2>
              <RadioGroup
                value={status}
                onValueChange={(value) => setStatus(value as ProductStatus)}
                className="flex items-center gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="draft" id="draft" />
                  <Label htmlFor="draft" className="font-normal cursor-pointer">
                    Draft
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="published" id="published" />
                  <Label htmlFor="published" className="font-normal cursor-pointer">
                    Published
                  </Label>
                </div>
              </RadioGroup>
            </section>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t px-4 sm:px-8 py-5 bg-slate-50 rounded-b-xl">
            <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
              onClick={handleSubmit}
            >
              Create Product
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