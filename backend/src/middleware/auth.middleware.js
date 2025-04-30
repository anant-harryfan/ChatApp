import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt // jwt isliye kyoki utils.js me bhi jwt likha tha

        if (!token) {
            res.status(500).json({ message: "is if ke hisabh se tere pass token nahi, ie token not provided" })

        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if (!decoded) {
            res.status(500).json({ message: "ye token sahi nahi hai  " })
        }

        const user = await User.findById(decoded.userId).select("-password")
        if (!user) {
            res.status(404).json({ message: "user hi nahi hai " })

        }
        req.user = user
        next()

    } catch (e) {
        console.log(e.message)
        res.status(500).json({ message: "server error internal " })

    }
}
