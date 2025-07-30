import type { Request, Response, NextFunction } from "express";
import express from "express";
import { PrismaClient, Role } from "@prisma/client";
import jwt from "jsonwebtoken";

// Extend the Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: Role;
            };
        }
    }
}

// Define JWT payload type
type JwtPayload = {
    id: string;
    email: string;
    role: Role;
};

// Middleware to check if user is authenticated
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = (req.headers['authorization'] || req.headers['Authorization']) as string | undefined;
    let token: string | undefined;
    if (authHeader) {
        token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
    }
    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload;
        req.user = {
            id: payload.id,
            email: payload.email,
            role: payload.role
        };
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

const prisma = new PrismaClient();
const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post("/api/organizations", requireAuth, async (req: Request, res: Response) => {
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

router.get("/api/organizations", requireAuth, async(req: Request, res: Response) => {
    try {
        const organization = await prisma.organization.findFirst({
            where: {
                users: {
                    some: {
                        id: req.user?.id,
                        role: Role.ADMIN // Use ADMIN role as OWNER might not exist
                    }
                }
            },
            include: {
                users: {
                    where: {
                        id: req.user?.id
                    },
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
            data: organization,
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