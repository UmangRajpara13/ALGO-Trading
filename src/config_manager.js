import { watch } from "chokidar"
import fs from "fs"
import path from "path"
import { exec, spawn } from "child_process"
import { main } from "./main.js";
import { configDotenv } from "dotenv";

configDotenv();

// Map to store active strategies and their scheduled tasks
const strategies = new Map();
const loginRequest = {
    secretKey: process.env.secretKey,
    appKey: process.env.appKey,
    source: process.env.source
};
export let allStrategiesConfig = {}

// Check if today is a weekday
function isWeekday() {
    const today = new Date().getDay();
    return today >= 1 && today <= 5; // Monday (1) to Friday (5)
}

// Function to reset strategies at midnight
function resetAtMidnight() {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0); // Set to next midnight

    const timeUntilMidnight = midnight - now;
    console.log(`Scheduled reset at midnight in ${timeUntilMidnight / 1000} seconds.`);

    setTimeout(() => {
        console.log("Resetting all strategies... its Midnight");
        // Clear all existing timers
        for (const { startTimeout, endTimeout } of strategies.values()) {
            if (startTimeout) clearTimeout(startTimeout);
            if (endTimeout) clearTimeout(endTimeout);
        }
        strategies.clear();

        // Re-scan all files to set up new timers
        setupInitialTimers();
        main(loginRequest);
        // Schedule the next reset
        resetAtMidnight();
    }, timeUntilMidnight);
}

// Function to parse time and schedule tasks
function scheduleTask(filePath, startAt, endAt, command) {
    const now = new Date(); 

    if (startAt) {
        const [startHour, startMinute] = startAt.split(':').map(Number);
        const startDate = new Date();
        startDate.setHours(startHour, startMinute, 0, 0);

        if (startDate < now) {
            startDate.setDate(startDate.getDate() + 1);
        }

        const timeUntilStart = startDate - now;
        console.log(`Scheduling strategy ${filePath} to start at ${startAt}`);

        const startTimeout = setTimeout(() => {
            console.log(`Starting strategy: ${filePath}`, `with command ${command}`);
            // exec(command, (error, stdout, stderr) => {
            //     if (error) {
            //         console.error(`Error starting strategy ${filePath}:`, error);
            //     }
            //     if (stdout) console.log(`Output from ${filePath}:\n${stdout}`);
            //     if (stderr) console.error(`Error output from ${filePath}:\n${stderr}`);
            // });

            spawn(command, [], {
                cwd: path.dirname(filePath), // Set the current working directory
                stdio: 'inherit',     // Pass input/output to the parent process
                shell: true           // Use a shell to interpret the command
            });
        }, timeUntilStart);

        strategies.set(filePath, { startTimeout });
    }

    if (endAt) {
        const [endHour, endMinute] = endAt.split(':').map(Number);
        const endDate = new Date();
        endDate.setHours(endHour, endMinute, 0, 0);

        if (endDate < now) {
            endDate.setDate(endDate.getDate() + 1);
        }

        const timeUntilEnd = endDate - now;
        console.log(`Scheduling strategy ${filePath} to end at ${endAt}`);

        const endTimeout = setTimeout(() => {
            console.log(`Terminating strategy: ${filePath}`);
            if (strategies.has(filePath)) {
                const { startTimeout } = strategies.get(filePath);
                if (startTimeout) clearTimeout(startTimeout);
                strategies.delete(filePath);
            }
        }, timeUntilEnd);

        const existingEntry = strategies.get(filePath) || {};
        strategies.set(filePath, { ...existingEntry, endTimeout });
    }
}

// TODO filepath
// Function to determine the command to run based on file type
function getCommand(config) {
    const { file, language } = config;
    if (!language) {
        console.error("Missing 'file' or 'language' key in config.");
        return null;
    }
    // const filePath = path.join(process.cwd(), 'Strategies', 'Strategy_2', file);
    // console.log(file, filePath)
    switch (language.toLowerCase()) {
        case 'javascript':
            return `node ${file}`;
        case 'python':
            return `python ${file}`;
        case 'bash':
            return `bash ${file}`;
        case 'java':
            return `javac ${file} && java ${path.basename(file, '.java')}`;
        default:
            console.error(`Unsupported language: ${language}`);
            return null;
    }
}

// Function to handle new or updated files
function handleFile(filePath) {
    // if (!filePath.endsWith('.config.json')) return;
    // console.log(`Processing file: ${filePath}`);

    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
            console.error(`Error reading file ${filePath}:`, err);
            return;
        }

        try {
            const config = JSON.parse(data);
            const { parameters } = config;


            if (!parameters.enable || parameters.enable.value !== 'Yes') {
                console.log(`Strategy in ${filePath} is disabled. Ignoring.`);
                return;
            }


            const temp = filePath.split('/')
            const strategyName = temp[temp.length - 2]
            allStrategiesConfig[strategyName] = config

            const startAt = parameters.startAt?.value;
            const endAt = parameters.endAt?.value;
            const command = getCommand(config);
            if (!command) return;

            // Clear any existing timeouts for this strategy
            if (strategies.has(filePath)) {
                const { startTimeout, endTimeout } = strategies.get(filePath);
                if (startTimeout) clearTimeout(startTimeout);
                if (endTimeout) clearTimeout(endTimeout);
            }

            scheduleTask(filePath, startAt, endAt, command);
        } catch (parseError) {
            console.error(`Error parsing JSON in file ${filePath}:`, parseError);
        }
    });
}

// Function to set up initial timers
function setupInitialTimers() {
    if (!isWeekday()) {
        console.log("Today is a weekend. Exiting...");
        return;
    }

    console.log("Setting up initial timers...");
    console.log(watcher.getWatched())
    Object.keys(watcher.getWatched()).forEach((dir) => {
        // console.log('getWatched', dir)
        handleFile(path.join(dir, 'config.json'));
    });

}


// Define the Strategies directory
const strategiesDir = path.join(process.cwd(), 'Strategies');

// Function to get all config.json paths
function getConfigPaths(dir) {
    const configPaths = [];

    // Read all items in the Strategies directory
    const items = fs.readdirSync(dir);

    // Filter for directories and check for config.json
    items.forEach(item => {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
            const configPath = path.join(fullPath, 'config.json');
            if (fs.existsSync(configPath)) {
                configPaths.push(configPath);
            }
        }
    });

    return configPaths;
}


// Initialize the watcher with computed config.json paths
const configPaths = getConfigPaths(strategiesDir);
const watcher = watch(configPaths, {
    persistent: true,
    ignoreInitial: false,
});

// Watcher event listeners
watcher
    .on('ready', () => console.log('Watcher is ready!'))
    .on('add', handleFile)       // When a new file is added
    // Add event listeners
    // .on('add', path => console.log(`File ${path} has been added`))
    .on('change', handleFile)    // When a file is changed
    .on('unlink', (filePath) => { // When a file is removed
        console.log(`File removed: ${filePath}`);
        if (strategies.has(filePath)) {
            const { startTimeout, endTimeout } = strategies.get(filePath);
            if (startTimeout) clearTimeout(startTimeout);
            if (endTimeout) clearTimeout(endTimeout);
            strategies.delete(filePath);
        }
    })
    .on('error', (error) => console.error(`Watcher error: ${error}`));


// Start the program
export function run_config_manager(params) {
    if (isWeekday()) {
        setupInitialTimers();
        resetAtMidnight();
    } else {
        console.log("Today is a weekend. Program will not schedule timers for any strategies.");
    }
}