const express = require("express");
const Booking = require("../models/Booking");
const Client = require("../models/Client");
const router = express.Router();


// Create Booking and Add Client
router.post("/", async (req, res) => {
  try {
   
    const { client, email, phone, service, date, address, message } = req.body;

    console.log("Received booking request:", req.body);

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

    console.log("Client ID before booking:", existingClient._id); // Ensure this logs correctly

    if (!existingClient._id) {
      throw new Error("Client ID is undefined after creation.");
    }

    const newBooking = new Booking({
      client: existingClient._id, // Assign the ObjectId from existingClient
      service,
      // date,
      address,
      message,
      status: "Pending",
    });

    await newBooking.save();
    console.log("New booking created:", newBooking);

    res.status(201).json({ message: "Booking created successfully!", booking: newBooking });

  } catch (error) {
    console.error("Error in POST /bookings:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get all bookings
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("client", "name email phone")
      .sort({ createdAt: -1 });  // 🔥 Newer bookings first

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// ✅ Get a single booking by ID
router.get("/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("client").populate("service");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Update a booking
router.put("/:id", async (req, res) => {
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Delete a booking
router.delete("/:id", async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate if status is provided
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    // Find booking and update status
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json({ success: true, booking: updatedBooking }); // Return updated booking
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
