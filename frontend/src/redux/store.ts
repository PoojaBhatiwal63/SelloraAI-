import { configureStore } from "@reduxjs/toolkit";

import userReducer from "./userSlice";
import partnerReducer from "./partnerSlice"
import publicProductReducer
    from "./publicProductSlice";

import publicPartnerReducer
    from "./publicPartnerSlice";

import orderReducer from "./orderSlice"
export const store = configureStore({

    reducer:{

        user:userReducer
        ,
        partner: partnerReducer,

        publicProducts:
            publicProductReducer,

        publicPartners:
            publicPartnerReducer,

        orders: orderReducer,
    }

});



export type RootState = ReturnType<
typeof store.getState
>;


export type AppDispatch = typeof store.dispatch;