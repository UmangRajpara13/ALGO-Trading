import React from 'react'
import { useSelector, useDispatch } from 'react-redux';
import Tab1 from './TradingHistory';
import Tab2 from './Tab2';
import Tab3 from './Tab3';
import './Tabs.css'
import TradeConfig from './TradeConfig';

const Tabs = () => {
  const dispatch = useDispatch();
  const activeTab = useSelector((state) => state.tabs.activeTab);

  // Function to render the appropriate component based on the active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <Tab1 />;
      case 1:
        return <Tab2 />;
      case 2:
        return <Tab3 />;
      case 3:
        return <TradeConfig />;
      default:
        return null;
    }
  };

  return (
    <div className='tab-panel'>

      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Tabs