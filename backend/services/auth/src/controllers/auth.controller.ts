import crypto from "crypto";

import { Request, Response } from "express";
import { getAuth } from "firebase-admin/auth";

import { app } from "../configs/firebase.js"

import redis from "../../../../shared/redis/redis.js";

import User from "../models/user.model.js";


interface LoginRequest {
    token: string;
}



export const login = async (
    req: Request<{}, {}, LoginRequest>,
    res: Response
) => {

    try {

        const { token } = req.body;


        const decoded = await getAuth(app).verifyIdToken(token);


        let user = await User.findOne({
            firebaseUid: decoded.uid,
        });


        if (!user) {

            user = await User.create({

                firebaseUid: decoded.uid,

                email: decoded.email || "",

                name: decoded.name || "",


            });

        }


        const sessionId = crypto.randomUUID();


        await redis.set(

            `session:${sessionId}`,

            JSON.stringify({

                userId: user._id,

                name: user.name,

                email: user.email,

                role: user.role,



            }),

            "EX",

            60 * 60 * 24 * 7

        );



        res.cookie(
            "session",
            sessionId,
            {

                httpOnly: true,

                secure: false,

                sameSite: "strict",

                maxAge:
                    1000 * 60 * 60 * 24 * 7,

            }
        );


        return res.json({

            success: true,

            user

        });


    } catch (error) {
        console.log(error)

        const message =
            error instanceof Error
                ? error.message
                : "Login failed";


        return res.status(401).json({

            success: false,

            message

        });

    }

};





export const logout = async (
    req: Request,
    res: Response
) => {


    try {


        const sessionId =
            req.cookies?.session;


        if (sessionId) {

            await redis.del(
                `session:${sessionId}`
            );

        }



        res.clearCookie(
            "session",
            {

                httpOnly: true,

                secure: false,

                sameSite: "strict",

            }
        );



        return res.json({

            success: true,

            message: "Logged out successfully"

        });



    } catch (error) {


        const message =
            error instanceof Error
                ? error.message
                : "Logout failed";





        return res.status(500).json({

            success: false,

            message

        });

    }

};




interface UpdatePartnerRequest {
    name?: string;

    partnerProfile?: {
        slug?: string;
        bio?: string;
        website?: string;

        socialLinks?: {
            youtube?: string;
            instagram?: string;
            linkedin?: string;
            github?: string;
        };
    };

    paymentDetails?: {
        method?: "upi" | "bank";
        upiId?: string;
        accountHolderName?: string;
        accountNumber?: string;
        ifscCode?: string;
    };
}


// ==========================================
// GET PARTNER PROFILE
// ==========================================

export const getPartnerProfile = async (
    req: Request,
    res: Response
) => {

    try {

        // 1. Session cookie
        const sessionId = req.cookies?.session;

        if (!sessionId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }


        // 2. Session Redis se nikalo
        const session = await redis.get(
            `session:${sessionId}`
        );

        if (!session) {
            return res.status(401).json({
                success: false,
                message: "Session expired"
            });
        }


        // 3. Session parse karo
        const sessionData = JSON.parse(session);

        const userId = sessionData.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Invalid session"
            });
        }


        // ==========================================
        // 4. PARTNER CACHE CHECK
        // ==========================================

        const cachedPartner = await redis.get(
            `partner:${userId}`
        );


        if (cachedPartner) {

            const user = JSON.parse(cachedPartner);


         


            return res.status(200).json({
                success: true,
                data: "Cache",
                user
            });

        }


        // ==========================================
        // 5. REDIS ME DATA NAHI HAI
        //    MONGODB SE FETCH
        // ==========================================

        const user = await User.findById(userId)
            .select(
                "firebaseUid name email role partnerProfile totalSales totalRevenue paymentDetails isActive createdAt updatedAt"
            )
            .lean();


        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }


       

        // ==========================================
        // 6. COMPLETE USER DATA REDIS ME STORE
        // ==========================================

        await redis.set(
            `partner:${userId}`,
            JSON.stringify(user),
            "EX",
            60 * 60 * 24 * 7
        );


        // ==========================================
        // 7. RESPONSE
        // ==========================================

        return res.status(200).json({
            success: true,
            data: "mongoDb",
            user
        });


    } catch (error) {

        console.error(
            "Get partner profile error:",
            error
        );


        const message =
            error instanceof Error
                ? error.message
                : "Failed to fetch partner profile";


        return res.status(500).json({
            success: false,
            message
        });

    }
};



