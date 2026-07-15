const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");

const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users(name, email, password, role)
       VALUES($1, $2, $3, $4)
       RETURNING
       id,
       name,
       email,
       role,
       resume,
       profile_photo,
       phone,
       location,
       bio,
       company`,
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

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

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
        profile_photo: user.profile_photo,
        phone: user.phone,
        location: user.location,
        bio: user.bio,
        company: user.company,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Get logged-in user profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
       id,
       name,
       email,
       role,
       resume,
       profile_photo,
       phone,
       location,
       bio,
       company
       FROM users
       WHERE id=$1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User profile not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Update profile details
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, phone, location, bio, company } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    const result = await pool.query(
      `UPDATE users
       SET
       name=$1,
       phone=$2,
       location=$3,
       bio=$4,
       company=$5
       WHERE id=$6
       RETURNING
       id,
       name,
       email,
       role,
       resume,
       profile_photo,
       phone,
       location,
       bio,
       company`,
      [
        name.trim(),
        phone || null,
        location || null,
        bio || null,
        company || null,
        req.user.id,
      ]
    );

    res.json({
      message: "Profile updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Upload profile photo
router.post(
  "/upload-profile-photo",
  authMiddleware,
  upload.single("profile_photo"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "No profile photo uploaded",
        });
      }

      const profilePhotoPath = `/uploads/${req.file.filename}`;

      const result = await pool.query(
        `UPDATE users
         SET profile_photo=$1
         WHERE id=$2
         RETURNING
         id,
         name,
         email,
         role,
         resume,
         profile_photo,
         phone,
         location,
         bio,
         company`,
        [profilePhotoPath, req.user.id]
      );

      res.json({
        message: "Profile photo uploaded successfully",
        user: result.rows[0],
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
);

// Upload resume
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

      const resumePath = `/uploads/${req.file.filename}`;

      const result = await pool.query(
        `UPDATE users
         SET resume=$1
         WHERE id=$2
         RETURNING
         id,
         name,
         email,
         role,
         resume,
         profile_photo,
         phone,
         location,
         bio,
         company`,
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