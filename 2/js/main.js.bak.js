// renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
var origin = new THREE.Vector3( 0, 0, 0 );
// camera
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.x = 0;
camera.position.y = 70;
camera.position.z = 300;
camera.lookAt(origin);

// scene
var scene = new THREE.Scene();

// draw palm
var palm_size = [40,36];
var palm = new THREE.Mesh(new THREE.CubeGeometry(36, 4, 40), new THREE.MeshNormalMaterial());
palm.overdraw = true;
scene.add(palm);

// draw fingers
var phalanges = [];
var length = [15, 14, 18, 18, 20, 20, 18, 18, 16, 16];
var width = 5;
var gap_joint = 2;
var gap_finger = (palm_size[1]-4*width)/3;
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

for (var i = 0; i < 10; i ++) {
    var phalange = new THREE.Mesh(new THREE.CubeGeometry(width, width, length[i]), new THREE.MeshNormalMaterial());
    phalanges[i] = phalange;
    scene.add(phalanges[i]);
    phalanges[i].position.set(phalange_position[i * 3],phalange_position[i * 3 + 1],phalange_position[i * 3 + 2]);
}
var t = 0;

var origin_direction = new THREE.Vector3( 0, 0, -1);
var origin_norm = new THREE.Vector3( 0,-1, 0);
var origin_palm_position = new THREE.Vector3(0, 0, 0);
var finger_root = [[length[0]/2+gap_joint/2,palm_size[1]/2+gap_finger/2,0],
                    [-(palm_size[0]/2+gap_joint/2), palm_size[1]-width/2,0],
                    [-(palm_size[0]/2+gap_joint/2), gap_finger/2+width/2,0],
                    [-(palm_size[0]/2+gap_joint/2), -gap_finger/2-width/2,0],
                    [-(palm_size[0]/2+gap_joint/2), -palm_size[1]+width/2,0]];
render();
var time = 0;
Leap.loop(function (frame) {
    var date = new Date();
    if (date.getTime() - time > 100) {
        time = date.getTime();
        animate(frame);
    }
});

