import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";

export const getUserForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const allUsers = await User.find().select("-password");

        res.status(200).json(allUsers)
    } catch (e) {
        console.log("message.controller.js catch, error: ", e.message)
        res.status(500).json({ message: 'message.controller.js catch error' })

    }
}

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId },
            ],
        });

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessages controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body
        const { id: receiverId } = req.params;
        // myid
        const senderId = req.user._id
        let a = 0
        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl
        })
        await newMessage.save();


        //socket io start
        res.status(201).json(newMessage)
    } catch (e) {
        console.log('error in sendMessage catch block, e: ', e.message)
        res.status(500).json({ message: 'error in sendmessage' })
    }
}