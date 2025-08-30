import prisma from "../prisma/client.js";
import bcrypt from "bcryptjs";

export const createUser = async (req, res) => {

  const { name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    console.log(user);
    return res.status(201).json(user);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to create user" });
  }
};

export const getUser = async (req, res) => {
  try {
    res.status(200).json("hello from the get user ");
  } catch (error) {}
};
