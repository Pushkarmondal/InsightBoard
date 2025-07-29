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

// "/feedback/:feedbackId/vote"
router.post("/api/feedback/:feedbackId/vote", requireAuth, async (req: any, res: any) => {
    let action: string = "";
    let updatedFeedback: any;
    try {
        const { feedbackId } = req.params;
        const userId = req.user.id;

        const feedback = await prisma.feedback.findUnique({
            where: { id: feedbackId }
        });
        if (!feedback) {
            return res.status(404).json({ error: "Feedback not found" });
        }

        const existingVote = await prisma.vote.findFirst({
            where: { feedbackId, userId }
        });
        await prisma.$transaction(async (tx) => {
            if (existingVote) {
                await tx.vote.delete({
                    where: { id: existingVote.id }
                });
                action = 'removed';
            } else {
                await tx.vote.create({
                    data: { feedbackId, userId }
                });
                action = 'added';
            }

            const voteCount = await tx.vote.count({
                where: { feedbackId }
            });
            updatedFeedback = await tx.feedback.update({
                where: { id: feedbackId },
                data: { votes: voteCount },
                include: {
                    author: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            });
        });

        res.status(200).json({
            success: true,
            data: {
                action,
                voteCount: updatedFeedback?.votes,
                feedback: updatedFeedback
            }
        });
    } catch (error) {
        console.error('Error processing vote:', error);
        res.status(500).json({ error: "Failed to process vote" });
    }
});


export default router;