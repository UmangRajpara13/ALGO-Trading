import { configureStore } from '@reduxjs/toolkit'
import tabsReducer from '../Tabs/tabsSlice'
import clockReducer from '../Clock/clockSlice'
import configReducer from '../Tabs/Config/configSlice'         


export default configureStore({
  reducer: {
    tabs: tabsReducer,
    clock: clockReducer,
    config: configReducer,
  },
})