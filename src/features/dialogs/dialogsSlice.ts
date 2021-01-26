import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type DialogPayload = {
  dialogId: string;
  data?: any;
};

export const initialState = {};

export const dialogsSlice = createSlice({
  initialState,
  name: 'alerts',
  reducers: {
    openDialog: (state, action: PayloadAction<DialogPayload>) => {
      state[action.payload.dialogId] = action.payload.data;
    },
    closeDialog: (state, action: PayloadAction<DialogPayload>) => {
      state[action.payload.dialogId] = undefined;
    },
  },
});

export const { openDialog, closeDialog } = dialogsSlice.actions;
export default dialogsSlice.reducer;
