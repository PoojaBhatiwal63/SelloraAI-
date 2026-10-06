import express from "express";

import {
    createProduct,
    getAllProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    getAllPublicProducts,
    updateProductSale,
    downloadProduct,
   
} from "../controllers/product.controller.js";




const productRouter = express.Router();


// ===============================
// CREATE PRODUCT
// ===============================

productRouter.post(
    "/create",
    createProduct
);



// ===============================
// GET ALL PRODUCTS (Partner)
// ===============================

productRouter.get(
    "/all",
    getAllProducts
);



// ===============================
// GET SINGLE PRODUCT
// ===============================

productRouter.get(
    "/:id/getproduct",
    getProduct
);



// ===============================
// UPDATE PRODUCT
// ===============================

productRouter.patch(
    "/:id/update",
    updateProduct
);



// ===============================
// DELETE PRODUCT
// ===============================

productRouter.delete(
    "/:id/delete",
    deleteProduct
);

productRouter.get(
    "/public/all",
    getAllPublicProducts
)

// INTERNAL API

productRouter.patch(
    "/update-sale",
    updateProductSale
);

productRouter.post("/download", downloadProduct)


export default productRouter;