var renderer, scene, camera, controls;
var renderer2, scene2, camera2, controls2;
var reader = new FileReader();
var FPS = 30;
var data, palm, fingers = [];
var data2, palm2, fingers2 = [];
var hand, hand2;
var recordedFrames = [], recordedFrames2 = [];
var currentFrame, currentFrame2;
var isExercise = false;
var isReplaying = false, isRecording = false, frameNum = 0;
var isPaused = false;
var beforeDTW = [], afterDTW = [];
var has_init_exercise = false;
var selected_exercise;

function init_exercise(exercise) {
    switch_to('exercise');
    selected_exercise = exercise;
    if (!has_init_exercise) {
        has_init_exercise = true;
        init();
        animate();
    }
    switch(selected_exercise) {
        case 'index_circle':
            $('#name')[0].innerText = "食指绕环运动";
            break;
        case 'index_wave':
            $('#name')[0].innerText = "食指摆动运动";
            break;
        case 'index_bend':
            $('#name')[0].innerText = "食指弯曲运动";
            break;
    }
}

function sec2str(sec) {
    var min = Math.floor(sec/60);
    sec = Math.floor(sec%60);
    var str = (min<10?'0':'') + min + ':' + (sec<10?'0':'') + sec;
    return str;
}

function init() {
    var css, geometry, material, mesh;
    var geometry2, material2, mesh2;

    var reader = new FileReader();
    $.get( "default.data", function( data ) {
        recordedFrames = JSON.parse(Base64.btou(RawDeflate.inflate(Base64.fromBase64(data))));
        $('#timer2')[0].innerText = sec2str(recordedFrames.length / FPS);
    });
    reader.readAsText("default.data");

    console.log("recordedFrames: " + recordedFrames.length);

    renderer = new THREE.WebGLRenderer( { antialias: true }  );
    renderer.setSize( 0.35 * window.innerWidth, window.innerHeight*0.75 );
    document.getElementById('animation').appendChild( renderer.domElement );
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 40, (0.35 * window.innerWidth) / (window.innerHeight*0.75) , 1, 5000 );
    camera.position.set(-1,40,0);
    controls = new THREE.TrackballControls( camera, renderer.domElement );

    // geometry = new THREE.AxisHelper( 80 );
    // scene.add( geometry );

    geometry = new THREE.PlaneGeometry( 60, 60, 1, 1 );
    geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
    material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide } );
    mesh = new THREE.Mesh( geometry, material );
    mesh.position.set( 0, -20, 0 );
    scene.add( mesh );

    // geometry = new THREE.CubeGeometry( 100, 20, 80 );
    // material = new THREE.MeshNormalMaterial();
    // palm = new THREE.Mesh( geometry, material );
    // palm.castShadow = true;
    // palm.receiveShadow = true;
    // scene.add( palm );

    // geometry = new THREE.CubeGeometry( 16, 12, 20 );
    // material = new THREE.MeshNormalMaterial();
    // for (var j = 0; j < 5; j++) {
    //     mesh = new THREE.Mesh( geometry, material );
    //     mesh.castShadow = true;
    //     mesh.receiveShadow = true;
    //     scene.add( mesh );
    //     fingers.push( mesh );
    // }

    var loader = new THREE.JSONLoader();

    // Load model
    loader.load('js/models/hand_rig.js', function (geometry, materials) {
        var material;

        hand = new THREE.SkinnedMesh(
            geometry,
            new THREE.MeshFaceMaterial(materials)
        );

        material = hand.material.materials;

        for (var i = 0; i < materials.length; i++) {
            var mat = materials[i];
            mat.skinning = true;
        }

        hand.castShadow = true;
        hand.receiveShadow = true;

        scene.add(hand);
        hand.lookAt(v(0,0,-1))

    });

    // Render2

    renderer2 = new THREE.WebGLRenderer( { antialias: true }  );
    renderer2.setSize( 0.35 * window.innerWidth, window.innerHeight*0.75 );
    document.getElementById('animation').appendChild( renderer2.domElement );
    scene2 = new THREE.Scene();

    camera2 = new THREE.PerspectiveCamera( 40, (0.35 * window.innerWidth) / (window.innerHeight*0.75) , 1, 5000 );
    camera2.position.set(-1,40,0);
    controls2 = new THREE.TrackballControls( camera2, renderer2.domElement );

    loader.load('js/models/hand_rig.js', function (geometry, materials) {
        var material;

        hand2 = new THREE.SkinnedMesh(
            geometry,
            new THREE.MeshFaceMaterial(materials)
        );

        material = hand2.material.materials;

        for (var i = 0; i < materials.length; i++) {
            var mat = materials[i];
            mat.skinning = true;
        }

        hand2.castShadow = true;
        hand2.receiveShadow = true;

        scene2.add(hand2);
        hand2.lookAt(v(0,0,-1))
    });

    geometry2 = new THREE.PlaneGeometry( 60, 60, 1, 1 );
    geometry2.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
    material2 = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide } );
    mesh2 = new THREE.Mesh( geometry2, material2 );
    mesh2.position.set( 0, -20, 0 );
    scene2.add( mesh2 );

    // geometry2 = new THREE.CubeGeometry( 100, 20, 80 );
    // material2 = new THREE.MeshNormalMaterial();
    // palm2 = new THREE.Mesh( geometry2, material2 );
    // palm2.castShadow = true;
    // palm2.receiveShadow = true;
    // scene2.add( palm2 );

    // geometry2 = new THREE.CubeGeometry( 16, 12, 20 );
    // material2 = new THREE.MeshNormalMaterial();
    // for (var j = 0; j < 5; j++) {
    //     mesh2 = new THREE.Mesh( geometry2, material2 );
    //     mesh2.castShadow = true;
    //     mesh2.receiveShadow = true;
    //     scene2.add( mesh2 );
    //     fingers2.push( mesh2 );
    // }

    Leap.loop( function( frame ) {
        if (!isPaused) {
            currentFrame = frame;
        }
    });

    setInterval(playFrame, 1000/FPS);

    setInterval(function() {
        console.log("update score");
        if (isExercise) {
            $('#current')[0].innerText = ((1 - distance(currentFrame, recordedFrames[frameNum]))*100).toFixed(1);
            $('#average')[0].innerText = (100 - (total/(frameNum+1)*100)).toFixed(1);
        }
    }, 300);
}

