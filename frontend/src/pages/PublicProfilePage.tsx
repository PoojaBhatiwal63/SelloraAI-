import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  AlertTriangle,
  Link2,
} from "lucide-react";
import { FaYoutube } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa6";
import { FaGithub } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryThumbnail, PRODUCT_TYPE_META } from "@/components/product/Productmeta";
import type { Product } from "@/components/product/Types";
import type { IUser } from "@/App";
import logo from "../assets/logo.png";
import { usePublicPartners, usePublicProducts } from "@/hooks/usePublicData";

// Loosely typed selector shape — adjust to your real RootState if you prefer.
interface RootStateShape {
  publicProducts: { products: Product[] };
  publicPartners: { partners: IUser[] };
}

const SOCIAL_LINKS: { key: "youtube" | "instagram" | "linkedin" | "github"; icon: typeof FaYoutube; label: string }[] = [
  { key: "youtube", icon: FaYoutube, label: "YouTube" },
  { key: "instagram", icon: FaInstagram , label: "Instagram" },
  { key: "linkedin", icon: FaLinkedin, label: "LinkedIn" },
  { key: "github", icon: FaGithub, label: "GitHub" },
];

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0).toUpperCase()).join("") || "?";
}



export default function PublicProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  usePublicPartners()
  usePublicProducts()

  const partners = useSelector((state: RootStateShape) => state.publicPartners.partners);
  const products = useSelector((state: RootStateShape) => state.publicProducts.products);

  const partner = partners.find(
  (p) =>
    p.partnerProfile?.slug === slug &&
    p.isActive === true
);

const partnerProducts = partner
  ? products.filter(
      (product) =>
        product.partnerId === partner._id
    )
  : [];



  

  if (!partner) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">

        <div className="mx-auto h-14 w-14 rounded-full bg-amber-50 flex items-center justify-center">
          <AlertTriangle className="h-7 w-7 text-amber-500" />
        </div>

        <h1 className="mt-5 text-xl font-semibold text-slate-900">
          Creator Unavailable
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          This creator profile is currently unavailable or no longer
          exists.
        </p>

        <Button
          onClick={() => navigate("/")}
          className="mt-6 bg-indigo-600 hover:bg-indigo-700"
        >
          Back to Marketplace
        </Button>

      </div>
    </div>
  );
}

  const socialLinks = partner.partnerProfile?.socialLinks;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={logo}
              alt="SelloraAI logo"
              className="h-6 w-6 rounded-sm object-contain shrink-0"
            />
            <span className="text-base sm:text-lg font-semibold tracking-tight truncate">
              SelloraAI
            </span>
          </div>
          <Button
            onClick={() => navigate("/")}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 shrink-0"
          >
            <span className="hidden sm:inline">Add Your Own Product</span>
            <span className="sm:hidden">List Product</span>
          </Button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Profile hero */}
        <div className="text-center">
          <div className="h-24 w-24 sm:h-32 sm:w-32 mx-auto rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-3xl sm:text-4xl font-bold">
            {getInitials(partner.name)}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-5">{partner.name}</h1>

          {partner.partnerProfile?.bio && (
            <p className="text-slate-500 mt-1 text-base sm:text-lg">
              {partner.partnerProfile.bio}
            </p>
          )}

          {partner.partnerProfile?.website && (
            <a
              href={partner.partnerProfile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-indigo-600 hover:underline mt-3 text-sm sm:text-base break-all"
            >
              <Link2 className="h-4 w-4 shrink-0" />
              {partner.partnerProfile.website}
            </a>
          )}

          {socialLinks && (
            <div className="flex items-center justify-center gap-3 mt-5 flex-wrap">
              {SOCIAL_LINKS.map(({ key, icon: Icon, label }) => {
                const url = socialLinks[key];
                if (!url) return null;
                const href = url.startsWith("http") ? url : `https://${url}`;
                return (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={label}
                    className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 transition-colors"
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </a>
                );
              })}
            </div>
          )}
        </div>

      

        {/* Products */}
        <div className="mt-10 sm:mt-14">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b pb-4 mb-6">
            Products by {partner.name}
          </h2>

          {partnerProducts.length === 0 ? (
            <p className="text-slate-400 text-sm">This creator hasn&apos;t listed any products yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {partnerProducts.map((product) => {
                const typeMeta = PRODUCT_TYPE_META[product.type];

                return (
                  <div
                    key={product._id}
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      window.open(
                        `/product/${product.slug}`,
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        window.open(
                          `/product/${product.slug}`,
                          "_blank",
                          "noopener,noreferrer"
                        );
                      }
                    }}
                    className="rounded-2xl border bg-white overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    <div className="relative h-36 sm:h-40 w-full">
                      <CategoryThumbnail type={product.type} fill className="rounded-none" />
                    </div>

                    <div className="p-4 sm:p-5 space-y-2">
                      <Badge className={`${typeMeta?.className} hover:${typeMeta?.className}`}>
                        {typeMeta?.label ?? product.type}
                      </Badge>

                      <h3 className="font-semibold text-slate-900 leading-snug">
                        {product.title}
                      </h3>

                      <p className="text-sm text-slate-500 line-clamp-2">{product.description}</p>

                      <div className="flex items-center justify-between pt-2">
                        <p className="text-lg font-bold text-slate-900">₹{product.price}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(
                              `/product/${product.slug}`,
                              "_blank",
                              "noopener,noreferrer"
                            );
                          }}
                        >
                          View Product
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
    
    </div>
  );
}