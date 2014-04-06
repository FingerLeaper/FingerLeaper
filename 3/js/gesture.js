$(document).ready(function() {
    var ctl = new Leap.Controller({enableGestures: true});
    var swiper = ctl.gesture('swipe');
    var totalDistance = 0;
    var tolerance = 4;
    var cooloff = 200;
    var unlocked = false;
    var unlocked_start = false;

    ctl.on('gesture', function (gesture,frame) {
        if (gesture.type == 'circle') {
            handleGesture('circle')
        }
        // console.log(gesture.type + " with ID " + gesture.id + " in frame " + frame.id);
    });

    var handleGesture = _.debounce(function(gesture, parameter) {
        switch (app_status) {
            case 'main':
            case 'select_exercise':
            case 'select_exercise2':
            case 'game':
            case 'log':
            case 'login':
            case 'note':
                switch (gesture) {
                    case 'swipe':
                        var xDir = parameter.xDir;
                        var yDir = parameter.yDir;
                        console.log('swipe: x='+xDir+', y='+yDir);
                        if (xDir == 1) {
                            // Swipe left
                            $('.roundabout:visible').roundabout("animateToPreviousChild")
                        }
                        else if (xDir == -1) {
                            // Swipe right
                            $('.roundabout:visible').roundabout("animateToNextChild")
                        }
                        else if (yDir == -1) {
                            // Swipe downwards
                            $('.roundabout-in-focus:visible').click()
                            if (app_status == 'login' && localStorage.getItem('current_user') != undefined) {
                                var username = localStorage.getItem('current_user');
                                var password = Base64.fromBase64(localStorage.getItem('password'));
                                login(username, password);
                            }
                        }
                        else if (yDir == 1) {
                            switch (app_status) {
                                case 'select_exercise2':
                                    switch_to('select_exercise');
                                    break;
                                case 'main':
                                case 'login':
                                    break;
                                default:
                                    switch_to('main');
                                    break;
                            }
                        }
                        break;
                    case 'keyTap':
                        $('.roundabout-in-focus:visible').click()
                        console.log('keyTap');
                        break;
                    case 'circle':
                        console.log('circle');
                        break;
                }
                break;
            case 'exercise':
                switch (gesture) {
                    case 'swipe':
                        var xDir = parameter.xDir;
                        var yDir = parameter.yDir;
                        if (yDir == 1 && !isExercise) {
                            // Swipe upward
                            if (unlocked) {
                                switch_to('main');
                                unlocked = false;
                            } else {
                                unlocked = true;
                                setTimeout(function() {
                                    unlocked = false;
                                }, 3000);
                                $.UIkit.notify('3s 内再次向上挥手退出',{timeout:3000,pos:'top-left',status:'danger'});
                            }
                        }
                        else if (yDir == -1 && !isExercise) {
                            if (unlocked_start) {
                                unlocked_start = false;
                                $.UIkit.notify('1s 后开始',{timeout:1000,pos:'top-left',status:'success'});
                                setTimeout(startExercise, 1000);
                            } else {
                                $.UIkit.notify('3s 内再次向下挥手开始',{timeout:3000,pos:'top-left',status:'warning'});
                                unlocked_start = true;
                                setTimeout(function() {
                                    unlocked_start = false;
                                }, 3000);
                            }
                        }
                        console.log('swipe: x='+xDir+', y='+yDir);
                        break;
                    case 'circle':
                        console.log('circle');
                        break;
                }
                break;
            case 'log':
                break;
            case 'game':
                break;
        }
    }, cooloff, true);

    swiper.update(function(g) {
        if (Math.abs(g.translation()[0]) > tolerance || Math.abs(g.translation()[1]) > tolerance) {
            var xDir = Math.abs(g.translation()[0]) > tolerance ? (g.translation()[0] > 0 ? -1 : 1) : 0;
            var yDir = Math.abs(g.translation()[1]) > 5 ? (g.translation()[1] > 0 ? -1 : 1) : 0;
            if (yDir && Math.abs(g.translation()[1]) > Math.abs(g.translation()[0])) {
                xDir = 0;
            }
            handleGesture('swipe', {'xDir':xDir, 'yDir':yDir});
        }
    });

    ctl.connect();
});