// ==========================================
// UPDATE PARTNER PROFILE
// ==========================================
export const updatePartnerProfile = async (
    req: Request<{}, {}, UpdatePartnerRequest>,
    res: Response
) => {

    try {

        // ==========================================
        // 1. GET SESSION ID
        // ==========================================

        const sessionId = req.cookies?.session;

        if (!sessionId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }


        // ==========================================
        // 2. GET SESSION FROM REDIS
        // ==========================================

        const session = await redis.get(
            `session:${sessionId}`
        );

        if (!session) {
            return res.status(401).json({
                success: false,
                message: "Session expired"
            });
        }


        // ==========================================
        // 3. PARSE SESSION
        // ==========================================

        const sessionData = JSON.parse(session);

        const userId = sessionData.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Invalid session"
            });
        }


        // ==========================================
        // 4. FIND USER
        // ==========================================

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }


        const {
            name,
            partnerProfile,
            paymentDetails
        } = req.body;


        // ==========================================
        // 5. UPDATE NAME
        // ==========================================

        if (name !== undefined) {

            user.name = name.trim();

        }


        // ==========================================
        // 6. UPDATE PARTNER PROFILE
        // ==========================================

        if (partnerProfile) {

            const currentProfile =
                user.partnerProfile;

            const currentSlug =
                currentProfile?.slug?.trim() || "";

            const newSlug =
                partnerProfile.slug
                    ?.trim()
                    .toLowerCase();


            // ======================================
            // SLUG LOGIC
            // ======================================

            if (currentSlug) {

                // User already has a slug.
                // Slug cannot be changed.

                if (
                    newSlug &&
                    newSlug !== currentSlug
                ) {

                    return res.status(409).json({

                        success: false,

                        field: "slug",

                        message:
                            "Profile slug cannot be changed once created."

                    });

                }

            } else {

                // ==================================
                // FIRST TIME SLUG
                // ==================================

                if (!newSlug) {

                    return res.status(400).json({

                        success: false,

                        field: "slug",

                        message:
                            "Profile slug is required."

                    });

                }


                // ==================================
                // CHECK UNIQUE SLUG
                // ==================================

                const existingUser =
                    await User.findOne({

                        "partnerProfile.slug":
                            newSlug,

                        _id: {
                            $ne: user._id
                        }

                    });


                if (existingUser) {

                    return res.status(409).json({

                        success: false,

                        field: "slug",

                        message:
                            "This profile slug is already taken."

                    });

                }

            }


            // ======================================
            // EXISTING SOCIAL LINKS
            // ======================================

            const currentSocialLinks =
                currentProfile?.socialLinks;


            // ======================================
            // CREATE COMPLETE PROFILE OBJECT
            // ======================================

            user.partnerProfile = {

                slug:
                    currentSlug ||
                    newSlug ||
                    "",

                bio:
                    partnerProfile.bio?.trim() ??
                    currentProfile?.bio ??
                    "",

                website:
                    partnerProfile.website?.trim() ??
                    currentProfile?.website ??
                    "",

                socialLinks: {

                    youtube:
                        partnerProfile.socialLinks
                            ?.youtube?.trim() ??
                        currentSocialLinks
                            ?.youtube ??
                        "",

                    instagram:
                        partnerProfile.socialLinks
                            ?.instagram?.trim() ??
                        currentSocialLinks
                            ?.instagram ??
                        "",

                    linkedin:
                        partnerProfile.socialLinks
                            ?.linkedin?.trim() ??
                        currentSocialLinks
                            ?.linkedin ??
                        "",

                    github:
                        partnerProfile.socialLinks
                            ?.github?.trim() ??
                        currentSocialLinks
                            ?.github ??
                        ""

                }

            };

        }


        // ==========================================
        // 7. UPDATE PAYMENT DETAILS
        // ==========================================

        if (paymentDetails) {

            const currentPayment =
                user.paymentDetails;

            user.paymentDetails = {

                method:
                    paymentDetails.method ??
                    currentPayment.method ??
                    "upi",

                upiId:
                    paymentDetails.upiId?.trim() ??
                    currentPayment.upiId ??
                    "",

                accountHolderName:
                    paymentDetails.accountHolderName?.trim() ??
                    currentPayment.accountHolderName ??
                    "",

                accountNumber:
                    paymentDetails.accountNumber?.trim() ??
                    currentPayment.accountNumber ??
                    "",

                ifscCode:
                    paymentDetails.ifscCode?.trim() ??
                    currentPayment.ifscCode ??
                    ""

            };

        }


        // ==========================================
        // 8. SAVE USER
        // ==========================================

        await user.save();


        // ==========================================
        // 9. UPDATE REDIS SESSION
        // ==========================================

        const updatedSession = {

            userId: user._id,

            name: user.name,

            email: user.email,

            role: user.role

        };


        await redis.set(

            `session:${sessionId}`,

            JSON.stringify(updatedSession),

            "EX",

            60 * 60 * 24 * 7

        );




        // ==========================================
        // 10. UPDATE PARTNER CACHE
        // ==========================================

        const updatedUser =
            user.toObject();


        await redis.set(

            `partner:${user._id}`,

            JSON.stringify(updatedUser),

            "EX",

            60 * 60 * 24 * 7

        );

        // Public partners cache invalidate
