const mongoose = require("mongoose");
const dns = require("dns");

// Use Google's DNS servers for Node.js DNS lookups
dns.setServers(["8.8.8.8", "8.8.4.4"]);

async function connectDB() {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MONGODB_URI is missing from .env");
    }

    console.log("Connecting to MongoDB...");

    const connection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log(
      "MongoDB connected successfully:",
      connection.connection.host
    );
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

module.exports = connectDB;