import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post("/api/createBoard", async(req, res) => {
    try {
        const { title, description, organizationId } = req.body;
        if (!title || !description || !organizationId) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const board = await prisma.board.create({
            data: {
                title,
                description,
                organizationId,
            },
        });
        res.status(201).json({
            success: true,
            data: board,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error in Create Board route" });
    }
})

router.get("/api/boards", async(req, res) => {
    try {
        const boards = await prisma.board.findMany({
            where: {
                organizationId: req.query.organizationId as string,
            },
        });
        res.status(200).json({
            success: true,
            data: boards,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error in Boards route" });
    }
})

export default router;