import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IUser } from "@/App";

interface PartnerState {
  partner: IUser | null;
  loading: boolean;
}

const initialState: PartnerState = {
  partner: null,
  loading: true,
};

const partnerSlice = createSlice({
  name: "partner",

  initialState,

  reducers: {
    setPartner: (
      state,
      action: PayloadAction<IUser>
    ) => {
      state.partner = action.payload;
    },



    clearPartner: (state) => {
      state.partner = null;
    },
  },
});

export const {
  setPartner,
  clearPartner,
} = partnerSlice.actions;

export default partnerSlice.reducer;