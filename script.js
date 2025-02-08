import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RectAreaLightHelper } from "three/addons/helpers/RectAreaLightHelper.js";
import GUI from "https://cdn.jsdelivr.net/npm/lil-gui@0.20/+esm";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.172.0/examples/jsm/loaders/GLTFLoader.js"; // ✅ Use CDN
import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@0.172.0/examples/jsm/loaders/FBXLoader.js';


// ==============================================
// Scene, Camera, Renderer Setup and orbit controlls
// ==============================================
let canvas = document.querySelector(".webgl");
let scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

let sizes = { width: window.innerWidth, height: window.innerHeight };

let camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(0, 8, 40);
scene.add(camera);

let renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
document.body.appendChild(renderer.domElement);

let controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.minDistance = 5;  
controls.maxDistance = 38; 
controls.dampingFactor = 0.05;


// ==========================
// Loaders for Models and Textures
// ==========================
const loader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();

// Wall and Floor Textures
const wallTextures = [
    textureLoader.load("./wall textures/wall-texture1.jpg"),
    textureLoader.load("./wall textures/wall-texture2.jpg"),
    textureLoader.load("./wall textures/wall-texture3.jpg"),
    textureLoader.load("./wall textures/wall-texture4.jpg")
];

const floorTextures = [
    textureLoader.load("./wood floor textures/wood-floor1.jpg"),
    textureLoader.load("./wood floor textures/wood-floor2.jpg"),
    textureLoader.load("./wood floor textures/wood-floor3.jpg"),
    textureLoader.load("./wood floor textures/wood-floor4.jpg")
];


// ==========================
// Lighting Setup
// ==========================
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);


// 🌞 Directional Light (Simulating Sunlight)
const sunLight = new THREE.DirectionalLight(0xffffff, 0.5);
sunLight.position.set(10, 20, 10);
sunLight.castShadow = true; // ✅ Enable shadows
sunLight.shadow.mapSize.width = 4096; // Higher resolution shadows
sunLight.shadow.mapSize.height = 4096;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 50;
sunLight.shadow.camera.left = -30;
sunLight.shadow.camera.right = 30;
sunLight.shadow.camera.top = 30;
sunLight.shadow.camera.bottom = -30;
scene.add(sunLight);


// ✅ Soft Spotlight Focus on Sofa
const sofaLight = new THREE.SpotLight(0xfff5e1, 1.5);
sofaLight.position.set(0, 15, 5);
sofaLight.angle = Math.PI / 6;
sofaLight.penumbra = 0.3;
sofaLight.castShadow = true;
scene.add(sofaLight);


// ==========================
// Room Structure
// ==========================
const roomMaterial = new THREE.MeshStandardMaterial({ map: wallTextures[0], side: THREE.BackSide })
const roomGeometry = new THREE.BoxGeometry(50, 25, 50);
const roomMesh = new THREE.Mesh(roomGeometry, roomMaterial);
scene.add(roomMesh);

// ==========================
// Door with Frame and Handle
// ==========================
const floorMaterial = new THREE.MeshStandardMaterial({ map: floorTextures[0] });
const floorGeometry = new THREE.PlaneGeometry(50, 50);
const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
floorMesh.rotation.x = -Math.PI / 2;
floorMesh.position.y = -12.5;
floorMaterial.depthTest = false;
scene.add(floorMesh);

// Door
const doorWidth = 8, doorHeight = 18;
const doorTexture = textureLoader.load("door-texture.jpg");
doorTexture.colorSpace = THREE.SRGBColorSpace;
const doorMaterial = new THREE.MeshStandardMaterial({ map: doorTexture, side: THREE.DoubleSide });

const doorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, 0.3);
const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);
doorMesh.position.set(-24.9, -12.5 + doorHeight / 2, 0);
doorMesh.rotation.y = Math.PI / 2;
scene.add(doorMesh);

// Door Frame
const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3c2a });
const frameGeometry = new THREE.BoxGeometry(8.4, 18.4, 0.2);
const doorFrame = new THREE.Mesh(frameGeometry, frameMaterial);
doorFrame.position.set(-24.95, -12.5 + 9, 0);
doorFrame.rotation.y = Math.PI / 2;
scene.add(doorFrame);

// Door Handle
const handleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 32);
const handleMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });
const doorHandle = new THREE.Mesh(handleGeometry, handleMaterial);
doorHandle.position.set(-24.85, -12.5 + doorHeight / 2 - 2, -doorWidth / 2 + 0.5);
doorHandle.rotation.z = Math.PI / 2;
scene.add(doorHandle);

