import { useEffect } from "react";
import { useDispatch } from "react-redux";

import api from "@/utils/axios";
import type { AppDispatch } from "@/redux/store";
import {
    setPartner
} from "@/redux/partnerSlice";

import type { IUser } from "@/App";

export function useGetPartnerData() {

    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {

        const fetchPartner = async () => {

            try {

                const response = await api.get(
                    "/api/auth/get-partner"
                );

                if (response.data.success) {

                    const partnerUser: IUser =
                        response.data.user;

                    dispatch(
                        setPartner(partnerUser)
                    );

                }

            } catch (error) {

                console.log(
                    "Partner data not found",
                    error
                );

            }
        };


        fetchPartner();

    }, [dispatch]);

}