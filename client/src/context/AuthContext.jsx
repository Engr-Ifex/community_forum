import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    return savedUser
      ? JSON.parse(savedUser)
      : null;
  });

  const login = (userData) => {
    const existingUser = {
      ...userData,
      username:
        userData.username ||
        userData.name ||
        userData.email?.split("@")[0] ||
        "User",
      name:
        userData.name ||
        userData.username ||
        userData.email?.split("@")[0] ||
        "User",
      profilePicture:
        userData.profilePicture || "",
      bio: userData.bio || "",
      pronouns: userData.pronouns || "",
      gender: userData.gender || "",
      links: userData.links || [],
    };

    localStorage.setItem(
      "user",
      JSON.stringify(existingUser),
    );

    setUser(existingUser);
  };

  const updateUser = (updatedFields) => {
    setUser((currentUser) => {
      if (!currentUser) {
        return currentUser;
      }

      const updatedUser = {
        ...currentUser,
        ...updatedFields,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser),
      );

      return updatedUser;
    });
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);