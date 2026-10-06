import { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Share2,
  ExternalLink,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CategoryIcon} from "./Productmeta";
import type { Product } from "./Types";
import { toast } from "sonner";

interface ProductsListProps {
  products: Product[];
  onCreateClick: () => void;
  onEditClick: (product: Product) => void;
  onDeleteClick: (product: Product) => void;
}

export default function ProductsList({
  products,
  onCreateClick,
  onEditClick,
  onDeleteClick,
}: ProductsListProps) {
  const [query, setQuery] = useState("");

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <p className="text-sm text-slate-400 mb-1">Products &gt; All Products</p>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Manage your digital products and sell them to customers.
          </p>
        </div>
        <Button
          onClick={onCreateClick}
          className="bg-indigo-600 hover:bg-indigo-700 gap-1.5 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Create Product
        </Button>
      </div>

      {/* Table card */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b">
          <div className="relative w-full sm:w-72">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Filter products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" className="gap-1.5 w-full sm:w-auto">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* Horizontal scroll wrapper keeps the table usable on small screens
            instead of squashing every column. */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="text-left font-medium px-4 py-3">Product</th>
                
                <th className="text-left font-medium px-4 py-3">Price</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
                <th className="text-right font-medium px-4 py-3 text-nowrap">Total Sales</th>
                <th className="text-right font-medium px-4 py-3">Revenue</th>
                <th className="text-left font-medium px-4 py-3">Created At</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <CategoryIcon type={product.type} size="sm" />
                      <div>
                        <p className="font-medium text-nowrap text-slate-900">
                          {product.title}
                        </p>

                        <div className="flex items-center gap-2">
                          <p className="text-xs text-nowrap text-slate-400">
                            /{product.slug}
                          </p>


                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-4 py-3 text-slate-700">₹{product.price.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <Badge
                      className={
                        product.status === "published"
                          ? "bg-green-50 text-green-700 hover:bg-green-50"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-100"
                      }
                    >
                      {product.status === "published" ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700">
                    {product.totalSales ?? 0}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700">
                    ₹{(product.totalRevenue ?? 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {product.createdAt}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">

                      {product.status === "published" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5 text-xs"
                          onClick={async () => {
                            const url = `${window.location.origin}/product/${product.slug}`;

                            try {
                              await navigator.clipboard.writeText(url);
                              toast("Product link copied!");
                            } catch (error) {
                              console.error("Copy link error:", error);
                            }
                          }}
                        >
                          <Share2 className="h-3.5 w-3.5" />
                          Share Link
                        </Button>
                      )}

                      {product.status === "published" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Open product"
                          onClick={() =>
                            window.open(
                              `/product/${product.slug}`,
                              "_blank",
                              "noopener,noreferrer"
                            )
                          }
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="
          h-8 w-8
          inline-flex
          items-center
          justify-center
          rounded-md
          text-slate-400
          hover:bg-slate-100
          hover:text-slate-600
        "
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">

                          <DropdownMenuItem
                            onClick={() => onEditClick(product)}
                          >
                            <Pencil className="h-3.5 w-3.5 mr-2" />
                            Edit
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => onDeleteClick(product)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            Delete
                          </DropdownMenuItem>

                        </DropdownMenuContent>
                      </DropdownMenu>

                    </div>
                  </td>
                </tr>
              ))}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        
      </div>
    </div>
  );
}