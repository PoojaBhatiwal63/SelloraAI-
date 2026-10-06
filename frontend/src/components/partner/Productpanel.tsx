import { useEffect, useState } from "react";

import { useSelector } from "react-redux";

import type { RootState } from "@/redux/store";

import type { Product } from "../product/Types";

import ProductsList from "../product/Productslist";
import CreateProductForm from "../product/Createproductform";
import EditProductForm from "../product/Editproductform";


import api from "@/utils/axios";
import CompleteProfile from "./CompleteProfile";
import { toast } from "sonner";


type View =
    | "list"
    | "create"
    | "edit";


export default function Productspanel() {

    // ==========================================
    // REDUX PARTNER
    // ==========================================

    const partner = useSelector(
        (state: RootState) =>
            state.partner.partner
    );


    // ==========================================
    // STATE
    // ==========================================

    const [view, setView] =
        useState<View>("list");

    const [products, setProducts] =
        useState<Product[]>([]);

    const [selectedProduct, setSelectedProduct] =
        useState<Product | null>(null);

    const [loading, setLoading] =
        useState(true);


    // ==========================================
    // CHECK PROFILE COMPLETION
    // ==========================================

    const isProfileComplete = () => {

        if (!partner) {
            return false;
        }


        // -------------------------------
        // Basic partner information
        // -------------------------------

        if (!partner.name?.trim()) {
            return false;
        }


        if (!partner.partnerProfile?.slug?.trim()) {
            return false;
        }


        if (!partner.partnerProfile?.bio?.trim()) {
            return false;
        }


        // -------------------------------
        // Payment information
        // -------------------------------

        const payment =
            partner.paymentDetails;


        if (!payment) {
            return false;
        }


        if (!payment.accountHolderName?.trim()) {
            return false;
        }


        // -------------------------------
        // UPI
        // -------------------------------

        if (payment.method === "upi") {

            if (!payment.upiId?.trim()) {
                return false;
            }

        }


        // -------------------------------
        // BANK
        // -------------------------------

        if (payment.method === "bank") {

            if (!payment.accountNumber?.trim()) {
                return false;
            }


            if (!payment.ifscCode?.trim()) {
                return false;
            }

        }


        return true;
    };


    const profileComplete =
        isProfileComplete();


    // ==========================================
    // GET ALL PRODUCTS
    // ==========================================

    const fetchProducts = async () => {

        try {

            setLoading(true);

            const response =
                await api.get(
                    "/api/product/all"
                );


            if (response.data.success) {

                setProducts(
                    response.data.products ?? []
                );

            }

        } catch (error) {

            console.log(
                "Fetch products error",
                error
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        fetchProducts();

    }, []);


    // ==========================================
    // BACK TO LIST
    // ==========================================

    const goToList = () => {

        setSelectedProduct(null);

        setView("list");

    };


    // ==========================================
    // CREATE PRODUCT
    // ==========================================

    const handleCreate = async (
        product: Product
    ) => {

        try {

            const response =
                await api.post(
                    "/api/product/create",
                    product
                );


            if (response.data.success) {

                setProducts(
                    (prev) => [
                        response.data.product,
                        ...prev,
                    ]
                );


                goToList();

            }
            toast.success("Created")

        } catch (error: any) {

            console.log(
                "Create product error:",
                error
            );


            const message =
                error.response?.data?.message ||
                "Failed to create product";


           toast.error(message)

        }

    };


    // ==========================================
    // EDIT CLICK
    // ==========================================

    const handleEditClick = (
        product: Product
    ) => {

        setSelectedProduct(product);

        setView("edit");

    };


    // ==========================================
    // UPDATE PRODUCT
    // ==========================================

    const handleSaveEdit = async (
        updated: Product
    ) => {

        try {

            const response =
                await api.patch(
                    `/api/product/${updated._id}/update`,
                    updated
                );


            if (response.data.success) {

                setProducts(
                    (prev) =>
                        prev.map(
                            (product) =>
                                product._id === updated._id
                                    ? response.data.product
                                    : product
                        )
                );


                goToList();

            }
            toast.success("Product Updated.")

        } catch (error: any) {

            console.log(
                "Update product error",
                error
            );


            toast.error(
                error.response?.data?.message ||
                "Failed to update product"
            );

        }

    };


    // ==========================================
    // DELETE PRODUCT
    // ==========================================

    const handleDelete = async (
        product: Product
    ) => {

        const confirmed =
            window.confirm(
                `Delete "${product.title}"? This cannot be undone.`
            );


        if (!confirmed) {
            return;
        }


        try {

            const response =
                await api.delete(
                    `/api/product/${product._id}/delete`
                );


            if (response.data.success) {

                setProducts(
                    (prev) =>
                        prev.filter(
                            (p) =>
                                p._id !== product._id
                        )
                );


                goToList();

            }
            toast.success("deleted")

        } catch (error: any) {

            console.log(
                "Delete product error",
                error
            );


            toast.error(
                error.response?.data?.message ||
                "Failed to delete product"
            );

        }

    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

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


    // ==========================================
    // PROFILE INCOMPLETE
    // ==========================================

    if (!profileComplete) {

        return (

            <CompleteProfile
                
            />

        );

    }


    // ==========================================
    // MAIN PRODUCT UI
    // ==========================================

    return (

        <div className="min-h-screen bg-slate-50">

            {/* ==================================
                PRODUCTS LIST
            ================================== */}

            {view === "list" && (

                <ProductsList

                    products={products}

                    onCreateClick={() =>
                        setView("create")
                    }

                    onEditClick={
                        handleEditClick
                    }

                    onDeleteClick={
                        handleDelete
                    }

                />

            )}


            {/* ==================================
                CREATE PRODUCT
            ================================== */}

            {view === "create" && (

                <CreateProductForm

                    onCreate={
                        handleCreate
                    }

                    onCancel={
                        goToList
                    }

                />

            )}


            {/* ==================================
                EDIT PRODUCT
            ================================== */}

            {view === "edit" &&
                selectedProduct && (

                    <EditProductForm

                        product={
                            selectedProduct
                        }

                        onSave={
                            handleSaveEdit
                        }

                        onDelete={
                            handleDelete
                        }

                        onCancel={
                            goToList
                        }

                    />

                )}

        </div>

    );

}