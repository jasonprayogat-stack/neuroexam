// ============================================================
//  Interactive 3D viewer (Three.js)
//  A stylized, orbitable humanoid that animates each maneuver.
//  Not photoreal — it's a light, rotatable teaching model.
// ============================================================
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const SKIN = 0xf0c9a8;
const GOWN = 0x6fa8dc;
const TABLE = 0xd8dde3;
const HAMMER = 0x8a5a2b;

// ---- small helpers ----------------------------------------
function limb(len, r, color) {
  const g = new THREE.Group();
  const mesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(r, len, 6, 12),
    new THREE.MeshStandardMaterial({ color, roughness: 0.7 })
  );
  mesh.position.y = -len / 2 - r; // hang down from the pivot
  mesh.castShadow = true;
  g.add(mesh);
  return g;
}
function pivotAt(x, y, z) {
  const p = new THREE.Group();
  p.position.set(x, y, z);
  return p;
}

// ---- build the humanoid rig -------------------------------
function makeHuman() {
  const body = new THREE.Group(); // whole figure; we tilt this for supine/prone
  const skin = new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.75 });

  // pelvis / torso
  const pelvis = pivotAt(0, 1.6, 0);
  body.add(pelvis);

  const torso = pivotAt(0, 0, 0); // bends at the waist
  const torsoMesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.34, 0.9, 6, 12),
    new THREE.MeshStandardMaterial({ color: GOWN, roughness: 0.8 })
  );
  torsoMesh.position.y = 0.6;
  torsoMesh.castShadow = true;
  torso.add(torsoMesh);
  pelvis.add(torso);

  // neck + head
  const neck = pivotAt(0, 1.2, 0);
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 20, 16),
    skin
  );
  head.position.y = 0.35;
  head.castShadow = true;
  neck.add(head);
  torso.add(neck);

  // arms
  function arm(side) {
    const shoulder = pivotAt(side * 0.42, 1.05, 0);
    const upper = limb(0.6, 0.11, GOWN);
    shoulder.add(upper);
    const elbow = pivotAt(0, -0.82, 0);
    const fore = limb(0.55, 0.1, SKIN);
    elbow.add(fore);
    upper.add(elbow);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), skin);
    hand.position.y = -0.78;
    elbow.add(hand);
    torso.add(shoulder);
    return { shoulder, elbow };
  }
  const armL = arm(1);
  const armR = arm(-1);

  // legs
  function leg(side) {
    const hip = pivotAt(side * 0.2, 0, 0);
    const thigh = limb(0.8, 0.15, SKIN);
    hip.add(thigh);
    const knee = pivotAt(0, -1.05, 0);
    const shin = limb(0.75, 0.12, SKIN);
    knee.add(shin);
    thigh.add(knee);
    const ankle = pivotAt(0, -0.97, 0);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.34), skin);
    foot.position.set(0, -0.05, 0.12);
    foot.castShadow = true;
    ankle.add(foot);
    shin.add(ankle);
    pelvis.add(hip);
    return { hip, knee, ankle, foot };
  }
  const legL = leg(1);
  const legR = leg(-1);

  return { body, parts: { pelvis, torso, neck, head, armL, armR, legL, legR } };
}

// ---- reflex hammer ----------------------------------------
function makeHammer() {
  const g = new THREE.Group();
  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.7, 8),
    new THREE.MeshStandardMaterial({ color: HAMMER })
  );
  const head = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.22, 12),
    new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.4 })
  );
  head.rotation.z = Math.PI / 2;
  head.position.y = 0.35;
  g.add(handle, head);
  g.visible = false;
  return g;
}

