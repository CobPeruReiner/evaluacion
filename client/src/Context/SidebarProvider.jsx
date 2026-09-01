import { useState } from "react";
import { SideBarContext } from "./SideBarContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../store/actions/user.actions";

export const SideBarProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const handleLogOut = () => {
    dispatch(logout());
    navigate("/login");
  };

  const sideBarActive = () => setIsSidebarOpen(true);
  const sideBarInactive = () => undefined;
  const toggleSidebar = () => setIsSidebarOpen((open) => !open);

  const isActive = (path) => location.pathname === path;

  return (
    <SideBarContext.Provider
      value={{
        isSidebarOpen,
        sideBarActive,
        sideBarInactive,
        toggleSidebar,
        handleLogOut,
        isActive,
      }}
    >
      {children}
    </SideBarContext.Provider>
  );
};
