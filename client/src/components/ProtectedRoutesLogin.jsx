import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoutesLogin = () => {

    const token = localStorage.getItem('token');

    if(token){
        return <Outlet />
    } else { 
        return <Navigate to='/login' />
    }                     
};                        

export default ProtectedRoutesLogin;