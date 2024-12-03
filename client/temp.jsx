
<div className='strategy-config-field grey'
>
    <label className='strategy-config-label'>
        Enable / Disable
    </label>
    <select
        className='strategy-config-input'
        id="enable-disable-dropdown"
        // value={selectedValue}
        // onChange={handleTradingMode}
        required // Ensures a selection is made
    >
        {/* <option className='strategy-config-option' value="" disabled>Select an option</option> Placeholder option */}
        <option className='strategy-config-option' value="yes">Yes</option>
        <option className='strategy-config-option' value="no">No</option>
    </select>
</div>
<div className='strategy-config-field'>
    <label className='strategy-config-label'>
        Stop Loss
    </label>
    <input className='strategy-config-input'
        type="text"
        // value={inputValue}
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
        // value={selectedValue}
        // onChange={handleTradingMode}
        required // Ensures a selection is made
    >
        {/* <option className='strategy-config-option' value="" disabled>Select an option</option> Placeholder option */}
        <option className='strategy-config-option' value="live">Live</option>
        <option className='strategy-config-option' value="paper">Paper</option>
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