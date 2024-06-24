import React, { useState } from 'react';
import './CounterButton.css';

const CounterButton: React.FC = () => {
    const [count, setCount] = useState(0);

    const handleIncrement = () => {
        setCount(count + 1);
    };

    return (
        <div>
            <a href="#" className="cta_btn01" onClick={handleIncrement}>
                {count}
            </a>
        </div>
    );
};

export default CounterButton;
