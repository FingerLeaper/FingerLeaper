// $('.ContentFlow').css('display','none');
var app_status;
var notes;

function switch_to(name) {
    app_status = name;
    $('.fade').fadeOut(function() {
        setTimeout(function() {
            $('#'+name).fadeIn();
        }, 400);
    });
}

function init_main() {
    $('#welcome')[0].innerText = "欢迎回来, " + localStorage.getItem('current_user');
    switch_to('main');
    notes = JSON.parse(localStorage.getItem('notes'));
    $.UIkit.notify("最新医嘱:" + notes[0].content ,{timeout:5000,pos:'top-left'});
}

function init_game() {
    switch_to('game');
}

$(document).ready(function() {
    // init_log();
    init_waiting();

    // init_exercise();
    $('.roundabout').roundabout();
});
