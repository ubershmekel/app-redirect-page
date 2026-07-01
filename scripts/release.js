const { execSync } = require("child_process");

const run = (cmd) => execSync(cmd, { stdio: "inherit" });
const capture = (cmd) => execSync(cmd).toString().trim();

// Require a clean working tree before we start. This makes the rollback below
// safe (a hard reset can't discard uncommitted work) and gives a clear early
// error instead of a confusing failure inside `npm version`.
if (capture("git status --porcelain") !== "") {
  console.error(
    "Working tree is not clean. Commit or stash your changes before releasing.",
  );
  process.exit(1);
}

// Remember exactly where we started so a failed release resets back to it,
// rather than assuming npm created exactly one commit.
const originalSha = capture("git rev-parse HEAD");

run("npm run build");

// Bump the version. npm version prints the new tag (e.g. "v2.0.3") to stdout
// and, with the default config, creates a matching commit and tag. Capture the
// exact tag so rollback below can never touch a different commit or tag.
const tag = capture("npm version patch");
console.log(tag);

// Guard against non-default npm config (e.g. git-tag-version=false): only the
// rollback path relies on the commit/tag existing, so verify it now.
const headSha = capture("git rev-parse HEAD");
let taggedSha;
try {
  taggedSha = capture(`git rev-list -n 1 ${tag}`);
} catch {
  taggedSha = null;
}
if (taggedSha !== headSha) {
  console.error(
    `Expected HEAD (${headSha}) to be tagged ${tag}, but it is not. ` +
      "Aborting before publish so nothing is left in an inconsistent state.",
  );
  process.exit(1);
}

// Validate the push can go through (auth, branch protection, divergence) before
// making anything public, so we don't publish to npm and then fail to push.
run("git push --dry-run --follow-tags");

try {
  run("npm publish");
} catch (err) {
  console.error("\nnpm publish failed, rolling back the version bump and tag.");
  run(`git tag -d ${tag}`);
  run(`git reset --hard ${originalSha}`);
  process.exit(1);
}

// Publish succeeded and the dry-run passed, so this push should go through.
run("git push --follow-tags");
