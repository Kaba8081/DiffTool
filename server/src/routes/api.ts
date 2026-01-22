import type e = require("express");
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

router.get('/health', (_req: e.Request, res: e.Response) => {
  res.json({ status: 'ok' });
});

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), (req: e.Request, res: e.Response) => {
  const clientID = req.body.clientID;
  if (!clientID || !req.file) return res.status(400).json({ error: 'Missing clientID or file' });

  const userDir = path.join('uploads', clientID);
  fs.mkdirSync(userDir, { recursive: true });
  const destPath = path.join(userDir, req.file.originalname);
  fs.renameSync(req.file.path, destPath);

  res.json({ success: true });
});

router.get('/files', (req, res) => {
  const clientIDRaw = req.query.clientID;
  const clientID = Array.isArray(clientIDRaw) ? clientIDRaw[0] : clientIDRaw;
  if (!clientID || typeof clientID !== 'string') return res.status(400).json({ error: 'Missing clientID' });

  const userDir = path.join('uploads', clientID);
  if (!fs.existsSync(userDir)) return res.json({ files: [] });

  const files = fs.readdirSync(userDir);
  res.json({ files });
});

router.get('/file/:clientID/:filename', (req, res) => {
  const { clientID, filename } = req.params;
  const filePath = path.join('uploads', clientID, filename);
  if (!fs.existsSync(filePath)) return res.status(404).end();
  res.sendFile(path.resolve(filePath));
});

export default router;