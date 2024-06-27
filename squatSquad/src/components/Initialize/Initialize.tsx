import { error } from 'console'
import React from 'react'

function Initialize() {

    const DESTROY_ALL = () => {
        fetch("/destroy", {
            method: "DELETE",
        }).then(() => {
            alert("アプリを初期化しました。")
        }).catch(e => {
            console.log(e);
        })
    }

    return (
        <div>
            全ての情報をリセットします。
            <button onClick={DESTROY_ALL}>
                全て削除
            </button>
        </div>
    )
}

export default Initialize
