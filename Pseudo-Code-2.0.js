Leap.loop(step(frame));

int sys_status = 0;
int app_status = 2;
boolean isUserReady = false;
int cur_app_focus = 0;
int countdown_length = 3 * frameRate;
int cur_countdown_status = countdown_length;
int app_length = CONSTANT;
int current_schedule = 0;
Status user_performance = null;

step(frame) {
	switch sys_status:
	case 0:
		switch current_gesture():

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
			user_performance = null;
			app_length = cur_app_length;
			sys_status = 1;
			break;
		default:
			break;
	case 1:
		update_gesture_status();
		if isUserReady == true:
			sys_status == 2;
		else if current_gesture() == 1:
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
			if isUserReady == true:

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
				Store current process;
				app_status = 2;
			break;
		
		// during waiting stage
		case 2:
		
			// if the hands revert to the right position
			if isUserReady == true:
				recover();

			// if a circle gesture is made and restart the exercise
			else if current_gesture() == 2:
				restart();

			// is a pinch gesture is made and return the launchpad
			else if current_gesture() == 1;
				open_launchpad();
			
			break;
		
		// if the exercise has been accomplished and enter the finish stage
		case 3:
			switch current_gesture():
		
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
}

// restart and discard and the process currently stored
restart() {
	app_status = 2;
	user_performance = null;
	current_schedule = 0;
}

// back to exercise stage and continue
recover() {
	app_status = 0;
}

// check pinch gesture status using FSM
update_gesture_status() {

}

// record and check if a pinch gesture is made
pinch_gesture() {
	// TODO
	return false;
}

// return the currently most probab gesture
current_gesture() {
	if pinch_gesture() == true:
		return 1;
	if frame.gesture == circle_gesture:
		return 2;
	if frame.gesture == leftSwipe:
		return 3;
	if frame.gesture == rightSwipe:
		return 4;
	if frame.gesture == kepTap:
		return 5;
	return 0;
}

// return the launchpad page
open_launchpad() {
	app_status = 2;
	user_performance = null;
	current_schedule = 0;
	sys_status = 0;
}
