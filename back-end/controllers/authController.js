const jwt = require("jsonwebtoken");
require("dotenv").config();
const { validateEmail, validateUsername, validateName, validatePhone, validatePassword } = require("../utils/validators");

const {
  checkIfEmailOrUsernameExists,
  hashPassword,
  createUser,
  findUserByIdentifier,
  comparePasswords,
} = require("../services/authService");

const registerUser = async (req, res) => {
  try {
    let { firstname, lastname, username, email, password, address, phone } = req.body;

    const clean = (s) => (typeof s === "string" ? s.trim() : s);
    firstname = clean(firstname);
    lastname = clean(lastname);
    username = clean(username);
    email = clean(email)?.toLowerCase();
    address = clean(address);
    phone = clean(phone);

    const required = [firstname, lastname, username, email, password];
    if (required.some((val) => !val)) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    const errors = [
      validateName(firstname, "First name"),
      validateName(lastname, "Last name"),
      validateUsername(username),
      validateEmail(email),
      validatePhone(phone),
      validatePassword(password),
    ].filter(Boolean);

    if (errors.length) {
      return res.status(400).json({ success: false, message: errors[0] });
    }

    const { existingEmail, existingUsername } = await checkIfEmailOrUsernameExists(email, username);
    if (existingEmail) {
      return res.status(409).json({ success: false, message: "Email already in use." });
    }
    if (existingUsername) {
      return res.status(409).json({ success: false, message: "Username already taken." });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await createUser({
      firstname,
      lastname,
      username,
      email,
      password: hashedPassword,
      address,
      phone,
    });

    const token = jwt.sign(
      {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        roleId: newUser.roleId,
        membershipId: newUser.membershipId,
      },
      process.env.TOKEN_SECRET,
      { expiresIn: "2h" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: {
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          roleId: newUser.roleId,
          membershipId: newUser.membershipId,
        },
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: "Missing identifier or password." });
    }

    const user = await findUserByIdentifier(identifier);

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    if (user.isDeleted) {
      return res.status(403).json({
        success: false,
        message: "Your account is deactivated. Please contact support.",
      });
    }

    const passwordMatch = await comparePasswords(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        roleId: user.roleId,
        membershipId: user.membershipId,
      },
      process.env.TOKEN_SECRET,
      { expiresIn: "2h" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          roleId: user.roleId,
          membershipId: user.membershipId,
        },
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { registerUser, loginUser };
