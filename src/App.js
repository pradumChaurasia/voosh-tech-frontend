import logo from './logo.svg';
import './App.css';
import Header from './Components/Header';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Signin from './Pages/Signin';
import SignUp from './Pages/SignUp';
import Dashboard from './Components/Dashboard';
import ProtectedRoute from './Components/ProtectedRoute';

function App() {
  
  return (
    <>
      <Router>

      <Header/>
      <Routes>
        <Route exact path="/signin" element={<Signin/>}/>
        <Route exact path="/signup" element={<SignUp/>}/>
        <Route exact path="/" element={<ProtectedRoute Component={Dashboard} />} />
      </Routes>
      </Router>

    </>
  );
}

export default App;
