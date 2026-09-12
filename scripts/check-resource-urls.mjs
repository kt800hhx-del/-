#!/usr/bin/env node
/**
 * HEAD/GET every https URL in lib/resources.ts.
 * Exit 1 if any URL is missing, not https, or not 2xx/3xx.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const resourcesSrc = readFileSync(join(root, "lib/resources.ts"), "utf8");
const rolesSrc = readFileSync(join(root, "lib/roles.ts"), "utf8");

const urls = [...new Set(resourcesSrc.match(/https:\/\/[^\s"']+/g) ?? [])].sort();
const skillIds = [...rolesSrc.matchAll(/skill\(\{\s*id:\s*"([^"]+)"/g)].map((m) => m[1]);
const catalog = resourcesSrc.slice(
  resourcesSrc.indexOf("export const SKILL_RESOURCES"),
  resourcesSrc.indexOf("export const ROLE_RESOURCES"),
);
const skillBlocks = [...catalog.matchAll(/"([a-z0-9-]+)":\s*\[([\s\S]*?)\]/g)];
const skillKeys = new Set();
for (const [, key, body] of skillBlocks) {
  const count = (body.match(/https:\/\//g) ?? []).length;
  skillKeys.add(key);
  if (count < 2 || count > 4) {
    console.error(`skill ${key} has ${count} urls (need 2–4)`);
    process.exitCode = 1;
  }
}

const missing = skillIds.filter((id) => !skillKeys.has(id));
if (missing.length) {
  console.error("skills without resource entries:", missing.join(", "));
  process.exitCode = 1;
}

if (!urls.length) {
  console.error("no https URLs found in lib/resources.ts");
  process.exit(1);
}

const bad = [];
async function check(url) {
  for (const method of ["HEAD", "GET"]) {
    try {
      const res = await fetch(url, {
        method,
        redirect: "follow",
        signal: AbortSignal.timeout(20000),
        headers: { "User-Agent": "CareerPlannerLinkCheck/1.0", Accept: "*/*" },
      });
      if (res.status >= 200 && res.status < 400) {
        return { url, status: res.status, method };
      }
      if (method === "HEAD") continue;
      return { url, status: res.status, method };
    } catch (err) {
      if (method === "HEAD") continue;
      return { url, status: 0, method, error: String(err) };
    }
  }
  return { url, status: 0, method: "GET" };
}

const results = await Promise.all(urls.map(check));
for (const row of results) {
  const ok = row.status >= 200 && row.status < 400;
  if (!ok) {
    bad.push(row);
    console.error(`FAIL ${row.status || row.error} ${row.method} ${row.url}`);
  } else {
    console.log(`OK   ${row.status} ${row.method} ${row.url}`);
  }
}

if (bad.length) {
  console.error(`\n${bad.length}/${urls.length} URLs failed`);
  process.exit(1);
}
console.log(`\n${urls.length} URLs returned 2xx/3xx; ${skillIds.length} skills have 2–4 resources.`);
