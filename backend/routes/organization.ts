import type { Request, Response, NextFunction } from "express";
import express from "express";
import { PrismaClient, Role } from "@prisma/client";
import jwt from "jsonwebtoken";

// Define JWT payload type
type JwtPayload = {
    id: string;
    email: string;
    role: Role;
};

// Extend the Express Request type to include user
type AuthenticatedRequest = Request & {
    user?: JwtPayload;
};

const prisma = new PrismaClient();
const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Middleware to verify admin access
const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        // Verify the token and check if user is admin
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        if (decoded.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

router.post("/api/organizations", requireAdmin, async(req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const organization = await prisma.organization.create({
            data: {
                name,
            },
        });
        
        res.status(201).json({
            success: true,
            data: organization,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error in Create Organization route" });
    }
})

router.get("/api/organizations", requireAdmin, async(req, res) => {
    try {
        const organizations = await prisma.organization.findMany();
        res.status(200).json({
            success: true,
            data: organizations,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error in Organizations route" });
    }
})

router.get("/api/organizations/:id", requireAdmin, async(req, res) => {
    try {
        const organization = await prisma.organization.findUnique({
            where: {
                id: req.params.id,
            },
        });
        res.status(200).json({
            success: true,
            data: organization,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error in Organization route" });
    }
})



// /organizations/:id/invite - Only admins can invite existing users to organization
router.post("/api/organizations/:id/invite", requireAdmin, async(req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        // Check if organization exists
        const organization = await prisma.organization.findUnique({
            where: { id: req.params.id },
            include: { users: true }
        });
        
        if (!organization) {
            return res.status(404).json({ error: "Organization not found" });
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email },
            include: { organizations: true }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if user is already in the organization
        const isAlreadyMember = organization.users.some(
            orgUser => orgUser.id === user.id
        );
        
        if (isAlreadyMember) {
            return res.status(400).json({ 
                error: "User is already a member of this organization" 
            });
        }

        // Add user to organization
        await prisma.organization.update({
            where: { id: req.params.id },
            data: {
                users: {
                    connect: { id: user.id }
                }
            }
        });

        res.status(200).json({
            success: true,
            message: "User added to organization successfully",
            data: {
                userId: user.id,
                organizationId: req.params.id
            }
        });
    } catch (error) {
        console.error('Error in invite route:', error);
        res.status(500).json({ 
            error: "Failed to process invitation" 
        });
    }
});

export default router;