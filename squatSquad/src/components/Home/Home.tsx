/** -----------------------------------------------------------------------------
 * 初期画面を描写
 * 名前と運動志向を入力するモーダル（入力するまで消えない）が初期表示されている.
 ---------------------------------------------------------------------------- */

import React, { useEffect, useState } from "react";
import QRCode from "qrcode.react";
import { useNavigate } from 'react-router-dom';
import { IUserInfo } from "../../interfaces/interfaces";
import "./Home.css";

const Home = () => {
    const [isLogin, setLogin] = useState<boolean>(false);
    const [name, setName] = useState("");
    const [exercise_pre, setExercise_pre] = useState("");
    const [team, setTeam] = useState("");
    const [alert_name, setAlert_name] = useState("");
    const [alert_exer, setAlert_exer] = useState("");
    const [viewQR, setViewQR] = useState<boolean>(false);
    const navigate = useNavigate();

    const toggleLoginState = () => {
        if (isLogin) {
            setLogin(false);
            setAlert_name("");
            setAlert_exer("");
            localStorage.setItem("name", name);
            localStorage.setItem("exercise_pre", exercise_pre);
        } else {
            setLogin(true);
        }
    };

    const changeExer = (btnID: string) => {
        setExercise_pre(btnID);

        const buttons = document.querySelectorAll(".btnbox button");
        buttons.forEach(button => { button.classList.remove("selected"); });

        const clickedButton = document.getElementById(btnID);
        if (clickedButton) {
            clickedButton.classList.add("selected");
        }
    };

    const reset_data = () => {
        setName("");
        setExercise_pre("");
        setTeam("")
        localStorage.removeItem("name");
        localStorage.removeItem("exercise_pre");
        localStorage.removeItem("team")
    };

    const check_input = () => {
        if (name !== "" && exercise_pre !== "") {
            fetch("/divide_teams", {
                method: "POST",
                body: JSON.stringify({
                    name: name, score: exercise_pre
                })
            }).then((response) => response.json())
                .then((res) => {
                    console.log(res.team)
                    setTeam(res.team);
                    localStorage.setItem("team", res.team);
                    toggleLoginState();
                })
        }
        if (name === "") {
            setAlert_name("（必須）");
        }
        if (exercise_pre === "") {
            setAlert_exer("（必須）");
        }
    };

    useEffect(() => {
        const stored_name = localStorage.getItem("name");
        const stored_exer = localStorage.getItem("exercise_pre");
        const stored_team = localStorage.getItem("team");
        if (stored_name === null || stored_exer === null || stored_team === null) {
            toggleLoginState();
        } else {
            setName(stored_name);
            setExercise_pre(stored_exer);
            setTeam(stored_team)
        }
    }, []);

    const transitionToButton = () => {
        const data: IUserInfo = { name: name, team: team };
        navigate("/button", { state: data });
    };

    const getButtonClass = () => {
        if (team === "赤") {
            return "button-red";
        } else if (team === "青") {
            return "button-blue";
        }
        return "";
    };

    return (
        <div className="container">
            {isLogin ? (
                <div className="modal">
                    <div className="form">
                        <div>
                            <div>{`名前を入力して下さい${alert_name}`}</div>
                            <input type="text" value={name} onChange={(e) => { setName(e.target.value) }} />
                        </div>
                        <div>
                            <div>{`運動の得意不得意を入力して下さい${alert_exer}`}</div>
                            <div className="explain_exer">
                                <p>苦手</p>
                                <p>普通</p>
                                <p>得意</p>
                            </div>
                            <div className="btnbox">
                                <button id="1" onClick={(e) => changeExer(e.currentTarget.id)}>1</button>
                                <button id="2" onClick={(e) => changeExer(e.currentTarget.id)}>2</button>
                                <button id="3" onClick={(e) => changeExer(e.currentTarget.id)}>3</button>
                                <button id="4" onClick={(e) => changeExer(e.currentTarget.id)}>4</button>
                                <button id="5" onClick={(e) => changeExer(e.currentTarget.id)}>5</button>

                            </div>
                        </div>
                        <button type="button" onClick={() => { check_input() }}>OK</button>
                    </div>
                </div>
            ) : (
                <div className="home">
                    <div className="mydata">
                        <div>{`${name}`}</div>
                    </div>
                    <div className="teamdata">
                        <div>{`${team}チーム`}</div>
                    </div>
                    {viewQR ? (
                        <div className="QRmodal">
                            <div className="QRCode">
                                <QRCode
                                    size={256}
                                    value={`${name}${team}`}
                                />
                            </div>
                            <button onClick={() => setViewQR(false)}>閉じる</button>
                        </div>
                    ) : (
                        <div className="buttons">
                            <button className={getButtonClass()} onClick={() => { setViewQR(true) }}>QRコードの表示</button>
                            <button className={getButtonClass()} onClick={transitionToButton}>応援する</button>
                        </div>
                    )}
                    <button onClick={() => { reset_data() }}>reset</button>
                    <button onClick={() => { toggleLoginState() }}>reModal</button>
                </div>
            )}
        </div>
    );
};

export default Home;
