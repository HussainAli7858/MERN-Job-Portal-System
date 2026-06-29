import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get current directory (needed in ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root folder (one level up from api/)
dotenv.config({ path: path.join(__dirname, "../.env") });

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();