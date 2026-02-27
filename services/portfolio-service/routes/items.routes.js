// File: services/portfolio-service/routes/items.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../middleware/auth');
const portfolioService = require('../services/portfolio.service');
const itemsService = require('../services/items.service');

// File upload config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = process.env.UPLOAD_DIR || './uploads';
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${uuidv4()}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
        const allowed = [
            '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',      // Images
            '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', // Docs
            '.mp4', '.webm', '.mov', '.avi',                         // Video
            '.mp3', '.wav', '.ogg',                                   // Audio
            '.zip', '.rar',                                           // Archives
            '.psd', '.ai', '.sketch', '.fig',                        // Design files
        ];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) cb(null, true);
        else cb(new Error(`File type ${ext} not allowed.`));
    },
});

// POST /api/portfolio/items — Add new item
router.post('/', authenticate, upload.single('file'), async (req, res) => {
    try {
        const portfolio = await portfolioService.getOrCreatePortfolio(req.user.id);
        const { title, description, itemType, externalUrl, tags } = req.body;

        if (!title || !itemType) {
            return res.status(400).json({ success: false, message: 'Title and itemType are required.' });
        }

        const itemData = {
            title,
            description,
            itemType,
            fileUrl: req.file ? `/uploads/${req.file.filename}` : null,
            externalUrl,
            thumbnailUrl: req.file && req.file.mimetype.startsWith('image') ? `/uploads/${req.file.filename}` : null,
            tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [],
        };

        const item = await itemsService.addItem(portfolio.PortfolioID, itemData);
        res.status(201).json({ success: true, data: item, message: 'Item added. AI evaluation in progress...' });
    } catch (err) {
        console.error('Add item error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT /api/portfolio/items/:itemId — Update item
router.put('/:itemId', authenticate, upload.single('file'), async (req, res) => {
    try {
        const { title, description, itemType, externalUrl, tags, sortOrder } = req.body;
        const updateData = {
            title,
            description,
            itemType,
            externalUrl,
            tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : undefined,
            sortOrder: sortOrder ? parseInt(sortOrder) : undefined,
        };

        if (req.file) {
            updateData.fileUrl = `/uploads/${req.file.filename}`;
            if (req.file.mimetype.startsWith('image')) updateData.thumbnailUrl = updateData.fileUrl;
        }

        const item = await itemsService.updateItem(req.params.itemId, req.user.id, updateData);
        res.json({ success: true, data: item });
    } catch (err) {
        console.error('Update item error:', err);
        res.status(err.message.includes('unauthorized') ? 403 : 500).json({ success: false, message: err.message });
    }
});

// DELETE /api/portfolio/items/:itemId — Delete item
router.delete('/:itemId', authenticate, async (req, res) => {
    try {
        await itemsService.deleteItem(req.params.itemId, req.user.id);
        res.json({ success: true, message: 'Item deleted.' });
    } catch (err) {
        console.error('Delete item error:', err);
        res.status(err.message.includes('unauthorized') ? 403 : 500).json({ success: false, message: err.message });
    }
});

// POST /api/portfolio/items/:itemId/evaluate — Re-evaluate with AI
router.post('/:itemId/evaluate', authenticate, async (req, res) => {
    try {
        const evaluation = await itemsService.reEvaluateItem(req.params.itemId, req.user.id);
        res.json({ success: true, data: evaluation });
    } catch (err) {
        console.error('Re-evaluate item error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
