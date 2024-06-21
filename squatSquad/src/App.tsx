import React, { useContext } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';

// components
import Home from './components/Home/Home';
import Squat from './components/SquatScreen/SquatScreen';
import ReadQR from './components/ReadQR/ReadQR';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/readqr' element={<ReadQR />}></Route>
        <Route path='/squat' element={<Squat />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
