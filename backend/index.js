require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const crypto = require("node:crypto");
const { promisify } = require("node:util");
const dns = require("node:dns");

// The local resolver on this machine refuses MongoDB Atlas SRV records.
if (process.env.NODE_ENV !== "production") {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
}

const { HoldingsModel } = require("./model/HoldingsModel");
const { PositionsModel } = require("./model/PositionsModel");
const { OrdersModel } = require("./model/OrdersModel");
const { UserModel } = require("./model/UserModel");

const PORT = process.env.PORT || 3002;
const uri = process.env.MONGO_URL;
const scrypt = promisify(crypto.scrypt);

const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = (await scrypt(password, salt, 64)).toString("hex");
  return `${salt}:${hash}`;
};

const verifyPassword = async (password, savedPassword) => {
  const [salt, savedHash] = savedPassword.split(":");
  if (!salt || !savedHash) return false;

  const inputHash = (await scrypt(password, salt, 64)).toString("hex");
  return crypto.timingSafeEqual(
    Buffer.from(savedHash, "hex"),
    Buffer.from(inputHash, "hex")
  );
};

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || [
  "http://localhost:3001",
  "http://localhost:3000",
  "https://zerodha-frontend-y8my.onrender.com",
  "https://zerodha-dashboard-i5gh.onrender.com",
].join(","))
  .split(",")
  .map((origin) => origin.trim());

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS"));
  },
}));
app.use(express.json());

app.get("/addHoldings", async (req, res) => {
  let tempHoldings = [
    {
      name: "BHARTIARTL",
      qty: 2,
      avg: 538.05,
      price: 541.15,
      net: "+0.58%",
      day: "+2.99%",
    },
    {
      name: "HDFCBANK",
      qty: 2,
      avg: 1383.4,
      price: 1522.35,
      net: "+10.04%",
      day: "+0.11%",
    },
    {
      name: "HINDUNILVR",
      qty: 1,
      avg: 2335.85,
      price: 2417.4,
      net: "+3.49%",
      day: "+0.21%",
    },
    {
      name: "INFY",
      qty: 1,
      avg: 1350.5,
      price: 1555.45,
      net: "+15.18%",
      day: "-1.60%",
      isLoss: true,
    },
    {
      name: "ITC",
      qty: 5,
      avg: 202.0,
      price: 207.9,
      net: "+2.92%",
      day: "+0.80%",
    },
    {
      name: "KPITTECH",
      qty: 5,
      avg: 250.3,
      price: 266.45,
      net: "+6.45%",
      day: "+3.54%",
    },
    {
      name: "M&M",
      qty: 2,
      avg: 809.9,
      price: 779.8,
      net: "-3.72%",
      day: "-0.01%",
      isLoss: true,
    },
    {
      name: "RELIANCE",
      qty: 1,
      avg: 2193.7,
      price: 2112.4,
      net: "-3.71%",
      day: "+1.44%",
    },
    {
      name: "SBIN",
      qty: 4,
      avg: 324.35,
      price: 430.2,
      net: "+32.63%",
      day: "-0.34%",
      isLoss: true,
    },
    {
      name: "SGBMAY29",
      qty: 2,
      avg: 4727.0,
      price: 4719.0,
      net: "-0.17%",
      day: "+0.15%",
    },
    {
      name: "TATAPOWER",
      qty: 5,
      avg: 104.2,
      price: 124.15,
      net: "+19.15%",
      day: "-0.24%",
      isLoss: true,
    },
    {
      name: "TCS",
      qty: 1,
      avg: 3041.7,
      price: 3194.8,
      net: "+5.03%",
      day: "-0.25%",
      isLoss: true,
    },
    {
      name: "WIPRO",
      qty: 4,
      avg: 489.3,
      price: 577.75,
      net: "+18.08%",
      day: "+0.32%",
    },
  ];

  tempHoldings.forEach((item) => {
    let newHolding = new HoldingsModel({
      name: item.name,
      qty: item.qty,
      avg: item.avg,
      price: item.price,
      net: item.day,
      day: item.day,
    });

    newHolding.save();
  });
  res.send("Done!");
});

