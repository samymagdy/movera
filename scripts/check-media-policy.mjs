import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(root, "apps", "web", "public");
const sourceRoots = [
  path.join(root, "apps", "web"),
  path.join(root, "apps", "admin"),
  path.join(root, "apps", "api", "src"),
  path.join(root, "packages", "contracts", "src"),
];
const maxActiveRasterBytes = 300 * 1024;
const rasterExtensions = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif"]);
const visualExtensions = /\.(?:png|jpe?g|gif|webp|avif|svg|woff2?|ttf)(?:[?#].*)?$/i;
const retiredAssets = new Set([
  "starter-media/movera-chatbot.png",
  "starter-media/movera-autonomy-hero.png",
]);
const virtualLocalPrefixes = ["/admin-branding/"];

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute));
    else files.push(absolute);
  }
  return files;
}

function publicRelative(absolute) {
  return path.relative(publicRoot, absolute).replaceAll(path.sep, "/");
}

const failures = [];
const publicFiles = await walk(publicRoot);
for (const file of publicFiles) {
  const relative = publicRelative(file);
  if (retiredAssets.has(relative)) continue;
  if (rasterExtensions.has(path.extname(file).toLowerCase())) {
    const size = (await fs.stat(file)).size;
    if (size > maxActiveRasterBytes) failures.push(`Active raster exceeds ${maxActiveRasterBytes} bytes: ${relative} (${size} bytes)`);
  }
}

const sourceFiles = (await Promise.all(sourceRoots.map(rootPath => walk(rootPath)))).flat().filter(file => /\.(?:json|ts|tsx|css|mjs|js)$/.test(file) && !file.includes(`${path.sep}.next${path.sep}`) && !file.includes(`${path.sep}node_modules${path.sep}`));
const localPathPattern = /["'`]((?:\/)[^"'`\s)]+\.(?:png|jpe?g|gif|webp|avif|svg)(?:\?[^"'`]*)?)["'`]/gi;
const externalVisualPattern = /https?:\/\/[^"'`\s)]+/gi;
for (const file of sourceFiles) {
  const relative = path.relative(root, file).replaceAll(path.sep, "/");
  const source = await fs.readFile(file, "utf8");
  for (const match of source.matchAll(localPathPattern)) {
    const assetPath = match[1].split("?")[0];
    if (virtualLocalPrefixes.some(prefix => assetPath.startsWith(prefix))) continue;
    const assetRelative = assetPath.slice(1);
    if (retiredAssets.has(assetRelative)) continue;
    const assetFile = path.join(publicRoot, assetRelative);
    try {
      await fs.access(assetFile);
    } catch {
      failures.push(`Missing local visual asset referenced by ${relative}: ${assetPath}`);
    }
  }
  for (const match of source.matchAll(externalVisualPattern)) {
    const url = match[0].replace(/[),.;]+$/, "");
    if (url.includes("localhost") || url.includes("127.0.0.1") || url.includes("google.com/recaptcha")) continue;
    if (visualExtensions.test(url) || /fonts\.(?:googleapis|gstatic)\.com|use\.typekit\.net|unpkg\.com|cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com/i.test(url)) {
      failures.push(`External visual resource referenced by ${relative}: ${url}`);
    }
  }
}

const apiSource = await fs.readFile(path.join(root, "apps", "api", "src", "index.ts"), "utf8");
for (const requirement of ["uploadMaxDimension = 2400", "uploadVariantWidths", ".webp({", "variants: MediaVariant[]"]) {
  if (!apiSource.includes(requirement)) failures.push(`Upload optimizer guard is missing: ${requirement}`);
}
const mediaComponent = await fs.readFile(path.join(root, "apps", "web", "components", "MediaImage.tsx"), "utf8");
if (!mediaComponent.includes("isLocalMediaUrl")) failures.push("Media renderer no longer enforces local-only image URLs");

if (failures.length) {
  console.error("Media policy failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Media policy passed: ${publicFiles.length} public files checked; active raster budget is ${maxActiveRasterBytes} bytes; local visual references and upload guards are present.`);
}
