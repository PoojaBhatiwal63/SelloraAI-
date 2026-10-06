import { Request, Response } from "express";
import mongoose from "mongoose";
import { createHmac } from "node:crypto";
import Order from "../models/order.model.js";
import razorpay from "../configs/razorpay.js";
import { emailQueue } from "../configs/email.queue.js";
import redis from "../../../../shared/redis/redis.js"
import PartnerPayment from "../models/partnerPayment.model.js";

interface CreateOrderRequest {

    productId: string;

    partnerId: string;

    amount: number;

    customerName: string;

    customerEmail: string;

    partnerEmail: string;

    productTitle: string;


    links:{
        title:string;
        url:string;
    }[];

}



// ==========================================
// CREATE ORDER
// ==========================================

export const createOrder = async (
    req: Request<{}, {}, CreateOrderRequest>,
    res: Response
) => {

    try {

        const {
            productId,
            partnerId,
            amount,
            customerName,
            customerEmail,
            partnerEmail,
            productTitle,
            links

        } = req.body;



        if(
            !productId ||
            !partnerId ||
            !amount ||
            !customerName ||
            !customerEmail ||
            !partnerEmail ||
            !productTitle ||
            !links
        ){

            return res.status(400).json({

                success:false,

                message:
                "All fields are required"

            });

        }



        const razorpayOrder =
        await razorpay.orders.create({

            amount:
            amount * 100,

            currency:"INR",

            receipt:
            `receipt_${Date.now()}`

        });



        const order =
        await Order.create({

            productId,

            partnerId,


            productTitle,


            productPrice:
            amount,


            customerName,

            customerEmail,


            partnerEmail,


            links,



            razorpayOrderId:
            razorpayOrder.id,


            paymentStatus:
            "pending",


            partnerAmount:
            amount * 0.95,


            adminAmount:
            amount * 0.05

        });

        await redis.del("orders:all")



        return res.status(201).json({

            success:true,

            message:
            "Order created successfully",


            orderId:
            order._id,


            razorpayOrderId:
            razorpayOrder.id,


            amount,


            key:
            process.env.RAZORPAY_KEY_ID

        });


    }
    catch(error){

        console.log(
            "Create order error",
            error
        );


        return res.status(500).json({

            success:false,

            message:
            "Failed to create order"

        });

    }

};





interface VerifyPaymentRequest {

    razorpay_order_id: string;

    razorpay_payment_id: string;

    razorpay_signature: string;

}



// ==========================================
// VERIFY RAZORPAY PAYMENT
// ==========================================

export const verifyPayment = async (
    req: Request<{}, {}, VerifyPaymentRequest>,
    res: Response
) => {

    try {


        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature

        } = req.body;



        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Payment details missing"

            });

        }



        // ======================================
        // VERIFY SIGNATURE
        // ======================================


        const generatedSignature = createHmac(
            "sha256",
            process.env.RAZORPAY_KEY_SECRET!
        )
            .update(
                razorpay_order_id + "|" + razorpay_payment_id
            )
            .digest("hex");





        if (
            generatedSignature !==
            razorpay_signature
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Payment verification failed"

            });

        }




        // ======================================
        // FIND ORDER
        // ======================================


        const order =
            await Order.findOne({

                razorpayOrderId:
                    razorpay_order_id

            });



        if (!order) {

            return res.status(404).json({

                success: false,

                message:
                    "Order not found"

            });

        }





        // ======================================
        // UPDATE ORDER
        // ======================================


        order.paymentStatus =
            "success";


        order.razorpayPaymentId =
            razorpay_payment_id;


        await order.save();











        // ======================================
        // ADD EMAIL JOB (NEXT STEP)
        // ======================================

       await emailQueue.add(
    "payment-success",
    {

        customerName:
        order.customerName,


        customerEmail:
        order.customerEmail,


        partnerEmail:
        order.partnerEmail,


        productTitle:
        order.productTitle,


        amount:
        order.productPrice,


        links:
        order.links

    }
);





        return res.status(200).json({

            success: true,

            message:
                "Payment verified successfully",

            order

        });



    }
    catch (error) {


        console.log(
            "Verify payment error",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Payment verification failed"

        });


    }

};


