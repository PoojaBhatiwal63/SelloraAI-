import {
  IndianRupee,
  ShoppingBag,
  Users,
  Package,
  MoreHorizontal,
  Ban,
  CheckCircle2,
  UserRound,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


import {
  Badge,
} from "@/components/ui/badge";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

import {
  useSelector,
} from "react-redux";

import type { IAdmin, IUser } from "@/App";

import type { Product } from "@/components/product/Types";
import type { RootState } from "@/redux/store";







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

      <CardContent className="flex items-center justify-between py-6">

        <div>

          <p className="text-sm text-slate-500">
            {label}
          </p>

          <p className="text-2xl font-semibold text-slate-900 mt-1">
            {value}
          </p>

        </div>


        <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">

          {icon}

        </div>

      </CardContent>

    </Card>

  );

}


// ==========================================
// PROPS
// ==========================================

interface AdminDashboardProps {

  partners: IUser[];

  products: Product[];

  admin:IAdmin | null

  onTogglePartner: (
    partner: IUser
  ) => void;

}


// ==========================================
// COMPONENT
// ==========================================

export default function AdminDashboard({
  partners,
  products,
  admin,
  onTogglePartner,
}: AdminDashboardProps) {


  const orders = useSelector(
    (state: RootState) =>
      state.orders.orders
  );


  // ==========================================
  // TOTAL SALES
  // ==========================================

  const totalSales =
    orders.reduce(
      (total, order) =>
        total +
        order.partnerAmount +
        order.adminAmount,
      0
    );


  // ==========================================
  // ADMIN EARNINGS
  // ==========================================

  const adminEarnings =
    orders.reduce(
      (total, order) =>
        total +
        order.adminAmount,
      0
    );


  // ==========================================
  // COUNTS
  // ==========================================

  const totalPartners =
    partners.length;


  const totalProducts =
    products.length;


  return (

    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">


      {/* =====================================
          HEADER
      ===================================== */}

      <div>

        <h1 className="text-2xl font-bold text-slate-900">
          Admin Dashboard - Hello, {admin?.name} 👋
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Monitor your marketplace, partners, products and earnings.
        </p>

      </div>


      {/* =====================================
          STATS
      ===================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        <StatCard
          label="Total Sales"
          value={`₹${totalSales.toFixed(2)}`}
          icon={
            <ShoppingBag className="h-5 w-5" />
          }
        />


        <StatCard
          label="Admin Earnings"
          value={`₹${adminEarnings.toFixed(2)}`}
          icon={
            <IndianRupee className="h-5 w-5" />
          }
        />


        <StatCard
          label="Total Partners"
          value={String(totalPartners)}
          icon={
            <Users className="h-5 w-5" />
          }
        />


        <StatCard
          label="Total Products"
          value={String(totalProducts)}
          icon={
            <Package className="h-5 w-5" />
          }
        />

      </div>


      {/* =====================================
          PARTNERS
      ===================================== */}

      <Card className="shadow-sm">

        <CardHeader>

          <div className="flex items-center justify-between">

            <div>

              <CardTitle className="text-base">
                All Partners
              </CardTitle>

              <p className="text-sm text-slate-500 mt-1">
                Manage partner accounts and their products.
              </p>

            </div>

          </div>

        </CardHeader>


        <CardContent className="p-0">

          {partners.length === 0 ? (

            <div className="py-12 text-center">

              <UserRound className="h-8 w-8 mx-auto text-slate-300" />

              <p className="text-sm text-slate-500 mt-2">
                No partners found.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead>

                  <tr className="border-y bg-slate-50 text-slate-500">

                    <th className="text-left font-medium px-5 py-3">
                      Partner
                    </th>

                    <th className="text-left font-medium px-5 py-3">
                      Products
                    </th>

                    <th className="text-left font-medium px-5 py-3">
                      Sales
                    </th>

                    <th className="text-left font-medium px-5 py-3">
                      Revenue
                    </th>

                    <th className="text-left font-medium px-5 py-3">
                      Status
                    </th>

                    <th className="text-right font-medium px-5 py-3">
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody className="divide-y">

                  {partners.map((partner) => {

                    const partnerProducts =
                      products.filter(
                        (product) =>
                          product.partnerId ===
                          partner._id
                      );


                    return (

                      <tr
                        key={partner._id}
                        className="hover:bg-slate-50/60 transition-colors"
                      >

                        {/* Partner */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <Avatar>

                              <AvatarFallback>
                                {partner.name
                                  .charAt(0)
                                  .toUpperCase()}
                              </AvatarFallback>

                            </Avatar>


                            <div>

                              <p className="font-medium text-slate-900">
                                {partner.name}
                              </p>

                              <p className="text-xs text-slate-400">
                                {partner.email}
                              </p>

                            </div>

                          </div>

                        </td>


                        {/* Products */}

                        <td className="px-5 py-4">

                          <span className="font-medium">
                            {partnerProducts.length}
                          </span>

                        </td>


                        {/* Sales */}

                        <td className="px-5 py-4">
                          {partner.totalSales}
                        </td>


                        {/* Revenue */}

                        <td className="px-5 py-4 font-medium">
                          ₹
                          {partner.totalRevenue.toFixed(2)}
                        </td>


                        {/* Status */}

                        <td className="px-5 py-4">

                          {partner.isActive ? (

                            <Badge className="bg-green-50 text-green-700 hover:bg-green-50">
                              Active
                            </Badge>

                          ) : (

                            <Badge className="bg-red-50 text-red-700 hover:bg-red-50">
                              Inactive
                            </Badge>

                          )}

                        </td>


                        {/* Actions */}

                        <td className="px-5 py-4 text-right">

                          <DropdownMenu>

                            <DropdownMenuTrigger
                              className="h-8 w-8 inline-flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >

                              <MoreHorizontal className="h-4 w-4" />

                            </DropdownMenuTrigger>


                            <DropdownMenuContent align="end">

                              <DropdownMenuItem
                                onClick={() =>
                                  onTogglePartner(
                                    partner
                                  )
                                }
                              >

                                {partner.isActive ? (

                                  <>
                                    <Ban className="h-4 w-4 mr-2" />
                                    Disable
                                  </>

                                ) : (

                                  <>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Activate
                                  </>

                                )}

                              </DropdownMenuItem>

                            </DropdownMenuContent>

                          </DropdownMenu>

                        </td>

                      </tr>

                    );

                  })}

                </tbody>

              </table>

            </div>

          )}

        </CardContent>

      </Card>

    </div>

  );

}