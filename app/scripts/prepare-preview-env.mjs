import { readFile, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
const file = "../private/.env.vercel-preview";
let env = await readFile(file, "utf8");
const existing = env.match(/^PAYLOAD_SECRET=(.*)$/m)?.[1]?.replaceAll('"', '');
const values = { APP_ENV: "preview", DEMO_MODE: "false", PAYLOAD_SECRET: existing || randomBytes(32).toString("hex") };
for (const [key, value] of Object.entries(values)) {
  env = env.replace(new RegExp(`^${key}=.*\\r?\\n?`, "m"), "");
  env += `\n${key}=${value}\n`;
}
await writeFile(file, env);
await writeFile("../private/vercel-preview-env.json", JSON.stringify(Object.entries(values).map(([key,value]) => ({ key, value, type: key === "PAYLOAD_SECRET" ? "encrypted" : "plain", target: ["preview"] }))));
console.log("Preview configuration saved privately; no production variables modified.");
