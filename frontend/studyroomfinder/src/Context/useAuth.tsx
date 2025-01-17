import React, { createContext, useEffect, useState } from "react";
import { UserProfile } from "../Models/User";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";


type UserContextType = {
  user: UserProfile | null;
  registerUser: (
    username: string,
    password: string,
    firstName: string,
    lastName: string,
    email: string
  ) => void;
  loginUser: (email: string, password: string) => void;
  logout: () => void;
  isLoggedIn: () => boolean;
};

type Props = { children: React.ReactNode };

const UserContext = createContext<UserContextType>({} as UserContextType);

export const UserProvider = ({ children }: Props) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
        withCredentials: true,
      });
      const user: UserProfile = {
        user_id: res.data.user_id,
        username: res.data.username,
        first_name: res.data.first_name,
        last_name: res.data.last_name,
        degree: res.data.degree,
        university: res.data.university,
      };
      setUser(user);
    } catch (error) {
      console.log("No user: ", error);
      setUser(null);
      navigate("/login");
    }
  };

  const initAuth = async () => {
    try {
      await fetchUser();
    } catch (error) {
      console.log("User not authenticated");
    } finally {
      setIsReady(true); // Ensure the app renders only after the user state is checked
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const registerUser = async (
    username: string,
    password: string,
    firstName: string,
    lastName: string,
    email: string
  ) => {
    await axios
      .post(`${import.meta.env.VITE_API_URL}/auth/signup`, {
        username: username,
        password: password,
        first_name: firstName,
        last_name: lastName,
        email: email,
      })
      .then((res) => {
        console.log(res);
        navigate("/verify");
      })
      .catch((err) => {
        console.log(err);
        toast.error(err.response.data);
      });
  };

  const loginUser = async (email: string, password: string) => {
    axios.defaults.withCredentials = true;
    try {
      const res = await axios
      .post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        email: email,
        password: password,
      })
      console.log(res.data);
      await fetchUser();
      navigate("/home");
    } catch (error) {
      console.log(error);
        toast.error("Invalid email or password.");
    }

  };

  const isLoggedIn = () => {
    return !!user;
  };

  const logout = async () => {
    
    await axios
      .post(`${import.meta.env.VITE_API_URL}/auth/logout`, {}, { withCredentials: true })
      .then((res) => {
        console.log(res);
        setUser(null);
        navigate("/");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <UserContext.Provider
      value={{ loginUser, user, logout, isLoggedIn, registerUser }}
    >
      {isReady ? children : null}
    </UserContext.Provider>
  );
};

export const useAuth = () => React.useContext(UserContext);
