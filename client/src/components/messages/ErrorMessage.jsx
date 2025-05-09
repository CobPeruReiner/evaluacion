import React from 'react'
import './errorMessage.css'
import {VscError} from 'react-icons/vsc';

export const ErrorMessage = ({handleErrorMessage, message}) => {

  return (
    <div className='message-global'>
        <div className='message-container-error' >
            <VscError className='wrong'/>
            <p className='message-text-error'>{message}</p>
            <div className='message-close-error' onClick={handleErrorMessage}>Aceptar</div>
        </div>
    </div>
  )
}
