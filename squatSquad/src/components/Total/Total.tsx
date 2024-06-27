import React, { useEffect, useState } from 'react'
import "./Total.css";

function Total() {
    const [redScore, setRedScore] = useState<number>(0)
    const [blueScore, setBlueScore] = useState<number>(0)
    const [r_name, setRName] = useState<string>("")
    const [b_name, setBName] = useState<string>("")
    const [r_cnt, setRCnt] = useState<number>(0)
    const [b_cnt, setBCnt] = useState<number>(0)
    const [isRedVisible, setIsRedVisible] = useState<boolean>(false)
    const [isBlueVisible, setIsBlueVisible] = useState<boolean>(false);
    const [ws, setWs] = useState<any>(null)
    const [r_result, set_Rresult] = useState<number>(0)
    const [w_result, set_Wresult] = useState<number>(0)
    const [isR_result, setIsR_result] = useState<boolean>(false)
    const [isW_result, setIsW_result] = useState<boolean>(false)
<<<<<<< HEAD
    const [r_score, setR_score] = useState<number>(0)
    const [w_score, setW_score] = useState<number>(0)

=======
>>>>>>> b6957a4b6d253fb6946bcaa9d9269504ada3fab9


    const toggleRedVisibility = (val: boolean) => {
        setIsRedVisible(val);
    };

    const toggleBlueVisibility = (val: boolean) => {
        setIsBlueVisible(val);
    };

    // const btn_r = document.getElementById("ch");
    // const list_r = document.querySelector(".team.r .squat");
    // const btn_w = document.getElementById("ch_w");
    // const list_w = document.querySelector(".team.w .squat");

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
            // console.log(messageData)
            const id = messageData.id;
            const name = messageData.name;
            const cnt = messageData.cnt;
            const state = messageData.state;

            console.log(state)

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
                    fetch("/calculate_score_red", {
                        method: "POST",
                        body : JSON.stringify({
                            cnt: cnt
                        })
                    }).then((response) => response.json())
                    .then((res) => {
                        const score = res.score
                        const total = res.total
                        setRedScore(total)
<<<<<<< HEAD
                        setR_score(score)
=======
>>>>>>> b6957a4b6d253fb6946bcaa9d9269504ada3fab9
                    })

                    toggleRedVisibility(false)

                    set_Rresult(cnt);
                    setIsR_result(true);
                    await new Promise(resolve => setTimeout(resolve, 10000));
                    setIsR_result(false);

                    // fetch("/calculate_score_red", {
                    //     method: "POST",
                    //     body : JSON.stringify({
                    //         cnt: cnt
                    //     })
                    // }).then((response) => response.json())
                    // .then((res) => {
                    //     const score = res.score
                    //     const total = res.total
                    //     document.getElementById("r_pt").innerHTML = total
                    // })
                }
                else
                {
                    fetch("/calculate_score_white", {
                        method: "POST",
                        body : JSON.stringify({
                            cnt: cnt
                        })
                    }).then((response) => response.json())
                    .then((res) => {
                        const score = res.score
                        const total = res.total
                        setBlueScore(total)
                        setW_score(score)
                    })

                    toggleBlueVisibility(false)

                    set_Wresult(cnt);
                    setIsW_result(true);
                    await new Promise(resolve => setTimeout(resolve, 10000));
                    setIsW_result(false);
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
                <div className='team_header'>
                    <p>赤チーム</p>
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
<<<<<<< HEAD
                <div id="r_result" className={isR_result ? "result" : "hide"}>
                    <p>結果 : {r_result}回</p>
                    <p>スコア : {r_score}</p>
=======
                <div id="r_result" className={isR_result ? "result" : "result hide"}>
                    <p>結果 : {r_result}回</p> 
>>>>>>> b6957a4b6d253fb6946bcaa9d9269504ada3fab9
                </div>
                {/* <button id="ch">計測</button>
                <button id="inc_count" className="hide">スクワット</button> */}
            </div>
        
            <div className="team w">
                <div className='team_header'>
                    <p>青チーム</p>
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
<<<<<<< HEAD
                <div id="w_result" className={isW_result ? "result" : "hide"}>
                    <p>結果 : {w_result}回</p>
                    <p>スコア : {w_score}</p>
=======
                <div id="w_result" className={isW_result ? "result" : "result hide"}>
                    <p>結果 : {w_result}回</p> 
>>>>>>> b6957a4b6d253fb6946bcaa9d9269504ada3fab9
                </div>
                {/* <button id="ch_w">計測</button>
                <button id="inc_count" className="hide">スクワット</button> */}
            </div>
        </div>
        </div>
    )
}

export default Total
