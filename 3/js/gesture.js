$(document).ready(function() {
    var ctl = new Leap.Controller({enableGestures: true});
    var swiper = ctl.gesture('swipe');
    var totalDistance = 0;
    var tolerance = 5;
    var cooloff = 100;
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
                switch (gesture) {
                    case 'swipe':
                        var xDir = parameter.xDir;
                        var yDir = parameter.yDir;
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
                        }
                        else if (yDir == 1) {
                            switch (app_status) {
                                case 'select_exercise2':
                                    switch_to('select_exercise');
                                    break;
                                default:
                                    switch_to('main');
                                    break;
                            }
                        }
                        console.log('swipe: x='+xDir+', y='+yDir);
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
                                $.UIkit.notify('Swipe up again in 3s to exit.',{timeout:3000,pos:'top-left',status:'danger'});
                            }
                        }
                        else if (yDir == -1 && !isExercise) {
                            if (unlocked_start) {
                                unlocked_start = false;
                                $.UIkit.notify('Start after 1s.',{timeout:1000,pos:'top-left',status:'success'});
                                setTimeout(startExercise, 1000);
                            } else {
                                $.UIkit.notify('Swipe down again in 3s to start.',{timeout:3000,pos:'top-left',status:'warning'});
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
    }, cooloff);

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
