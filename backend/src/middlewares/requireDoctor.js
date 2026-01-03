import jwt from "jsonwebtoken";

export const requireDoctor = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "DOCTOR") {
      return res
        .status(403)
        .json({ error: "Access denied. Doctor role required." });
    }

    req.user = decoded; // { doctorId, role }

    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
