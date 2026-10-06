import { useCallback, useEffect } from "react";
import { useDispatch} from "react-redux";



import {
    setOrders,
    
} from "@/redux/orderSlice";

import api from "@/utils/axios";




export function useOrders() {

    const dispatch = useDispatch();


    const fetchOrders = useCallback(
        async () => {

            try {

                

                const { data } =
                    await api.get(
                        "/api/order/all"
                    );




                if (data.success) {

                    dispatch(
                        setOrders(
                            data.orders
                        )
                    );

                }

            }
            catch (error) {

                console.log(
                    "Fetch orders error:",
                    error
                );

            }

        },
        [dispatch]
    );


    useEffect(() => {

        fetchOrders();

    }, [fetchOrders]);
}