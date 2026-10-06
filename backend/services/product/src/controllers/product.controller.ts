import { Request, Response } from "express";
import Product from "../models/product.model.js";
import redis from "../../../../shared/redis/redis.js";
// ===============================
// CREATE PRODUCT
// ===============================

export const createProduct = async (
    req: Request,
    res: Response
) => {

    try {

        const userId =
            req.headers["x-user-id"] as string;


        if (!userId) {

            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });

        }


        const {
            title,
            slug,
            description,
            type,
            price,
            links,
            status
        } = req.body;


        // -----------------------------
        // Validate slug
        // -----------------------------

        if (!slug || !slug.trim()) {

            return res.status(400).json({
                success: false,
                message: "Product slug is required"
            });

        }


        const cleanSlug =
            slug.trim().toLowerCase();


        // -----------------------------
        // Check slug already exists
        // -----------------------------

        const existingProduct =
            await Product.findOne({
                slug: cleanSlug
            });


        if (existingProduct) {

            return res.status(409).json({
                success: false,
                field: "slug",
                message:
                    "This product slug is already taken. Please choose another slug."
            });

        }


        // -----------------------------
        // Create Product
        // -----------------------------

        const product = await Product.create({

            partnerId: userId,

            title: title?.trim(),

            slug: cleanSlug,

            description: description?.trim(),

            type,

            price,

            links,

            status: status || "draft"

        });


        // -----------------------------
        // Clear Partner Product Cache
        // -----------------------------

        await redis.del(
            `products:${userId}`
        );

        if (product.status === "published") {
    await redis.del("public:products");
}


        return res.status(201).json({

            success: true,

            message:
                "Product created successfully",

            product

        });


    } catch (error: any) {


        console.log(
            "Create product error:",
            error
        );


        // -----------------------------
        // MongoDB Duplicate Key Error
        // -----------------------------

        if (error?.code === 11000) {

            return res.status(409).json({

                success: false,

                field: "slug",

                message:
                    "This product slug is already taken. Please choose another slug."

            });

        }


        const message =
            error instanceof Error
                ? error.message
                : "Create product failed";


        return res.status(500).json({

            success: false,

            message

        });

    }

};




// ===============================
// GET ALL PRODUCTS
// ===============================

export const getAllProducts = async (
    req: Request,
    res: Response
) => {

    try {

        const userId = req.headers["x-user-id"] as string;


        if (!userId) {

            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });

        }


        // 1. Check Redis Cache

        const cacheKey = `products:${userId}`;


        const cachedProducts = await redis.get(cacheKey);



        if (cachedProducts) {

            return res.status(200).json({

                success: true,

                source: "redis",

                products: JSON.parse(cachedProducts)

            });

        }



        // 2. MongoDB

        const products = await Product.find({

            partnerId: userId

        })
            .sort({
                createdAt: -1
            });



        // 3. Save Redis

        await redis.set(

            cacheKey,

            JSON.stringify(products),

            "EX",

            60 * 10

        );



        return res.status(200).json({

            success: true,

            source: "mongodb",

            products

        });



    } catch (error) {


        return res.status(500).json({

            success: false,

            message:
                error instanceof Error
                    ? error.message
                    : "Failed"

        });

    }

};




// ===============================
// GET SINGLE PRODUCT
// ===============================

export const getProduct = async (
    req: Request,
    res: Response
) => {

    try {


        const product =
            await Product.findById(
                req.params.id
            );


        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found"

            });

        }



        return res.json({

            success: true,

            product

        });


    } catch (error) {

        return res.status(500).json({

            success: false,

            message: "Failed to fetch product"

        });

    }

};




// ===============================
// UPDATE PRODUCT
// ===============================

