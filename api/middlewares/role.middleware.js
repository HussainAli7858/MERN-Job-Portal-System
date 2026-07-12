import ApiError from "../utils/ApiError.js";

// Usage: authorize("admin") or authorize("recruiter", "admin")
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.account) {
    throw new ApiError(401, "Please login first");
  }

  if (!allowedRoles.includes(req.account.role)) {
    throw new ApiError(
      403,
      `Access denied. Required role: ${allowedRoles.join(" or ")}`
    );
  }

  next();
};

export default authorize;