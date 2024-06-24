// CounterButton.tsx
import React, { useState } from 'react';
import './CounterButton.css';

const CounterButton: React.FC = () => {
    const [count, setCount] = useState(0);

    const handleClick = () => {
        setCount(count + 1);
    };

    return (
        <div className="container">
            <a href="#" className="btn-square-shadow" onClick={handleClick}>
                Push!
            </a>
            <p>Count: {count}</p>
        </div>
    );
};

export default CounterButton;
