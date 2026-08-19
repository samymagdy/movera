import { execFileSync } from "node:child_process";

const schema = ["--schema", "apps/api/prisma/schema.prisma"];
if (process.env.NODE_ENV === "production") {
  execFileSync("npx", ["prisma", "migrate", "deploy", ...schema], { stdio: "inherit" });
  console.log("PostgreSQL production migrations applied");
} else {
  execFileSync("npx", ["prisma", "db", "push", ...schema], { stdio: "inherit" });
  console.log("PostgreSQL development schema ready");
}