function saveFile() {
    var out = Base64.toBase64(RawDeflate.deflate(Base64.utob(JSON.stringify(recordedFrames))));
    var blob = new Blob( [ out ] , {type: "text/plain;charset=utf-8"} );
    saveAs(blob, 'leapmotion.data');
}

function saveFile2() {
    var out = Base64.toBase64(RawDeflate.deflate(Base64.utob(JSON.stringify(recordedFrames2))));
    var blob = new Blob( [ out ] , {type: "text/plain;charset=utf-8"} );
    saveAs(blob, 'leapmotion.data');
}

function readFile(that){
    if ( that.files && that.files[0]){
        var reader = new FileReader();
        reader.onload = function (e) {
            recordedFrames = JSON.parse(Base64.btou(RawDeflate.inflate(Base64.fromBase64(e.target.result))));
        };
        reader.readAsText(that.files[0]);
    }
}

function readFile2(that){
    if ( that.files && that.files[0]){
        var reader = new FileReader();
        reader.onload = function (e) {
            recordedFrames2 = JSON.parse(Base64.btou(RawDeflate.inflate(Base64.fromBase64(e.target.result))));
        };
        reader.readAsText(that.files[0]);
    }
}
var total;
function playFrame() {
    if (app_status != 'exercise') {
        return;
    }
    if (!currentFrame) {
        return;
    }
    if (currentFrame.hands.length<1 || currentFrame.pointables.length<5){
        return;
    }
    if (isExercise) {
        playLoop(tr(currentFrame), hand2);
        playLoop(recordedFrames[frameNum], hand);
        if (!isPaused) {
            total += distance(currentFrame, recordedFrames[frameNum]);
            frameNum++;
            $('#timer1')[0].innerText = sec2str(frameNum / FPS);
            recordedFrames2.push(tr(currentFrame));
        }
        if (frameNum >= recordedFrames.length) {
            $('#timer1')[0].innerText = sec2str(0);
            isExercise = false;
            $('#overlay').fadeIn();
        }
        return;
    }
    if (isReplaying) {
        if (frameNum < recordedFrames2.length) {
            playLoop(recordedFrames2[frameNum], hand2);
            // puts(distance(recordedFrames[frameNum], recordedFrames2[frameNum]));
        } else {
            playLoop(tr(currentFrame), hand2);
        }
        playLoop(recordedFrames[frameNum], hand);
        if (!isPaused) {
            frameNum++;
        }
        if (frameNum >= recordedFrames.length) {
            toggleReplay();
        }
        return;
    }
    if (isRecording) {
        recordedFrames.push(tr(currentFrame));
    }
    playLoop(tr(currentFrame), hand);
    playLoop(tr(currentFrame), hand2);
}

