export class AppError extends Error {
  constructor(message, code = "GENERIC_ERROR", statusCode = 500) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

export const errorHandler = {
  handle: (error, context = "") => {
    console.error(`Error in ${context}:`, error);

    // Log to crash reporting service (Sentry, Bugsnag, etc.)
    // crashReporting.log(error, context);

    // Return user-friendly error message
    if (error.isOperational) {
      return error.message;
    }

    // Generic error message for unexpected errors
    return "Something went wrong. Please try again.";
  },

  network: (error) => {
    if (!error.response) {
      return "Network error. Please check your connection.";
    }

    switch (error.response.status) {
      case 400:
        return error.response.data?.message || "Invalid request";
      case 401:
        return "Please login to continue";
      case 403:
        return "You don't have permission to do this";
      case 404:
        return "Resource not found";
      case 500:
        return "Server error. Please try again later";
      default:
        return "Something went wrong";
    }
  },
};
