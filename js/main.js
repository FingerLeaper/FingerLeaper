// renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
var origin = new THREE.Vector3( 0, 0, 0 );
// camera
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.x = 40;
camera.position.y = 130;
camera.position.z = 10;
camera.lookAt(origin);

// scene
var scene = new THREE.Scene();

// draw palm
var palm_size = [46,40];
var palm = new THREE.Mesh(new THREE.CubeGeometry(palm_size[1], 4, palm_size[0]), new THREE.MeshNormalMaterial());
palm.overdraw = true;
scene.add(palm);

// draw fingers
var phalanges = [];
var length = [21, 15, 16, 18, 16, 18, 16, 17, 16, 16];
var width = 6;
var gap_joint = 1;
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
    phalanges[i].position.set(phalange_position[i * 3] - 1000,phalange_position[i * 3 + 1],phalange_position[i * 3 + 2]);
}

var base = new THREE.Mesh(new THREE.CubeGeometry(10,9,15), new THREE.MeshNormalMaterial());
scene.add(base);
base.position.set(0,0,0);
var t = 0;

var origin_direction = new THREE.Vector3( 0, 0, -1);
var origin_norm = new THREE.Vector3( 0,-1, 0);
var origin_palm_position = new THREE.Vector3(0, 0, 0);
var finger_root = [[palm_size[1]/2+gap_finger/2,0,0],
                    [palm_size[1]/2-width/2,    0,  -(palm_size[0]/2+gap_joint/2)],
                    [gap_finger/2+width/2,      0,  -(palm_size[0]/2+gap_joint/2)],
                    [-gap_finger/2-width/2,     0,  -(palm_size[0]/2+gap_joint/2)],
                    [-palm_size[1]/2+width/2,   0,  -(palm_size[0]/2+gap_joint/2)]];

var light = new THREE.DirectionalLight(0xffffff);
light.position.set(0, 300, 0);
light.castShadow = true;
light.shadowCameraLeft = -60;
light.shadowCameraTop = -60;
light.shadowCameraRight = 60;
light.shadowCameraBottom = 60;
light.shadowCameraNear = 1;
light.shadowCameraFar = 1000;
light.shadowBias = -0.0001;
light.shadowMapWidth = light.shadowMapHeight = 1024;
light.shadowDarkness = 0.7;

scene.add(light);

render();
var time = 0;
Leap.loop(function (frame) {
    var date = new Date();
    if (date.getTime() - time > 100) {
        time = date.getTime();
        animate(frame);
    }
    // animate(frame);
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

    var z_axis = new THREE.Vector3().fromArray(hand.direction);
    var y_axis = new THREE.Vector3().fromArray(hand.palmNormal);
    var x_axis = y_axis.clone().cross(z_axis);
    x_axis.setLength(1);

    // obtain the rotate angles for the palm
    var palm_rotate = rotate_para(z_axis, y_axis);

    palm.rotation.set(palm_rotate.x, palm_rotate.y, palm_rotate.z);

    var squence = finger_sequence (hand);
    console.log(squence);

    // TODO: only draw left hand, need to implement right hand
    if (squence[5] == 1)
        return;
    var palm_position = (new THREE.Vector3()).fromArray(hand.palmPosition);

    var ratio0 = 0.5;
    var ratio1 = 0.5;
    var zoom = 0.6;

    for (var i = 0; i < 5; i ++) {
        if (squence[i] == undefined)
            continue;
        var finger = fingers[squence[i]];
        if (finger == undefined)
            continue;

        var rotated_root = new THREE.Vector3();
        var middle_joint = new THREE.Vector3();
        var phalange_direction = new THREE.Vector3();
        var phalange_norm = new THREE.Vector3();
        var phalange_rotation = new THREE.Vector3();
        var finger_direction = new THREE.Vector3().fromArray(finger.direction);
        var tip = (new THREE.Vector3()).fromArray(finger.tipPosition).sub(palm_position).multiplyScalar(zoom);

        rotated_root.add(x_axis.clone().multiplyScalar(finger_root[i][0]));
        rotated_root.sub(y_axis.clone().multiplyScalar(finger_root[i][1]));
        rotated_root.sub(z_axis.clone().multiplyScalar(finger_root[i][2]));

        // console.log(rotated_root);

        middle_joint = tip.clone().sub(finger_direction.clone().multiplyScalar(length[i * 2 + 1] / 2));
        // console.log(middle_joint);

        var position0 = rotated_root.clone().multiplyScalar(1-ratio0).add(middle_joint.clone().multiplyScalar(ratio0));
        phalanges[i * 2].position.set(position0.x,position0.y,position0.z);
        // console.log(position0);

        phalange_direction = middle_joint.clone().sub(position0);
        phalange_norm = phalange_direction.clone().cross(y_axis.clone().cross(phalange_direction));
        phalange_rotation = rotate_para(phalange_direction, phalange_norm);
        phalanges[i * 2].rotation.set(phalange_rotation.x, phalange_rotation.y, phalange_rotation.z);

        var position1 = middle_joint.clone().multiplyScalar(1-ratio1).add(tip.clone().multiplyScalar(ratio1));
        phalanges[i * 2 + 1].position.set(position1.x, position1.y, position1.z);
        // console.log(position1);

        phalange_direction = (new THREE.Vector3()).fromArray(finger.direction);
        phalange_norm = phalange_direction.clone().cross(y_axis.clone().cross(phalange_direction));
        phalange_rotation = rotate_para(phalange_direction, phalange_norm);
        phalanges[i * 2 + 1].rotation.set(phalange_rotation.x, phalange_rotation.y, phalange_rotation.z);

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

    squence = [4,1,0,2,3];
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