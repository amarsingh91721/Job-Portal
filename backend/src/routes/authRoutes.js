const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");

const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const JWT_SECRET = "mysecretkey";

// multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users(name, email, password, role) VALUES($1, $2, $3, $4) RETURNING id, name, email, role, resume",
      [name, email, hashedPassword, role || "candidate"]
    );

    res.json({
      message: "Registration successful",
      user: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        message: "Email already registered. Please login or use another email.",
      });
    }

    res.status(500).json({
      message: error.message,
    });
  }
});

// login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Wrong password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        resume: user.resume,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// upload resume
router.post(
  "/upload-resume",
  authMiddleware,
  upload.single("resume"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "No resume file uploaded",
        });
      }

      const resumePath = req.file.path;

      const result = await pool.query(
        "UPDATE users SET resume=$1 WHERE id=$2 RETURNING id, name, email, role, resume",
        [resumePath, req.user.id]
      );

      res.json({
        message: "Resume uploaded successfully",
        user: result.rows[0],
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
);

module.exports = router;