await redis.del(
    "public:partners"
);


        // ==========================================
        // 11. RESPONSE
        // ==========================================

        return res.status(200).json({

            success: true,

            message:
                "Partner profile updated successfully",

            user: updatedUser

        });


    } catch (error: any) {

        console.error(
            "Update partner profile error:",
            error
        );


        // ==========================================
        // DUPLICATE SLUG
        // ==========================================

        if (error?.code === 11000) {

            return res.status(409).json({

                success: false,

                field: "slug",

                message:
                    "This profile slug is already taken."

            });

        }


        const message =
            error instanceof Error
                ? error.message
                : "Failed to update partner profile";


        return res.status(500).json({

            success: false,

            message

        });

    }

};



// ==========================================
// GET ALL PUBLIC PARTNERS
// ==========================================

export const getAllPublicPartners = async (
    req: Request,
    res: Response
) => {

    try {

        // ==========================================
        // 1. CHECK REDIS CACHE
        // ==========================================

        const cachedPartners =
            await redis.get(
                "public:partners"
            );


        if (cachedPartners) {

            const partners =
                JSON.parse(
                    cachedPartners
                );


            return res.status(200).json({

                success: true,

                partners,

                source: "cache"

            });

        }


        // ==========================================
        // 2. GET FROM MONGODB
        // ==========================================

        const partners =
            await User.find({

                role: "partner",

                "partnerProfile.slug": {

                    $exists: true,

                    $ne: ""

                }

            })
            .select(
                "name partnerProfile email totalSales isActive totalRevenue paymentDetails" )
            .lean();


        // ==========================================
        // 3. SAVE TO REDIS
        // ==========================================

        await redis.set(

            "public:partners",

            JSON.stringify(partners),

            "EX",

            60 * 10

        );


        // ==========================================
        // 4. RESPONSE
        // ==========================================

        return res.status(200).json({

            success: true,

            partners,

            source: "database"

        });


    } catch (error) {

        console.error(
            "Get public partners error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch partners"

        });

    }

};


// ==========================================
// UPDATE PARTNER SALE
// ==========================================

