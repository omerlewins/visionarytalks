import { getPayload } from "payload";
import config from "../src/payload.config";
const email = process.env.BOOTSTRAP_ADMIN_EMAIL,
  password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
if (!email || !password || password.length < 20)
  throw new Error(
    "Set BOOTSTRAP_ADMIN_EMAIL and a 20+ character BOOTSTRAP_ADMIN_PASSWORD in the server environment",
  );
const payload = await getPayload({ config });
const existing = await payload.find({ collection: "users", limit: 1 });
if (existing.totalDocs)
  throw new Error(
    "Users already exist; ask an existing administrator to grant access",
  );
await payload.create({
  collection: "users",
  data: { email, password, name: "Publication administrator", role: "admin" },
});
console.log(
  "Administrator created. Remove bootstrap variables from the environment.",
);
await payload.destroy();
process.exit(0);
