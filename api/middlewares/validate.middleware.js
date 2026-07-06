import ApiError from "../utils/ApiError.js";

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message);
    return next(new ApiError(400, "Validation failed", errors));
  }

  // Replace req.body with parsed & sanitized data
  req.body = result.data;
  next();
};

export default validate;