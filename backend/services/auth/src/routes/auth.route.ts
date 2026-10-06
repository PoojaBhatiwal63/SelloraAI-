import express from "express";
import { getAdmin, getAllPublicPartners, getPartnerProfile, login, logout, resetPartnerRevenue, togglePartnerStatus, updatePartnerProfile, updatePartnerSale } from "../controllers/auth.controller.js";





const authRouter = express.Router();

authRouter.post("/login",login);

authRouter.get("/logout",logout)

authRouter.get("/get-partner",getPartnerProfile)

authRouter.patch("/update-partner",updatePartnerProfile)

authRouter.get("/public/all",getAllPublicPartners)

authRouter.patch("/update-sale",updatePartnerSale);

authRouter.get("/admin",getAdmin);

authRouter.patch(
    "/partner/:partnerId/toggle-status",
    togglePartnerStatus
);
authRouter.patch(
  "/partner/:partnerId/reset-revenue",
  resetPartnerRevenue
);

export default authRouter;