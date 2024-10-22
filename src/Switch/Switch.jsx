import './Switch.css'
import React, { useState } from 'react';
import { SwitchTheme } from './setTheme';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';


function CustomSlider() {
    const [isDarkActive, setIsActive] = useState(true);


    const toggleSlider = () => {
        setIsActive(!isDarkActive);
        SwitchTheme(!isDarkActive)
    };

    return (
        <div onClick={toggleSlider} className='slider-socket' style={{
            cursor: "pointer",
            width: "50px",
            height: "25px",
            border: "2px solid grey",
            borderRadius: "15px",
            position: "relative",
        }}>
            <div className='slider' style={{
                top: "0",
                width: "23px",
                height: "23px",
                borderRadius: '50%', 
                border: "1px solid",
                borderColor: isDarkActive ? "#000" : '#fff',
                transition: "left 0.2s",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: 'absolute',
                left: isDarkActive ? '25px' : '0',
            }} >
                <FontAwesomeIcon icon={isDarkActive ? faSun : faMoon}
                    style={{ color: isDarkActive ? '#fff' : '#333' }} />
            </div>
        </div >
    );
}

export default CustomSlider;