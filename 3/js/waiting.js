function init_waiting() {
    switch_to('waiting');
    var count = 0;
    var mid_x = window.innerWidth / 2;
    var mid_y = window.innerHeight / 2 - 30;
    var radius = 200;
    var position_x = -1000;
    var position_y = -1000;
    var valid_x= [mid_x - radius,mid_x + radius];
    var valid_y = [mid_y - radius,mid_y + radius];
    var indicator = $('.position_indicator');
    Leap.loop( function( frame ) {
        if (frame.hands.length > 0 && app_status == 'waiting') {
            var hand  = frame.hands[0];
            position_x = (hand.palmPosition[0]) * 5 + mid_x;
            position_y = (-hand.palmPosition[1] - 20) * 5 + mid_y + 500;
            indicator.css({
                display: 'block',
                position: 'absolute',
                top: position_y,
                left: position_x
        });
        }
        else
        {
            position_x = - 1000;
            position_y = - 1000;
            indicator.css({
                display: 'none'
            });

        }
        if (position_x > valid_x[0] && position_x < valid_x[1] && position_y > valid_y[0] && position_y < valid_y[1])
            init_login();
    });
}
