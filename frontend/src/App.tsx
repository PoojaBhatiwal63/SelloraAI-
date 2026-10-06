import { Routes, Route, Navigate } from "react-router-dom";

import { useSelector } from "react-redux";

import Home from "./pages/Home";

import PartnerPage from "./pages/Partnerpage";

import { Toaster } from "@/components/ui/sonner";

import type {RootState } from "./redux/store";


import { useGetCurrentUser } from "./hooks/useGetCurrentUser";
import { useGetPartnerData } from "./hooks/getPartnerData";
import { usePublicPartners, usePublicProducts } from "./hooks/usePublicData";
import PublicProductPage from "./pages/PublicProductPage";
import PublicProfilePage from "./pages/PublicProfilePage";
import { useOrders } from "./hooks/useOrders";
import Admin from "./pages/Admin";
import { useEffect, useState } from "react";
import api from "./utils/axios";




export interface ISocialLinks {
  youtube?: string;
  instagram?: string;
  linkedin?: string;
  github?: string;
}

export interface IPartnerProfile {
  slug?: string;
  bio?: string;
  website?: string;
  socialLinks?: ISocialLinks;
}

export interface IPaymentDetails {
  method: "upi" | "bank";
  upiId?: string;
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
}

export interface IUser {
  _id?:string;
  firebaseUid: string;

  name: string;

  email: string;

  role: "partner" | "admin";

  partnerProfile?: IPartnerProfile;

  paymentDetails: IPaymentDetails;

  totalSales: number;

  totalRevenue: number;

  isActive: boolean;

  createdAt: string;

  updatedAt: string;
}


export interface IAdmin {
  name: string;
  email: string;
}

function App() {
useGetCurrentUser()
useGetPartnerData()
usePublicPartners()
usePublicProducts()
useOrders()

  const { user, loading } = useSelector(
    (state: RootState) => state.user
  );
  const [admin, setAdmin] =
  useState<IAdmin | null>(null);


  useEffect(() => {

  const fetchAdmin = async () => {

    try {

      const { data } =
        await api.get(
          "/api/auth/admin"
        );


      if (data.success) {

        setAdmin(data.admin);

      }

    }
    catch (error) {

      console.log(
        "Fetch admin error:",
        error
      );

    }

  };


  fetchAdmin();

}, []);

  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
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

  return (
    <>
    <Toaster/>
    <Routes>
      <Route
        path="/"
        element={
          user?.role === "admin" ? (
            <Navigate to="/admin" replace />
          ) : (
            <Home admin={admin}/>
          )
        }
      />

      <Route
        path="/partner"
        element={
          user?.role === "partner" ? (
            <PartnerPage admin={admin}/>
          ) : user?.role === "admin" ? (
            <Navigate to="/admin" replace />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route
        path="/admin"
        element={
          user?.role === "admin" ? (
            <Admin admin={admin}/>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* Public Customer Routes */}
  <Route
    path="/product/:slug"
    element={<PublicProductPage/>}
  />

  <Route
    path="/profile/:slug"
    element={<PublicProfilePage />}
  />

    </Routes>
    </>
  );
}

export default App;