// ==========================
// TV and Video Setup
// ==========================
const tvMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
const tvGeometry = new THREE.BoxGeometry(17, 10, 0.3);
const tvMesh = new THREE.Mesh(tvGeometry, tvMaterial);
tvMesh.position.set(0, 3, -25);
scene.add(tvMesh);

// Video Textures
const videoSources = ["video.webm", "video2.mp4", "video3.mp4"];
let currentVideoIndex = 0;
const video = document.createElement("video");
video.src = videoSources[currentVideoIndex];
video.loop = true;
video.muted = true;
video.setAttribute("playsinline", "");


// Function to setup video texture
let videoTexture; 

// Function to setup video texture (only once)
function videoTextureSetup() {
    video.load(); 

    if (!videoTexture) {
        videoTexture = new THREE.VideoTexture(video);
        videoTexture.generateMipmaps = false;
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        videoTexture.colorSpace = THREE.SRGBColorSpace;
    }

    const screenGeometry = new THREE.PlaneGeometry(16.5, 9.3);
    const screenMaterial = new THREE.MeshBasicMaterial({ 
        map: videoTexture, 
        side: THREE.DoubleSide 
    });

    // Remove previous screen mesh if it exists
    const oldMesh = scene.getObjectByName("screenMesh");
    if (oldMesh) {
        scene.remove(oldMesh);
    }

    const screenMesh = new THREE.Mesh(screenGeometry, screenMaterial);
    screenMesh.position.set(0, 3, -24.95);
    screenMesh.name = "screenMesh";
    screenMaterial.depthTest = false;
    scene.add(screenMesh);
}

videoTextureSetup();



// Tube Light
const tubeLight = new THREE.RectAreaLight(0xffffff, 6, 6, 0.5);
tubeLight.position.set(24.5, 10, 0);
tubeLight.rotation.y = -Math.PI / 2;
scene.add(tubeLight);

// Tube Light Housing
const tubeHousingMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
const tubeHousingGeometry = new THREE.BoxGeometry(6, 0.3, 0.5);
const tubeHousing = new THREE.Mesh(tubeHousingGeometry, tubeHousingMaterial);
tubeHousing.position.copy(tubeLight.position);
tubeHousing.rotation.copy(tubeLight.rotation);
scene.add(tubeHousing);

// Additional Room Lights
const extraLights = [];
const lightPositions = [
    [-24, 12, -24], [24, 12, -24], [-24, 12, 24], [24, 12, 24],
    [0, 12, -24], [0, 12, 24]
];

lightPositions.forEach(pos => {
    const pointLight = new THREE.PointLight(0xffffff, 0, 40);
    pointLight.position.set(...pos);
    scene.add(pointLight);
    extraLights.push(pointLight);
});


// ✅ Enable Renderer Shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;




// 🌟 Load GLB Sofa File with Shadows & Brightness Enhancements
loader.load("GLB/Couch.glb", (gltf) => {
  const sofa = gltf.scene;
  sofa.position.set(0, -8.5, 15);
  sofa.scale.set(16, 16, 16);
  sofa.rotation.y = -Math.PI / 2;

  // ✅ Enable Shadows on Sofa
  sofa.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;  // ✅ Sofa casts shadows
      child.receiveShadow = true; // ✅ Sofa receives shadows
      child.material.roughness = 0.4; // ✅ Slight glossiness for realism
    }
  });

  scene.add(sofa);
});


// 📸 Improve Renderer for Better Lighting
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5; // Increase brightness balance
renderer.outputColorSpace = THREE.SRGBColorSpace;

// ✅ Floor & Room Shadows
floorMesh.receiveShadow = true;
roomMesh.receiveShadow = true;
tvMesh.castShadow = true;
doorMesh.castShadow = true;


// Load Fan GLB
let fanModel; 

loader.load("GLB/Ceiling fan.glb", (gltf) => {
    fanModel = gltf.scene;
    
   
    fanModel.position.set(0, 9.9, 0);
    fanModel.scale.set(0.01, 0.01, 0.01); 
    
    scene.add(fanModel);
});



let targetPosition = new THREE.Vector3(0, -8.5, 15); 
const moveSpeed = 0.39;

// Load FBX models
const fbxLoader = new FBXLoader();
let man, mixer, walkAction, idleAction, sitAction;
let walking = false; 
let sitting = false;


