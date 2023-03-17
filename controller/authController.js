import { hashPassword, comparePassword } from "../helpers/authHelper.js";
import userModel from "../models/userModel.js";

import JWT from "jsonwebtoken";

export const registerController = async (req, res) => {
  try {
    const { name, email, password, answer } = req.body;
    // validation
    if (!name) {
      return res.send({ message: "Name is required" });
    }
    if (!email) {
      return res.send({ message: "Email is required" });
    }
    if (!password) {
      return res.send({ message: "Password is required" });
    }
    if (!answer) {
      return res.send({ message: "Answer is required" });
    }

    //check user
    const existingUser = await userModel.findOne({ email });
    //existing user
    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: "Already Register Please Login",
      });
    }

    //regsiter user
    const hashedPassword = await hashPassword(password);
    //save
    const user = await new userModel({
      name,
      email,
      password: hashedPassword,
      answer,
    }).save();

    res.status(201).send({
      success: true,
      message: "Register Succesfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Registration",
      error,
    });
  }
};

//POST LOGIN

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    //validation
    if (!email || !password) {
      return res.status(404).send({
        sucess: false,
        message: "Invalid email or password",
      });
    }
    //check user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email is not registered",
      });
    }
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(200).send({
        sucess: false,
        message: "Invalid Password",
      });
    }

    //token
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).send({
      success: true,
      message: "login successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        firstname: user.firstname,
        lastname: user.lastname,
        phone: user.phone,
        state: user.state,
        postcode: user.postcode,
        area: user.area,
        country: user.country,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      sucess: false,
      message: "Error in Login",
      error,
    });
  }
};

//forgotPasswordController
export const forgotPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;
    if (!email) {
      res.status(400).send({ message: "Email is required" });
    }
    if (!answer) {
      res.status(400).send({ message: "Answer is required" });
    }
    if (!newPassword) {
      res.status(400).send({ message: " NewPassword is required" });
    }
    //check
    const user = await userModel.findOne({ email, answer });
    //validation
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Wrong Email or Answer",
      });
    }
    const hashed = await hashPassword(newPassword);
    await userModel.findByIdAndUpdate(user._id, { password: hashed });
    res.status(200).send({
      success: true,
      message: "Password Reset Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

//update CONTROLLER
export const updateProfileController = async (req, res) => {
  try {
    const {
      name,
      email,
      //   password,
      //   address,
      firstname,
      lastname,
      phone,
      postcode,
      state,
      area,
      country,
    } = req.body;
    const user = await userModel.findById(req.user._id);
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        //   password: hashedPassword || user.password,
        phone: phone || user.phone,
        //   address: address || user.address,
        firstname: firstname || user.firstname,
        lastname: lastname || user.lastname,
        postcode: postcode || user.postcode,
        state: state || user.state,
        area: area || user.area,
        country: country || user.country,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Profile Updated SUccessfully",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error WHile Update profile",
      error,
    });
  }
};

//GET user
export const getUserByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "user not found",
      });
    }
    return res.status(200).send({
      success: true,
      message: "fetch user",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "error while getting single user",
      error,
    });
  }
};

//test controller

export const testController = (req, res) => {
  try {
    res.send("protected route");
  } catch (error) {
    console.log(error);
    res.send({ error });
  }
};
