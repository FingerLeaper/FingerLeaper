function init_select_exercise() {
    switch_to('select_exercise');
    $.UIkit.notify("当前医生建议动作:食指弯曲运动" ,{timeout:5000,pos:'top-left'});
}

function init_select_exercise2(name) {
    switch_to(name);
    app_status = 'select_exercise2';
}
