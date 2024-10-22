// src/components/TradeConfig.js
import './StrategyConfigs.css'
import React, { useState } from 'react';

function TradeConfig() {

    const [inputValue, setInputValue] = useState('');
    // Function to handle changes in the input field
    const handleChange = (event) => {
        setInputValue(event.target.value); // Update state with the new input value
    };

    // Function to handle form submission
    const handleSubmit = (event) => {
        event.preventDefault(); // Prevent default form submission behavior
        alert('Submitted value: ' + inputValue); // Alert the current input value
    };

    const [time, setTime] = useState('14:00'); // Initial time in HH:MM format

    const handleTimeChange = (event) => {
        setTime(event.target.value);
        console.log(`Time changed to: ${event.target.value}`);
    };


    const [selectedValue, setSelectedValue] = useState('');

    const handleTradingMode = (event) => {
        setSelectedValue(event.target.value);
    };
    return (
        //         <div>Strategy wise configuration
        //             max active positions,
        //             instrument_id, neighbours, series, xtsmessagecode, publish format,
        //             max quantity in single order, dailyloss, systemloss, place all orders
        // telegram bot token, dummyval, 
        //         </div>

        <div className='strategy-config-form'>
            <div className='strategy-config-field grey'
                // style={{ marginTop: '100px' }}
            >
                <label className='strategy-config-label'>
                    Enable / Disable
                </label>
                <select
                    className='strategy-config-input'
                    id="enable-disable-dropdown"
                    value={selectedValue}
                    onChange={handleTradingMode}
                    required // Ensures a selection is made
                >
                    <option value="" disabled>Select an option</option> {/* Placeholder option */}
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                </select>
            </div>
            <div className='strategy-config-field'>
                <label className='strategy-config-label'>
                    Stop Loss
                </label>
                <input className='strategy-config-input'
                    type="text"
                    value={inputValue}
                    onChange={handleChange} // Attach change handler
                />
            </div>
            <div className='strategy-config-field grey'>
                <label className='strategy-config-label'>
                    Trail After
                </label>

                <input className='strategy-config-input'
                    type="text"
                    value={inputValue}
                    onChange={handleChange} // Attach change handler
                />
            </div>
            <div className='strategy-config-field '>
                <label className='strategy-config-label'>
                    Lader Order for Single Strike
                </label>

                <input className='strategy-config-input'
                    type="text"
                    value={inputValue}
                    onChange={handleChange} // Attach change handler
                />
            </div>
            <div className='strategy-config-field grey'>
                <label className='strategy-config-label'>
                    Threshold Time
                </label>
                <input className='strategy-config-input'
                    id="time-input"
                    type="time"
                    value={time}
                    onChange={handleTimeChange}
                    step="1" // Allows seconds input
                />
            </div>
            <div className='strategy-config-field '>
                <label className='strategy-config-label'>
                    Square_off TIme
                </label>
                <input className='strategy-config-input'
                    id="time-input"
                    type="time"
                    value={time}
                    onChange={handleTimeChange}
                    step="1" // Allows seconds input
                />
            </div>
            <div className='strategy-config-field grey'>
                <label className='strategy-config-label'>
                    Start Time
                </label>
                <input className='strategy-config-input'
                    id="time-input"
                    type="time"
                    value={time}
                    onChange={handleTimeChange}
                    step="1" // Allows seconds input
                />
            </div>
            <div className='strategy-config-field '>
                <label className='strategy-config-label'>
                    Live or Paper
                </label>
                <select className='strategy-config-input'
                    id="enable-disable-dropdown"
                    value={selectedValue}
                    onChange={handleTradingMode}
                    required // Ensures a selection is made
                >
                    <option value="" disabled>Select an option</option> {/* Placeholder option */}
                    <option value="live">Live</option>
                    <option value="paper">Paper</option>
                </select>
            </div>
            <div className='strategy-config-field grey'>
                <label className='strategy-config-label'>
                    Order Stagnant Threshold Minutes
                </label>
                <input className='strategy-config-input'
                    type="text"
                    value={inputValue}
                    onChange={handleChange} // Attach change handler
                />
            </div>
            <div className='strategy-config-field '>
                <label className='strategy-config-label'>
                    Exchange Symbol
                </label>
                <input className='strategy-config-input'
                    type="text"
                    value={inputValue}
                    onChange={handleChange} // Attach change handler
                />
            </div>
            <div className='strategy-config-field grey'>
                <label className='strategy-config-label'>
                    Exchange Format
                </label>
                <input className='strategy-config-input'
                    type="text"
                    value={inputValue}
                    onChange={handleChange} // Attach change handler
                />
            </div>
            <div className='strategy-config-field '>
                <label className='strategy-config-label'>
                    Symbol
                </label>
                <input className='strategy-config-input'
                    type="text"
                    value={inputValue}
                    onChange={handleChange} // Attach change handler
                />
            </div>
            <div className='strategy-config-field grey'>
                <label className='strategy-config-label'>
                    Exchange ID
                </label>
                <input className='strategy-config-input'
                    type="text"
                    value={inputValue}
                    onChange={handleChange} // Attach change handler
                />
            </div>
            <div className='strategy-config-field'>
                <label className='strategy-config-label'>
                    Expiry Date
                </label>
                <input className='strategy-config-input'
                    type="text"
                    value={inputValue}
                    onChange={handleChange} // Attach change handler
                />
            </div>
            <div>

                <button type="submit">Save</button>

            </div>
        </div>
    )
}

export default TradeConfig