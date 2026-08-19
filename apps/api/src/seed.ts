import { ensureCEOMessage } from "./store";

async function seed() {
  await ensureCEOMessage();
  console.log("Starter content imported to PostgreSQL when missing");
}

seed();
