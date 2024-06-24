import { useZxing } from 'react-zxing';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { IUserInfo } from '../../interfaces/interfaces';

const ReadQR = () => {
    // const [cnt, setCnt] = useState<number>(0);
    // const [message, setMessage] = useState<string>('');
    // const [ws, setWs] = useState<any>(null);
    const [readValue, setReadValue] = useState<boolean>(false);
    const [name, setName] = useState<string>("");
    const [team, setTeam] = useState<string>("");

    const navigate = useNavigate();

    const { ref } = useZxing({
        onDecodeResult(result) {
            const text = result.getText();
            setReadValue(true);
            setName(text)
            setTeam(text)
            console.log(text)
        },
    })

    const transitionToSquat = () => {
        const data: IUserInfo = { name: name, team: team }
        navigate("/squat", { state: data })
    }

    // useEffect(() => {
    //     const loc = window.location;
    //     const wsStart = loc.protocol === 'https:' ? 'wss://' : 'ws://';
    //     const wsUrl = wsStart + loc.host + '/ws/consumer';
    //     const websocket = new WebSocket(wsUrl);

    //     websocket.onopen = () => {
    //         console.log('WebSocket is open now.');
    //     };

    //     websocket.onclose = () => {
    //         console.log('WebSocket is closed now.');
    //     };

    //     websocket.onerror = (event) => {
    //         console.error('WebSocket error:', event);
    //     };

    //     setWs(websocket);

    //     return () => {
    //         websocket.close();
    //     };
    // }, []);

    // const sendMessage = () => {
    //     if (ws) {
    //         ws.send(JSON.stringify({
    //             message: {
    //                 "id" : "r_cnt",
    //                 "cnt": cnt+1
    //             }
    //         }));
    //         setCnt(cnt+1)
    //     }
    // };


    return (
        <div>
            <button>WebSocket</button>
            {readValue ?
                <div>
                    <p>{team} チーム所属</p>
                    <p>{name} さん</p>
                    <button type='button' onClick={transitionToSquat}>確認</button>
                </div>
                :
                <></>
            }
            <video ref={ref} />
        </div>
    )
}

export default ReadQR
