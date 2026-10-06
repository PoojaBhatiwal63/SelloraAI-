import {useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import PartnerNav, {
  type PartnerTab,
} from "../components/partner/Partnernav";

import ProfilePanel from "@/components/partner/Profilepanel";
import DashboardPanel from "@/components/partner/Dashboardpanel ";
import DeactivatedNotice from "@/components/partner/Deactivatednotice ";

import api from "@/utils/axios";

import type {
  RootState,
  AppDispatch,
} from "@/redux/store";

import { setPartner } from "@/redux/partnerSlice";
import type { IAdmin, IUser } from "@/App";
import Productpanel from "@/components/partner/Productpanel";
import { useGetPartnerData } from "@/hooks/getPartnerData";
import { toast } from "sonner";

interface AdminProps {
  admin: IAdmin| null;
}
export default function PartnerPage({
  admin,
}: AdminProps) {
  const [activeTab, setActiveTab] =
    useState<PartnerTab>("dashboard");

  const [saving, setSaving] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

 
useGetPartnerData()
  const partner = useSelector(
    (state: RootState) =>
      state.partner.partner
  );

  

  if (!partner) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div
          className="
            h-10
            w-10
            animate-spin
            rounded-full
            border-4
            border-indigo-600
            border-t-transparent
          "
        />
      </div>
    );
  }

  if (partner.isActive === false) {
    return <DeactivatedNotice  admin={admin}/>;
  }

  const handleUpdateProfile = async (data: IUser) => {
  try {
    setSaving(true);

    const response = await api.patch(
      "/api/auth/update-partner",
      {
        name: data.name,

        partnerProfile: {
          slug:
            data.partnerProfile?.slug ?? "",

          bio:
            data.partnerProfile?.bio ?? "",

          website:
            data.partnerProfile?.website ?? "",

          socialLinks: {
            youtube:
              data.partnerProfile
                ?.socialLinks?.youtube ?? "",

            instagram:
              data.partnerProfile
                ?.socialLinks?.instagram ?? "",

            linkedin:
              data.partnerProfile
                ?.socialLinks?.linkedin ?? "",

            github:
              data.partnerProfile
                ?.socialLinks?.github ?? "",
          },
        },

        paymentDetails: {
          method:
            data.paymentDetails?.method ?? "upi",

          upiId:
            data.paymentDetails?.upiId ?? "",

          accountHolderName:
            data.paymentDetails
              ?.accountHolderName ?? "",

          accountNumber:
            data.paymentDetails
              ?.accountNumber ?? "",

          ifscCode:
            data.paymentDetails
              ?.ifscCode ?? "",
        },
      }
    );

    if (response.data.success) {

      const updatedUser: IUser =
        response.data.user;

      dispatch(
        setPartner(updatedUser)
      );

      setActiveTab("dashboard");
    }
    toast.success("Profile Updated.")

  } catch (error: any) {

    console.error(
      "Update partner profile error:",
      error
    );

    // ==========================================
    // SLUG ALREADY EXISTS
    // ==========================================

    if (
      error?.response?.status === 409 &&
      error?.response?.data?.field === "slug"
    ) {

      toast.error(
        error.response.data.message ||
        "This profile slug is already taken."
      );

      return;
    }


    // ==========================================
    // OTHER API ERROR
    // ==========================================

    toast.error(
      error?.response?.data?.message ||
      "Failed to update partner profile."
    );

  } finally {

    setSaving(false);

  }
};

  return (
    <div className="min-h-screen bg-slate-50">
      <PartnerNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === "dashboard" && (
        <DashboardPanel />
      )}
      {activeTab === "product" && (
        <Productpanel/>
      )}

      {activeTab === "profile" && (
        <ProfilePanel
          partner={partner}
          onSave={handleUpdateProfile}
          onCancel={() =>
            setActiveTab("dashboard")
          }
          saving={saving}
        />
      )}
    </div>
  );
}