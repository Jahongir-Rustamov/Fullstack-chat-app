import MessageModel from "../models/message.model.js";
import imagekit from "../library/imageKit.js";
import UserModel from "../models/user.model.js";
import { getReceiverSocketId, io } from "../library/soket.js";
export const GetAllUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const users = await UserModel.find({ _id: { $ne: loggedInUserId } })
      .select("-password -__v")
      .lean();
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user._id;
    if (!userToChatId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const message = await MessageModel.find({
      $or: [
        { senderId: senderId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: senderId },
      ],
    })
      .populate("senderId")
      .populate("receiverId")
      .sort({ createdAt: 1 })
      .lean();
    res.status(200).json(message);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const SendMessage = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    const { text, image } = req.body;
    if (!receiverId || (!text && !image)) {
      return res
        .status(400)
        .json({ message: "User ID and message content are required" });
    }
    let ImageUrl = null;
    if (image) {
      // image - bu base64 string bo‘lishi kerak
      const uploadedImage = await imagekit.upload({
        file: image, // base64 string
        fileName: `chat-image-${Date.now()}.jpg`,
        folder: "Chat_Images",
      });
      if (!uploadedImage) {
        return res.status(500).json({ message: "Image upload failed" });
      }
      ImageUrl = uploadedImage.url;
    }

    const newMessage = await MessageModel.create({
      senderId,
      receiverId,
      text,
      image: ImageUrl,
    });

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
