import {
  IndianRupee,
  ShoppingBag,
  Package,

  ExternalLink,
  CalendarDays,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";

import { Button } from "../ui/button";

import { useSelector } from "react-redux";
import { useState } from "react";




import {
  CategoryIcon,
  PRODUCT_TYPE_META,
} from "@/components/product/Productmeta";
import type { RootState } from "@/redux/store";
import type { Order } from "@/redux/orderSlice";
import AIAnalytics from "./AIAnalytics";







// ==========================================
// STAT CARD
// ==========================================

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
}

function StatCard({
  label,
  value,
  icon,
}: StatCardProps) {

  return (
    <Card className="shadow-sm">

      <CardContent className="flex items-center justify-between py-5 sm:py-6">

        <div className="min-w-0">

          <p className="text-sm text-slate-500">
            {label}
          </p>

          <p className="text-xl sm:text-2xl font-semibold text-slate-900 mt-1 truncate">
            {value}
          </p>

        </div>

        <div className="h-10 w-10 shrink-0 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
          {icon}
        </div>

      </CardContent>

    </Card>
  );
}


// ==========================================
// DASHBOARD
// ==========================================

export default function DashboardPanel() {

  const [activeTab, setActiveTab] =
    useState<"products" | "orders">("products");


  const partner = useSelector(
    (state: RootState) =>
      state.partner.partner
  );


  const products = useSelector(
    (state: RootState) =>
      state.publicProducts.products
  );
   const orders = useSelector(
    (state: RootState) =>
      state.orders.orders
  );


  


  // ==========================================
  // PARTNER PRODUCTS
  // ==========================================

  const partnerProducts =
    products.filter(
      (product) =>
        product.partnerId === partner?._id
    );


  // ==========================================
  // PARTNER ORDERS
  // ==========================================

  const partnerOrders =
    orders.filter(
      (order: Order) =>
        order.partnerId === partner?._id
    );


  const totalRevenue =
    partner?.totalRevenue ?? 0;


  const totalSales =
    partner?.totalSales ?? 0;


  const activeProducts =
    partnerProducts.length;

  const analyticsData = {
  partner: {
    id: partner?._id ?? "",
    name: partner?.name ?? "",
  },

  summary: {
    totalRevenue: partner?.totalRevenue ?? 0,
    totalSales: partner?.totalSales ?? 0,
    totalProducts: partnerProducts.length,
  },

  products: partnerProducts
  .filter((product) => product._id)
  .map((product) => ({
    id: product._id!,
    title: product.title,
    type: product.type,
    price: product.price,
    totalSales: product.totalSales ?? 0,
    totalRevenue: product.totalRevenue ?? 0,
  })),

  orders: partnerOrders
    .filter(
      (order) =>
        order.paymentStatus === "success"
    )
    .map((order) => ({
      productTitle: order.productTitle,
      partnerAmount: order.partnerAmount,
      createdAt: order.createdAt,
    })),
};


  return (

    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-6 sm:space-y-8">

      {/* =====================================
          HEADER
      ===================================== */}

      <div>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Hello, {partner?.name || "Partner"} 👋
        </h1>

        <p className="text-sm sm:text-base text-slate-500 mt-1">
          Here’s an overview of your store performance.
        </p>

      </div>


      {/* =====================================
          ANALYTICS
      ===================================== */}

      <div>

        <h2 className="text-lg font-semibold text-slate-900">
          Your Analytics
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Track your sales, earnings, and product performance.
        </p>

      </div>


      {/* =====================================
          STATS
      ===================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">

        <StatCard
          label="Total Earnings"
          value={`₹${totalRevenue.toFixed(2)}`}
          icon={
            <IndianRupee className="h-5 w-5" />
          }
        />

        <StatCard
          label="Total Sales"
          value={String(totalSales)}
          icon={
            <ShoppingBag className="h-5 w-5" />
          }
        />

        <StatCard
          label="Active Products"
          value={String(activeProducts)}
          icon={
            <Package className="h-5 w-5" />
          }
        />

      </div>


      {/* =====================================
          AI ANALYTICS
      ===================================== */}

      <AIAnalytics
  analyticsData={analyticsData}
/>


      {/* =====================================
          PRODUCTS / ORDERS
      ===================================== */}

      <Card className="shadow-sm overflow-hidden">

        {/* Header */}

        <CardHeader className="pb-3 sm:pb-4">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <CardTitle className="text-base">
              {activeTab === "products"
                ? "Your Products"
                : "Recent Orders"}
            </CardTitle>


            {/* Toggle */}

            <div className="flex w-full sm:w-auto rounded-lg bg-slate-100 p-1">

              <button
                type="button"
                onClick={() =>
                  setActiveTab("products")
                }
                className={`
                  flex-1 sm:flex-none
                  px-4 py-1.5
                  rounded-md
                  text-sm
                  font-medium
                  transition
                  ${
                    activeTab === "products"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }
                `}
              >
                Products
              </button>


              <button
                type="button"
                onClick={() =>
                  setActiveTab("orders")
                }
                className={`
                  flex-1 sm:flex-none
                  px-4 py-1.5
                  rounded-md
                  text-sm
                  font-medium
                  transition
                  ${
                    activeTab === "orders"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }
                `}
              >
                Orders
              </button>

            </div>

          </div>

        </CardHeader>


        <CardContent className="pt-0">

          {/* ===================================
              PRODUCTS
          =================================== */}

          {activeTab === "products" && (

            partnerProducts.length === 0 ? (

              <p className="text-sm text-slate-500 py-10 text-center">
                No published products yet.
              </p>

            ) : (

              <div className="divide-y">

                {partnerProducts
                  .slice(0, 5)
                  .map((product) => {

                    const meta =
                      PRODUCT_TYPE_META[
                        product.type
                      ];


                    return (

                      <div
                        key={product._id}
                        className="flex items-center gap-3 sm:gap-4 py-4"
                      >

                        {/* Product */}

                        <CategoryIcon
                          type={product.type}
                          size="sm"
                        />


                        <div className="flex-1 min-w-0">

                          <p className="font-medium text-sm sm:text-base text-slate-900 truncate">
                            {product.title}
                          </p>

                          <p className="text-xs text-slate-400 mt-0.5">
                            {meta?.label ?? product.type}
                          </p>

                        </div>


                        {/* Desktop stats */}

                        <div className="hidden md:flex items-center gap-8 text-sm">

                          <div>

                            <p className="text-xs text-slate-400">
                              Sales
                            </p>

                            <p className="font-medium text-slate-700">
                              {product.totalSales ?? 0}
                            </p>

                          </div>


                          <div>

                            <p className="text-xs text-slate-400">
                              Revenue
                            </p>

                            <p className="font-medium text-slate-700">
                              ₹
                              {(product.totalRevenue ?? 0).toFixed(2)}
                            </p>

                          </div>

                        </div>


                        {/* Mobile stats */}

                        <div className="hidden sm:block md:hidden text-right">

                          <p className="text-xs text-slate-400">
                            Sales
                          </p>

                          <p className="text-sm font-medium text-slate-700">
                            {product.totalSales ?? 0}
                          </p>

                        </div>


                        <Button
                          variant="ghost"
                          size="icon"
                         
                          className="shrink-0"
                        >

                          <a
                            href={`/product/${product.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>

                        </Button>

                      </div>

                    );

                  })}

              </div>

            )

          )}


          {/* ===================================
              ORDERS
          =================================== */}

          {activeTab === "orders" && (

            partnerOrders.length === 0 ? (

              <div className="py-10 text-center">

                <ShoppingBag className="h-8 w-8 mx-auto text-slate-300 mb-2" />

                <p className="text-sm text-slate-500">
                  No orders yet.
                </p>

              </div>

            ) : (

              <div className="divide-y">

                {partnerOrders
                  .slice(0, 5)
                  .map((order) => (

                    <div
                      key={order._id}
                      className="py-4"
                    >

                      <div className="flex items-center gap-3">

                        {/* Icon */}

                        <div className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">

                          <ShoppingBag className="h-4 w-4" />

                        </div>


                        {/* Order info */}

                        <div className="flex-1 min-w-0">

                          <p className="font-medium text-sm sm:text-base text-slate-900 truncate">
                            {order.productTitle}
                          </p>

                          <p className="text-xs text-slate-400 mt-0.5 truncate">
                            Customer: {order.customerName}
                          </p>

                        </div>


                        {/* Amount */}

                        <div className="text-right shrink-0">

                          <p className="font-semibold text-sm text-slate-900">
                            ₹{order.partnerAmount.toFixed(2)}
                          </p>

                          <span
                            className={`
                              inline-flex
                              items-center
                              text-[11px]
                              font-medium
                              mt-1
                              px-2
                              py-0.5
                              rounded-full
                              ${
                                order.paymentStatus === "success"
                                  ? "bg-green-50 text-green-700"
                                  : order.paymentStatus === "pending"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-red-50 text-red-700"
                              }
                            `}
                          >
                            {order.paymentStatus}
                          </span>

                        </div>

                      </div>


                      {/* Order date */}

                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2 ml-12 sm:ml-14">

                        <CalendarDays className="h-3.5 w-3.5" />

                        {new Date(
                          order.createdAt
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}

                      </div>

                    </div>

                  ))}

              </div>

            )

          )}

        </CardContent>

      </Card>

    </div>
  );
}