function similarities() {
    var s = [];
    for (var i = 0; i < recordedFrames.length && i < recordedFrames2.length; i++) {
        s.push(similarity(recordedFrames[i], recordedFrames2[i]));
    }
    return s;
}

function tr(frame) {
    // return {"hands":frame.data.hands, "pointables":frame.data.pointables};
    tr_frame = {
        "hands": [],
        "pointables": []
    };
    var handDir = v(0,0,-1);
    if (frame.hands.length > 0) {
        var d = frame.hands[0].direction;
        handDir = vv(d);
    }
    for (var i = 0; i < frame.hands.length; i++) {
        tr_frame.hands.push({
            'stabilizedPalmPosition':normVec(frame.hands[0].stabilizedPalmPosition, handDir),
            'palmNormal':normVec(frame.hands[0].palmNormal, handDir)
        });
    }
    for (var i = 0; i < frame.pointables.length; i++) {
        tr_frame.pointables.push({
            'direction':normVec(frame.pointables[i].direction, handDir),
            'stabilizedTipPosition':normVec(frame.pointables[i].stabilizedTipPosition, handDir),
            'length':frame.pointables[i].length
        });
    }
    tr_frame.pointables.sort(sortPointable);
    return tr_frame;
}

function puts(str) {
    $('#notifier')[0].innerText = str;
}

function toggleReplay() {
    if (recordedFrames.length == 0) {
        textareaOutput.value = 'No recorded frames.';
        return;
    }
    frameNum = 0;
    isReplaying = !isReplaying;
    textareaOutput.value = isReplaying ? 'Replaying...':'';
}

// Press spacebar to toggle pause
window.onkeypress = function(e) {
    if (e.charCode == 32) {
        if (!isRecording && !isExercise) {
            isPaused = !isPaused;
            textareaOutput.value = isPaused ? 'Paused':'';
        }
    }
};

function toggleRecording() {
    isRecording = !isRecording;
    textareaOutput.value = isRecording ? 'Recording...':'';
    if (isRecording) {
        recordedFrames = [];
    }
}

function normVec(vec, handDir) {
    // Rotate a vector to eliminate the effect of different hand direction
    // Hand direction will be fixed at (0,0,-1)
    var vec3 = vv(vec);
    var n = v(0,0,-1);
    var a = new THREE.Vector3();
    a.crossVectors(handDir, n); // a = handDir x n
    a.normalize();
    if (a.length() > 0) {
        vec3.applyAxisAngle(a, handDir.angleTo(n));
    }
    return [vec3.x,vec3.y,vec3.z];
}

