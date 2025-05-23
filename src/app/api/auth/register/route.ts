import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Helper function to generate username from name
function generateUsername(name: string): string {
  // Remove spaces and special characters, convert to lowercase
  const baseUsername = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 15); // Limit length

  // Add random suffix to ensure uniqueness
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${baseUsername}${randomSuffix}`;
}

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Generate a unique username
    let username = generateUsername(name);
    let usernameExists = await prisma.user.findUnique({
      where: { username },
    });

    // Keep generating until we find a unique username
    while (usernameExists) {
      username = generateUsername(name);
      usernameExists = await prisma.user.findUnique({
        where: { username },
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        username, // Add the generated username
      },
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { message: "User registered successfully", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { error: "An error occurred while registering the user" },
      { status: 500 }
    );
  }
}
