import type { Express } from "express";
import { createServer, type Server } from "http";
import crypto from "crypto";
import multer from "multer";
import { pdf } from "pdf-parse";
import mammoth from "mammoth";
import PDFDocument from "pdfkit";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { storage } from "./storage";
import { sendPasswordResetEmail } from "./email";
import { insertUserSchema, insertTaskSchema, loginSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import session from "express-session";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
  }));

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "A user with that email already exists." });
      }
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "That username is already taken." });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        name: userData.name,
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
      });

      // Set session
      req.session.userId = user.id;

      res.json({ user: { id: user.id, email: user.email, username: user.username, name: user.name } });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set session
      req.session.userId = user.id;

      res.json({ user: { id: user.id, email: user.email, username: user.username, name: user.name } });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      const user = await storage.getUserByEmail(email);

      if (!user) {
        // We send a success response even if the user doesn't exist to prevent email enumeration attacks.
        return res.json({ message: 'If a matching account was found, a password reset link has been sent.' });
      }

      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 3600000); // 1 hour from now

      await storage.updateUser(user.id, { passwordResetToken: token, passwordResetExpires: expires });

      const host = req.get('host') || 'localhost:3000';
      await sendPasswordResetEmail(user.email, token, host);

      res.json({ message: 'If a matching account was found, a password reset link has been sent.' });
    } catch (error: any) {
      res.status(500).json({ message: 'An error occurred while processing your request.' });
    }
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, password } = req.body;
      const user = await storage.getUserByPasswordResetToken(token);

      if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
        return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await storage.updateUser(user.id, {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      });

      res.json({ message: 'Password has been updated successfully.' });
    } catch (error: any) {
      res.status(500).json({ message: 'An error occurred while resetting your password.' });
    }
  });


  // Get current user
  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      res.json({ user: { id: user.id, email: user.email, username: user.username, name: user.name } });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update user
  app.put("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const updates = req.body;
      if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
      }

      const updatedUser = await storage.updateUser(req.session.userId!, updates);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ user: { id: updatedUser.id, email: updatedUser.email, username: updatedUser.username, name: updatedUser.name } });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get tasks
  app.get("/api/tasks", requireAuth, async (req, res) => {
    try {
      const tasks = await storage.getTasksByUserId(req.session.userId!);
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create task
  app.post("/api/tasks", requireAuth, async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse({
        ...req.body,
        userId: req.session.userId,
      });
      
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const upload = multer({ storage: multer.memoryStorage() });
  app.post("/api/tasks/import-file", requireAuth, upload.single('file'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    try {
      let textContent = "";
      if (req.file.mimetype === "application/pdf") {
        const data = await pdf(req.file.buffer);
        textContent = data.text;
      } else if (req.file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        const { value } = await mammoth.extractRawText({ buffer: req.file.buffer });
        textContent = value;
      } else {
        return res.status(400).json({ message: "Unsupported file type." });
      }

      const taskData = {
        title: `Imported from: ${req.file.originalname}`,
        description: textContent.substring(0, 1000), // Truncate to avoid overly long descriptions
        userId: req.session.userId!,
        category: 'general-inquiry',
        priority: 'medium',
      };

      const task = await storage.createTask(insertTaskSchema.parse(taskData));
      res.status(201).json(task);
    } catch (error: any) {
      console.error("File import error:", error);
      res.status(500).json({ message: "Failed to process file." });
    }
  });

  // Update task
  app.put("/api/tasks/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Verify task belongs to user
      const existingTask = await storage.getTask(id);
      if (!existingTask || existingTask.userId !== req.session.userId) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      const task = await storage.updateTask(id, updates);
      res.json(task);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Delete task
  app.delete("/api/tasks/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verify task belongs to user
      const existingTask = await storage.getTask(id);
      if (!existingTask || existingTask.userId !== req.session.userId) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      const deleted = await storage.deleteTask(id);
      if (!deleted) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json({ message: "Task deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Export task as PDF
  app.get("/api/tasks/:id/export-pdf", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const task = await storage.getTask(id);

      if (!task || task.userId !== req.session.userId) {
        return res.status(404).json({ message: "Task not found" });
      }

      const doc = new PDFDocument({ margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=task-${task.id}.pdf`);
      doc.pipe(res);

      // Header
      doc.fontSize(20).text("Task Details", { align: 'center' });
      doc.moveDown();

      // Task Info
      doc.fontSize(12).text(`Title: ${task.title}`);
      doc.text(`Priority: ${task.priority}`);
      doc.text(`Category: ${task.category}`);
      doc.text(`Status: ${task.completed ? 'Completed' : 'Pending'}`);
      doc.text(`Created At: ${new Date(task.createdAt).toLocaleString()}`);
      if (task.emailFrom) {
        doc.text(`From: ${task.emailFrom}`);
      }
      doc.moveDown();

      // Description
      doc.fontSize(14).text("Description", { underline: true });
      doc.fontSize(12).text(task.description || "No description provided.");

      doc.end();
    } catch (error: any) {
      console.error("PDF export error:", error);
      res.status(500).json({ message: "Failed to export task as PDF." });
    }
  });

  // Export task as DOCX
  app.get("/api/tasks/:id/export-docx", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const task = await storage.getTask(id);

      if (!task || task.userId !== req.session.userId) {
        return res.status(404).json({ message: "Task not found" });
      }

      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({
              children: [new TextRun({ text: "Task Details", bold: true, size: 32 })],
              alignment: 'center',
            }),
            new Paragraph({ text: "" }),
            new Paragraph({ children: [new TextRun({ text: `Title: ${task.title}` })] }),
            new Paragraph({ children: [new TextRun({ text: `Priority: ${task.priority}` })] }),
            new Paragraph({ children: [new TextRun({ text: `Category: ${task.category}` })] }),
            new Paragraph({ children: [new TextRun({ text: `Status: ${task.completed ? 'Completed' : 'Pending'}` })] }),
            new Paragraph({ children: [new TextRun({ text: `Created At: ${new Date(task.createdAt).toLocaleString()}` })] }),
            ...(task.emailFrom ? [new Paragraph({ children: [new TextRun({ text: `From: ${task.emailFrom}` })] })] : []),
            new Paragraph({ text: "" }),
            new Paragraph({ children: [new TextRun({ text: "Description", bold: true, underline: { type: 'single' } })] }),
            new Paragraph({ children: [new TextRun(task.description || "No description provided.")] }),
          ],
        }],
      });

      const buffer = await Packer.toBuffer(doc);
      res.setHeader('Content-Disposition', `attachment; filename="task-${task.id}.docx"`);
      res.type('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.send(buffer);
    } catch (error: any) {
      console.error("DOCX export error:", error);
      res.status(500).json({ message: "Failed to export task as DOCX." });
    }
  });

  // Get task statistics
  app.get("/api/tasks/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getTaskStats(req.session.userId!);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get category statistics
  app.get("/api/tasks/categories", requireAuth, async (req, res) => {
    try {
      const categories = await storage.getCategoryStats(req.session.userId!);
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
