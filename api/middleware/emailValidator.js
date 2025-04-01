function validateEmail(email) {
  if (!email) {
    return {
      isValid: false,
      message: "Email is required",
    };
  }

  const emailRegex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      message: "Invalid email format",
    };
  }

  return {
    isValid: true,
    message: "Email is valid",
  };
}

module.exports = { validateEmail };
