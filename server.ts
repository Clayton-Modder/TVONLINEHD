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
  const rootDir = process.cwd();
  const DATA_FILE = path.join(rootDir, "canais.json");
  const USERS_FILE = path.join(rootDir, "users.json");
  const DB_FILE = path.join(rootDir, "db.json");
  const CONFIG_FILE = path.join(rootDir, "config.json");

  app.use(cors());
  app.use(bodyParser.json());

  // Initialize files if they don't exist
  const initFile = (file: string, initialData: any) => {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(initialData, null, 2));
      console.log(`Created ${file}`);
    }
  };

  initFile(USERS_FILE, { users: [] });
  initFile(DB_FILE, { reports: [] });
  initFile(DATA_FILE, { 
    siteConfig: { title: "TV Online HD", subtitle: "Os melhores canais ao vivo" }, 
    categories: ["Todos", "Esportes", "Notícias", "Filmes", "Documentários", "Variedades"], 
    channels: [] 
  });
  initFile(CONFIG_FILE, { adminAccessCode: "123456" });

  // Helper to read data
  const readData = (file: string) => {
    try {
      if (!fs.existsSync(file)) return null;
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

  const authenticateAdmin = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err || user.role !== 'admin') return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // API Routes - Channels
  app.get("/api/data", (req, res) => {
    const data = readData(DATA_FILE);
    res.json(data || { siteConfig: { title: "TV Online HD", subtitle: "Os melhores canais ao vivo" }, categories: ["Todos"], channels: [] });
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

  // API Routes - Admin
  app.post("/api/admin/login", (req, res) => {
    const { code } = req.body;
    const config = readData(CONFIG_FILE);

    if (code === config.adminAccessCode) {
      const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '2h' });
      res.json({ success: true, token });
    } else {
      res.status(401).json({ success: false, message: "Código de acesso inválido" });
    }
  });

  app.get("/api/admin/users", authenticateAdmin, (req, res) => {
    const data = readData(USERS_FILE);
    const usersWithoutPasswords = data.users.map(({ password, ...u }: any) => u);
    res.json(usersWithoutPasswords);
  });

  app.get("/api/admin/data", authenticateAdmin, (req, res) => {
    res.json(readData(DATA_FILE));
  });

  app.post("/api/admin/channels", authenticateAdmin, (req, res) => {
    const { channels, categories } = req.body;
    const data = readData(DATA_FILE);
    
    if (channels) data.channels = channels;
    if (categories) data.categories = categories;
    
    writeData(DATA_FILE, data);
    res.json({ success: true });
  });

  app.delete("/api/admin/channels/:id", authenticateAdmin, (req, res) => {
    const { id } = req.params;
    const data = readData(DATA_FILE);
    data.channels = data.channels.filter((c: any) => c.id !== id);
    writeData(DATA_FILE, data);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
