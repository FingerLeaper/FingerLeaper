$('ul#minutes-tens').roundabout({
    easing: 'easeOutExpo',
    shape: 'waterWheel',
    startingChild: 0,
    minScale: 1
});
$('ul#minutes-ones').roundabout({
    easing: 'easeOutExpo',
    shape: 'waterWheel',
    startingChild: 0,
    minScale: 1
});

$('ul#seconds-tens').roundabout({
    easing: 'easeOutExpo',
    shape: 'waterWheel',
    startingChild: 0,
    minScale: 1
});
$('ul#seconds-ones').roundabout({
    easing: 'easeOutExpo',
    shape: 'waterWheel',
    startingChild: 0,
    minScale: 1
});

$('ul#minutes-tens').roundabout("animateToChild", breakdown.minutesTens);
$('ul#minutes-ones').roundabout("animateToChild", breakdown.minutesOnes);
$('ul#seconds-tens').roundabout("animateToChild", breakdown.secondsTens);
$('ul#seconds-ones').roundabout("animateToChild", breakdown.secondsOnes);
