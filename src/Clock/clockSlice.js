import { createSlice } from '@reduxjs/toolkit'

export const clockSlice = createSlice({
    name: 'clock',
    initialState: {
        time: 0,
    },
    reducers: {
        setTime(state, action) {
            // console.log(action)
            const timeNow = new Date()
            const hours = String(timeNow.getHours()).padStart(2, '0');
            const minutes = String(timeNow.getMinutes()).padStart(2, '0');
            const seconds = String(timeNow.getSeconds()).padStart(2, '0');
            state.time = `${hours}:${minutes}:${seconds}`;
        },
    },
});

export const { setTime } = clockSlice.actions;

export default clockSlice.reducer