export const updateProduct = async (
    req: Request,
    res: Response
) => {

    try {


        const userId = req.headers["x-user-id"] as string;


        const product =
            await Product.findOne({

                _id: req.params.id,

                partnerId: userId

            });



        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found"

            });

        }



        const {

            title,

            description,

            type,

            price,

            status,

            links

        } = req.body;



        product.title =
            title ?? product.title;


        product.description =
            description ?? product.description;


        product.type =
            type ?? product.type;


        product.price =
            price ?? product.price;


        product.links =
            links ?? product.links;

        product.status =
            status ?? product.status



        await product.save();

        await redis.del(
            `products:${userId}`
        );

        await redis.del("public:products");




        return res.json({

            success: true,

            message: "Product updated",

            product

        });



    } catch (error) {

        return res.status(500).json({

            success: false,

            message: "Update failed"

        });

    }

};




// ===============================
// DELETE PRODUCT
// ===============================

export const deleteProduct = async (
    req: Request,
    res: Response
) => {

    try {


        const userId = req.headers["x-user-id"] as string;



        const product =
            await Product.findOneAndDelete({

                _id: req.params.id,

                partnerId: userId

            });

        await redis.del(
            `products:${userId}`
        );

        await redis.del("public:products");


        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found"

            });

        }



        return res.json({

            success: true,

            message: "Product deleted"

        });



    } catch (error) {


        return res.status(500).json({

            success: false,

            message: "Delete failed"

        });

    }

};

// ==========================================
// GET ALL PUBLIC PRODUCTS
// ==========================================

export const getAllPublicProducts = async (
    req: Request,
    res: Response
) => {

    try {

        // ==========================================
        // 1. CHECK REDIS CACHE
        // ==========================================

        const cachedProducts =
            await redis.get(
                "public:products"
            );


        if (cachedProducts) {

            const products =
                JSON.parse(
                    cachedProducts
                );

            return res.status(200).json({

                success: true,

                products,

                source: "cache"

            });

        }


        // ==========================================
        // 2. GET FROM MONGODB
        // ==========================================

        const products =
            await Product.find({

                status: "published"

            })
            .sort({
                createdAt: -1
            })
            .lean();


        // ==========================================
        // 3. SAVE TO REDIS
        // ==========================================

        await redis.set(

            "public:products",

            JSON.stringify(products),

            "EX",

            60 * 10

        );


        // ==========================================
        // 4. RESPONSE
        // ==========================================

        return res.status(200).json({

            success: true,

            products,

            source: "database"

        });


    } catch (error) {

        console.error(
            "Get public products error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch products"

        });

    }

};


// ==========================================
// UPDATE PRODUCT SALE (INTERNAL)
// ==========================================

export const updateProductSale = async (
    req: Request,
    res: Response
) => {

    try {

        const {
            productId,
            amount
        } = req.body;



        if(
            !productId ||
            !amount
        ){

            return res.status(400).json({
                success:false,
                message:"Product id and amount required"
            });

        }



        const product =
            await Product.findById(productId);



        if(!product){

            return res.status(404).json({
                success:false,
                message:"Product not found"
            });

        }



        // Partner earning 95%

        const partnerRevenue =
            amount * 0.95;



        product.totalSales += 1;


        product.totalRevenue += partnerRevenue;



        await product.save();



        // clear partner products cache

        await redis.del(
            `products:${product.partnerId}`
        );


        // clear public products cache

        await redis.del(
            "public:products"
        );



        return res.status(200).json({

            success:true,

            message:
            "Product sale updated",

            product

        });



    }
    catch(error){

        console.log(
            "Update sale error",
            error
        );


        return res.status(500).json({

            success:false,

            message:
            "Failed to update product sale"

        });

    }

};





export const downloadProduct = async (
  req: Request,
  res: Response
) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        message: "File URL is required",
      });
    }

    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({
        message: "Unable to fetch file",
      });
    }

    const contentType =
      response.headers.get("content-type") ||
      "application/octet-stream";

    const contentLength = response.headers.get("content-length");

    res.setHeader("Content-Type", contentType);

    if (contentLength) {
      res.setHeader("Content-Length", contentLength);
    }

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="product"'
    );

    if (!response.body) {
      return res.status(500).json({
        message: "File stream unavailable",
      });
    }

    // Node.js fetch Web Stream → Node.js response
    for await (const chunk of response.body as any) {
      res.write(chunk);
    }

    res.end();
  } catch (error) {
    console.error("Download product error:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        message: "Download failed",
      });
    }

    res.end();
  }
};