document.addEventListener("DOMContentLoaded", function() {
    const btn_r = document.getElementById("ch");
    const list_r = document.querySelector(".team.r .squat");
    const btn_w = document.getElementById("ch_w");
    const list_w = document.querySelector(".team.w .squat");

    const loc = window.location;
    const wsStart = loc.protocol === 'https' ? 'wss://' : 'ws://';
    const wsUrl = wsStart + loc.host + "/ws/consumer";
    const ws = new WebSocket(wsUrl);

    ws.onopen = function(event)
    {
        console.log("WebSocket is open now.");
    };

    ws.onclose = function(event)
    {
        console.log("WebSocket is closed now.");
    };

    ws.onerror = function(event)
    {
        console.error("WebSocket has Error:", event);
    };

    ws.onmessage = async function(event)
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
                document.getElementById("r_name").innerHTML = name;
                change_mode(btn_r, list_r)
            }
            else
            {
                change_mode(btn_w, list_w)
                document.getElementById("b_name").innerHTML = name;
            }
        }
        else if (state == "counting")
        {
            const messageDiv = document.getElementById(id);
            messageDiv.innerHTML = cnt
        }
        else if (state == "end")
        {
            if (id == "r_cnt")
            {
                change_mode(btn_r, list_r)
                fetch("/calculate_score_red", {
                    method: "POST",
                    body : JSON.stringify({
                       cnt: cnt
                    })
                }).then((response) => response.json())
                .then((res) => {
                    const score = res.score
                    const total = res.total
                    document.getElementById("r_pt").innerHTML = total
                })

                document.getElementById("r_result").innerHTML = `結果 :  ${cnt} 回`;
                document.getElementById("r_result").classList.remove("hide");
                await new Promise(resolve => setTimeout(resolve, 10000));
                document.getElementById("r_result").classList.add("hide");
            }
            else
            {
                document.getElementById("w_result").innerHTML = `結果 :  ${cnt} 回`;
                document.getElementById("w_result").classList.remove("hide");
                await new Promise(resolve => setTimeout(resolve, 10000));
                document.getElementById("w_result").classList.add("hide");

                change_mode(btn_w, list_w)
                fetch("/calculate_score_white", {
                    method: "POST",
                    body : JSON.stringify({
                        cnt: cnt
                    })
                }).then((response) => response.json())
                .then((res) => {
                    const score = res.score
                    const total = res.total
                    document.getElementById("b_pt").innerHTML = total
                })
            }
        }
        const messageDiv = document.getElementById(id);
        messageDiv.innerHTML = cnt
    }

    btn_r.addEventListener("click", function() {
        change_mode(btn_r, list_r)
    });

    btn_w.addEventListener("click", function() {
        change_mode(btn_w, list_w)
    });

    function change_mode(btn, list) {
        list.classList.toggle("hide");
        btn.classList.toggle("hide");

        // setTimeout(function() {
        //     list.classList.toggle("hide");
        //     btn.classList.toggle("hide");
        // }, 10000);
    }

});