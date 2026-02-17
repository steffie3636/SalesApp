import express from "express";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Azure App Service Linux uses /home/ for persistent storage
// WEBSITE_SITE_NAME is set automatically by Azure App Service
const isAzure = !!process.env.WEBSITE_SITE_NAME;
const DATA_DIR = process.env.DATA_DIR || (isAzure ? "/home/data" : join(__dirname, "data"));
const DATA_FILE = join(DATA_DIR, "salesarena.json");

app.use(express.json({ limit: "5mb" }));

// API: Load data
app.get("/api/data", async (_req, res) => {
  try {
    if (!existsSync(DATA_FILE)) {
      return res.json(null);
    }
    const raw = await readFile(DATA_FILE, "utf-8");
    res.json(JSON.parse(raw));
  } catch {
    res.json(null);
  }
});

// API: Save data
app.post("/api/data", async (req, res) => {
  try {
    if (!existsSync(DATA_DIR)) {
      await mkdir(DATA_DIR, { recursive: true });
    }
    await writeFile(DATA_FILE, JSON.stringify(req.body, null, 2), "utf-8");
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve React app (built files from dist/)
app.use(express.static(join(__dirname, "dist")));

// SPA fallback: all other routes serve index.html
app.get("*", (_req, res) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`SalesArena server running on port ${PORT}`);
});
