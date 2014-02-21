int sys_status = 0;
int app_status = 2;
int cur_app_focus = 0;
int countdown_length = 3 * frameRate;
int cur_countdown_status = countdown_length;
int app_length = CONSTANT;
int current_schedule = 0;
var valid_range = [[-20,20],[-16,16]];

var renderer = new THREE.WebGLRenderer();
var origin = new THREE.Vector3( 0, 0, 0 );
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
var scene = new THREE.Scene();
var palm_size = [46,40];
var palm = new THREE.Mesh(new THREE.CubeGeometry(palm_size[1], 4, palm_size[0]), new THREE.MeshNormalMaterial());


// draw fingers
var phalanges = [];
var length = [21, 15, 16, 18, 16, 18, 16, 17, 16, 16];
var width = 6;
var gap_joint = 1;
var gap_finger = (palm_size[1]-4*width)/3;

// default phalange position
var phalange_position = [palm_size[1]/2+gap_finger+width/2,0,0,
                palm_size[1]/2+gap_finger+width/2,0,-(length[0]/2+gap_joint+length[1]/2),

                palm_size[1]/2-width/2,0,-(palm_size[0]/2+gap_joint+length[2]/2),
                palm_size[1]/2-width/2,0,-(palm_size[0]/2+2*gap_joint+length[2]*1.5),

                width/2+gap_finger/2,0,-(palm_size[0]/2+gap_joint+length[4]/2),
                width/2+gap_finger/2,0,-(palm_size[0]/2+2*gap_joint+length[4]*1.5),

                -width/2-gap_finger/2,0,-(palm_size[0]/2+gap_joint+length[6]/2),
                -width/2-gap_finger/2,0,-(palm_size[0]/2+2*gap_joint+length[6]*1.5),

                -palm_size[1]/2+width/2,0,-(palm_size[0]/2+gap_joint+length[8]/2),
                -palm_size[1]/2+width/2,0,-(palm_size[0]/2+2*gap_joint+length[8]*1.5)];

var base = new THREE.Mesh(new THREE.CubeGeometry(10,9,15), new THREE.MeshNormalMaterial());
var origin_direction = new THREE.Vector3( 0, 0, -1);
var origin_norm = new THREE.Vector3( 0,-1, 0);
var origin_palm_position = new THREE.Vector3(0, 0, 0);
var finger_root = [[palm_size[1]/2+gap_finger/2,0,0],
                    [palm_size[1]/2-width/2,    0,  -(palm_size[0]/2+gap_joint/2)],
                    [gap_finger/2+width/2,      0,  -(palm_size[0]/2+gap_joint/2)],
                    [-gap_finger/2-width/2,     0,  -(palm_size[0]/2+gap_joint/2)],
                    [-palm_size[1]/2+width/2,   0,  -(palm_size[0]/2+gap_joint/2)]];

var light = new THREE.DirectionalLight(0xffffff);

var user_performance = [];

function step(frame) {
	// init
	if (frame.hands.length == 0)
		return;
	var hand = frame.hands[0];
	if (hand == undefined)
		return;
	var fingers = hand.pointables;
	if (fingers.length == 0)
		return;
	var gestures = frame.gestures;

	switch sys_status:
	case 0:
		switch current_gesture(frame):

		// right swipe to focus on the previous app
		case 4:
			cur_app_focus --;
			break;

		// left swipe to focus on the next app
		case 3:
			cur_app_focus ++;
			break;
		
		// key tap to select one app
		case 5:
			current_schedule = 0;
			user_performance = [];
			app_length = cur_app_length;
            setup_scene();
			sys_status = 1;
			break;
		default:
			break;
	case 1:
		update_gesture_status();
		if isUserReady() == true:
			sys_status == 2;
		else if current_gesture(frame) == 1:
			open_launchpad();
		break;
	case 2:
		update_gesture_status();
		switch app_status:
		
		// count down to start the exercise
		case 0:
			if cur_countdown_status == 0:
				cur_countdown_status = countdown_length;
				app_status = 1;
			cur_countdown_status --;
			break;
		
		// during exercise
		case 1:
		
			// if the number of hands is 2 and the position of hands is right
			if isUserReady() == true:

				// exercise continue
				current_schedule ++;
				record_user_performance();
				update_model();
				calculate_performance_score();

				// if the exercise reaches the end
				if current_schedule == app_length:
					app_status = 3;

			else:
		
				// the hands lose their position 
				// and the exercise has to suspend and enter the waiting stage
                
				// TODO: Store current process;
				app_status = 2;
			break;
		
		// during waiting stage
		case 2:
		
			// if the hands revert to the right position
			if isUserReady() == true:
				recover();

			// if a circle gesture is made and restart the exercise
			else if current_gesture(frame) == 2:
				restart();

			// is a pinch gesture is made and return the launchpad
			else if current_gesture(frame) == 1;
				open_launchpad();
			
			break;
		
		// if the exercise has been accomplished and enter the finish stage
		case 3:
			switch current_gesture(frame):
		
			// a circle gesture is made
			case 2:
				restart();
				break;
		
			// return the launchpad page
			case 1:
				open_launchpad();
				break;
			break;
		default:
			break;
    update_actions();
}

Leap.loop(function (frame) {
	step(frame);
});

// restart and discard and the process currently stored
function restart() {
	app_status = 2;
	user_performance = null;
	current_schedule = 0;
}

// back to exercise stage and continue
function recover() {
	app_status = 0;
}

// check pinch gesture status using FSM
function update_gesture_status(hand) {

}

// record and check if a pinch gesture is made
function pinch_gesture(hand) {
	if (hand != undefined && hand.fingers < 2) {
		console.log("pinch gesture detected.");
		return true;
	}
	return false;
}

// return the currently most probab gesture
function current_gesture(frame) {
	
	if (frame.gestures.length == 0)
		return 0;
	var gesture = frame.gestures[0];

	if (pinch_gesture(frame.hands[0]) == true) {
		return 1;
	} 
	else if (gesture.type == "circle") {
		return 2;
	} 
	else if (gesture.type == "swipe")
	{
		if (gesture.direction[0] < 0)
			return 3;
		else
			return 4;
	}
	else if (gesture.type == "keyTap") {
		return 5;
	}
	return 0;
}

// return the launchpad page
function open_launchpad() {
	app_status = 2;
	user_performance = null;
	current_schedule = 0;
	sys_status = 0;
}

// store performance of a user
function record_user_performance() {

}

// use the data collected in real-time to update the 3D model
function update_model() {
    renderer();
    animate();
}

// compare the performance of the user and the standard performance 
// and calculate performance score
function calculate_performance_score() {
	int score = 0;
	return score;
}

function isUserReady (hand) {
    if (hand == undefined)
        return false;
    var position = hand.palmPosition;
    if (position[0] > valid_range[0][0] && position[0] < valid_range[0][1] && position[1] > valid_range[1][0] && position[1] < valid_range[1][1])
        return true;
	return false;
}

function update_actions () {
    // body...
}