// this function is executed on each animation frame
function animate(frame){
    // render
    palm.position = origin_palm_position;
    if (frame.hands.length == 0)
        return;
    var hand = frame.hands[0];
    if (hand == undefined || hand.pointables.length == 0)
        return;
    var fingers = hand.pointables;

    // new basis for the rotated coordinate system
    var z_direction0 = hand.direction;
    var y_direction0 = hand.palmNormal;
    var x_direction0 = (new THREE.Vector3()).crossVectors((new THREE.Vector3(y_direction0[0],y_direction0[1],y_direction0[2])), (new THREE.Vector3(z_direction0[0],z_direction0[1],z_direction0[2])));

    // normalize x_direction0
    var sum = 0;
    length = Math.sqrt(x_direction0.x * x_direction0.x + x_direction0.y * x_direction0.y + x_direction0.z * x_direction0.z);
    x_direction0.x = x_direction0.x / length;
    x_direction0.y = x_direction0.y / length;
    x_direction0.z = x_direction0.z / length;
    var x_axis = new THREE.Vector3(x_direction0.x,x_direction0.y,x_direction0.z);
    var y_axis = new THREE.Vector3(y_direction0.x,y_direction0.y,y_direction0.z);
    var z_axis = new THREE.Vector3(z_direction0.x,z_direction0.y,z_direction0.z);

    // obtain the rotate angles for the palm
    var palm_rotate = rotate_para(z_direction0, y_direction0);

    palm.rotation.x = palm_rotate[0];
    palm.rotation.y = palm_rotate[1];
    palm.rotation.z = palm_rotate[2];
    var squence = finger_sequence (hand);

    // TODO: only draw left hand, need to implement right hand
    if (squence[5] == 1)
        return;
    var palm_position = (new THREE.Vector3(hand.palmPosition[0],hand.palmPosition[1],hand.palmPosition[2]));
    for (var i = 0; i < 5; i ++) {
        // TODO: obtain the position and rotate angles for each phalange
        console.log("");
        var rotated_root = new THREE.Vector3()
        var x_base = new THREE.Vector3();

        console.log(x_axis);
        console.log(y_axis);
        console.log(z_axis);
        rotated_root.x = x_axis.x * finger_root[i][0] + y_axis.x * finger_root[i][1] + z_axis.x * finger_root[i][2];
        rotated_root.y = x_axis.y * finger_root[i][0] + y_axis.y * finger_root[i][1] + z_axis.y * finger_root[i][2];
        rotated_root.z = x_axis.z * finger_root[i][0] + y_axis.z * finger_root[i][1] + z_axis.z * finger_root[i][2];

        console.log(rotated_root);

        var middle_joint = new THREE.Vector3();
        if (squence[i] == undefined)
            continue;

        var finger = fingers[squence[i]];
        if (finger == undefined)
            continue;
        middle_joint = (new THREE.Vector3(finger.tipPosition[0],finger.tipPosition[1],finger.tipPosition[2])).sub(palm_position).sub((new THREE.Vector3(finger.direction[0],finger.direction[1],finger.direction[2])).multiplyScalar(length[i * 2]));
        console.log(middle_joint);

        var position0 = rotated_root.clone().add(middle_joint).multiplyScalar(0.5);
        
        console.log(position0);
        // phalanges[i * 2].position.x = position0.x;
        // phalanges[i * 2].position.y = position0.y;
        // phalanges[i * 2].position.z = position0.z;

        // TODO: get rotate angle
        var phalange_direction = middle_joint.clone().sub(position0);
        var phalange_norm = (new THREE.Vector3()).crossVectors(phalange_direction, (new THREE.Vector3()).crossVectors((new THREE.Vector3()).fromArray(y_direction0), phalange_direction));
        console.log(phalange_norm);
        var phalange_rotate = rotate_para(phalange_direction, phalange_norm);
        console.log(phalange_rotate);
        // phalanges[i * 2].rotation.x = phalange_rotate.x;
        // phalanges[i * 2].rotation.y = phalange_rotate.y;
        // phalanges[i * 2].rotation.z = phalange_rotate.z;

        var position1 = (new THREE.Vector3()).fromArray(finger.tipPosition).sub(palm_position).add(middle_joint).multiplyScalar(0.5);
        phalanges[i * 2 + 1].position.x = position1.x;
        phalanges[i * 2 + 1].position.y = position1.y;
        phalanges[i * 2 + 1].position.z = position1.z;
        console.log(position1);
        
        // TODO: get rotate angle
        phalange_direction = (new THREE.Vector3()).fromArray(finger.direction);
        phalange_norm = (new THREE.Vector3()).crossVectors(phalange_direction, (new THREE.Vector3()).crossVectors((new THREE.Vector3()).fromArray(y_direction0), phalange_direction));
        phalange_rotate = rotate_para(phalange_direction, phalange_norm);

        phalanges[i * 2 + 1].rotation.x = phalange_rotate.x;
        phalanges[i * 2 + 1].rotation.y = phalange_rotate.y;
        phalanges[i * 2 + 1].rotation.z = phalange_rotate.z;
        console.log(phalange_rotate);
    }
}

