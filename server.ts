import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const DATA_FILE = path.join(__dirname, "canais.json");
  const USERS_FILE = path.join(__dirname, "users.json");
  const DB_FILE = path.join(__dirname, "db.json");

  app.use(cors());
  app.use(bodyParser.json());

  // Initialize files if they don't exist
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }, null, 2));
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ reports: [] }, null, 2));
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ siteConfig: { title: "TV Online HD", subtitle: "Os melhores canais ao vivo" }, categories: ["Todos"], channels: [] }, null, 2));
  }

  // Helper to read data
  const readData = (file: string) => {
    try {
      const data = fs.readFileSync(file, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${file}:`, error);
      return null;
    }
  };

  // Helper to write data
  const writeData = (file: string, data: any) => {
    try {
      fs.writeFileSync(file, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error writing ${file}:`, error);
      return false;
    }
  };

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // API Routes - Channels
  app.get("/api/data", (req, res) => {
    res.json(readData(DATA_FILE) || { siteConfig: { title: "TV Online HD", subtitle: "" }, categories: [], channels: [] });
  });

  app.post("/api/data", (req, res) => {
    const newData = req.body;
    if (writeData(DATA_FILE, newData)) {
      res.json({ success: true, message: "Dados atualizados com sucesso" });
    } else {
      res.status(500).json({ success: false, message: "Erro ao salvar dados" });
    }
  });

  // API Routes - Auth
  app.post("/api/auth/register", async (req, res) => {
    const { username, password } = req.body;
    const data = readData(USERS_FILE);
    
    if (data.users.find((u: any) => u.username === username)) {
      return res.status(400).json({ success: false, message: "Usuário já existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: uuidv4(),
      username,
      password: hashedPassword,
      profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      favorites: [],
      folders: []
    };

    data.users.push(newUser);
    writeData(USERS_FILE, data);

    const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET);
    const { password: _, ...userWithoutPassword } = newUser;
    res.json({ success: true, token, user: userWithoutPassword });
  });

  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    const data = readData(USERS_FILE);
    const user = data.users.find((u: any) => u.username === username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: "Credenciais inválidas" });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, token, user: userWithoutPassword });
  });

  // API Routes - Profile
  app.get("/api/profile", authenticateToken, (req: any, res) => {
    const data = readData(USERS_FILE);
    const user = data.users.find((u: any) => u.id === req.user.id);
    if (!user) return res.status(404).json({ message: "Usuário não encontrado" });
    
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  app.put("/api/profile", authenticateToken, (req: any, res) => {
    const { username, profileImage, favorites, folders } = req.body;
    const data = readData(USERS_FILE);
    const userIndex = data.users.findIndex((u: any) => u.id === req.user.id);

    if (userIndex === -1) return res.status(404).json({ message: "Usuário não encontrado" });

    if (username) data.users[userIndex].username = username;
    if (profileImage) data.users[userIndex].profileImage = profileImage;
    if (favorites) data.users[userIndex].favorites = favorites;
    if (folders) data.users[userIndex].folders = folders;

    writeData(USERS_FILE, data);
    const { password: _, ...userWithoutPassword } = data.users[userIndex];
    res.json(userWithoutPassword);
  });

  // API Routes - Reports
  app.post("/api/reports", authenticateToken, (req: any, res) => {
    const { message } = req.body;
    const data = readData(DB_FILE);
    
    const newReport = {
      id: uuidv4(),
      userId: req.user.id,
      username: req.user.username,
      message,
      timestamp: new Date().toISOString()
    };

    data.reports.push(newReport);
    writeData(DB_FILE, data);
    res.json({ success: true, message: "Reporte enviado com sucesso" });
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
