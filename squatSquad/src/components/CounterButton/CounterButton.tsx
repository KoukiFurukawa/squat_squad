import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CounterButton.css';

const CounterButton: React.FC = () => {
    const location = useLocation();
    const teamName = location.state.team
    const [count, setCount] = useState(0);
    const [isPressed, setIsPressed] = useState(false);
    const [ws, setWs] = useState<any>(null);
    const [valid, setValid] = useState<boolean>(false);
    const navigate = useNavigate();
    const buttonRef = useRef<HTMLButtonElement>(null)

    // ソケット通信の初期設定
    useEffect(() => {
        const loc = window.location;
        const wsStart = loc.protocol === 'https:' ? 'wss://' : 'ws://';
        const wsUrl = wsStart + loc.host + '/ws/consumer';
        const websocket = new WebSocket(wsUrl);

        websocket.onopen = () => {
            console.log('WebSocket is open now.');
        };

        websocket.onclose = () => {
            console.log('WebSocket is closed now.');
        };

        websocket.onerror = (event) => {
            console.error('WebSocket error:', event);
        };

        websocket.onmessage = (event) => {
            const messageData = JSON.parse(event.data).message;
            const id = messageData.id;
            const name = messageData.name;
            const cnt = messageData.cnt;
            const state = messageData.state;
            const SC_TEAM = id === "r_cnt" ? "赤" : "青"

            const current_count = buttonRef.current?.innerText;
            console.log(current_count)

            if (state == "start" && teamName == SC_TEAM)
            {
                setValid(true)
            }
            else if (state == "end" && teamName == SC_TEAM)
            {
                setValid(false)
                if (teamName == "赤")
                {
                    fetch("/cheering_red", {
                        method: "POST",
                        body: JSON.stringify({
                            cnt: current_count
                        })
                    }).then(() => {
                        setCount(0)
                    })
                }
                else
                {
                    fetch("/cheering_white", {
                        method: "POST",
                        body: JSON.stringify({
                            cnt: current_count
                        })
                    }).then(() => {
                        setCount(0)
                    })
                }
            }
        }

        setWs(websocket);

        return () => {
            websocket.close();
        };
    }, []);

    const handleMouseDown = () => {
        setIsPressed(true);
    };

    const handleMouseUp = () => {
        setIsPressed(false);
    };

    const handleClick = () => {
        if (valid) { setCount(count+1) }      
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
            <button
                className={`btn-square-shadow ${teamClass}_btn ${isPressed ? 'active' : ''}`}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onClick={handleClick}
                ref={buttonRef}
            >
                {count}
            </button>
            <p className="message">
                ボタンを連打して<br />チームを応援しよう！
            </p>
        </div>
    );
};

export default CounterButton;