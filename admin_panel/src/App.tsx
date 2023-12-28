import { useEffect, useState } from "react";
import BotManagement from "./components/BotManagement";
import Navbar from "./components/Navbar";
import UserManagement from "./components/UserManagement";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

import { Routes, Route } from "react-router-dom";
import type { Profile } from "./types";

interface DecodedTokenPayload {
  name: string;
  email: string;
  picture: string;
}

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState<Profile>();

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem("loggedUser") || null);
    if (loggedUser) {
      setIsLoggedIn(true);
      setProfile({
        ...loggedUser,
      });
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const onGoogleLoginSuccess = (credentialResponse) => {
    setIsLoggedIn(true);
    const decodedToken: DecodedTokenPayload = jwtDecode(
      credentialResponse.credential
    );
    const loggerUser = {
      name: decodedToken.name,
      email: decodedToken.email,
      picture: decodedToken.picture,
    };
    localStorage.setItem(
      "loggedUser",
      JSON.stringify({
        ...loggerUser,
      })
    );
    setProfile({
      ...loggerUser,
    });
  };

  const onGoogleLoginFailure = () => {
    localStorage.removeItem("loggedUser");
    setIsLoggedIn(false);
    console.log("Error while logging with Google");
    alert("Error while logging with Google");
  };

  const logout = () => {
    googleLogout();
    localStorage.removeItem("loggedUser");
    setIsLoggedIn(false);
    setProfile(undefined);
  };
  return (
    <div className="min-h-screen">
      {isLoggedIn ? (
        <>
          <Navbar profile={profile} logout={logout} />
          <div className="mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <Routes>
                <Route path="/" element={<UserManagement />}></Route>
                <Route path="/manage-bot" element={<BotManagement />}></Route>
              </Routes>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-4xl font-bold mb-4">WeatherBot Admin Panel</h1>

          <GoogleLogin
            onSuccess={(credentialResponse) => {
              onGoogleLoginSuccess(credentialResponse);
            }}
            theme="filled_black"
            text="signin_with"
            onError={() => {
              onGoogleLoginFailure();
            }}
          />
        </div>
      )}
    </div>
  );
};

export default App;
