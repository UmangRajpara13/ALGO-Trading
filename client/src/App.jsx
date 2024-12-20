import './App.css';
import React, { Component, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import Tabs from './Tabs/Tabs';
import Clock from './Clock/Clock';
import { setActiveTab } from './Tabs/tabsSlice';
import axios from 'axios';
import CustomSlider from './Switch/Switch';


function App() {

  const tabData = useSelector((state) => state.tabs.tabData);
  const activeTab = useSelector((state) => state.tabs.activeTab);

  const dispatch = useDispatch()
 

  useEffect(() => {
  }, [])  

  return (
    <div className='container'> 
      <div className='header'>
        <div className='company-name'>Volatility of Options</div>
        <div className="tab-buttons">
          {tabData.map((tab) => (
            <button
              key={tab.id}
              onClick={() => dispatch(setActiveTab(tab.id))}
              className={activeTab === tab.id ? 'active' : ''}
              style={{ borderRight: tab.id == 2 ? '0px' : '1px' }}
            >
              {tab.title}
            </button>
          ))}
        </div>
        <CustomSlider />
        <div className='clock'> <Clock /></div>
      </div>
      <Tabs />

    </div>
  )
}

export default App