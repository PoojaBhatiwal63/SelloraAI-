import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "@/components/product/Types";

interface PublicProductState {
    products: Product[];
}

const initialState: PublicProductState = {
    products: [],
};

const publicProductSlice = createSlice({
    name: "publicProducts",

    initialState,

    reducers: {
        setPublicProducts: (
            state,
            action: PayloadAction<Product[]>
        ) => {
            state.products = action.payload;
        },
    },
});

export const {
    setPublicProducts,
} = publicProductSlice.actions;

export default publicProductSlice.reducer;