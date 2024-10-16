import { configureStore } from '@reduxjs/toolkit'
import counterReducer from '../slice'
import tabsReducer from '../Tabs/tabsSlice'
import clockReducer from '../Clock/clockSlice'


export default configureStore({
  reducer: {
    counter: counterReducer,
    tabs: tabsReducer,
    clock: clockReducer,
  },
})