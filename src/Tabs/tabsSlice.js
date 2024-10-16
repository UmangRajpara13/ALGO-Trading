import { createSlice } from '@reduxjs/toolkit'

export const tabsSlice = createSlice({
    name: 'tabs',
    initialState: {
        activeTab: 0,
        tabData: [
            { id: 0, content: "Trading History" },
            { id: 1, content: "Positions" },
            { id: 2, content: "Orders" },
        ],
    },
    reducers: {
        setActiveTab(state, action) {
            state.activeTab = action.payload;
        },
    },
});

export const { setActiveTab } = tabsSlice.actions;

export default tabsSlice.reducer