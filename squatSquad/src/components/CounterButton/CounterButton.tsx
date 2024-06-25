import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CounterButton.css';

const CounterButton: React.FC = () => {
    const teamName = '赤';
    const [count, setCount] = useState(0);
    const [isPressed, setIsPressed] = useState(false);
    const navigate = useNavigate();

    const handleMouseDown = () => {
        setIsPressed(true);
    };

    const handleMouseUp = () => {
        setIsPressed(false);
    };

    const handleClick = () => {
        setCount(count + 1);
    };

    const handleBackClick = () => {
        navigate('/');
    };

    const teamClass = teamName === '赤' ? 'red-team' : 'blue-team';

    return (
        <div className="container">
            <button onClick={handleBackClick} className="back-button">戻る</button>
            <p className="main-message">
                あなたは<br />
                <span className={teamClass}>{teamName}チーム</span>です！
            </p>
            <a
                href="#"
                className={`btn-square-shadow ${isPressed ? 'active' : ''}`}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onClick={handleClick}
            >
                {count}
            </a>
            <p className="message">
                ボタンを連打して<br />チームを応援しよう！
            </p>
        </div>
    );
};

export default CounterButton;
