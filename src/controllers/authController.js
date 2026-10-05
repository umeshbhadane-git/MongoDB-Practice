const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");

const User = require("../models/User");
const AppError = require("../errors/AppError");

const JWT_SECRET = process.env.JWT_SECRET;

const registerSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters"),

    email: z
        .string()
        .email("Invalid email"),

    password: z
        .string()
        .min(6, "Password must be at least 6 characters")
});

const loginSchema = z.object({
    email: z.string().email("Invalid email"),

    password: z
        .string()
        .min(1, "Password is required")
});

// -----------------------------------------------------------

// REGISTER USER 

const register = async (req, res, next) => {
    try {
        // Validate request body
        const result = registerSchema.safeParse(req.body);

        if (!result.success) {
            return next(
                new AppError(
                    result.error.issues[0].message,
                    400
                )
            );
        }

        const { name, email, password } = result.data;

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return next(
                new AppError(
                    "User with this email already exists",
                    409
                )
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            name,
            email,
            passwordHash
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",

            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            }
        });
    } catch (error) {

        // MongoDB duplicate key error
        if (error.code === 11000) {
            return next(
                new AppError(
                    "User with this email already exists",
                    409
                )
            );
        }

        next(error);
    }
};

// -----------------------------------------------------------

// LOGIN USER

const login = async (req, res, next) => {
    try {
        // Validate request
        const result = loginSchema.safeParse(req.body);

        if (!result.success) {
            return next(
                new AppError(
                    result.error.issues[0].message,
                    400
                )
            );
        }

        const { email, password } = result.data;

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return next(
                new AppError(
                    "Invalid email or password",
                    401
                )
            );
        }

        // Compare password
        const passwordMatches = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!passwordMatches) {
            return next(
                new AppError(
                    "Invalid email or password",
                    401
                )
            );
        }

        // Create JWT
        const token = jwt.sign(
            {
                userId: user._id.toString()
            },
            JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        res.json({
            success: true,
            message: "Login successful",
            token
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login
};