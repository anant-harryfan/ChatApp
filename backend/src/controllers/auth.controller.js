import cloudinary from "../lib/cloudinary.js"
import { generateToken } from "../lib/utils.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"


export const signup = async (req, res) => {
    const { fullName, email, password } = req.body
    try {

        if (!fullName) {
            return res.status(400).json({ message: "fullName isnt their" })
        }

        if (!email) {
            return res.status(400).json({ message: "email isnt their" })
        }

        if (!password) {
            return res.status(400).json({ message: "password nahi hai" })
        }
        if (password.length < 3) {
            return res.status(400).json({ message: "Password must be at least 3 character" })

        }
        const user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ message: "email alr exist" })
        }
        // pasward hash
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            email,
            fullName,
            password: hashedPassword,
        })

        if (newUser) {
            generateToken(newUser._id, res)
            await newUser.save()
            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            })
        } else {
            res.status(400).json({
                message: 'notWorking'
            })

        }
    } catch (e) {
        console.log('nahi chala')
        res.status(500).json({
            message: 'ye bhi nahi chala server error'
        })
    }
}
export const login = async (req, res) => {
    const { email, password } = req.body;
    console.log('Request Body:', req.body); // Log the request body

    try {
        const user = await User.findOne({ email });
        console.log('Found User:', user); // Log the user object

        if (!user) {
            return res.status(400).json({ message: "Email does not exist" });
        }

        if (!user.password) {
            return res.status(500).json({ message: "Password field is missing in the database" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Incorrect password" });
        }

        generateToken(user._id, res);
        res.status(200).json({
            _id: user._id,
            email: user.email,
            profilePic: user.profilePic,
        });
    } catch (e) {
        console.error('Login failed:', e);
        res.status(500).json({
            message: 'Server error'
        });
    }
};

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 })
        res.status(200).json({ message: "Logged out!!" })
    } catch (e) {
        console.log('logout failed, e: ', e.message)
        res.status(500).json({
            message: 'logOUT not working'
        })
    }
}

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;
        if (!profilePic) {
            res.status(400).json({ message: "Profile pic is req " })
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic)
        const updateUser = await User.findByIdAndUpdate(userId, { profilePic: uploadResponse.secure_url }, { new: true })

        res.status(200).json(updateUser)

    } catch (e) {

    }
}

export const checkAuth = (req, res) => {
    try {
        if (!req.user) {
            console.error("Unauthorized: req.user is undefined");
            return res.status(401).json({ message: "Unauthorized" });
        }
        return res.status(200).json(req.user); // Send response and stop execution
    } catch (e) {
        console.error("Error in checkAuth controller:", e.message);

        // Ensure no further responses are sent if an error occurs
        if (!res.headersSent) {
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }

};