// Load the 3D Man Model (without animation)
fbxLoader.load('Standing Idle.fbx', (fbx) => {
    man = fbx;
    man.scale.set(0.1, 0.1, 0.1);
    man.position.set(-26.9, -12.5, 0);
    man.rotation.y = Math.PI / 2;
    scene.add(man);

    mixer = new THREE.AnimationMixer(man);

    fbxLoader.load('Walking.fbx', (anim) => {
        walkAction = mixer.clipAction(anim.animations[0]);
    });
    
    fbxLoader.load('Stand To Sit.fbx', (anim) => {
        sitAction = mixer.clipAction(anim.animations[0]);
        sitAction.setLoop(THREE.LoopOnce); 
        sitAction.clampWhenFinished = true; 
    });
});



// ==========================
// GUI Controls
// ==========================
const gui = new GUI();

// Controls Object
const controlsObj = {
    lightOn: true,
    fanOn: false
};

// Toggle Lights
gui.add(controlsObj, "lightOn").name("Toggle Lights").onChange(value => {
    tubeLight.intensity = value ? 6 : 0;
    extraLights.forEach(light => light.intensity = value ? 3 : 0);
});

// Toggle Fan
gui.add(controlsObj, "fanOn").name("Toggle Fan").onChange(value => {
    fanRotation = value;
});



// TV Controls
const tvControls = {
    playTV: () => video.play(),
    pauseTV: () => video.pause(),
    muteTV: () => video.muted = true,
    unmuteTV: () => video.muted = false,
    changeVideo: () => {
        currentVideoIndex = (currentVideoIndex + 1) % videoSources.length;
        video.pause();
        video.src = videoSources[currentVideoIndex];

        videoTexture.needsUpdate = true;

        video.play();
    }
};

const tvFolder = gui.addFolder("📺 TV Controls");
tvFolder.add(tvControls, "playTV").name("▶ Play TV");
tvFolder.add(tvControls, "pauseTV").name("⏸ Pause TV");
tvFolder.add(tvControls, "muteTV").name("🔇 Mute TV");
tvFolder.add(tvControls, "unmuteTV").name("🔊 Unmute TV");
tvFolder.add(tvControls, "changeVideo").name("🔄 Change Video");
tvFolder.open();


// man gui
const manControls = {
    walk: () => {
        if (!walking && !sitting) {
            walking = true;
            if (walkAction) walkAction.play();
            // Reset target position for multiple uses
            targetPosition.set(0, -8.5, 9);
        }
    },
    sit: () => {
        if (!walking && !sitting) {
            sitting = true;
            if (sitAction) sitAction.play();
        }
    }
};

gui.add(manControls, "walk").name("🚶 Walk to Sofa");

const textureControls = {
    wallTexture: 0,
    floorTexture: 0
};

gui.add(textureControls, "wallTexture", { "Texture 1": 0, "Texture 2": 1, "Texture 3": 2, "Texture 4": 3 }).name("Wall Texture").onChange((value) => {
    roomMaterial.map = wallTextures[value];
    roomMaterial.needsUpdate = true;
});

gui.add(textureControls, "floorTexture", { "Texture 1": 0, "Texture 2": 1, "Texture 3": 2, "Texture 4": 3 }).name("Floor Texture").onChange((value) => {
    floorMaterial.map = floorTextures[value];
    floorMaterial.needsUpdate = true;
});


// Fan Rotation
let fanRotation = false;

// Resize Event
window.addEventListener("resize", () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    renderer.setSize(sizes.width, sizes.height);
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
});





// ==========================
// Animation Loop
// ==========================
const clock = new THREE.Clock(); 

function animate() {
    requestAnimationFrame(animate);

    // Rotate fan if enabled
    if (fanRotation && fanModel) {
      fanModel.rotation.y += 0.1;
  }



  const delta = clock.getDelta();
    if (mixer) mixer.update(delta);

    if (man && walking) {
        // Calculate direction to target
        const direction = new THREE.Vector3();
        direction.subVectors(targetPosition, man.position).normalize();
        man.position.add(direction.multiplyScalar(moveSpeed));
        
        // Calculate target rotation to face direction of movement
        const targetRotation = Math.atan2(direction.x, direction.z);
        man.rotation.y = THREE.MathUtils.lerp(man.rotation.y, targetRotation, 0.1);
    
        // Check if reached target
        if (man.position.distanceTo(targetPosition) < 10) {
            walking = false;
            if (walkAction) walkAction.stop();

            // Position adjustment for sitting
            man.position.copy(targetPosition);
            man.rotation.y = Math.PI; // Face TV direction
            
            // Trigger sitting animation
            if (sitAction && !sitting) {
                sitting = true;
                sitAction.reset().play();
        
                // Adjust sit position relative to sofa
               man.position.set(0, -11.2, 9.5); // Fine-tuned position
            }
        }
    }
    controls.update();
    renderer.render(scene, camera);
}

animate();
