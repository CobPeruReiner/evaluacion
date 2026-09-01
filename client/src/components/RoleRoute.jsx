import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { isAsesor } from "../utils/accessPolicy";

export default function RoleRoute({ allow, children }) {
  const user = useSelector((state) => state.user.user);
  if (!user) return null;
  return allow(user)
    ? children
    : <Navigate replace to={isAsesor(user) ? "/perfilAsesor" : "/"} />;
}
