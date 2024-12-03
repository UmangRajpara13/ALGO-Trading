import axios from 'axios';

function fetchHello() {
  axios.get('/api/hello')
    .then((response) => {
      console.log('Response data:', response.data);
    })
    .catch((error) => {
      console.error('Error making API call:', error);
    });
}

// Call this function on component mount or a button click
fetchHello();