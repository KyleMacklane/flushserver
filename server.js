
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const cors = require("cors");


const app = express();

app.use(express.json());
app.use(cors({ origin: "*" }));
app.use("/api/clients", require("./routes/clients"));
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/messages", require("./routes/messages"));
app.use("/api/services", require("./routes/services"));

const Client = require("./models/Client");
const Booking = require("./models/Booking");
const Message = require("./models/Message");
const Service = require("./models/Service");



mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Error:", err));




app.post("/api/clients", async (req, res) => {
  try {
    const newClient = new Client(req.body);
    await newClient.save();
    res.status(201).json(newClient);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/bookings", async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/messages", async (req, res) => {
  try {
    const newMessage = new Message(req.body);
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



// API Endpoints
router.get("/clients", async (req, res) => {
  try {
    const clients = await Booking.find().populate("client"); // Populate client details
    res.status(200).json(clients.map(booking => booking.client));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get("/api/bookings", async (req, res) => {
  const bookings = await Booking.find();
  res.json(bookings);
});

app.get("/api/messages", async (req, res) => {
  const messages = await Message.find();
  res.json(messages);
});

app.get("/api/services", async (req, res) => {
  const services = await Service.find();
  res.json(services);
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
