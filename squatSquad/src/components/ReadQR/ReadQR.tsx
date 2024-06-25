import { useZxing } from 'react-zxing';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { IUserInfo } from '../../interfaces/interfaces';
import "./ReadQR.css";

const ReadQR = () => {

    const [readValue, setReadValue] = useState<boolean>(false);
    const [name, setName] = useState<string>("");
    const [team, setTeam] = useState<string>("");

    const navigate = useNavigate();

    const { ref } = useZxing({
        onDecodeResult(result) {
            const text = result.getText();
            setReadValue(true);
            setName(text.substring(0,text.length-1))
            setTeam(text[text.length-1])
            console.log(text)
        },
    })

    const transitionToSquat = () => {
        const data: IUserInfo = { name: name, team: team }
        navigate("/squat", { state: data })
    }


    return (
        <div className='back'>
            {readValue ?
                <div className='backmodal'>    
<<<<<<< HEAD
                    <div className='modal_QRdata'>
=======
                    <div className='modal'>
>>>>>>> bc411384f9d4ed65fb8134108ed2672ad1550ab8
                        <span></span>
                        <div>
                            <p>{team} チーム所属</p>
                            <p>{name} さん</p>
                        </div>
                        <button type='button' onClick={transitionToSquat}>スクワットを始める</button>
                    </div>
                </div>
                :
                <></>
            }
            <div className='videobox'>
                <p>スマホのQRコードをかざしてください</p>
                <video ref={ref} />
            </div>
            
        </div>
    )
}

export default ReadQR
