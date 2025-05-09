import React, { useEffect } from 'react'
import axios from 'axios';
import Select from 'react-select';
import { useState } from 'react';
import './asignarFicha.css';

const CARTERAS_URL = `${import.meta.env.VITE_API_URL}api/v1/carteras/`;
const BASE_URL = `${import.meta.env.VITE_API_URL}api/v1/base/`;

const AsignarFicha = () => {
    const [carteras, setCarteras] = useState([])

    const [carterasSelected, setCarterasSelected] = useState([])
    const [ficha, setficha] = useState('')

    useEffect(() => {
      axios.get(CARTERAS_URL)
      .then(res => {
        setCarteras([...new Set(res.data.carteras.map(item => {return{idcartera: item.idcartera, cartera: item.cartera}}))])
    })
      .catch(err => {
        console.log(err)
      })
    }, [])
    
    const carterasOptions = carteras.map(cartera => {
        return {
            label: `${cartera.idcartera}  ➡  ${cartera.cartera}`,
            value: cartera.idcartera
        } 
    })

    const handleSelect = (e) => {
        setCarterasSelected([...new Set(e.map(item => item.value))])
    }
    
    const handleChange = (e) => {
        setficha(e.target.value)
    }

    const handleSubmit = () => {
        axios.patch(BASE_URL, {ficha, carterasSelected: carterasSelected})
        .then(res => {
            alert(`Carteras asignadas a: ${ficha}`)
            console.log(res.data)
        })
        .catch(err => {
            alert('Error al asignar ficha')
            console.log(err)
        })
    }


  return (
    <div className='asignarFicha-container'>
        <Select
            className='asignarFicha__select'
            options={carterasOptions}
            isMulti
            onChange={handleSelect}
        />
        <div className='asignarFicha__radio-container'>
            <div>
                <label htmlFor="ficha01">Ficha 01</label>
                <input
                    type="radio"
                    name="fichas"
                    id="ficha01"
                    value="ficha01"
                    checked={ficha === "ficha01"}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label htmlFor="ficha02">Ficha 02</label>
                <input
                    type="radio" 
                    name="fichas" 
                    id="ficha02" 
                    value="ficha02"
                    checked={ficha === "ficha02"}
                    onChange={handleChange}
                />
            </div>
        </div>
            <button onClick={handleSubmit} className='asignarFicha__button'>Asignar ficha</button>
    </div>
  )
}

export default AsignarFicha