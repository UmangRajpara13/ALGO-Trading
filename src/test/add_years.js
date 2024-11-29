// // Define the Unix timestamp
// const unixTimestamp = 1417259130;

// // Convert to milliseconds and create a Date object
// const dateObj = new Date(unixTimestamp * 1000);

// // Get the formatted date in GMT
// const gmtDate = dateObj.toGMTString();

// // Get the local date string
// const localDate = dateObj.toLocaleString();

// // Output the results
// console.log("GMT Date:", gmtDate);
// console.log("Local Date:", localDate);

// Get the current date
const currentDate = new Date();

// Get the Unix timestamp for the current date (in seconds)
const unixTimestampNow = Math.floor(currentDate.getTime() / 1000);

// Convert to milliseconds and create a Date object
const dateObjNow = new Date(unixTimestampNow * 1000);

// Get the formatted date in GMT
const gmtDateNow = dateObjNow.toGMTString();

// Get the local date string
const localDateNow = dateObjNow.toLocaleString();

// Output the results
console.log("Current Unix Timestamp:", unixTimestampNow);
console.log("GMT Date:", gmtDateNow);
console.log("Local Date:", localDateNow);