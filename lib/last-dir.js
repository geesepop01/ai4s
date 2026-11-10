// Remembers the research workspace the agent touched last.
//
// The panel is a root-scoped overlay and has no session props, so the host
// records the directory each state read/write used and the route falls back to
// it. A session-scoped picker is the follow-up; this keeps v1.0 honest about
// what it shows (it names the directory in the panel).

let lastStateDir

/** @param {string} dir */
export function setLastStateDir(dir) {
  lastStateDir = dir
}

/** @returns {string|undefined} */
export function getLastStateDir() {
  return lastStateDir
}
