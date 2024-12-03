import './Configs.css'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux'
import { setCurrentStrategy, setCurrentStrategyConfig, setStrategyNames } from './configSlice';


export default function Config() {

    const strategyNames = useSelector((state) => state.config.strategyNames);
    const currentStrategy = useSelector((state) => state.config.currentStrategy);
    const currentStrategyConfig = useSelector((state) => state.config.currentStrategyConfig);

    const dispatch = useDispatch()

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
    const [selectedValue, setSelectedValue] = useState(''); // Initial time in HH:MM format
    const [inputValue, setInputValue] = useState('');

    const handleTimeChange = (event) => {
        setTime(event.target.value);
        console.log(`Time changed to: ${event.target.value}`);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const [paramType, paramKey] = name.split(".");
        console.log(name, value)

        const updatedConfig = {
            ...currentStrategyConfig,
            parameters: {
                ...currentStrategyConfig.parameters,
                [paramKey]: { ...currentStrategyConfig.parameters[paramKey], value },
            },
        };

        dispatch(setCurrentStrategyConfig(updatedConfig)); // Dispatch the updated config
    };

    const renderInput = (key, param) => {
        switch (param.type) {
            case "option":
                return (
                    <select
                        className='strategy-config-input'
                        key={key} name={`parameters.${key}`}
                        value={param.value} onChange={handleInputChange}>
                        {param.options.map((option) => (
                            <option className='strategy-config-option' key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                );
            case "time":
                return (
                    <input
                        className='strategy-config-input'
                        key={key}
                        type="time"
                        name={`parameters.${key}`}
                        value={param.value}
                        onChange={handleInputChange}
                    />
                );
            case "input":
                return (
                    <input
                        className='strategy-config-input'
                        key={key}
                        type="text"
                        name={`parameters.${key}`}
                        value={param.value}
                        onChange={handleInputChange}
                    />
                );
            default:
                return null;
        }
    };

    const handleStrategyChange = (event) => {
        dispatch(setCurrentStrategy(event.target.value))
        // setSelectedValue(event.target.value);
        const data = {
            strategyName: event.target.value
        }
        axios.post('/api/get-strategy-config', data, {
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then((response) => {
                console.log('Full Axios response:', response);
                console.log('Response data:', response.data); // This should show the expected object
                dispatch(setCurrentStrategyConfig(response.data)); // Dispatch the updated config

            })
            .catch((error) => {
                console.error('Error making API call:', error);
            });
    };

    useEffect(() => {
        axios.post('/api/get-all-strategy-name', {}, {
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then((response) => {
                // console.log('Full Axios response:', response);
                console.log('Response data:', response.data); // This should show the expected object
                dispatch(setStrategyNames(response.data.names))
            })
            .catch((error) => {
                console.error('Error making API call:', error);
            });
    }, [])
    return (
        //         <div>Strategy wise configuration
        //             max active positions,
        //             instrument_id, neighbours, series, xtsmessagecode, publish format,
        //             max quantity in single order, dailyloss, systemloss, place all orders
        // telegram bot token, dummyval, 
        //         </div>
        <div className='trade-config'>

            <div className='strategy-config-form'>

                <div className='strategy-config-field'>
                    <label className='strategy-config-label'>
                        Strategy
                    </label>
                    <select
                        className='strategy-config-input'
                        id="choose-strategy"
                        value={currentStrategy}
                        onChange={handleStrategyChange}
                        required // Ensures a selection is made
                    >
                        {/* <option value="" disabled>Select an option</option> Placeholder option */}
                        {strategyNames.map((item, index) => (
                            <option key={index} className='strategy-config-option' value={item}>{item}</option>
                        ))}
                    </select>
                </div>

                {Object.entries(currentStrategyConfig.parameters).map(([key, param]) => (
                    <div className='strategy-config-field' key={key}>
                        <label className='strategy-config-label'>{key}</label>
                        {renderInput(key, param)}
                    </div>
                ))}



            </div>
            <div className='trade-config-footer'>
                <div className='strategy-config-save-button'>

                    <button type="submit">Save</button>

                </div>
            </div>
        </div>

    )
}

