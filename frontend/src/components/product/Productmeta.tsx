import {
  GraduationCap,
  Code2,
  BookOpen,
  LayoutGrid,
  LayoutTemplate,
  Sparkles,
  AppWindow,
  Package,
  type LucideIcon,
} from "lucide-react";
import type { ProductType } from "./Types";
import courseThumb from "../../assets/courses.png";
import sourceCodeThumb from "../../assets/sourcecode.png";
import ebookThumb from "../../assets/ebook.png";
import uiKitThumb from "../../assets/uikit.png";
import templateThumb from "../../assets/template.png";
import aiPromptThumb from "../../assets/aiprompt.png";
import softwareThumb from "../../assets/software.png";
import otherThumb from "../../assets/other.png";

interface ProductTypeMeta {
  label: string;
  icon: LucideIcon;
  className: string; 
  thumbnail: string; 
}

export const PRODUCT_TYPE_META: Record<ProductType, ProductTypeMeta> = {
  course: {
    label: "Course",
    icon: GraduationCap,
    className: "bg-amber-50 text-amber-600",
    thumbnail: courseThumb,
  },
  "source-code": {
    label: "Source Code",
    icon: Code2,
    className: "bg-slate-100 text-slate-600",
    thumbnail: sourceCodeThumb,
  },
  ebook: {
    label: "Ebook",
    icon: BookOpen,
    className: "bg-blue-50 text-blue-600",
    thumbnail: ebookThumb,
  },
  "ui-kit": {
    label: "UI Kit",
    icon: LayoutGrid,
    className: "bg-purple-50 text-purple-600",
    thumbnail: uiKitThumb,
  },
  template: {
    label: "Template",
    icon: LayoutTemplate,
    className: "bg-teal-50 text-teal-600",
    thumbnail: templateThumb,
  },
  "ai-prompt": {
    label: "AI Prompt",
    icon: Sparkles,
    className: "bg-pink-50 text-pink-600",
    thumbnail: aiPromptThumb,
  },
  software: {
    label: "Software",
    icon: AppWindow,
    className: "bg-indigo-50 text-indigo-600",
    thumbnail: softwareThumb,
  },
  other: {
    label: "Other",
    icon: Package,
    className: "bg-gray-100 text-gray-600",
    thumbnail: otherThumb,
  },
};

const SIZE_CLASSES = {
  sm: { box: "h-9 w-9 rounded-md", icon: "h-4 w-4" },
  md: { box: "h-11 w-11 rounded-lg", icon: "h-5 w-5" },
  lg: { box: "h-16 w-16 rounded-xl", icon: "h-7 w-7" },
  xl: { box: "h-28 w-28 sm:h-32 sm:w-32 rounded-3xl", icon: "h-10 w-10" },
};

interface CategoryIconProps {
  type: ProductType;
  size?: keyof typeof SIZE_CLASSES;
}


export function CategoryIcon({ type, size = "md" }: CategoryIconProps) {
  const meta = PRODUCT_TYPE_META[type] ?? PRODUCT_TYPE_META.other;
  const Icon = meta.icon;
  const sizing = SIZE_CLASSES[size];

  return (
    <div className={`flex items-center justify-center shrink-0 ${meta.className} ${sizing.box}`}>
      <Icon className={sizing.icon} />
    </div>
  );
}

interface CategoryThumbnailProps {
  type: ProductType;
  size?: keyof typeof SIZE_CLASSES;
  showIconBadge?: boolean;
  className?: string;
  fill?: boolean;
}

export function CategoryThumbnail({
  type,
  size = "md",
  showIconBadge = false,
  className = "",
  fill = false,
}: CategoryThumbnailProps) {
  const meta = PRODUCT_TYPE_META[type] ?? PRODUCT_TYPE_META.other;
  const Icon = meta.icon;
  const sizing = SIZE_CLASSES[size];
  const boxSizing = fill ? "h-full w-full" : `${sizing.box} shrink-0`;

  return (
    <div className={`relative overflow-hidden ${meta.className} ${boxSizing} ${className}`}>
      <img
        src={meta.thumbnail}
        alt={meta.label}
        className="h-full w-full object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
      {showIconBadge && (
        <div className="absolute bottom-3 right-3 h-9 w-9 rounded-full bg-white shadow flex items-center justify-center border">
          <Icon className="h-4 w-4 text-slate-600" />
        </div>
      )}
    </div>
  );
}