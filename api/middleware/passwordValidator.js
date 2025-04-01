function validatePassword(password) {
  // Check if password exists
  if (!password) {
    return {
      isValid: false,
      message: "Password is required",
    };
  }

  // Check minimum length (e.g., 8 characters)
  if (password.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters long",
    };
  }

  // Check for special characters using regex
  const specialCharsRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
  if (!specialCharsRegex.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one special character",
    };
  }

  return {
    isValid: true,
    message: "Password is valid",
  };
}

module.exports = { validatePassword };
