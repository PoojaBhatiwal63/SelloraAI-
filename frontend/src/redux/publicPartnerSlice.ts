import {
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import type { IUser } from "@/App";

interface PublicPartnerState {
  partners: IUser[];
}

const initialState: PublicPartnerState = {
  partners: [],
};

const publicPartnerSlice = createSlice({

  name: "publicPartners",

  initialState,

  reducers: {

    setPublicPartners: (
      state,
      action: PayloadAction<IUser[]>
    ) => {

      state.partners =
        action.payload;

    },


    updatePartner: (
      state,
      action: PayloadAction<IUser>
    ) => {

      const index =
        state.partners.findIndex(
          (partner) =>
            partner._id ===
            action.payload._id
        );


      if (index !== -1) {

        state.partners[index] = {
          ...state.partners[index],
          ...action.payload,
        };

      }

    },

  },

});

export const {
  setPublicPartners,
  updatePartner,
} = publicPartnerSlice.actions;

export default publicPartnerSlice.reducer;