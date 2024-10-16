import React, { Component, useEffect } from 'react';
import { setTime } from './clockSlice';
import { useSelector, useDispatch } from 'react-redux';

function Clock() {
    const dispatch = useDispatch();

    const time = useSelector((state) => state.clock.time);

   useEffect(() => {
    const timerId = setInterval(() => {
      dispatch(setTime());
    }, 1000); // Update every second

    return () => clearInterval(timerId); // Cleanup on unmount
  }, []);


    return (
        <div>
            <p>{time}</p>
            </div>
    )
}

export default Clock