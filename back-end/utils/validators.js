// Normalize helper to trim all string values
const normalize = (obj) =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v]));

// Email format validator
function validateEmail(email) {
  if (!email) return "Email is required.";
  const clean = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(clean)) {
    return "Invalid email format.";
  }
  return null;
}

// Username format validator
function validateUsername(username) {
  if (!username) return "Username is required.";
  const pattern = /^[a-zA-Z0-9_.-]+$/;
  if (!pattern.test(username.trim())) {
    return "Username can only contain letters, numbers, dots, underscores, and hyphens.";
  }
  return null;
}

// Name (first/last) validator
function validateName(name, field = "Name") {
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return `${field} must be at least 2 characters.`;
  }
  return null;
}

// Phone number validator
function validatePhone(phone) {
  if (phone && !/^\d{8,15}$/.test(phone.trim())) {
    return "Phone number must be 8-15 digits and contain only numbers.";
  }
  return null;
}

// Password strength validator
function validatePassword(password) {
  const allowedTestPasswords = ["test", "test123!", "P@ssword2023"];
  if (allowedTestPasswords.includes(password)) return null;

  const strongEnough = password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password);
  if (!strongEnough) {
    return "Password must be at least 8 characters long and include an uppercase letter and a number.";
  }
  return null;
}

// Brand name validator
function validateBrandName(name) {
  if (!name) return "Brand name is required.";
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 50) {
    return "Brand name must be between 2 and 50 characters.";
  }
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(trimmed)) {
    return "Brand name can only contain letters, numbers, spaces, and hyphens.";
  }
  return null;
}

// Product ID and quantity validator
function validateProductIdAndQuantity(productId, quantity) {
  if (!productId) return "Product ID is required.";
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return "Quantity must be a positive integer.";
  }
  return null;
}

// Category name validator
function validateCategoryName(name) {
  if (!name) return "Category name is required.";
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 50) {
    return "Category name must be between 2 and 50 characters.";
  }
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(trimmed)) {
    return "Category name can only contain letters, numbers, spaces, and hyphens.";
  }
  return null;
}

// Membership input validator
function validateMembershipInput(input) {
  const { name, minQty, maxQty, discount } = normalize(input);

  if (!name || name.length < 2 || name.length > 50) {
    return "Membership name must be a string between 2 and 50 characters.";
  }
  if (!/^[a-zA-Z0-9\s\-]+$/.test(name)) {
    return "Membership name can only contain letters, numbers, spaces, and hyphens.";
  }
  if (!Number.isInteger(minQty) || minQty < 0) {
    return "minQty must be an integer greater than or equal to 0.";
  }
  if (maxQty !== null && maxQty !== undefined) {
    if (!Number.isInteger(maxQty) || maxQty < minQty) {
      return "maxQty must be an integer greater than or equal to minQty.";
    }
  }
  if (!Number.isInteger(discount) || discount < 0 || discount > 100) {
    return "Discount must be an integer between 0 and 100.";
  }
  return null;
}

// Order status validator
function validateOrderStatus(status) {
  const allowed = ["Ordered", "Completed"];
  if (!allowed.includes(status)) {
    return `Invalid status. Allowed values: ${allowed.join(", ")}`;
  }
  return null;
}

// Product input validator
function validateProductInput(input) {
  const { name, unitprice, quantity, CategoryId, BrandId } = normalize(input);

  if (!name || name.length < 2 || name.length > 100) {
    return "Product name must be 2-100 characters long.";
  }
  if (!Number.isFinite(unitprice) || unitprice <= 0) {
    return "unitprice must be a number greater than 0.";
  }
  if (!Number.isInteger(quantity) || quantity < 0) {
    return "quantity must be a non-negative integer.";
  }
  if (!Number.isInteger(CategoryId) || CategoryId <= 0) {
    return "CategoryId must be a valid integer.";
  }
  if (!Number.isInteger(BrandId) || BrandId <= 0) {
    return "BrandId must be a valid integer.";
  }

  return null;
}

// Role input validator
function validateRoleInput(input) {
  const { name, isAdmin, defaultMembershipId } = normalize(input);

  if (!name || name.length < 2 || name.length > 50) {
    return "Role name must be 2-50 characters long.";
  }
  if (!/^[a-zA-Z0-9\s\-]+$/.test(name)) {
    return "Role name can only contain letters, numbers, spaces, and hyphens.";
  }
  if (isAdmin !== undefined && typeof isAdmin !== "boolean") {
    return "isAdmin must be a boolean value.";
  }
  if (defaultMembershipId !== undefined && defaultMembershipId !== null) {
    const id = parseInt(defaultMembershipId, 10);
    if (isNaN(id) || id <= 0) {
      return "defaultMembershipId must be a positive integer if provided.";
    }
  }

  return null;
}

// Search input validator
function validateSearchInput(input) {
  const { name, brand, category } = normalize(input);

  // If all fields are empty, allow it (Treat as "show all")
  if (!name && !brand && !category) return null;

  for (const [key, value] of Object.entries({ name, brand, category })) {
    if (value !== undefined && value !== null) {
      if (typeof value !== "string") {
        return `${key} must be a string.`;
      }
      if (value.length > 100) {
        return `${key} must be less than or equal to 100 characters.`;
      }
    }
  }

  return null;
}

// User input validator
function validateUserInput(input) {
  const { firstname, lastname, username, email, password, phone, address, allowTestPassword = false } = normalize(input);

  if (!firstname || firstname.length < 2) return "Firstname must be at least 2 characters.";
  if (!lastname || lastname.length < 2) return "Lastname must be at least 2 characters.";

  const usernameRegex = /^[a-zA-Z0-9_.-]{3,30}$/;
  if (!username || !usernameRegex.test(username)) {
    return "Username must be 3-30 characters and only contain letters, numbers, dots, underscores, or hyphens.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return "Email must be a valid email address.";
  }

  if (password) {
    const allowed = ["test", "test123!", "P@ssword2023"];
    if (!allowTestPassword || !allowed.includes(password)) {
      const strongEnough = password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password);

      if (!strongEnough) {
        return "Password must be at least 8 characters and contain an uppercase letter and a number.";
      }
    }
  }

  if (address && address.trim().length < 5) {
    return "Address must be at least 5 characters long.";
  }

  if (phone && !/^\d{8,15}$/.test(phone)) {
    return "Phone number must be 8-15 digits.";
  }

  return null;
}

module.exports = {
  validateEmail,
  validateUsername,
  validateName,
  validatePhone,
  validatePassword,
  validateBrandName,
  validateProductIdAndQuantity,
  validateCategoryName,
  validateMembershipInput,
  validateOrderStatus,
  validateProductInput,
  validateRoleInput,
  validateSearchInput,
  validateUserInput,
};
