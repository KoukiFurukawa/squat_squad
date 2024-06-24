import { useZxing } from 'react-zxing';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { IUserInfo } from '../../interfaces/interfaces';

const ReadQR = () => {

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

    const transitionToSquat = () =>
    {
        const data: IUserInfo = { name: name, team: team }
        navigate("/squat", { state: data})
    }
    

    return (
        <div>
            { readValue ?
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
