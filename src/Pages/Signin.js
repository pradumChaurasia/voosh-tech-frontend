import React, { useState } from 'react'
import './signin.css';
import { useNavigate } from 'react-router';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/actions/userActions';

const Signin = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [formValues, setFormValues] = useState({
        email:"",
        password:"",
    });

    const handleChange= (e)=>{
        
        setFormValues({
            ...formValues,
            [e.target.name] : e.target.value
        })
    }

    const validate = (values) => {
        const errors = {};
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
        let isValid = true;

        if (!values.email) {
            errors.email = "Please Enter Email";
            isValid = false;
        } else if (!regex.test(values.email)) {
            errors.email = "Please Enter Valid Email";
            isValid = false;
        }

        if (!values.password) {
            errors.password = "Please Enter Password";
            isValid = false;
        }

        return { isValid, errors };
    };
    const handleLogin = async () => {
        const { isValid, errors } = validate(formValues);
        const toastId = toast.loading('Loading...');
        if (isValid) {
            try {
                const response = await axios.post(`http://localhost:3000/api/login`, {
                    email: formValues.email,
                    password: formValues.password,
                });
                if (response.data) {
                    const { token, user } = response.data;
                    localStorage.setItem("token", JSON.stringify(token));
                    dispatch(loginSuccess({ token, ...user }));
                    toast.success("Login Successfully!", {
                        id: toastId,
                    });
                    navigate('/');
                }
            } catch (error) {
                console.log("error : ", error);
                toast.error("Error in Login", {
                    id: toastId,
                });
            }
        } else {
            const error = Object.values(errors);
            toast.error(error[0] ? error[0] : "All fields are required",{
                id: toastId,
            });
        }
    };

    const handleGoogleSuccess = async (response) => {
        const { credential } = response;
        const toastId = toast.loading('Loading...');
        try {
            const res = await axios.post('http://localhost:3000/api/google-login', {
                tokenId: credential,
            });
           
            if (res.data) {
                const { token, user } = res.data;
                localStorage.setItem("token", JSON.stringify(token));
                dispatch(loginSuccess({ token, ...user }));
                toast.success("Google Login Successfully!", {
                    id: toastId,
                });
                navigate('/');
            }
        } catch (error) {
            console.log("error : ", error);
            toast.error("Error in Google Login", {
                id: toastId,
            });
        }
    };


    const handleGoogleFailure = (response) => {
        toast.error("Google Login Failed");
    };
    return (
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
            <div className='login-container'>
                <div className='login-heading'>Login</div>
                <div className='login-sub-container'>
                    <div className="inputs">
                        <input
                            type="email"
                            placeholder='Email'
                            name='email'
                            onChange={handleChange}
                            value={formValues.email}
                        />
                        <input
                            type="password"
                            placeholder='Password'
                            name='password'
                            onChange={handleChange}
                            value={formValues.password}
                        />
                    </div>
                    <button className='login-button' onClick={handleLogin}>Login</button>
                    <div className='login-text'>
                        <span className='login-text1'>Don't have an account?</span>
                        <span className='login-text2' onClick={() => navigate('/signup')}>Sign up</span>
                    </div>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleFailure}
                    />
                    </div>
                </div>
            </div>
            <ToastContainer />
        </GoogleOAuthProvider>
    )
}

export default Signin