// function playLoop( frame, palm, fingers ) {
//     var hand, direction, len, finger, pointable;
//     if ( frame.hands.length > 0) {
//         hand = frame.hands[0];
//         palm.position.set( hand.stabilizedPalmPosition[0], hand.stabilizedPalmPosition[1], hand.stabilizedPalmPosition[2] );
//         direction = v(0,0,-1);
//         palm.lookAt( direction.add( palm.position ) );
//         roll = Math.atan2( hand.palmNormal[0], hand.palmNormal[1] );
//         palm.rotation.z = roll;
//         palm.visible = true;
//     } else {
//         palm.visible = false;
//     }

//     len = frame.pointables.length
//     if ( len > 0) {
//         palm.hasFingers = true;
//         for (var i = 0; i < 5; i++) {
//             finger = fingers[i];
//             if ( i < len ) {
//                 pointable = frame.pointables[i];
//                 finger.position.set( pointable.stabilizedTipPosition[0], pointable.stabilizedTipPosition[1], pointable.stabilizedTipPosition[2] );
//                 direction = vv(pointable.direction);  // best so far
//                 finger.lookAt( direction.add( finger.position ) );
//                 finger.scale.z = 0.05 * pointable.length;
//                 finger.visible = true;
//             } else {
//                 fingers[i].visible = false;
//             }
//         }
//     } else if ( palm.hasFingers ) {
//         for (var i = 0; i < 5; i++) {
//             fingers[i].visible = false;
//         }
//         palm.hasFingers = false;
//     }
// }

function playLoop(frame, handMesh) {
    if (frame.hands.length > 0) { // do stuff if at least one hand is detected
        var leapHand = frame.hands[0], // grab the first hand
            l = frame.pointables, // grab fingers
            handObj, fingersObj;
        var leapFingers = [l[2],l[3],l[1],l[4],l[0]];
        // grab, structure and apply hand position data
        handObj = {
            position: {
                z: 0,
                y: 0,
                x: 0
            },
            rotation: {
                z: leapHand.palmNormal[2],
                y: leapHand.palmNormal[0],
                x: -Math.atan2(leapHand.palmNormal[0], leapHand.palmNormal[1]) + Math.PI
            },
            update: function() {
                var VectorDir = new THREE.Vector3(0,0,-1);
                handMesh.lookAt(VectorDir.add(handMesh.position)); // setup view
                handMesh.position = this.position; // apply position
                handMesh.bones[1].rotation.set(this.rotation.x, this.rotation.y, this.rotation.z); // apply rotation
            }
        };

        // grab, structure and apply fingers position data
        fingersObj = {
            update: function (boneNum, fingerNum, isThumb) {
                var bone = handMesh.bones[boneNum], // define main bone
                    phalanges = [handMesh.bones[boneNum+1], handMesh.bones[boneNum+2]], // define phalanges bones
                    finger = leapFingers[fingerNum]; // grab finger
                if (!finger) return;
                var dir = finger.direction; // grab direction

                // if current finger is thumb, use only one additional phalange
                if (!!isThumb) {
                    phalanges = [handMesh.bones[boneNum+1]];
                }

                // make sure fingers won't go into weird position
                for (var i = 0, length = dir.length; i < length; i++) {
                    if (dir[i] >= 0.1) {
                        dir[i] = 0.1;
                    }
                }

                bone.rotation.set(0, -dir[0], -dir[1]); // apply rotation to the main bone

                // apply rotation to additional phalanges
                for (var i = 0, length = phalanges.length; i < length; i++) {
                    var phalange = phalanges[i];

                    phalange.rotation.set(0, 0, -dir[1]);
                }
            },

            /*
             * define each finger and update its position
             * passing main bone number and finger number
             */
            fingers: {
                pinky: function() {
                    fingersObj.update(3, 3);
                },
                ring: function() {
                    fingersObj.update(7, 1);
                },
                mid: function() {
                    fingersObj.update(11, 0);
                },
                index: function() {
                    fingersObj.update(15, 2);
                },
                thumb: function() {
                    fingersObj.update(19, 4, true);
                }
            },

            // update all fingers function
            updateAll: function() {
                var fingers = this.fingers;

                for (var finger in fingers) {
                    fingers[finger]();
                }
            }
        };

        handObj.update(); // update hand postion

        // update fingers position if all five fingers are detected
        if (leapFingers.length === 5) {
            fingersObj.updateAll();
        }
    }
}

