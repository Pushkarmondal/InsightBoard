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


const prisma = new PrismaClient();
const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Middleware to verify admin access
// Add this near the top of the file where other interfaces are defined
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
        [key: string]: any;
    };
}

// Update the requireAuth middleware (add this if not exists)
const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1] || req.headers.authorization;
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        };
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

router.post("/api/organizations", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
        const { name } = req.body;
        const userId = req.user?.id;

        if (!name) {
            return res.status(400).json({ error: "Organization name is required" });
        }

        const result = await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: userId },
                data: { role: 'ADMIN' }
            });

            const organization = await tx.organization.create({
                data: {
                    name,
                    users: {
                        connect: { id: userId }
                    }
                },
                include: {
                    users: {
                        where: { id: userId },
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                            role: true
                        }
                    }
                }
            });

            return organization;
        });

        res.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error creating organization:', error);
        res.status(500).json({ 
            error: "Failed to create organization" 
        });
    }
});

router.get("/api/organizations", requireAuth, async(req, res) => {
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

router.get("/api/organizations/:id", requireAuth, async(req, res) => {
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
router.post("/api/organizations/:id/invite", requireAuth, async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }
        const organization = await prisma.organization.findUnique({
            where: { id: req.params.id },
            include: { 
                users: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        role: true,
                    }
                } 
            }
        });
        
        if (!organization) {
            return res.status(404).json({ error: "Organization not found" });
        }

        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
            }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const isAlreadyMember = organization.users.some(
            orgUser => orgUser.id === user.id
        );
        
        if (isAlreadyMember) {
            return res.status(400).json({ 
                error: "User is already a member of this organization" 
            });
        }

        await prisma.organization.update({
            where: { id: req.params.id },
            data: {
                users: {
                    connect: { id: user.id }
                }
            }
        });

        const updatedOrg = await prisma.organization.findUnique({
            where: { id: req.params.id },
            select: {
                id: true,
                name: true,
                users: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        role: true,
                    }
                }
            }
        });

        res.status(200).json({
            success: true,
            message: "User added to organization successfully",
            data: {
                user,
                organization: updatedOrg
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