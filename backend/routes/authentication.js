import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/Users.js";

const router = express.Router();

// Signup 
router.post("/signup", async(req, res) => {
    try{
        const {name, email, password, adminKey} = req.body;
        const checkUser = await User.findOne({email});

        if (checkUser) 
            return res.status(400).json({message: "User already exist"})

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Check if admin key matches
        const isAdmin = adminKey === process.env.ADMIN_KEY;
        
        const user = await User.create({
            name, 
            email, 
            password: hashedPassword,
            isAdmin
        });
    
        res.status(201).json({
            message: "User created successfully",
            isAdmin: user.isAdmin
        });
    }
    catch(error){
        res.status(500).json({message: error.message});
    }
});

// Login 
router.post("/login", async(req, res) => {
    try{
        const {email, password} = req.body;
        const getUser = await User.findOne({email});
    
        if (!getUser)
            return res.status(400).json({message: "User not found"});

        const isValidUser = await bcrypt.compare(password, getUser.password);

        if (!isValidUser)
            return res.status(400).json({message: "Wrong email or Password"});
        
        const jwt_token = jwt.sign({ 
            id: getUser._id,
            isAdmin: getUser.isAdmin 
        }, process.env.JWT_SECRET, { expiresIn: "12h" });

        return res.json({jwt_token, isAdmin: getUser.isAdmin})
    }
    catch(error){
        res.status(500).json({message: error.message});
    }
});

export default router;