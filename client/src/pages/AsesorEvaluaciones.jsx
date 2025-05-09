import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Select from 'react-select'
import { useDispatch, useSelector } from 'react-redux';
import { checkToken } from '../store/actions/user.actions';
import './styles/asesorEvaluaciones.css'
import { getAsesorEvaluaciones, getAsesorPromedioCalificacion } from '../services/AsesorService';
import { updateCurrentEvaluacion } from '../store/actions/currentEvaluacion.actions';
import { FaCheckCircle, FaClipboardList } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import { FaCheck } from "react-icons/fa";
import { ImCross } from "react-icons/im";

const optionsMeses = [
  { value: 1 , label: 'Enero' },
  { value: 2 , label: 'Febrero' },
  { value: 3 , label: 'Marzo' },
  { value: 4 , label: 'Abril' },
  { value: 5 , label: 'Mayo' },
  { value: 6 , label: 'Junio' },
  { value: 7 , label: 'Julio' },
  { value: 8 , label: 'Agosto' },
  { value: 9 , label: 'Setiembre' },
  { value: 10 ,label: 'Octubre' },
  { value: 11 ,label: 'Noviembre' },
  { value: 12 ,label: 'Diciembre' },
]

const getCurrentMonth = () => {
  const mes = optionsMeses.find(x => x.value === new Date().getMonth() + 1)
  if (mes) {
    const currentMonth = mes.label.toLowerCase()
    return currentMonth
  } else return
}

const AsesorEvaluaciones = () => {

  const dispatch = useDispatch();
  const isAuth = useSelector(state => state.user.isAuth);
  const user = useSelector(state => state.user.user);

  const [currentEvaluaciones, setCurrentEvaluaciones] = useState([])
  const [currentAnualCalificacion, setCurrentAnualCalificacion] = useState()
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth())
  // const [currentMonth, setCurrentMonth] = useState('junio')

  const navigate = useNavigate()

  const  getCurrentEvaluaciones = async (dni, mes) => {
    const evaluaciones = await getAsesorEvaluaciones(dni, mes)
    setCurrentEvaluaciones(evaluaciones)

    const promedioAnualCalificacion = await getAsesorPromedioCalificacion(dni)
    setCurrentAnualCalificacion(promedioAnualCalificacion)
  }

  useEffect(() => {
    if (!isAuth) {
        dispatch(checktoken(navigate));
    };
  }, [isAuth, dispatch]);  

  useEffect(() => {
    if (user && currentMonth) {
      getCurrentEvaluaciones(user.dni, currentMonth)
    }
  }, [currentMonth, user])
  
  const showFeedback = (gestion) => {
    navigate('/feedbackAsesor');
    // window.open('/feedbackAsesor','_blank');
    dispatch(updateCurrentEvaluacion(gestion));
  }





  const calcularPromedio = (evaluaciones) => {
    if (evaluaciones.length === 0) return 0;
    const suma = evaluaciones.reduce((acc, evaluacion) => acc + parseFloat(evaluacion.calificacion_final), 0);
    return suma / evaluaciones.length;
  }

  return (
    <section className='asesorEvaluaciones__main-container'>
      

      <div className="title-container">
        <FaCheckCircle className="icon-left" />
        <h1 className="h1-center">EVALUACIONES ASESOR</h1>
        <FaClipboardList className="icon-right" />
      </div>

      <div className='asesorEvaluaciones-container'>
        <div className="asesorEvaluaciones__month">
          <label htmlFor="">Mes de evaluaciones</label>
          <Select placeholder='Seleccionar' className='asesorEvaluaciones__month-select' onChange={e => setCurrentMonth(e.label.toLowerCase())} options={optionsMeses}/> 
        </div>
        {/* <div className='asesorEvaluaciones__promedio-general'>
          <p>Nota de calidad general: <span>{currentAnualCalificacion ? (parseFloat(currentAnualCalificacion) * 100).toFixed(2) : '0.00'}%</span></p>
        </div> */}
        <div className="asesorEvaluaciones__promedio-general">
          <p>Nota de calidad general:</p> 
          <span>{currentAnualCalificacion ? (parseFloat(currentAnualCalificacion) * 100).toFixed(2) : '0.00'}%</span>
        </div>

        <div className="asesorEvaluaciones__evaluaciones">
          
          {
            currentEvaluaciones && currentEvaluaciones.length ? (
            <>
              <div className='asesorEvaluaciones__evaluaciones__header'>
                <div className="evaluacion__numero">Revisado</div>
                <div className="evaluacion__numero">Evaluaciones</div>
                <div className="evaluacion__calificacion">Calificación</div>
              </div>
            {currentEvaluaciones.map((e, index) => (
              <div key={e.id} className='asesorEvaluaciones__evaluaciones__item' onClick={x => showFeedback(e)}>
                <div className="evaluacion__estado">
                  {e.feedback_recibido === 1 ? <FaCheck className='evaluacion__estado__check'/> : <ImCross className='evaluacion__estado__cross'/>}
                </div>
                <div className="evaluacion__numero">Evaluación {index + 1}</div>
                <div className="evaluacion__calificacion">{(parseFloat(e.calificacion_final) * 100).toFixed(2)}%</div>
              </div>
            ))}
            </>
            )
            : <p>Sin evaluaciones</p>
          }
        </div>

        {/* <div className="asesorEvaluaciones__promedio-mes">  
          <p>Promedio de Nota {currentMonth}: <span>{currentEvaluaciones && (calcularPromedio(currentEvaluaciones)*100).toFixed(2)}%</span></p>
        </div> */}
          <div className="asesorEvaluaciones__promedio-mes">  
            <p>Promedio de Nota {currentMonth}:</p> 
            <span>{currentEvaluaciones && (calcularPromedio(currentEvaluaciones)*100).toFixed(2)}%</span>
          </div>
      </div>
    </section>
  )
}

export default AsesorEvaluaciones