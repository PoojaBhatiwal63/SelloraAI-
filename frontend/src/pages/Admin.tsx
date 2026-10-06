import {
  useState,
} from "react";

import {
  LayoutDashboard,
  Wallet,
} from "lucide-react";
import logo from "../assets/logo.png";
import {
  Button,
} from "@/components/ui/button";

import AdminDashboard from "@/components/admin/AdminDashboard";

import PayToPartner from "@/components/admin/PayToPartner";

import type { IAdmin, IUser } from "@/App";

import { useDispatch, useSelector } from "react-redux";
import { type RootState } from "@/redux/store";
import api from "@/utils/axios";
import { toast } from "sonner";
import { updatePartner } from "@/redux/publicPartnerSlice";


// ==========================================
// PROPS
// ==========================================
interface AdminProps {
  admin: IAdmin | null;
}


// ==========================================
// ADMIN PAGE
// ==========================================

export default function Admin({
  admin,
}: AdminProps) {
  const dispatch = useDispatch();

    const partners = useSelector(
    (state: RootState) =>
      state.publicPartners.partners
  );


  const products = useSelector(
    (state: RootState) =>
      state.publicProducts.products
  );


  const [
    activeSection,
    setActiveSection,
  ] = useState<
    "dashboard" | "payments"
  >("dashboard");


  // ==========================================
  // TOGGLE PARTNER
  // ==========================================
const handleTogglePartner = async (
    partner: IUser
) => {

    try {

        const { data } =
            await api.patch(
                `/api/auth/partner/${partner._id}/toggle-status`
            );
            dispatch(
      updatePartner(data.partner)
    );


        if (data.success) {

            toast.success(
                data.message
            );

        }

    }
    catch (error: any) {

        console.log(
            "Toggle partner error:",
            error
        );

        toast.error(
            error.response?.data?.message ||
            "Failed to update partner status"
        );

    }

};


  // ==========================================
  // PAYMENT SUCCESS
  // ==========================================

  // ==========================================
// PAYMENT SUCCESS
// ==========================================

const handlePaymentSuccess = async (
  partner: IUser
) => {

  try {

    if (!partner._id) {
      toast.error("Partner ID not found");
      return;
    }

    // ======================================
    // CREATE PARTNER PAYMENT
    // ======================================

    const { data } = await api.post(
      "/api/order/pay-partner",
      {
        partnerId: partner._id,
        partnerName: partner.name,
        partnerEmail: partner.email,
        amount:partner.totalRevenue
      }
    );


    if (!data.success) {

      toast.error(
        data.message ||
        "Partner payment failed"
      );

      return;
    }


    // ======================================
    // RESET PARTNER REVENUE
    // AUTH SERVICE
    // ======================================

    const resetResponse =
      await api.patch(
        `/api/auth/partner/${partner._id}/reset-revenue`
      );


    if (!resetResponse.data.success) {

      toast.error(
        "Payment recorded but revenue reset failed"
      );

      return;
    }


    // ======================================
    // UPDATE REDUX PARTNER
    // ======================================

    dispatch(
      updatePartner({
        ...partner,

        totalRevenue: 0,
      })
    );


    // ======================================
    // SUCCESS
    // ======================================

    toast.success(
      "Partner payment completed successfully"
    );

  }
  catch (error: any) {

    console.log(
      "Partner payment error:",
      error
    );


    toast.error(
      error.response?.data?.message ||
      "Failed to process partner payment"
    );

  }

};


  return (

    <div className="min-h-screen bg-slate-50">


      {/* =====================================
          ADMIN NAV
      ===================================== */}

      <header className="border-b bg-white">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className=" mt-2 flex items-center flex-wrap gap-3 justify-between h-16">

            <div className="flex items-center gap-2">
                        <img
                            src={logo}
                            alt="SelloraAI logo"
                            className="h-6 w-6 rounded-sm object-contain"
                        />
                        <span className="text-lg font-semibold tracking-tight">Admin Panel</span>
                    </div>


            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">

              <Button
                variant={
                  activeSection === "dashboard"
                    ? "default"
                    : "ghost"
                }
                size="sm"
                onClick={() =>
                  setActiveSection(
                    "dashboard"
                  )
                }
              >

                <LayoutDashboard className="h-4 w-4 mr-2" />

                Dashboard

              </Button>


              <Button
                variant={
                  activeSection === "payments"
                    ? "default"
                    : "ghost"
                }
                size="sm"
                onClick={() =>
                  setActiveSection(
                    "payments"
                  )
                }
              >

                <Wallet className="h-4 w-4 mr-2" />

                Pay To Partner

              </Button>

            </div>

          </div>

        </div>

      </header>


      {/* =====================================
          CONTENT
      ===================================== */}

      {activeSection === "dashboard" ? (

        <AdminDashboard
          partners={partners}
          products={products}
          admin={admin}
          onTogglePartner={
            handleTogglePartner
          }
        />

      ) : (

        <PayToPartner
          partners={partners}
          onPaymentSuccess={
            handlePaymentSuccess
          }
        />

      )}

    </div>

  );

}