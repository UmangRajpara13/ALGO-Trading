import { configureStore } from '@reduxjs/toolkit'
import tabsReducer from '../Tabs/tabsSlice'
import clockReducer from '../Clock/clockSlice'


export default configureStore({
  reducer: {
    tabs: tabsReducer,
    clock: clockReducer,
  },
})