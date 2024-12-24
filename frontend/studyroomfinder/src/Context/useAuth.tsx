import React, { createContext, useEffect, useState } from "react";
import { UserProfile } from "../Models/User";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../apiRoute";

type UserContextType = {
  user: UserProfile | null;
  token: string | null;
  registerUser: (
    username: string,
    password: string,
    firstName: string,
    lastName: string
  ) => void;
  loginUser: (username: string, password: string) => void;
  logout: () => void;
  isLoggedIn: () => boolean;
};

type Props = { children: React.ReactNode };

const UserContext = createContext<UserContextType>({} as UserContextType);

export const UserProvider = ({ children }: Props) => {
  
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) {
      setToken(token);
      setUser(JSON.parse(user));
      axios.defaults.headers.common["x-access-token"] = token;
    }
    setIsReady(true);
  }, []);

  const registerUser = async (
    username: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    await axios
      .post(`${API_URL}/register`, {
        username: username,
        password: password,
        first_name: firstName,
        last_name: lastName,
      })
      .then((res) => {
        console.log(res);
        navigate("/login");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const loginUser = async (username: string, password: string) => {
    await axios
      .post(`${API_URL}/login`, {
        username: username,
        password: password,
      })
      .then((res) => {
        console.log(res);
        if (res.data.auth) {
          setToken(res.data.token);
          localStorage.setItem("token", res.data.token);
          const user = {
            user_id: res.data.result.user_id,
            username: res.data.result.username,
            first_name: res.data.result.first_name,
            last_name: res.data.result.last_name,
          };
          setUser(user!);
          localStorage.setItem("user", JSON.stringify(user));
          navigate("/home");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const isLoggedIn = () => {
    return !!user;
  };

  const logout = async () => {
    const token = localStorage.getItem("token");
    const username = JSON.parse(localStorage.getItem("user")!).username;
    await axios
      .post(`${API_URL}/logout`, { username }, {
        headers: {
            "x-access-token": token
        }
      })
      .then((res) => {
        console.log(res);
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
      })
      .catch((err) => {
        console.log(err);
      });
  };

    return (
        <UserContext.Provider
        value={{ loginUser, user, token, logout, isLoggedIn, registerUser }}
        >
        {isReady ? children : null}
        </UserContext.Provider>
    );
};

export const useAuth = () => React.useContext(UserContext);
    
