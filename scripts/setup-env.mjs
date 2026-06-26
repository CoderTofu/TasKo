import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const backendEnv = join(process.cwd(), "backend", ".env");
const backendExampleEnv = join(process.cwd(), "backend", ".env.example");

if (!existsSync(backendEnv)) {
  copyFileSync(backendExampleEnv, backendEnv);
  console.log("Created backend/.env from backend/.env.example");
}
