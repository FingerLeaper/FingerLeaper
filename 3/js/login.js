function init_login() {
    switch_to('login');
    if (localStorage.getItem('current_user') != undefined) {
        $('#login_banner')[0].innerText = "以当前身份" + localStorage.getItem('current_user') + '登录，请向下挥手';
    } else {
        $('#login_banner')[0].innerText = "";
    }
}

function login(username, password) {
    var text = "[{\"date\": \"2014-03-31\", \"content\": \"训练情况良好，可以继续下一阶段训练\"}, {\"date\": \"2014-03-30\", \"content\": \"注意动作准确度。拇指动作有偏差。\"}]"
    localStorage.setItem('notes', text);
    var notes = JSON.parse(localStorage.getItem('notes'));
    console.log('login');
    init_main();
}

function first_login() {
    var username = $("#username")[0].value;
    var password = $("#password")[0].value;
    localStorage.setItem("current_user", username);
    localStorage.setItem("password", Base64.toBase64(password));
    login(username, password);
}

function logout() {
    localStorage.removeItem("current_user");
    init_login();
}
