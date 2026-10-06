import {
    createOrder,
    getAllOrders,
    getAllPartnerPayments,
    payPartner,
    verifyPayment
} from "../controllers/order.controller.js";
import express from "express"

const orderRouter = express.Router()
orderRouter.post(
    "/create",
    createOrder
);


orderRouter.post(
    "/verify",
    verifyPayment
);


orderRouter.get(
    "/all",
    getAllOrders
);

orderRouter.post(
    "/pay-partner",
    payPartner
);

orderRouter.get(
    "/partner-payments",
    getAllPartnerPayments
);
export default orderRouter