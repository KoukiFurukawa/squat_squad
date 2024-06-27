import React, { useContext } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';

// components
import Home from './components/Home/Home';
import Squat from './components/SquatScreen/SquatScreen';
import Result from './components/Result/Result';
import ReadQR from './components/ReadQR/ReadQR';
import Total from './components/Total/Total';
import CounterButton from './components/CounterButton/CounterButton';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/total' element={<Total />} />
        <Route path='/readqr' element={<ReadQR />}></Route>
        <Route path='/squat' element={<Squat />}></Route>
        <Route path='/result' element={<Result />}></Route>
        <Route path='/button' element={<CounterButton />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
