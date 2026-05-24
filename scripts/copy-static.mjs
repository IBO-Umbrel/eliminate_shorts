import { cp, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");

async function copyPath(source, target) {
  await cp(source, target, { recursive: true, force: true });
}

async function run() {
  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });

  await mkdir(join(dist, "popup"), { recursive: true });
  await Promise.all([
    copyPath(join(root, "src", "manifest.json"), join(dist, "manifest.json")),
    copyPath(join(root, "src", "popup", "popup.html"), join(dist, "popup", "popup.html")),
    copyPath(join(root, "src", "popup", "popup.css"), join(dist, "popup", "popup.css")),
    copyPath(join(root, "src", "assets"), join(dist, "assets"))
  ]);
}

run();
