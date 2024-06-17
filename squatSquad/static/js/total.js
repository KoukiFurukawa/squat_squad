document.addEventListener("DOMContentLoaded", function() {
    const btn_r = document.getElementById("ch");
    const list_r = document.querySelector(".team.r .squat");
    const btn_w = document.getElementById("ch_w");
    const list_w = document.querySelector(".team.w .squat");

    btn_r.addEventListener("click", function() {
        change_mode(btn_r, list_r)
    });

    btn_w.addEventListener("click", function() {
        change_mode(btn_w, list_w)
    });

    function change_mode(btn, list) {
        list.classList.toggle("hide");
        btn.classList.toggle("hide");

        setTimeout(function() {
            list.classList.toggle("hide");
            btn.classList.toggle("hide");
        }, 10000);
    }
});