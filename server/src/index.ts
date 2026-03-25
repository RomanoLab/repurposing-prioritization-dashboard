import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import pairsRouter from "./routes/pairs.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = parseInt(process.env.PORT || "3001");

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/pairs", pairsRouter);

// In production, serve the Vite-built frontend
const distPath = path.resolve(__dirname, "../../dist");
app.use(express.static(distPath));
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
