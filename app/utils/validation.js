export const validators = {
  email: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!re.test(email)) return "Invalid email format";
    return null;
  },

  password: (password) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return null;
  },

  listName: (name) => {
    if (!name || !name.trim()) return "List name is required";
    if (name.length > 50) return "List name is too long";
    return null;
  },

  itemName: (name) => {
    if (!name || !name.trim()) return "Item name is required";
    if (name.length > 100) return "Item name is too long";
    return null;
  },

  quantity: (quantity) => {
    if (!quantity || quantity < 1) return "Quantity must be at least 1";
    if (quantity > 999) return "Quantity is too large";
    return null;
  },

  price: (price) => {
    if (price < 0) return "Price cannot be negative";
    if (price > 99999) return "Price is too large";
    return null;
  },
};

export const validateForm = (formData, rules) => {
  const errors = {};

  Object.keys(rules).forEach((field) => {
    const error = rules[field](formData[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
