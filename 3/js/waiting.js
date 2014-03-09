function init_waiting() {
    switch_to('waiting');
    var count = 0;
    Leap.loop( function( frame ) {
        if (frame.hands.length > 0 && app_status == 'waiting') {
            count++;
            if (count >= 30) {
                init_main();
            }
        }
    });
}