function render() {
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

function rotate_para (dst_direction, dst_norm) {
    var rotate_angles = new THREE.Vector3(0, 0, 0);

    // TODO: figure out the angles needed to rotate
    rotate_angles.x = Math.atan(dst_norm.z/dst_norm.y);

    var dir0 = new THREE.Vector3(0, -dst_norm.z, dst_norm.y);
    rotate_angles.y = dir0.angleTo(new THREE.Vector3(dst_direction.x, dst_direction.y, dst_direction.z));
    if (dst_direction.x > 0)
        rotate_angles.y = -rotate_angles.y;
    rotate_angles.z = Math.atan(dst_norm.x/Math.sqrt(dst_norm.z*dst_norm.z+dst_norm.y*dst_norm.y));
    return rotate_angles;
}

function finger_sequence (hand) {

    var fingers = hand.pointables;
    var direction = (new THREE.Vector3()).fromArray(hand.direction);
    var palm_position = (new THREE.Vector3()).fromArray(hand.palmPosition);
    var min = 99999;
    var squence = new Array(6); // squence[5] = 0: left hand; =1:right hand

    for (var i = 0; i < 5; i ++)
        squence[i] = i;
    squence[5] = 0;
    return squence;

    var m = -1;

    // find the middle finger
    for (var i = 0; i < fingers.length; i ++) {
        var relative_position = new THREE.Vector3();
        var tip_position = (new THREE.Vector3()).fromArray(fingers[i].tipPosition);
        relative_position.subVectors(tip_position, palm_position);
        var d_square = Math.pow(relative_position.x, 2) + Math.pow(relative_position.y, 2) + Math.pow(relative_position.z, 2)
        -(direction.dot(relative_position));
        if (d_square < min) {
            m = i;
            min = d_square;
            squence[2] = i;
        }
    }
    console.log("middle finger index: " + m);

    // divide other fingers into two groups
    var left_fingers = [];
    var right_fingers = [];
    for (var i = 0; i < fingers.length; i ++) {
        if (i == m)
            continue;
        if (fingers[i].tipPosition[0] > fingers[m].tipPosition[0])
            right_fingers[right_fingers.length] = i;
        else
            left_fingers[left_fingers.length] = i;
    }

    console.log("left_fingers: " + left_fingers);
    console.log("right_fingers: " + right_fingers);
    if (left_fingers.length > right_fingers.length) {
        squence[5] = 0;
        if (left_fingers.length == 1) {
            squence[3] = left_fingers[0];
        } else {
            if (fingers[left_fingers[0]].tipPosition[0] > fingers[left_fingers[1]].tipPosition[0]) {
                squence[3] = left_fingers[0];
                squence[4] = left_fingers[1];
            } else {
                squence[3] = left_fingers[1];
                squence[4] = left_fingers[0];
            }
            if (right_fingers.length == 1)
                squence[1] = right_fingers[0];
        }
    } else if (left_fingers.length < right_fingers.length) {
        squence[5] = 1;
        if (right_fingers.length == 1) {
            squence[3] = right_fingers[0];
        } else {
            if (fingers[right_fingers[0]].tipPosition[0] > fingers[right_fingers[1]].tipPosition[0]) {
                squence[3] = right_fingers[1];
                squence[4] = right_fingers[0];
            } else {
                squence[3] = right_fingers[0];
                squence[4] = right_fingers[1];
            }
            if (left_fingers.length == 1)
                squence[1] = left_fingers[0];
        }
    } else {
        if (left_fingers.length < 2) {
            return squence;
        }
        if (fingers[left_fingers[0]].tipPosition[0] < fingers[left_fingers[1]].tipPosition[0]) {
            var t = left_fingers[0];
            left_fingers[0] = left_fingers[1];
            left_fingers[1] = t;
        }
        if (fingers[right_fingers[0]].tipPosition[0] > fingers[right_fingers[1]].tipPosition[0]) {
            var t = right_fingers[0];
            right_fingers[0] = right_fingers[1];
            right_fingers[1] = t;
        }

        if (fingers[right_fingers[1]].length > fingers[left_fingers[1]].length) {
            squence[5] = 1;
            squence[0] = left_fingers[1];
            squence[1] = left_fingers[0];
            squence[3] = right_fingers[0];
            squence[4] = right_fingers[1];
        } else {
            squence[5] = 0;
            squence[0] = right_fingers[1];
            squence[1] = right_fingers[0];
            squence[3] = left_fingers[0];
            squence[4] = left_fingers[1];
        }
    }

    return squence;
}