function distance(frame1, frame2) {
    dist = 0;
    for (var i = 0; i < 5; i++) {
        if (frame1.pointables[i] == undefined || frame2.pointables[i] == undefined)
            continue;
        dist += Math.sqrt(1-min(1,sq(vv(frame1.pointables[i].direction).dot(vv(frame2.pointables[i].direction)))));
    }
    return dist/5;
}

function similarity(frame1, frame2) {
    dist = 0;
    for (var i = 0; i < 5; i++) {
        dist += vv(frame1.pointables[i].direction).dot(vv(frame2.pointables[i].direction));
    }
    return dist/5;
}

function sortPointable(p1, p2) {
    return p1.stabilizedTipPosition[0] - p2.stabilizedTipPosition[0];
}

function startExercise() {
    if (recordedFrames.length > 0) {
        recordedFrames2 = [];
        frameNum = 0;
        total = 0;
        isExercise = true;
        $('#overlay').fadeOut();
    } else {
        textareaOutput.value = 'No recorded frames';
    }
}

function max(a,b) {return a>b?a:b;}
function min(a,b) {return a>b?b:a;}

Array.prototype.max = function() {
  return Math.max.apply(null, this);
};

Array.prototype.min = function() {
  return Math.min.apply(null, this);
};

Array.prototype.maxpos = function() {
  return this.indexOf(this.max());
};

Array.prototype.minpos = function() {
  return this.indexOf(this.min());
};

var pair;

function DTW(arr1, arr2) {
    var dist = [], pos = [];
    pair = [];
    var n = arr1.length, m = arr2.length;
    var l = 10;
    var t = 2;
    for (var i = 0; i <= n; i++) {
        dist[i] = [];
        pos[i] = [];
        for (var j = 0; j <= m; j++) {
            dist[i][j] = 100*max(n,m); // A big enough number
        }
    }
    for (var i = 1; i <= n; i++) {
        for (var j = max(1,i-l); j <= min(m,i+l) ; j++) {
            if (i == 1) {
                dist[i][j] = 0;
            } else {
                dist[i][j] = dist[i-1].slice([1,i-l,j-t].max(),j+1).min();
                pos[i][j] = dist[i-1].slice([1,i-l,j-t].max(),j+1).minpos() + [1,i-l,j-t].max();
            }
        }
        for (var j = max(1,i-l); j <= min(m,i+l) ; j++) {
            dist[i][j] += distance(arr1[i-1], arr2[j-1]);
        }
    }
    j = m;
    for (var i = n-1; i >= 0; i--) {
        pair[i] = j-1;
        j = pos[i+1][j];
    }
    return pair;
}

function applyDTW() {
    if (recordedFrames2.length == 0) return;
    if (afterDTW.length == 0) {
        beforeDTW = recordedFrames2;
        var pair = DTW(recordedFrames, recordedFrames2);
        for (var i = 0; i < recordedFrames2.length; i++) {
            afterDTW[i] = recordedFrames2[pair[i]];
        }
    }
    recordedFrames2 = afterDTW;
}

function cancelDTW() {
    if (beforeDTW.length == 0) {
        return;
    } else {
        recordedFrames2 = beforeDTW;
    }
}

function sq(x) {
    return x*x;
}

function animate() {
    requestAnimationFrame( animate );
    controls.update();
    renderer.render( scene, camera );
    controls2.update();
    renderer2.render( scene2, camera2 );
}

function v( x, y, z ){ return new THREE.Vector3( x, y, z ); }
function vv(v) {
    return new THREE.Vector3(v[0], v[1], v[2]);
}
