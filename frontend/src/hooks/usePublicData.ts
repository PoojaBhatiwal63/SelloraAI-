import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import api from "@/utils/axios";

import type {
    RootState,
    AppDispatch,
} from "@/redux/store";

import {
    setPublicProducts,
} from "@/redux/publicProductSlice";

import {
    setPublicPartners,
} from "@/redux/publicPartnerSlice";


// ==========================================
// PUBLIC PRODUCTS
// ==========================================

export const usePublicProducts = () => {

    const dispatch =
        useDispatch<AppDispatch>();

    const products = useSelector(
        (state: RootState) =>
            state.publicProducts.products
    );


    useEffect(() => {

        const fetchProducts = async () => {

            try {

                const response = await api.get(
                    "/api/publicProduct/public/all"
                );

               
                if (response.data.success) {

                    dispatch(
                        setPublicProducts(
                            response.data.products ?? []
                        )
                    );

                }
                console.log(response.data)

            } catch (error) {

                console.log(
                    "Public products fetch error:",
                    error
                );

            }

        };


        // Already Redux me data hai
        // toh API call nahi hogi
        if (products.length === 0) {

            fetchProducts();

        }

    }, [
        dispatch,
        products.length,
    ]);


    return {
        products,
    };
};



// ==========================================
// PUBLIC PARTNERS
// ==========================================

export const usePublicPartners = () => {

    const dispatch =
        useDispatch<AppDispatch>();

    const partners = useSelector(
        (state: RootState) =>
            state.publicPartners.partners
    );


    useEffect(() => {

        const fetchPartners = async () => {

            try {

                const response = await api.get(
                    "/api/auth/public/all"
                );
                

                if (response.data.success) {

                    dispatch(
                        setPublicPartners(
                            response.data.partners ?? []
                        )
                    );

                }
                    console.log(response.data)

            } catch (error) {

                console.log(
                    "Public partners fetch error:",
                    error
                );

            }

        };


        // Already Redux me data hai
        // toh API call nahi hogi
        if (partners.length === 0) {

            fetchPartners();

        }

    }, [
        dispatch,
        partners.length,
    ]);


    return {
        partners,
    };
};