const { execSync } = require("child_process");

execSync("npm run build", { stdio: "inherit" });
execSync("npm version patch", { stdio: "inherit" });
execSync("git push --follow-tags", { stdio: "inherit" });
execSync("npm publish", { stdio: "inherit" });
