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
    axios.get('http://localhost:8000/hello')
    .then((response) => {
        console.log(response); // Log the response data to the console
    })
    .catch((error) => {
        console.error('Error making API call:', error);
    });
  }, [])

  return (
    <div> 
      <div className='header'>
        <div className='company-name'>Volatility of Options</div>
        <div className="tab-buttons">
          {tabData.map((tab) => (
            <button
              key={tab.id}
              onClick={() => dispatch(setActiveTab(tab.id))}
              className={activeTab === tab.id ? 'active' : ''}
            >
              {tab.title}
            </button>
          ))}
        </div>
        <CustomSlider/>
        <div className='clock'> <Clock /></div>
      </div>
      <Tabs />

    </div>
  )
}

export default App