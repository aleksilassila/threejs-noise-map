import * as THREE from './js/three.module.js';
import { OrbitControls } from './js/OrbitControls.js';
import { GUI } from './js/dat.gui.module.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.getElementById("container").appendChild( renderer.domElement );

const controls = new OrbitControls( camera, document.getElementById("container") );
controls.minDistance = 0.5;
controls.maxDistance = 2;

camera.position.x = 0.5;
camera.position.y = 1;
camera.position.z = 0.5;
controls.target = new THREE.Vector3(0.5, 0, 0.5);
controls.update();

let geometry, pointCloud;

const effectController = {
    width: 200,
    seed: 1,
    amplitude: 0.1,
    frequency: 0.4,
    octaves: 3,
    gain: 0.5,
};

let width = effectController.width;

const init = () => {
    initGui();

    geometry = new THREE.BufferGeometry();
    updatePoints();
    pointCloud = new THREE.Points(geometry, new THREE.PointsMaterial( { size: 0.3 / width, vertexColors: true } ) );
    scene.add(pointCloud);
}

const updatePoints = () => {
    let points = new Float32Array(3 * width * width);
    let colors = new Float32Array(3 * width * width);

    const spacing = 1 / width;

    noise.seed(effectController.seed);

    for (let z = 0; z < width; z++) {
        for (let x = 0; x < width; x++) {
            let y = noise.simplex2(x / (effectController.frequency * width), z / (effectController.frequency * width));

            for (let o = 2; o <= effectController.octaves; o++) {
                const factor = effectController.gain ** (o - 1);

                y = y + factor * noise.simplex2(x * o / (effectController.frequency * width * 0.5 * o),
                    z * o / (effectController.frequency * width * 0.5 * o));
            }

            points[3 * (z * width + x)]     = x * spacing;
            points[3 * (z * width + x) + 1] = effectController.amplitude * y;
            points[3 * (z * width + x) + 2] = z * spacing;

            colors[3 * (z * width + x)]     = 1 - 0.5*(y + 1);
            colors[3 * (z * width + x) + 1] = 0.5*(y + 1);
            colors[3 * (z * width + x) + 2] = 0;
        }
    }

    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( points, 3 ));
    geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ));
}

const initGui = () => {
    const gui = new GUI();

    gui.add( effectController, "seed", 0, 10000, 1);
    gui.add( effectController, "width", 2, 1000, 1).onChange(value => {
        width = value;
    });
    gui.add( effectController, "amplitude", 0.0, 0.5);
    gui.add( effectController, "frequency", 0.01, 1);
    gui.add( effectController, "octaves", 1, 7, 1);
    gui.add( effectController, "gain", 0.1, 1);
}

const animate = function () {
    updatePoints();

    pointCloud.geometry.attributes.position.needsUpdate = true;
    pointCloud.geometry.attributes.color.needsUpdate = true;

    requestAnimationFrame( animate );

    renderer.render( scene, camera );
};

init();
animate();
