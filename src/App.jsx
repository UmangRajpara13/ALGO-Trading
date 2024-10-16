import React, { Component, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { useSelector, useDispatch } from 'react-redux'
import { decrement, increment } from './slice'
import Tabs from './Tabs/Tabs';
import Clock from './Clock/Clock';




function App() {
  const count = useSelector((state) => state.counter.value)
  const dispatch = useDispatch()
  useEffect(() => {
  }, [count])
  return (
    <div>
      <div className='header'>
        <div className='company-name'>Volatility of Options</div>
        <div className='clock'> <Clock /></div>
      </div>


      <Tabs  />

    </div>
  )
}

export default App