export const getAllOrders = async (
    req: Request,
    res: Response
) => {

    try {

        const cacheKey = "orders:all";


        // ======================================
        // CHECK REDIS
        // ======================================

        const cachedOrders =
            await redis.get(cacheKey);


        if (cachedOrders) {

            return res.status(200).json({

                success: true,

                source: "redis",

                orders: JSON.parse(cachedOrders)

            });

        }


        // ======================================
        // GET ALL ORDERS FROM DATABASE
        // ======================================

        const orders = await Order
            .find()
            .select(
                "_id productId partnerId productTitle productPrice customerName customerEmail partnerEmail paymentStatus partnerAmount adminAmount createdAt"
            )
            .sort({
                createdAt: -1
            })
            .lean();


        // ======================================
        // SAVE IN REDIS
        // ======================================

        await redis.set(
            cacheKey,
            JSON.stringify(orders),
            "EX",
            600
        );


        return res.status(200).json({

            success: true,

            source: "database",

            orders

        });

    }
    catch (error) {

        console.log(
            "Get all orders error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch orders"

        });

    }

};


// ==========================================
// PAY PARTNER
// ==========================================

export const payPartner = async (
    req: Request,
    res: Response
) => {

    try {

        const {
            partnerId,
            partnerName,
            partnerEmail,
            amount
        } = req.body;


        // ======================================
        // VALIDATION
        // ======================================

        if (
            !partnerId ||
            !partnerName ||
            !partnerEmail || !amount
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Partner details are required"
            });

        }


        // ======================================
        // MINIMUM PAYOUT
        // ======================================

        if (amount < 10000) {

            return res.status(400).json({

                success: false,

                message:
                    "Partner is not eligible for payment",

                amount

            });

        }


        // ======================================
        // CREATE PAYMENT RECORD
        // ======================================

        const payment =
            await PartnerPayment.create({

                partnerId,

                partnerName,

                partnerEmail,

                amount,

                status:
                    "success"

            });


       


        // ======================================
        // CLEAR ORDERS / PARTNER CACHE
        // ======================================

        await redis.del(
            "orders:all"
        );

        await redis.del(
    "partnerPayments:all"
);


        // ======================================
        // SEND PAYMENT EMAIL
        // ======================================

        await emailQueue.add(

            "partner-payment-success",

            {

                partnerName,

                partnerEmail,

                amount,

                paymentId:
                    payment._id.toString(),

                adminEmail:
                    process.env.EMAIL_USER

            }

        );


        // ======================================
        // RESPONSE
        // ======================================

        return res.status(200).json({

            success: true,

            message:
                "Partner payment processed successfully",

            payment

        });

    }

    catch (error) {

        console.log(
            "Pay partner error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to process partner payment"

        });

    }

};

// ==========================================
// GET ALL PARTNER PAYMENTS
// ==========================================

export const getAllPartnerPayments = async (
    req: Request,
    res: Response
) => {

    try {

        const cacheKey =
            "partnerPayments:all";


        // ======================================
        // CHECK REDIS FIRST
        // ======================================

        const cachedPayments =
            await redis.get(cacheKey);


        if (cachedPayments) {

            return res.status(200).json({

                success: true,

                source: "redis",

                payments:
                    JSON.parse(cachedPayments)

            });

        }


        // ======================================
        // GET FROM DATABASE
        // ======================================

        const payments =
            await PartnerPayment
                .find()
                .sort({
                    createdAt: -1
                })
                .lean();


        // ======================================
        // SAVE TO REDIS
        // ======================================

        await redis.set(

            cacheKey,

            JSON.stringify(payments),

            "EX",

            600

        );


        // ======================================
        // RESPONSE
        // ======================================

        return res.status(200).json({

            success: true,

            source: "database",

            payments

        });

    }
    catch (error) {

        console.log(
            "Get all partner payments error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch partner payments"

        });

    }

};