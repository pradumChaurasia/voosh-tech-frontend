import React from 'react'
import { PiNotepadBold } from "react-icons/pi";
import './Header.css'
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/actions/userActions';

const Header = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { token, user } = useSelector((state) => state.user);

    const handleLogout = () => {
        dispatch(logout());
        localStorage.removeItem('token');
        navigate('/signin');
    };
    console.log(user)
    return (
        <div className='header'>
            <div>
                <PiNotepadBold style={{ color: 'white', fontSize: '30px' }} />
            </div>
            <div className='header-container'>
                {user ? (<div>
                    <div className='signup-button' onClick={handleLogout}>
                    Logout
                </div>
                </div>):(
                    <>
                <div className='login-header' onClick={() => navigate('/signin')}>
                    Login
                </div>
                <div className='register-header' onClick={() => navigate('/signup')}>
                    Sign up
                </div>
                </>
                )
                }

            </div>
        </div>
    )
}

export default Header