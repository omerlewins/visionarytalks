import { getPayload } from "payload";
import config from "../src/payload.config";
const payload = await getPayload({ config });
await payload.jobs.run({ limit: 1 });
console.log(
  "Processed up to one due job. Check Content jobs for progress or missing inputs.",
);
await payload.destroy();
process.exit(0);
