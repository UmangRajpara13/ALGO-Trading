import './Tabs.css'
import React from 'react'
import { useSelector, useDispatch } from 'react-redux';
import History from './History/History';
import Config from './Config/Config';
import Positions from './Positions/Positions';
import Orders from './Orders/Orders';

const Tabs = () => {
  const dispatch = useDispatch();
  const activeTab = useSelector((state) => state.tabs.activeTab);

  // Function to render the appropriate component based on the active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <History />;
      case 1:
        return <Positions />;

      case 2:
        return <Orders/>;

      case 3:
        return <Config/>;
      default:
        return null;
    }
  };

  return (
    <div className='tab-panel'>
            {renderTabContent()}
      {/* <div className="tab-content">
      </div> */}
    </div>
  );
};

export default Tabs