import React, { useEffect, useState } from 'react'
import "./Total.css";

function Total() {
    const [redScore, setRedScore] = useState<number>(0);
    const [blueScore, setBlueScore] = useState<number>(0);
    const [r_name, setRName] = useState<string>("");
    const [b_name, setBName] = useState<string>("");
    const [r_cnt, setRCnt] = useState<number>(0);
    const [b_cnt, setBCnt] = useState<number>(0);
    const [isRedVisible, setIsRedVisible] = useState<boolean>(false);
    const [isBlueVisible, setIsBlueVisible] = useState<boolean>(false);
    const [ws, setWs] = useState<any>(null);
    const [r_result, set_Rresult] = useState<number>(0);
    const [w_result, set_Wresult] = useState<number>(0);
    const [isR_result, setIsR_result] = useState<boolean>(false);
    const [isW_result, setIsW_result] = useState<boolean>(false);
    const [r_score, setR_score] = useState<string>("計算中...");
    const [w_score, setW_score] = useState<string>("計算中...");
    const [r_cheer, setRCheer] = useState<string>("計算中...");
    const [w_cheer, setWCheer] = useState<string>("計算中...");

    const toggleRedVisibility = (val: boolean) => {
        setIsRedVisible(val);
    };

    const toggleBlueVisibility = (val: boolean) => {
        setIsBlueVisible(val);
    };

    useEffect(() => {
        fetch("/total_score", {
            method: "POST",
            body : JSON.stringify({})
        })
        .then((response) => response.json())
        .then((res) => {
            const red_score = res["red"];
            const blue_score = res["blue"];
            setRedScore(red_score)
            setBlueScore(blue_score)
        })
    })

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

        websocket.onmessage = async (event) =>
        {
            const messageData = JSON.parse(event.data).message;
            const id = messageData.id;
            const name = messageData.name;
            const cnt = messageData.cnt;
            const state = messageData.state;

            if (state == "start")
            {
                if (id == "r_cnt")
                {
                    setRName(name)
                    toggleRedVisibility(true);
                }
                else
                {
                    setBName(name)
                    toggleBlueVisibility(true);
                }
            }
            else if (state == "counting")
            {
                if (id == "r_cnt")
                {
                    setRCnt(cnt)
                }
                else
                {
                    setBCnt(cnt)
                }
            }
            else if (state == "end")
            {
                if (id == "r_cnt")
                {
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    fetch("/calculate_score_red", {
                        method: "POST",
                        body : JSON.stringify({
                            cnt: cnt
                        })
                    }).then((response) => response.json())
                    .then((res) => {
                        const score = res.score
                        const total = res.total
                        const cheer = res.cheer
                        setRedScore(total)
                        setR_score(score)
                        setRCheer(cheer)
                    })

                    toggleRedVisibility(false)

                    set_Rresult(cnt);
                    setIsR_result(true);
                    await new Promise(resolve => setTimeout(resolve, 20000));
                    setRCheer("計算中...")
                    setR_score("計算中...")
                    setIsR_result(false);
                    setRCnt(0)
                }
                else
                {
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    fetch("/calculate_score_white", {
                        method: "POST",
                        body : JSON.stringify({
                            cnt: cnt
                        })
                    }).then((response) => response.json())
                    .then((res) => {
                        const score = res.score
                        const total = res.total
                        const cheer = res.cheer
                        setBlueScore(total)
                        setW_score(score)
                        setWCheer(cheer)
                    })

                    toggleBlueVisibility(false)

                    set_Wresult(cnt);
                    setIsW_result(true);
                    await new Promise(resolve => setTimeout(resolve, 20000));
                    setWCheer("計算中...");
                    setW_score("計算中...")
                    setIsW_result(false);
                    setBCnt(0)
                }
            }
        }

        setWs(websocket);

        return () => {
            websocket.close();
        };
    }, []);

    return (
        <div className='wrapper'>
        <div className="containers">
            <div className="team r">
                <div className={`team_header ${isRedVisible || isR_result ? 'hide' : ''}`}>
                    <p className='team-text'>赤チーム</p>
                    <div className="pt">
                        <p id="r_pt">{redScore}</p>
                    <p>pt</p>
                    </div>
                </div>
                
                <div className={`squat ${isRedVisible ? 'player' : 'hide'}`}>
                    <p className="username" id="r_name">プレイヤー : {r_name}</p>
                    <div className="counter">
                        <p className="squat_count" id="r_cnt">{r_cnt}</p>
                        <p>回</p>
                    </div>
                </div>
                <div id="r_result" className={isR_result ? "result" : "hide"}>
                    <p>スクワット : {r_result}回</p>
                    <p>応援回数 : {r_cheer}</p>
                    <p>スコア : {r_score}</p>
                </div>
            </div>
        
            <div className="team w">
                <div className={`team_header ${isBlueVisible || isW_result ? 'hide' : ''}`}>
                    <p className='team-text'>青チーム</p>
                    <div className="pt">
                        <p id="w_pt">{blueScore}</p>
                    <p>pt</p>
                    </div>
                </div>
                <div className={`squat ${isBlueVisible ? 'player' : 'hide'}`}>
                    <p className="username" id="b_name">プレイヤー : {b_name}</p>
                    <div className="counter">
                        <p className="squat_count" id="w_cnt">{b_cnt}</p>
                        <p>回</p>
                    </div>
                </div>
                <div id="w_result" className={isW_result ? "result" : "hide"}>
                    <p>スクワット : {w_result}回</p>
                    <p>応援回数 : {w_cheer}</p>
                    <p>スコア : {w_score}</p>
                </div>
            </div>
        </div>
        </div>
    )
}

export default Total;
