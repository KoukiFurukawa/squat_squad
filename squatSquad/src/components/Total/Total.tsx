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
                    setTimeout(function(){
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
                        })
                    }, 5000)
                    toggleRedVisibility(false)
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
                    })

                    toggleBlueVisibility(false)
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
                <p>赤</p>
                <div className="pt">
                    <p id="r_pt">{redScore}</p>
                    <p>pt</p>
                </div>
                <div className={`squat ${isRedVisible ? '' : 'hide'}`}>
                    <p className="username" id="r_name">{r_name}</p>
                    <div className="counter">
                        <p className="squat_count" id="r_cnt">{r_cnt}</p>
                        <p>回</p>
                    </div>
                </div>
                {/* <button id="ch">計測</button>
                <button id="inc_count" className="hide">スクワット</button> */}
            </div>
        
            <div className="team w">
                <p>白</p>
                <div className="pt">
                    <p id="b_pt">{blueScore}</p>
                    <p>pt</p>
                </div>
                <div className={`squat ${isBlueVisible ? '' : 'hide'}`}>
                    <p className="username" id="b_name">{b_name}</p>
                    <div className="counter">
                        <p className="squat_count" id="w_cnt">{b_cnt}</p>
                        <p>回</p>
                    </div>
                </div>
                {/* <button id="ch_w">計測</button>
                <button id="inc_count" className="hide">スクワット</button> */}
            </div>
        </div>
        </div>
    )
}

export default Total