app.get("/addPositions", async (req, res) => {
  let tempPositions = [
    {
      product: "CNC",
      name: "EVEREADY",
      qty: 2,
      avg: 316.27,
      price: 312.35,
      net: "+0.58%",
      day: "-1.24%",
      isLoss: true,
    },
    {
      product: "CNC",
      name: "JUBLFOOD",
      qty: 1,
      avg: 3124.75,
      price: 3082.65,
      net: "+10.04%",
      day: "-1.35%",
      isLoss: true,
    },
  ];

  tempPositions.forEach((item) => {
    let newPosition = new PositionsModel({
      product: item.product,
      name: item.name,
      qty: item.qty,
      avg: item.avg,
      price: item.price,
      net: item.net,
      day: item.day,
      isLoss: item.isLoss,
    });

    newPosition.save();
  });
  res.send("Done!");
});

app.get("/allHoldings", async (req, res) => {
  let allHoldings = await HoldingsModel.find({});
  res.json(allHoldings);
});

app.get("/allPositions", async (req, res) => {
  let allPositions = await PositionsModel.find({});
  res.json(allPositions);
});

app.get("/allOrders", async (req, res) => {
  const allOrders = await OrdersModel.find({}).sort({ _id: -1 });
  res.json(allOrders);
});

// Mock checkout: the client sends the (mock) price it showed the user.
// No real market API or money is involved - this only records the order and
// updates the user's holdings in the database.
app.post("/newOrder", async (req, res) => {
  try {
    const { name, mode } = req.body;
    const qty = Number(req.body.qty);
    const price = Number(req.body.price);

    if (!name || !["BUY", "SELL"].includes(mode)) {
      return res.status(400).json({ message: "Invalid order" });
    }
    if (!Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({ message: "Quantity must be a whole number above 0" });
    }
    if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).json({ message: "Invalid price" });
    }

    const holding = await HoldingsModel.findOne({ name });

    if (mode === "SELL") {
      if (!holding || holding.qty < qty) {
        return res.status(400).json({
          message: `You only hold ${holding ? holding.qty : 0} share(s) of ${name}`,
        });
      }

      holding.qty -= qty;
      if (holding.qty === 0) {
        await HoldingsModel.deleteOne({ _id: holding._id });
      } else {
        await holding.save();
      }
    } else if (holding) {
      // Weighted-average cost on repeat buys.
      const totalQty = holding.qty + qty;
      holding.avg = (holding.avg * holding.qty + price * qty) / totalQty;
      holding.qty = totalQty;
      holding.price = price;
      await holding.save();
    } else {
      await new HoldingsModel({
        name,
        qty,
        avg: price,
        price,
        net: "+0.00%",
        day: "+0.00%",
      }).save();
    }

    const newOrder = await new OrdersModel({ name, qty, price, mode }).save();

    return res.status(201).json({ message: "Order saved!", order: newOrder });
  } catch (error) {
    console.error("Order error:", error);
    return res.status(500).json({ message: "Order failed" });
  }
});

app.post("/signup", async (req, res) => {
  try {
    const { fullName, email, mobile, password, pan, city } = req.body;

    if (!fullName || !email || !mobile || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const newUser = new UserModel({
      fullName,
      email,
      mobile,
      password: await hashPassword(password),
      pan,
      city,
    });

    await newUser.save();

    return res.status(201).json({
      message: "Signup successful",
      user: {
        fullName,
        email,
        mobile,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    if (error.code === 11000) {
      return res.status(409).json({ message: "User already exists" });
    }
    return res.status(500).json({ message: "Signup failed" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!(await verifyPassword(password, user.password))) {
      return res.status(401).json({ message: "Invalid password" });
    }

    return res.status(200).json({
      message: "Login successful",
      user: {
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Login failed" });
  }
});

app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found with that email" });
    }

    return res.status(200).json({
      message: "Password reset instructions have been sent to your email.",
      email: user.email,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: "Password reset failed" });
  }
});

app.listen(PORT, async () => {
  try {
    await mongoose.connect(uri);
    console.log("DB connected!");
    console.log(`App started on port ${PORT}!`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
});