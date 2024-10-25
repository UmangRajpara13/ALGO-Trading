import './TradingHistory.css'
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import React, { useState } from 'react';

const TradeHistory = () => {

  // Row Data: The data to be displayed.
  const [rowData, setRowData] = useState([
    { Date: "12/03/2024", Instrument: "INFY", "B/S": "Buy", Entry: 600, Exit: 700, Diff: 123, "P/L": 456789 },
    { Date: "12/03/2024", Instrument: "TECHM", "B/S": "Sell", Entry: 500, Exit: 300, Diff: 123, "P/L": 456789 },
    { Date: "12/03/2024", Instrument: "BPCL", "B/S": "Sell", Entry: 520, Exit: 222, Diff: 123, "P/L": 456789 },
    { Date: "12/03/2024", Instrument: "Reliance", "B/S": "Buy", Entry: 340, Exit: 341, Diff: 123, "P/L": 456789 },
  ]);

  // Column Definitions: Defines the columns to be displayed.
  const [colDefs, setColDefs] = useState([
    // Date, instrument, B/S,Price,Price,Diff,QTY,P/l 
    { field: "Date", flex: 1 },
    { field: "Instrument", flex: 0.8 },
    { field: "B/S", flex: 0.4 },
    { field: "Entry", flex: 1 },
    { field: "Exit", flex: 1 },
    { field: "Diff", flex: 0.75 },
    { field: "QTY", flex: 0.75 },
    { field: "P/L", flex: 1 },
  ]);

  return (
    <div className='trading-history'>
      <div
        className="ag-theme-quartz trading-history-grid" // applying the Data Grid theme
        style={{ height: 500 }} // the Data Grid will fill the size of the parent container
      >
        <AgGridReact
          rowData={rowData}
          columnDefs={colDefs}
        />
      </div>
      <div className='trading-history-footer'>
        From Date, To Date, Net P/L.
        Umang working remotely
      </div>
    </div>
  )
};

export default TradeHistory;