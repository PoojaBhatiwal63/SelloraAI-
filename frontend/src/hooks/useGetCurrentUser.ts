import { useEffect } from "react";
import { useDispatch } from "react-redux";

import api from "@/utils/axios";

import type { AppDispatch } from "@/redux/store";
import { setLoading, setUser } from "@/redux/userSlice";

import type { IUser } from "@/App";

export function useGetCurrentUser() {

    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {

        const fetchUser = async () => {

            try {

                const response = await api.get(
                    "/api/me"
                );

                if (!response.data.success) {
                    return;
                }


                const currentUser: IUser =
                    response.data.user;


                // Current user Redux me store
                dispatch(
                    setUser(currentUser)
                );

            } catch (error) {

                console.log(
                    "Not logged in",
                    error
                );

            } finally {

                dispatch(
                    setLoading(false)
                );

            }

        };


        fetchUser();

    }, [dispatch]);

}