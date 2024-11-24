import { createWriteStream } from 'fs';

// Create a writable stream with 'a' flag to append if the file exists, or create it if it doesn't
const logStream = createWriteStream('log.txt', { flags: 'a', encoding: 'utf8' });

// Function to log data
function logData(data) {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - ${data}\n`;

    // Write data to the log file
    logStream.write(logEntry, (err) => {
        if (err) {
            console.error(`Error writing to log file: ${err}`);
        }
    });
}

// Example usage: logging some data
logData('This is a test log entry.');

// Close the stream when done (optional, depending on your application logic)
process.on('exit', () => {
    logStream.end();
});