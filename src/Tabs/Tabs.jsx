import React from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { setActiveTab } from './tabsSlice';
import Tab1 from './Tab1';
import Tab2 from './Tab2';
import Tab3 from './Tab3';
import './Tabs.css'

const Tabs = () => {
    const dispatch = useDispatch();
    const activeTab = useSelector((state) => state.tabs.activeTab);
    const tabData = useSelector((state) => state.tabs.tabData);
  
    // Function to render the appropriate component based on the active tab
    const renderTabContent = () => {
      switch (activeTab) {
        case 0:
          return <Tab1 />;
        case 1:
          return <Tab2 />;
        case 2:
          return <Tab3 />;
        default:
          return null;
      }
    };
  
    return (
      <div className='tabs'>
        <div className="tab-buttons">
          {tabData.map((tab) => (
            <button
              key={tab.id}
              onClick={() => dispatch(setActiveTab(tab.id))}
              className={activeTab === tab.id ? 'active' : ''}
            >
              Tab {tab.id + 1}
            </button>
          ))}
        </div>
        <div className="tab-content">
          {renderTabContent()}
        </div>
      </div>
    );
  };

export default Tabs