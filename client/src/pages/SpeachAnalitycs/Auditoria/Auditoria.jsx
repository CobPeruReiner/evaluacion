import { useEffect } from "react";
import { checkToken } from "../../../store/actions/user.actions";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

export const Auditoria = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isAuth = useSelector((state) => state.user.isAuth);
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    if (!isAuth) {
      dispatch(checkToken(navigate));
    }
    if (user && user.cargo === "asesor") {
      navigate("/perfilAsesor");
    }
  }, [isAuth, dispatch]);

  return <div>Auditoria</div>;
};
