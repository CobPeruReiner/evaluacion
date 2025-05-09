import React, { useEffect, useState } from 'react';
import user_icon from '../assets/user_icon.png'
import { useDispatch, useSelector } from 'react-redux';
import { checkToken } from '../store/actions/user.actions';
import './styles/asesorPerfil.css'
import { getCarteras } from '../services/UserService';

const AsesorPerfil = () => {
  const dispatch = useDispatch();
  const { isAuth, user } = useSelector(state => state.user);
  const [carteras, setCarteras] = useState([])

  const getCurrentCarteras = async () => {
    const carteras = await getCarteras(user.dni)
    setCarteras(carteras)
  }

  useEffect(() => {
    if (!isAuth) {
        dispatch(checktoken(navigate));
    };
    if (!user) return;
    getCurrentCarteras()
}, [isAuth, dispatch]);  


  return (
    <section className='asesorPerfil__full-container'>
      <div className='asesorPerfil__main-container'>
        <h1 className='asesorPerfil__main__h1'>{user && `${user.apellidos.trim()}, ${user.nombres.trim()}`}</h1>
        <div className='asesorPerfil__container'>
            <img src={user_icon} alt="icono_usuario" />
            <div className='asesorPerfil__container__info'>
              <div className='info-labels'>
                <p style={carteras ? (carteras.length > 1 ? {marginBottom: `${carteras.length * 0.5}em`} : {}) : {}}>Cartera(s)</p>
                <p>Monitor</p>
                <p>Supervisor</p>
              </div>
              <div className='info-values'>

                {/* <p>Falabella Castigo</p> */}
                {/* {
                  carteras && 
                  <span>
                    {carteras.map(e => e.cartera).join(', ')}
                  </span>
                } */}
                {
                  carteras && 
                    carteras.map(e => (
                      <span key={e.id}>{e.cartera}</span>
                    ))
                }
                <p>Beatriz Fuentes</p>
                <p>{user && user.supervisor}</p>
              </div>
            </div>
        </div>
      </div>
    </section>
  )
}

export default AsesorPerfil