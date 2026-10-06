import {
    createSlice,
    type PayloadAction,
} from "@reduxjs/toolkit";

export interface Order {
    _id: string;

    productId: string;

    partnerId: string;

    productTitle: string;

    productPrice: number;

    customerName: string;

    customerEmail: string;

    partnerEmail: string;

    paymentStatus:
        | "pending"
        | "success"
        | "failed";

    partnerAmount: number;

    adminAmount: number;

    createdAt: string;

    updatedAt?: string;
}


interface OrderState {

    orders: Order[];

    loading: boolean;

}


const initialState: OrderState = {

    orders: [],

    loading: false,

};


const orderSlice = createSlice({

    name: "orders",

    initialState,

    reducers: {

        setOrders: (
            state,
            action: PayloadAction<Order[]>
        ) => {

            state.orders =
                action.payload;

        },


        

    },

});


export const {
    setOrders,
   
    
} = orderSlice.actions;


export default orderSlice.reducer;