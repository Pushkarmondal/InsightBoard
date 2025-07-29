import express from "express";
import { PrismaClient, Role } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const router = express.Router();

router.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, firstName, lastName, password, role = Role.MEMBER } = req.body;
    
    // Validate required fields
    if (!email || !firstName || !lastName || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate role is either MEMBER or ADMIN
    if (role !== Role.MEMBER && role !== Role.ADMIN) {
      return res.status(400).json({ error: "Invalid role. Must be MEMBER or ADMIN" });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    // Create new user
    const signupUser = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        password: await bcrypt.hash(password, 10),
        role,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: signupUser.id,
          email: signupUser.email,
          firstName: signupUser.firstName,
          lastName: signupUser.lastName,
          role: signupUser.role,
        },
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error in Signup route" });
  }
});

router.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const loginUser = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        password: true,
      },
    });
    if (!loginUser) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, loginUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign(
      {
        id: loginUser.id,
        email: loginUser.email,
        firstName: loginUser.firstName,
        lastName: loginUser.lastName,
        role: loginUser.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: loginUser.id,
          email: loginUser.email,
          firstName: loginUser.firstName,
          lastName: loginUser.lastName,
          role: loginUser.role,
        },
      },
      token,
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error in Login route" });
  }
});

export default router;
