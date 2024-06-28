import React, { useContext } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';

// components
import Home from './components/Home/Home';
import Squat from './components/SquatScreen/SquatScreen';
import ReadQR from './components/ReadQR/ReadQR';
import Total from './components/Total/Total';
import CounterButton from './components/CounterButton/CounterButton';
import Initialize from './components/Initialize/Initialize';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/total' element={<Total />} />
        <Route path='/readqr' element={<ReadQR />}></Route>
        <Route path='/squat' element={<Squat />}></Route>
        <Route path='/button' element={<CounterButton />}></Route>
        <Route path='/initialize' element={<Initialize />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
