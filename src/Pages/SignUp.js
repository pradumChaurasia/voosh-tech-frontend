import React, { useState } from 'react'
import './signin.css';
import { useNavigate } from 'react-router';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/actions/userActions';

const SignUp = () => {
    const dispatch = useDispatch()
    const [formValues, setFormValues] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const handleChange = (e) => {

        setFormValues({
            ...formValues,
            [e.target.name]: e.target.value
        })
    }
    const navigate = useNavigate()

    const validate = (values) => {
        const errors = {};
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
        let isValid = true;
        if (!values.firstName) {
            errors.firstName = "Please Enter First Name";
            isValid = false;
        }

        if (!values.lastName) {
            errors.lastName = "Please Enter Last Name";
            isValid = false;
        }

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

        if (!values.confirmPassword) {
            errors.confirmPassword = "Please Enter Confirm Password";
            isValid = false;
        }

        if (values.password !== values.confirmPassword) {
            errors.notMatch = "Password and Confirm Password must be same";
            isValid = false;
        }

        return { isValid, errors };
    };

    const handleSignUp = async () => {
        const { isValid, errors } = validate(formValues);

        if (isValid) {

            try {
                const response = await axios.post(`https://voosh-tech-backend.vercel.app/api/register`, {
                // const response = await axios.post(`http://localhost:3000/api/register`, {
                    email: formValues.email,
                    password: formValues.password,
                    name: `${formValues.firstName} ${formValues.lastName}`
                });


                const { token, user } = response.data;
                localStorage.setItem("token", JSON.stringify(token));
                dispatch(loginSuccess({ token, ...user }));

                toast.success("User Registered Successfully!", {
                    autoClose: 3000
                  });

                navigate('/');
            } catch (error) {
                toast.error(error.response?.data?.message || "Registration failed!", {
                    autoClose: 3000
                  });
            }
        } else {
            const error = Object.values(errors);
            toast.error(error[0] ? error[0] : "All fields are required", {
                autoClose: 3000
              });
        }
    }
    const handleGoogleSuccess = async (response) => {
        const { credential } = response;
        
        try {
            const res = await axios.post('https://voosh-tech-backend.vercel.app/api/google-login', {
            // const res = await axios.post('http://localhost:3000/api/google-login', {
                tokenId: credential,
            });
            if (res.data) {
                localStorage.setItem("token", JSON.stringify(res.data.token));
                dispatch(loginSuccess({ token: res.data.token, ...res.data.user }));
                toast.success("Google Login Successfully!", {
                    autoClose: 3000
                  });
                navigate('/');
            }
        } catch (error) {
            console.log("error : ", error);
            toast.error("Error in Google Login", {
                autoClose: 3000
              });
        }
    };


    const handleGoogleFailure = (response) => {
        toast.error("Google Login Failed");
    };
    return (
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
            <div className='login-container'>
                <div className='login-heading'>
                    Signup
                </div>
                <div className='login-sub-container'>
                    <div className="inputs">
                        <input
                            type="text"
                            placeholder='First Name'
                            name="firstName"
                            value={formValues.firstName}
                            onChange={handleChange}
                        />
                        <input
                            type="text"
                            placeholder='Last Name'
                            name="lastName"
                            value={formValues.lastName}
                            onChange={handleChange}
                        />
                        <input
                            type="email"
                            placeholder='Email'
                            name='email'
                            value={formValues.email}
                            onChange={handleChange}
                        />
                        <input
                            type="password"
                            placeholder='Password'
                            name='password'
                            value={formValues.password}
                            onChange={handleChange}
                        />
                        <input
                            type="password"
                            placeholder='Confirm Password'
                            name='confirmPassword'
                            value={formValues.confirmPassword}
                            onChange={handleChange}
                        />
                    </div>
                    <button className='login-button' onClick={handleSignUp}>Sign UP</button>
                    <div className='login-text'>
                        <span className='login-text1'>Already have a account?</span>
                        <span className='login-text2' onClick={() => navigate('/signin')}>
                            Login
                        </span>
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

export default SignUp