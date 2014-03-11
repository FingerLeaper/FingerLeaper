// $('.ContentFlow').css('display','none');
var app_status;

function switch_to(name) {
    app_status = name;
    $('.fade').fadeOut(function() {
        setTimeout(function() {
            $('#'+name).fadeIn();
        }, 400);
    });
}

function init_main() {
    switch_to('main');
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
