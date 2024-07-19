import React, { useEffect } from 'react'
import { useNavigate } from 'react-router';

const ProtectedRoute = (props) => {
    const { Component } = props;
    const navigate = useNavigate();
  
    useEffect(() => {
      let token = localStorage.getItem('token');
  
      if (!token) {
        navigate('/signin');
      }
    }, [navigate]);
    return <Component />;

}

export default ProtectedRoute