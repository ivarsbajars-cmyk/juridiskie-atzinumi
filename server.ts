import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("users.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

try {
  db.exec("ALTER TABLE users ADD COLUMN first_name TEXT");
} catch (e) {}

try {
  db.exec("ALTER TABLE users ADD COLUMN last_name TEXT");
} catch (e) {}

try {
  db.exec("ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1");
} catch (e) {}

try {
  db.exec("ALTER TABLE users ADD COLUMN last_login DATETIME");
} catch (e) {}

db.exec(`
  CREATE TABLE IF NOT EXISTS opinions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    service_type TEXT NOT NULL,
    question TEXT NOT NULL,
    generated_answer TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
`);

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-for-dev";

async function startServer() {
  const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());  
app.use(express.json());

  // API Routes
  app.post("/api/auth/register", async (req, res) => {
    let { email, password, firstName, lastName } = req.body;
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: "Visi lauki ir obligāti" });
    }
    email = email.toLowerCase().trim();

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const stmt = db.prepare("INSERT INTO users (email, password, first_name, last_name, last_login) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)");
      const info = stmt.run(email, hashedPassword, firstName, lastName);
      
      const token = jwt.sign({ id: info.lastInsertRowid, email }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ token, user: { id: info.lastInsertRowid, email, firstName, lastName } });
    } catch (error: any) {
      if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
        return res.status(400).json({ error: "Lietotājs ar šādu e-pastu jau eksistē" });
      }
      res.status(500).json({ error: "Servera kļūda" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "E-pasts un parole ir obligāti" });
    }
    email = email.toLowerCase().trim();

    try {
      const stmt = db.prepare("SELECT * FROM users WHERE LOWER(email) = LOWER(?)");
      const user = stmt.get(email) as any;

      if (!user) {
        return res.status(401).json({ error: "Nepareizs e-pasts vai parole" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Nepareizs e-pasts vai parole" });
      }

      const updateStmt = db.prepare("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?");
      updateStmt.run(user.id);

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ token, user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Servera kļūda" });
    }
  });

  app.post("/api/claude", async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2000,
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

    res.json({
      answer: data?.content?.[0]?.text || "Nav atbildes"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Claude API error" });
  }
});

  app.get("/api/users", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Nav autorizēts" });
    }

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      if (decoded.email !== "ivars.bajars@gmail.com" && decoded.email !== "ivars.bajārs@gmail.com") {
        return res.status(403).json({ error: "Piekļuve liegta" });
      }

      const stmt = db.prepare("SELECT id, email, first_name, last_name, is_active, last_login, created_at FROM users ORDER BY created_at DESC");
      const users = stmt.all();
      res.json(users);
    } catch (error) {
      res.status(401).json({ error: "Nederīgs tokens" });
    }
  });

  app.post("/api/opinions", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Nav autorizēts" });
    }

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const { serviceType, question, generatedAnswer } = req.body;
      
      if (!serviceType || !question || !generatedAnswer) {
        return res.status(400).json({ error: "Trūkst datu" });
      }

      const stmt = db.prepare("INSERT INTO opinions (user_id, service_type, question, generated_answer) VALUES (?, ?, ?, ?)");
      stmt.run(decoded.id, serviceType, question, generatedAnswer);
      
      res.json({ success: true });
    } catch (error) {
      res.status(401).json({ error: "Nederīgs tokens" });
    }
  });

  app.get("/api/opinions", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Nav autorizēts" });
    }

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const isAdmin = decoded.email === "ivars.bajars@gmail.com" || decoded.email === "ivars.bajārs@gmail.com";

      let stmt;
      if (isAdmin) {
        stmt = db.prepare(`
          SELECT o.id, o.service_type, o.question, o.generated_answer, o.created_at, 
                 u.first_name, u.last_name, u.email 
          FROM opinions o 
          JOIN users u ON o.user_id = u.id 
          ORDER BY o.created_at DESC
        `);
        const opinions = stmt.all();
        res.json(opinions);
      } else {
        stmt = db.prepare(`
          SELECT o.id, o.service_type, o.question, o.generated_answer, o.created_at, 
                 u.first_name, u.last_name, u.email 
          FROM opinions o 
          JOIN users u ON o.user_id = u.id 
          WHERE o.user_id = ?
          ORDER BY o.created_at DESC
        `);
        const opinions = stmt.all(decoded.id);
        res.json(opinions);
      }
    } catch (error) {
      res.status(401).json({ error: "Nederīgs tokens" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
