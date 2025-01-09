import { NextFunction, Request, Response } from "express";
import jwt, { VerifyErrors } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { supabase } from "../supabaseClient";
import { createUserData } from "../models/User";
import prisma from "../prismaClient";

//extend the Request interface to include userId
declare module 'express-serve-static-core' {
  interface Request {
    user?: any;
  }
}


const createAuthUser = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    if (error) {
      console.log(error);
      throw new Error("Error creating auth user");
    }
    if (!data || !data.user) {
      throw new Error("Coudlnt get auth user info");
    }
    return data.user.id;
  } catch (error) {
    console.log(error);
    throw new Error("Error creating auth user");
  }
};

const createDbUser = async (userData: createUserData) => {
  try {
    const user = await prisma.users.create({
      data: userData,
    });
    return user;
  } catch (error) {
    console.log(error);
    throw new Error("Error creating database user");
  }
};

export const signUp = async (req: Request, res: Response) => {
  try {
    const {
      username,
      email,
      password,
      first_name,
      last_name,
      university,
      degree,
    } = req.body;
    //insert user into supabase auth
    const authId = await createAuthUser(email, password);
    if (!authId) {
      throw new Error("Error signing up");
    }
    //insert user into database
    const userData: createUserData = {
      auth_id: authId,
      username: username,
      email: email,
      first_name: first_name,
      last_name: last_name,
      university: university,
      degree: degree,
    };
    await createDbUser(userData);
    res.status(201).send("User created");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error signing up");
  }
};

const authLogin = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      console.log(error);
      throw new Error("Error logging in"+ error);
    }
    return data;
  } catch (error) {
    console.log(error);
    throw new Error("Error logging in");
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const data = await authLogin(email, password);
    if (!data || !data.session) {
      res.status(401).send("Invalid credentials");
      return;
    }
    //set access token in http only cookie
    res.cookie("access_token", data.session.access_token, {
      httpOnly: true, //prevent access via JavaScript
      secure: process.env.NODE_ENV === "production", //send cookie only over HTTPS in production
      sameSite: "strict", // Prevent CSRF
      maxAge: data.session.expires_in * 1000, // Expiration time in milliseconds
    });
    const user = await getUserByAuthId(data.user.id);
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error logging in");
  }
};

const supaBaseAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //get token from header 
    const token = req.cookies.access_token;
    if (!token) {
      res.status(401).send("Access denied. No token found");
      return;
    }
    //get user data from token
    const { data, error } = await supabase.auth.getUser(token);
    if (error) {
      console.log(error);
      res.status(401).send("Access denied");
      return;
    }
    const authId = data?.user?.id;
    const user = await getUserByAuthId(authId!);
    if (!user) {
      res.status(401).send("Access denied");
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).send("Access denied");
  }
};

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  supaBaseAuthMiddleware(req, res, next);
}

const getUserByAuthId = async (authId: string) => {
  try {
    const data = await prisma.users.findUnique({
      where: {
        auth_id: authId,
      },
    });
    //map to user object
    const user = {
      user_id: data?.user_id,
      auth_id: data?.auth_id,
      username: data?.username,
      email: data?.email,
      first_name: data?.first_name,
      last_name: data?.last_name,
      university: data?.university,
      degree: data?.degree,
    }
    return user;
  } catch (error) {
    console.log(error);
    throw new Error("Error getting user by auth id");
  }
}

export const getUser = async (req: Request, res: Response) => {
  res.status(200).send(req.user);
}

export const logout = (req: Request, res: Response) => {
  
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).send("Logged out successfully");
};

const deleteUserByAuthId = async (authId: string) => {
  if(!authId){  
    throw new Error("No auth id was provided");
  }
  try {
    const data = await prisma.users.delete({
      where: {
        auth_id: authId,
      },
    });
    return data;
  } catch (error) {
    console.log(error);
    throw new Error("Error deleting user by auth id");
  }
}

const deleteAuthUser = async (userId: string) => {
  try {
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) {
      console.log(error);
      throw new Error("Error deleting auth user");
    }
    return { message: "User deleted" };
  } catch (error) {
    console.log(error);
    throw new Error("Error deleting auth user");
  }
}

const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await req.user;
    const authId = user.auth_id;
    //delete from users table  
    await deleteUserByAuthId(authId);
    //delete from auth table
    await deleteAuthUser(authId);
    res.status(200).send("User deleted");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error deleting user");
  }
}

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await req.user;
    res.status(200).send(user);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error getting user");
  }
}



