import React, { createContext, useEffect, useState } from "react";
import { UserProfile } from "../Models/User";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../apiRoute";
import { toast } from "react-toastify";
import { is } from "date-fns/locale";

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
      const res = await axios.get(`${API_URL}/auth/me`, {
        withCredentials: true,
      });
      const user: UserProfile = {
        user_id: res.data.user_id,
        username: res.data.username,
        first_name: res.data.first_name,
        last_name: res.data.last_name,
      };
      console.log(res.data);
      setUser(user);
    } catch (error) {
      console.log("No user: ", error);
      setUser(null);
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
      .post(`${API_URL}/auth/signup`, {
        username: username,
        password: password,
        first_name: firstName,
        last_name: lastName,
        email: email,
      })
      .then((res) => {
        console.log(res);
        navigate("/verify");
        fetchUser();
      })
      .catch((err) => {
        console.log(err);
        toast.error("Username or email already exists.");
      });
  };

  const loginUser = async (email: string, password: string) => {
    axios.defaults.withCredentials = true;
    try {
      await axios
      .post(`${API_URL}/auth/login`, {
        email: email,
        password: password,
      })
      await fetchUser();
      navigate("/home");
    } catch (error) {
      console.log(error);
        toast.error("Invalid email or password.");
    }
    
  };

  const isLoggedIn = () => {
    console.log("Checking if user is logged in", user);
    return !!user;
  };

  const logout = async () => {
    console.log(user);
    
    await axios
      .post(`${API_URL}/auth/logout`, {}, { withCredentials: true })
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
