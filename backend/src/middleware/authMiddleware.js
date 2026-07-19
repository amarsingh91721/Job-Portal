const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET || "temporary_local_secret";

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (error) {
    console.log(
      "TOKEN VERIFY ERROR:",
      error.message
    );

    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

module.exports = authMiddleware;