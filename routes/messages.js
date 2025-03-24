const express = require("express");
const Message = require("../models/Message");
const Client = require("../models/Client");
const router = express.Router();

// ✅ Create a new message
// router.post("/", async (req, res) => {
//   try {
//     const newMessage = new Message(req.body);
//     await newMessage.save();
//     res.status(201).json(newMessage);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// Create Message and Add Client
router.post("/", async (req, res) => {
  try {
   
    const { client, email, phone, service, message } = req.body;

    console.log("Received message request:", req.body);

    let existingClient = await Client.findOne({ email });

    if (!existingClient) {
      console.log("Client not found. Creating a new client...");
      const newClient = new Client({
        name: client,
        email,
        phone,
      });

      existingClient = await newClient.save(); // Save and get the created client with _id
      console.log("New client created:", existingClient);
    } else {
      console.log("Existing client found:", existingClient);
    }

    console.log("Client ID before message:", existingClient._id); 

    if (!existingClient._id) {
      throw new Error("Client ID is undefined after creation.");
    }

    const newMessage = new Message({
      client: existingClient._id, // Assign the ObjectId from existingClient
      service,
      message,
      
    });

    await newMessage.save();
    console.log("New message created:", newMessage);

    res.status(201).json({ message: "Message created successfully!", message: newMessage });

  } catch (error) {
    console.error("Error in POST /message:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get all messages
// router.get("/", async (req, res) => {
//   try {
//     const messages = await Message.find();
//     res.json(messages);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

router.get("/", async (req, res) => {
  try {
    const messages = await Message.find()
      .populate("client", "name email phone")
      .sort({ createdAt: -1 });  // 🔥 Newer messages first

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Delete a message
router.delete("/:id", async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
