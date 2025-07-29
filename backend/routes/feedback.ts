import express from "express";
import { PrismaClient, Status } from "@prisma/client";
import { requireAuth } from "./organization";

const prisma = new PrismaClient();
const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// POST /api/boards/:boardId/feedback - Create new feedback
router.post("/api/boards/:boardId/feedback", requireAuth, async (req: any, res) => {
    try {
        const { title, description } = req.body;
        if (!title || !description) {
            return res.status(400).json({ error: "Title and description are required" });
        }

        const board = await prisma.board.findUnique({
            where: { id: req.params.boardId }
        });

        if (!board) {
            return res.status(404).json({ error: "Board not found" });
        }

        const feedback = await prisma.feedback.create({
            data: {
                title,
                description,
                status: Status.OPEN,
                authorId: req.user.id,
                boardId: req.params.boardId,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                comments: {
                    select: {
                        id: true,
                        content: true,
                        createdAt: true,
                        author: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                }
            }
        });

        res.status(201).json({
            success: true,
            data: feedback
        });
    } catch (error) {
        console.error('Error creating feedback:', error);
        res.status(500).json({ error: "Failed to create feedback" });
    }
});

// GET /api/boards/:boardId/feedback - Get all feedback for a board
router.get("/api/boards/:boardId/feedback", requireAuth, async (req: any, res) => {
    try {
        const feedbacks = await prisma.feedback.findMany({
            where: { boardId: req.params.boardId },
            include: {
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                _count: {
                    select: { comments: true }
                },
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json({
            success: true,
            data: feedbacks
        });
    } catch (error) {
        console.error('Error fetching feedbacks:', error);
        res.status(500).json({ error: "Failed to fetch feedbacks" });
    }
});

// GET /api/feedback/:id - Get single feedback
router.get("/api/feedback/:id", requireAuth, async (req: any, res) => {
    try {
        const feedback = await prisma.feedback.findUnique({
            where: { id: req.params.id },
            include: {
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                comments: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
            }
        });

        if (!feedback) {
            return res.status(404).json({ error: "Feedback not found" });
        }

        res.status(200).json({
            success: true,
            data: feedback
        });
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({ error: "Failed to fetch feedback" });
    }
});


export default router;