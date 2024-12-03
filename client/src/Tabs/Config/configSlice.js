import { createSlice } from '@reduxjs/toolkit'

export const configSlice = createSlice({
    name: 'config',
    initialState: {
        strategyNames: [],
        currentStrategy: ``,
        currentStrategyConfig: {
            "file": "/path/to/strategy.js",
            "language": "javascript",
            "parameters": {
                "enable": {
                    "type": "option",
                    "options": [
                        "Yes",
                        "No"
                    ],
                    "value": "Yes"
                },
                "startAt": {
                    "type": "time",
                    "value": "11:48"
                },
                "endAt": {
                    "type": "time",
                    "value": "11:49"
                },
                "mode": {
                    "type": "option",
                    "options": [
                        "Live",
                        "Paper"
                    ],
                    "value": "Paper"
                },
                "symbol": {
                    "type": "input",
                    "value": "Infosys"
                }
            }
        }
    },
    reducers: {

        setStrategyNames(state, action) {
            // console.log(a)
            state.strategyNames = action.payload;
        },
        setCurrentStrategy(state, action) {
            // console.log(a)
            state.currentStrategy = action.payload;
        },
        setCurrentStrategyConfig(state, action) {
            console.log(action.payload)
            state.currentStrategyConfig = action.payload;
        },
    },
});

export const { setStrategyNames, setCurrentStrategy, setCurrentStrategyConfig } = configSlice.actions;

export default configSlice.reducer