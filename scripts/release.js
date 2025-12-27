const { execSync } = require("child_process");

execSync("npm version patch", { stdio: "inherit" });
execSync("npm publish", { stdio: "inherit" });
