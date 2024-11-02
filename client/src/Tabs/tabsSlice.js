import { createSlice } from '@reduxjs/toolkit'

export const tabsSlice = createSlice({
    name: 'tabs',
    initialState: {
        activeTab: 0,
        tabData: [
            { id: 0, title: 'History', content: "Trading History" },
            { id: 1, title: 'Positions', content: "Live Trades" },
            { id: 2, title: 'Orders', content: "Open Orders" },
            { id: 3, title: 'Config', content: "Trade Configs" },
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