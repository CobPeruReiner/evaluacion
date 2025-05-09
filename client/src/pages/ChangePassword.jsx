import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {FaUserAlt} from 'react-icons/fa';
import { checkToken } from '../store/actions/user.actions';
import './changePassword.css'


function ChangePassword({ setShowChangePassword, currentUser }) {

    const API_URL = `${import.meta.env.VITE_API_URL}api/v1/users/`;

    const [password, setPassword] = useState('');

    const handlePassword = (e) => {
      setPassword(e.target.value);
    }

    const handleSubmit = (e) => {
        e.preventDefault(); 
        const token = localStorage.getItem('token');
        axios.patch(`${API_URL}${currentUser}`, {password}, {
            headers: { authorization: `Bearer ${token}` },
        })
        .then(res => {
            alert('Contraseña actualizada')
            setShowChangePassword(false)
        })
        .catch(err => {
            alert('Error al actualizar')
            console.log(err)
        } )
    }

    return (
        <div className="changePassword-form">
            <form onSubmit={handleSubmit} className='changePassword-form__container'>
              <div className='changePassword-form__header'>
                <h1 className='changePassword-form__h1'>Cambiar contraseña de <span className='changePassword-form__user'>{currentUser}</span></h1>
              </div>
              <div className='changePassword-form__container-label__input'>
                <div className='changePassword-form__container-label'>
                  <label htmlFor="nombres">Nueva contraseña</label>
                </div>
                <div className='changePassword-form__container-input'>
                  <input type="password" className='changePassword-form__input' name='nombres' onChange={handlePassword}/>
                </div>
              </div>
              <div className='changePassword-form__buttons'>
                <button type='submit' className='changePassword-form__button'>Cambiar contraseña</button>
                <button className='changePassword-form__button' onClick={()=>setShowChangePassword(false)}>Cancelar</button>
              </div>
            </form>
        </div>
      );
}

export default ChangePassword;