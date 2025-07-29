import express from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "./organization";

const prisma = new PrismaClient();
const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post("/api/boards/:boardId/feedback/:feedbackId/comments", requireAuth, async (req: any, res) => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ error: "Content is required" });
        }
        const comment = await prisma.comment.create({
            data: {
                content,
                feedbackId: req.params.feedbackId,
                authorId: req.user.id,
            },
        });
        res.status(201).json({
            success: true,
            data: comment,
        });
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ error: "Failed to create comment" });
    }
});

router.get("/api/boards/:boardId/feedback/:feedbackId/comments", requireAuth, async (req: any, res) => {
    try {
        const comments = await prisma.comment.findMany({
            where: {
                feedbackId: req.params.feedbackId,
            },
        });
        res.status(200).json({
            success: true,
            data: comments,
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: "Failed to fetch comments" });
    }
});

export default router;