// ============================================================
export function createViewer(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(2.6, 1.8, 4.2);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 1.0, 0);
  controls.minDistance = 2;
  controls.maxDistance = 9;

  // lights
  scene.add(new THREE.HemisphereLight(0xffffff, 0x556677, 0.9));
  const dir = new THREE.DirectionalLight(0xffffff, 1.1);
  dir.position.set(3, 6, 4);
  dir.castShadow = true;
  dir.shadow.mapSize.set(1024, 1024);
  scene.add(dir);

  // exam table
  const table = new THREE.Mesh(
    new THREE.BoxGeometry(3.4, 0.2, 1.2),
    new THREE.MeshStandardMaterial({ color: TABLE, roughness: 0.9 })
  );
  table.position.y = 0.5;
  table.receiveShadow = true;
  table.visible = false;
  scene.add(table);

  // ground shadow catcher
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(6, 32),
    new THREE.ShadowMaterial({ opacity: 0.18 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const { body, parts } = makeHuman();
  scene.add(body);
  const hammer = makeHammer();
  scene.add(hammer);

  let anim = "idle";
  const clock = new THREE.Clock();

  // reset every joint to neutral standing
  function neutral() {
    body.position.set(0, 0, 0);
    body.rotation.set(0, 0, 0);
    for (const key of ["pelvis", "torso", "neck"]) parts[key].rotation.set(0, 0, 0);
    for (const s of ["armL", "armR"]) {
      parts[s].shoulder.rotation.set(0, 0, 0);
      parts[s].elbow.rotation.set(0, 0, 0);
    }
    for (const s of ["legL", "legR"]) {
      parts[s].hip.rotation.set(0, 0, 0);
      parts[s].knee.rotation.set(0, 0, 0);
      parts[s].ankle.rotation.set(0, 0, 0);
    }
    hammer.visible = false;
    table.visible = false;
  }

  // pose presets ------------------------------------------------
  function poseSeated() {
    // sitting on the table edge, lower legs hanging
    table.visible = true;
    body.position.y = 0.6; // sit on table top
    parts.legL.hip.rotation.x = -Math.PI / 2;
    parts.legR.hip.rotation.x = -Math.PI / 2;
    parts.legL.knee.rotation.x = Math.PI / 2;
    parts.legR.knee.rotation.x = Math.PI / 2;
    parts.armL.shoulder.rotation.x = 0.2;
    parts.armR.shoulder.rotation.x = 0.2;
  }
  function poseSupine() {
    // lying on the back on the table
    table.visible = true;
    body.rotation.x = -Math.PI / 2;
    body.position.set(0, 0.75, 0);
    parts.armL.shoulder.rotation.x = 0.15;
    parts.armR.shoulder.rotation.x = 0.15;
  }
  function poseProne() {
    table.visible = true;
    body.rotation.x = Math.PI / 2;
    body.position.set(0, 0.75, 0);
  }

  // choose pose per animation
  function applyBasePose(a) {
    neutral();
    switch (a) {
      case "knee": case "biceps": case "hoffmann": case "spurling":
        poseSeated(); break;
      case "femoral":
        poseProne(); break;
      case "plantar": case "clonus": case "neck": case "kernig":
      case "brudzinski": case "slr": case "achilles":
        poseSupine(); break;
      default:
        break; // idle standing
    }
  }

  function show(test) {
    anim = test ? test.anim : "idle";
    applyBasePose(anim);
  }

  // per-frame animation ----------------------------------------
  // a short "tap then settle" impulse, 0..1 over a ~1.6s cycle
  function tapImpulse(t, period = 1.6) {
    const p = (t % period) / period;
    if (p > 0.45) return 0;
    const x = p / 0.45;          // 0..1 during the active window
    return Math.sin(x * Math.PI) * Math.exp(-x * 2.2);
  }

  function animate() {
    const t = clock.getElapsedTime();
    const imp = tapImpulse(t);

    switch (anim) {
      case "knee": {
        hammer.visible = true;
        hammer.position.set(0.55, 1.35, 0.55);
        hammer.rotation.z = -0.6 - imp * 0.8;
        parts.legL.knee.rotation.x = Math.PI / 2 - imp * 1.1; // kick out
        break;
      }
      case "achilles": {
        hammer.visible = true;
        hammer.position.set(0.2, 1.0, 1.7);
        hammer.rotation.x = 0.4 + imp * 0.6;
        parts.legL.ankle.rotation.x = -imp * 0.7; // plantarflex
        parts.legR.ankle.rotation.x = -imp * 0.05;
        break;
      }
      case "biceps": {
        hammer.visible = true;
        hammer.position.set(0.7, 1.4, 0.2);
        hammer.rotation.z = -0.6 - imp * 0.6;
        parts.armL.elbow.rotation.x = -0.3 - imp * 0.5;
        break;
      }
      case "plantar": {
        // stroke the sole, big toe / foot dorsiflexes
        const p = (t % 2.4) / 2.4;
        const stroking = p < 0.4;
        hammer.visible = true;
        hammer.rotation.set(1.3, 0, 0);
        hammer.position.set(0.2, 1.05, 1.9 - (stroking ? p * 1.0 : 0.4));
        parts.legL.ankle.rotation.x = stroking ? 0 : 0.6 * Math.sin((p - 0.4) * 3); // dorsiflex up
        break;
      }
      case "clonus": {
        parts.legL.ankle.rotation.x = 0.35 * Math.sin(t * 12); // rhythmic beats
        break;
      }
      case "neck": {
        const p = 0.5 + 0.5 * Math.sin(t * 1.4);
        parts.neck.rotation.x = -0.5 * p; // chin toward chest
        break;
      }
      case "brudzinski": {
        const p = 0.5 + 0.5 * Math.sin(t * 1.2);
        parts.neck.rotation.x = -0.5 * p;
        // hips/knees flex in response
        parts.legL.hip.rotation.x = -0.7 * p;
        parts.legR.hip.rotation.x = -0.7 * p;
        parts.legL.knee.rotation.x = 0.9 * p;
        parts.legR.knee.rotation.x = 0.9 * p;
        break;
      }
      case "kernig": {
        parts.legL.hip.rotation.x = -Math.PI / 2;
        const ext = 0.4 + 0.4 * Math.sin(t * 1.6); // try to extend the knee
        parts.legL.knee.rotation.x = Math.PI / 2 * ext;
        break;
      }
      case "slr": {
        const p = 0.5 + 0.5 * Math.sin(t * 1.1);
        parts.legL.hip.rotation.x = -0.9 * p; // raise the straight leg
        break;
      }
      case "femoral": {
        const p = 0.5 + 0.5 * Math.sin(t * 1.3);
        parts.legL.knee.rotation.x = -0.9;      // knee flexed
        parts.legL.hip.rotation.x = 0.5 * p;    // extend the hip (lift thigh)
        break;
      }
      case "spurling": {
        const p = 0.5 + 0.5 * Math.sin(t * 1.0);
        parts.neck.rotation.z = 0.35 * p;
        parts.neck.rotation.y = 0.35 * p;
        break;
      }
      case "hoffmann": {
        parts.armL.elbow.rotation.x = -0.4 - imp * 0.25;
        break;
      }
      default: {
        // gentle breathing idle
        parts.torso.rotation.x = 0.02 * Math.sin(t * 1.5);
      }
    }

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight || Math.round(w * 0.9);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();
  animate();

  return { show, resize };
}
