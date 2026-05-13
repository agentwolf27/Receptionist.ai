/**
 * Next.js 15 (Webpack) can emit middleware to `.next/server/src/middleware.js` when the
 * source lives at `src/middleware.ts`, while `next start` still resolves `server/middleware.js`.
 * Copy into place so production start does not throw ENOENT.
 */
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const nested = path.join(root, ".next", "server", "src", "middleware.js");
const flat = path.join(root, ".next", "server", "middleware.js");

if (fs.existsSync(nested) && !fs.existsSync(flat)) {
  fs.copyFileSync(nested, flat);
  const nestedMap = `${nested}.map`;
  const flatMap = `${flat}.map`;
  if (fs.existsSync(nestedMap)) {
    fs.copyFileSync(nestedMap, flatMap);
  }
  console.log("[fix-next-middleware-output] copied src/middleware.js → middleware.js");
}
