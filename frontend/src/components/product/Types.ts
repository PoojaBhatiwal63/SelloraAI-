// Matches the backend IProduct mongoose model.
// _id is optional because a brand-new product (not yet saved) won't have one.

export type ProductType =
  | "course"
  | "source-code"
  | "ebook"
  | "ui-kit"
  | "template"
  | "ai-prompt"
  | "software"
  | "other";

export type ProductStatus = "draft" | "published";

export interface ProductLinkItem {
  title: string;
  url: string;
}

export interface Product {
  _id?: string;
  partnerId?: string;
  title: string;
  slug: string;
  description: string;
  type: ProductType;
  price: number;
  links: ProductLinkItem[];
  status: ProductStatus;
  totalSales?: number;
  totalRevenue?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const PRODUCT_TYPES: { value: ProductType; label: string }[] = [
  { value: "course", label: "Course" },
  { value: "source-code", label: "Source Code" },
  { value: "ebook", label: "Ebook" },
  { value: "ui-kit", label: "UI Kit" },
  { value: "template", label: "Template" },
  { value: "ai-prompt", label: "AI Prompt" },
  { value: "software", label: "Software" },
  { value: "other", label: "Other" },
];