export const updatePartnerSale = async (
    req: Request,
    res: Response
) => {

    try {

        const {
            partnerId,
            amount
        } = req.body;


        // ======================================
        // VALIDATION
        // ======================================

        if (
            !partnerId ||
            amount === undefined ||
            amount === null
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Partner id and amount are required"

            });

        }


        // ======================================
        // FIND PARTNER
        // ======================================

        const partner =
            await User.findOne({

                _id: partnerId,

                role: "partner"

            });


        if (!partner) {

            return res.status(404).json({

                success: false,

                message:
                    "Partner not found"

            });

        }


        // ======================================
        // PARTNER REVENUE
        // ======================================

        const partnerRevenue =
            Number(amount) * 0.95;


        // ======================================
        // UPDATE SALES
        // ======================================

        partner.totalSales += 1;

        partner.totalRevenue +=
            partnerRevenue;


        await partner.save();


        // ======================================
        // CLEAR PARTNER CACHE
        // ======================================

        await redis.del(
            "public:partners"
        );
        await redis.del(`partner:${partnerId}`)


        return res.status(200).json({

            success: true,

            message:
                "Partner sale updated",

            totalSales:
                partner.totalSales,

            totalRevenue:
                partner.totalRevenue

        });

    }
    catch (error) {

        console.log(
            "Update partner sale error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to update partner sale"

        });

    }

};




// ==========================================
// TOGGLE PARTNER ACTIVE STATUS
// ==========================================

export const togglePartnerStatus = async (
    req: Request,
    res: Response
) => {

    try {

        const { partnerId } = req.params;


        if (!partnerId) {

            return res.status(400).json({
                success: false,
                message: "Partner ID is required"
            });

        }


        // ==========================================
        // FIND PARTNER
        // ==========================================

        const partner =
            await User.findOne({
                _id: partnerId,
                role: "partner"
            });


        if (!partner) {

            return res.status(404).json({
                success: false,
                message: "Partner not found"
            });

        }


        // ==========================================
        // TOGGLE STATUS
        // ==========================================

        partner.isActive =
            !partner.isActive;


        await partner.save();

         await redis.del(
            "public:partners"
        );
        await redis.del(`partner:${partnerId}`)

        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(200).json({

            success: true,

            message:
                partner.isActive
                    ? "Partner activated successfully"
                    : "Partner deactivated successfully",

            partner: {
                _id: partner._id,
                name: partner.name,
                email: partner.email,
                isActive: partner.isActive
            }

        });

    }
    catch (error) {

        console.log(
            "Toggle partner status error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to update partner status"

        });

    }

};



// ==========================================
// GET ADMIN
// ==========================================

export const getAdmin = async (
    req: Request,
    res: Response
) => {

    try {

        const admin = await User.findOne({
            role: "admin",
            isActive: true
        })
        .select("name email")
        .lean();


        if (!admin) {

            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });

        }


        return res.status(200).json({

            success: true,

            admin: {
                name: admin.name,
                email: admin.email
            }

        });

    }
    catch (error) {

        console.log(
            "Get admin error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Failed to get admin"

        });

    }

};


export const resetPartnerRevenue = async (
  req: Request,
  res: Response
) => {

  try {

    const { partnerId } = req.params;


    if (!partnerId) {

      return res.status(400).json({
        success: false,
        message: "Partner ID is required",
      });

    }


    const partner =
      await User.findOne({
        _id: partnerId,
        role: "partner",
      });


    if (!partner) {

      return res.status(404).json({
        success: false,
        message: "Partner not found",
      });

    }


    partner.totalRevenue = 0;

    await partner.save();

    await redis.del(
            "public:partners"
        );
        await redis.del(`partner:${partnerId}`)


    return res.status(200).json({

      success: true,

      message:
        "Partner revenue reset successfully",

      partner: {
        _id: partner._id,
        totalRevenue: partner.totalRevenue,
      },

    });

  }
  catch (error) {

    console.log(
      "Reset partner revenue error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to reset partner revenue",

    });

  }

};