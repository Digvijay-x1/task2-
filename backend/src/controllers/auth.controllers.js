import cloudinary from "../config/cloudinary.config.js";
import { generateToken } from "../lib/generateToken.js";
import prisma from "../prisma/client.js";
import bcrypt from "bcryptjs";

export const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });
    // generate the token
    const token = generateToken(user.id, res);
    console.log(user);
    return res
      .status(201)
      .json({ message: "user register succesfully", user: user, token });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to create user" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // validate the feilds
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(user.id, res);

    // Return success response (exclude password from response)
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      message: "Login successful",
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("Error in login:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const me = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUser:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.log(`Error in logout controller ${error.message}`);
    res.status(500).json({
      message: "Internal server error in auth controller" + error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePicture } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "user not authenticated" });
    }

    const userId = req.user.id;

    if (!profilePicture) {
      return res
        .status(400)
        .json({ message: "profile picture is not selected" });
    }

    try {
      const updateResponse = await cloudinary.uploader.upload(profilePicture, {
        folder: "task_profiles",
        timeout: 60000,
      });

      const updatedUser = await prisma.user.update({
        where: {
          id: req.user.id,
        },
        data: {
          profilePicture: updateResponse.secure_url,
        },
        select: {
          id: true,
          name: true,
          email: true,
          location: true,
          contactInfo: true,
          role: true,
          profilePicture: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({
        message: "Profile picture updated successfully",
        user: updatedUser,
      });
    } catch (cloudinaryError) {
      console.error("Cloudinary upload error:", cloudinaryError);
      return res.status(500).json({
        message: "Failed to upload image",
        error: cloudinaryError.message,
      });
    }
  } catch (error) {
    console.error(`Error in updateProfile controller: ${error.message}`);
    return res.status(500).json({
      message: "Internal server error in auth controller",
      error: error.message,
    });
  }
};
