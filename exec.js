import { exec } from "child_process"
import path from "path"


exec(`node ${path.join(process.cwd(),'Strategies',)}`, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error starting strategy ${filePath}:`, error);
    }
    if (stdout) console.log(`Output from ${filePath}:\n${stdout}`);
    if (stderr) console.error(`Error output from ${filePath}:\n${stderr}`);
});