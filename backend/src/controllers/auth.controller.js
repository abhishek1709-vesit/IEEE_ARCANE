import bcryptjs from "bcryptjs"
import User from "../models/User.js"
import jwt from "jsonwebtoken"

const generateToken = (userId) => {
    return jwt.sign({userId}, process.env.JWT_SECRET, { expiresIn: "15d" })
}

export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body

        if(!username || !email || !password) {
            return res.status(400).json({message: "All fields are required"})
        }

        if(password.length < 6){
            return res.status(400).json({message: "Password must be greater then six characters"})
        }

        if(username.length < 3){ 
            return res.status(400).json({message: "Username must be greater then three characters"})
        }
        
        // Check if user already exists
        const existingEmail = await User.findOne({email})
        if(existingEmail) return res.status(400).json({message :"Email already exists"})

        const existingUsername = await User.findOne({username})
        if(existingUsername) return res.status(400).json({message: "Username already exists"})
        
        // Hash password
        const salt = await bcryptjs.genSalt(10)
        const hashedPassword = await bcryptjs.hash(password, salt)

        
        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        })
        
        await newUser.save()

        const token = generateToken(newUser._id)
        
        res.status(201).json({ 
            token,
            message: "User registered successfully",
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                profileImage: newUser.profileImage
            }
        })
    } catch (error) {
        console.log("Error in register api", error)
        res.status(500).json({ message: "Server error", error: error.message })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body
        
        if(!email || !password) return res.status(400).json({message: "Fill all fields"})
        
        // Find user by email
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" })
        }
        
        // Check password
        const isMatch = await bcryptjs.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" })
        }
        const token = generateToken(user._id)
        
        res.status(200).json({ 
            token,
            message: "Login successful",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message })
    }
}