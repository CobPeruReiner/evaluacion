import React from "react";
import Select from "react-select";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaUserLock } from "react-icons/fa";
import { FaUserAlt } from "react-icons/fa";
import { ImArrowRight } from "react-icons/im";
import "./signup.css";
import { checkToken } from "../../store/actions/user.actions";
import { getSupervisores } from "../../services/UserService";

const optionsCargo = [
  { value: "admin", label: "admin" },
  { value: "monitor", label: "monitor" },
  { value: "asesor", label: "asesor" },
];

const API_URL = `${import.meta.env.VITE_API_URL}api/v1/users/`;

function Signup() {
  const [userData, setUserData] = useState({
    nombres: "",
    apellidos: "",
    cargo: "",
    dni: "",
    supervisor: "",
    usuario: "",
    password: "",
  });

  const [supervisores, setSupervisores] = useState([]);

  const dispatch = useDispatch();
  const { isAuth, user } = useSelector((state) => state.user);

  const getCyCSupervisores = async () => {
    try {
      const supervisores = await getSupervisores();
      if (supervisores) {
        setSupervisores(supervisores);
      } else {
        alert("No se encontraron supervisores");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!isAuth) {
      dispatch(checkToken(navigate));
    }
    if (!user) return;
    getCyCSupervisores();
  }, [isAuth, dispatch]);

  const navigate = useNavigate();

  const handleChange = (event) => {
    setUserData((prevUserData) => {
      return {
        ...prevUserData,
        [event.target.name]: event.target.value,
      };
    });
  };

  const handleCargo = (e) => {
    setUserData((prevUserData) => {
      return {
        ...prevUserData,
        cargo: e.value,
      };
    });
  };

  const handleSupervisor = (e) => {
    setUserData((prevUserData) => {
      return {
        ...prevUserData,
        supervisor: e.label,
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .post(API_URL, userData)
      .then((res) => {
        alert("Usuario creado");
        navigate("/login");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="signup-form">
      <form onSubmit={handleSubmit} className="signup-form__container">
        <div className="signup-form__header">
          <FaUserAlt className="signup-form__icon" />
          <h1 className="signup-form__h1">Crear usuario</h1>
        </div>
        <div className="signup-form__container-label__input">
          <div className="signup-form__container-label">
            <label htmlFor="nombres">Nombres</label>
            <label htmlFor="apellidos">Apellidos</label>
            <label htmlFor="cargo">Cargo</label>
            <label htmlFor="dni">DNI</label>
            <label htmlFor="supervisor">Supervisor</label>
            <label htmlFor="usuarios">Usuario</label>
            <label htmlFor="password">Password</label>
          </div>
          <div className="signup-form__container-input">
            <input type="text" name="nombres" onChange={handleChange} />
            <input type="text" name="apellidos" onChange={handleChange} />
            <Select options={optionsCargo} onChange={handleCargo} />
            <input type="text" name="dni" onChange={handleChange} />
            <Select
              options={
                supervisores &&
                supervisores.map((e) => {
                  return {
                    value: e.IDPERSONAL,
                    label: `${e.APELLIDOS.trim()}, ${e.NOMBRES.trim()}`,
                  };
                })
              }
              onChange={handleSupervisor}
            />
            <input type="text" name="usuario" onChange={handleChange} />
            <input type="password" name="password" onChange={handleChange} />
          </div>
        </div>
        <button className="signup-form__btn">Registrar</button>
      </form>
    </div>
  );
}

export default Signup;
