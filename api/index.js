// This must be the very first line
import dotenv from "dotenv";
import { resolve } from "path";

// Load .env from root before anything else
dotenv.config({ path: resolve(process.cwd(), ".env") });

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