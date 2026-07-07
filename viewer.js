// ============================================================
//  Interactive 3D viewer (Three.js)
//  Two stylized, orbitable figures — a patient and an examiner —
//  performing each manoeuvre. Motion is smoothed with critically
//  damped springs so it reads as lifelike rather than robotic.
//  Not photoreal: light, rotatable teaching models.
// ============================================================
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const SKIN       = 0xf2c9a4;
const PATIENT    = 0x9d8df1;  // patient gown — lavender/purple
const EXAMINER   = 0x4f46e5;  // examiner scrubs — brand purple
const EXAM_SKIN  = 0xe9b892;
const TABLE      = 0xece9f8;
const TABLE_LEG  = 0xcfcbe8;
const HAMMER_W   = 0x6b4a2b;
const HAMMER_H   = 0x8a8aa0;

// frame-rate independent damping toward a target (exponential smoothing)
function damp(cur, target, lambda, dt) {
  return cur + (target - cur) * (1 - Math.exp(-lambda * dt));
}
// smooth ease in/out 0..1
function easeInOut(x) { return x * x * (3 - 2 * x); }

// ---- small builders ---------------------------------------
function limb(len, r, color) {
  const g = new THREE.Group();
  const mesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(r, len, 10, 18),
    new THREE.MeshStandardMaterial({ color, roughness: 0.72 })
  );
  mesh.position.y = -len / 2 - r;
  mesh.castShadow = true;
  g.add(mesh);
  return g;
}
function pivotAt(x, y, z) {
  const p = new THREE.Group();
  p.position.set(x, y, z);
  return p;
}

// ---- humanoid rig -----------------------------------------
function makeHuman({ gown, skin }) {
  const body = new THREE.Group();
  const skinMat = new THREE.MeshStandardMaterial({ color: skin, roughness: 0.75 });
  const gownMat = new THREE.MeshStandardMaterial({ color: gown, roughness: 0.8 });

  const pelvis = pivotAt(0, 1.6, 0);
  body.add(pelvis);

  const torso = pivotAt(0, 0, 0);
  const torsoMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.36, 0.92, 10, 18), gownMat);
  torsoMesh.position.y = 0.6;
  torsoMesh.castShadow = true;
  torso.add(torsoMesh);
  pelvis.add(torso);

  const neck = pivotAt(0, 1.24, 0);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.29, 26, 20), skinMat);
  head.position.y = 0.36;
  head.castShadow = true;
  neck.add(head);
  // simple face so the figures have a front
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x2b2b40, roughness: 0.4 });
  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 10), eyeMat);
    eye.position.set(sx * 0.1, 0.38, 0.25);
    neck.add(eye);
  }
  torso.add(neck);

  function arm(side) {
    const shoulder = pivotAt(side * 0.44, 1.08, 0);
    const upper = limb(0.6, 0.11, gown);
    shoulder.add(upper);
    const elbow = pivotAt(0, -0.84, 0);
    const fore = limb(0.55, 0.1, skin);
    elbow.add(fore);
    upper.add(elbow);
    const wrist = pivotAt(0, -0.78, 0);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), skinMat);
    wrist.add(hand);
    elbow.add(wrist);
    torso.add(shoulder);
    return { shoulder, elbow, wrist, hand };
  }
  const armL = arm(1);
  const armR = arm(-1);

  function leg(side) {
    const hip = pivotAt(side * 0.2, 0, 0);
    const thigh = limb(0.82, 0.15, skin);
    hip.add(thigh);
    const knee = pivotAt(0, -1.08, 0);
    const shin = limb(0.76, 0.12, skin);
    knee.add(shin);
    thigh.add(knee);
    const ankle = pivotAt(0, -0.98, 0);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.36), skinMat);
    foot.position.set(0, -0.05, 0.13);
    foot.castShadow = true;
    ankle.add(foot);
    shin.add(ankle);
    pelvis.add(hip);
    return { hip, knee, ankle, foot };
  }
  const legL = leg(1);
  const legR = leg(-1);

  return { body, parts: { pelvis, torso, neck, armL, armR, legL, legR } };
}

// ---- reflex hammer ----------------------------------------
function makeHammer() {
  const g = new THREE.Group();
  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.028, 0.028, 0.62, 10),
    new THREE.MeshStandardMaterial({ color: HAMMER_W, roughness: 0.6 })
  );
  const head = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, 0.2, 16),
    new THREE.MeshStandardMaterial({ color: HAMMER_H, metalness: 0.5, roughness: 0.4 })
  );
  head.rotation.z = Math.PI / 2;
  head.position.y = 0.34;
  g.add(handle, head);
  return g;
}

// ============================================================
export function createViewer(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(3.0, 2.0, 4.6);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.target.set(0, 1.05, 0);
  controls.minDistance = 2.4;
  controls.maxDistance = 10;

  // soft, bright lighting to suit the white theme
  scene.add(new THREE.HemisphereLight(0xffffff, 0xe7e5f5, 1.0));
  const dir = new THREE.DirectionalLight(0xffffff, 1.15);
  dir.position.set(4, 7, 5);
  dir.castShadow = true;
  dir.shadow.mapSize.set(2048, 2048);
  dir.shadow.camera.near = 1; dir.shadow.camera.far = 25;
  dir.shadow.camera.left = -6; dir.shadow.camera.right = 6;
  dir.shadow.camera.top = 6; dir.shadow.camera.bottom = -6;
  dir.shadow.bias = -0.0004;
  scene.add(dir);

  // exam table
  const table = new THREE.Group();
  const top = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.22, 1.3),
    new THREE.MeshStandardMaterial({ color: TABLE, roughness: 0.9 })
  );
  top.position.y = 0.62; top.receiveShadow = true; top.castShadow = true;
  table.add(top);
  for (const sx of [-1.5, 1.5]) for (const sz of [-0.45, 0.45]) {
    const legMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.52, 10),
      new THREE.MeshStandardMaterial({ color: TABLE_LEG, roughness: 0.9 })
    );
    legMesh.position.set(sx, 0.26, sz); legMesh.castShadow = true;
    table.add(legMesh);
  }
  table.visible = false;
  scene.add(table);

  // floor shadow catcher
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(7, 40),
    new THREE.ShadowMaterial({ opacity: 0.14 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // ---- the two figures ----
  const patient = makeHuman({ gown: PATIENT, skin: SKIN });
  scene.add(patient.body);
  const P = patient.parts;

  const examiner = makeHuman({ gown: EXAMINER, skin: EXAM_SKIN });
  examiner.body.position.set(2.0, 0, 0.25);
  examiner.body.rotation.y = -Math.PI / 2;   // face the patient
  examiner.body.visible = false;
  scene.add(examiner.body);
  const E = examiner.parts;

  // hammer rides in the examiner's right hand
  const hammer = makeHammer();
  hammer.position.set(0, -0.14, 0);
  hammer.rotation.x = Math.PI / 2;           // point the head forward
  E.armR.wrist.add(hammer);
  hammer.visible = false;

  let anim = "idle";
  const clock = new THREE.Clock();

  // ---- target-based posing --------------------------------
  // Every frame we compute *target* joint angles; actual joints are damped
  // toward them, which turns stepwise poses into smooth, weighted motion.
  const targets = new Map();     // "path" -> radians
  function set(path, v) { targets.set(path, v); }
  const JOINTS = [
    "pelvis.x","torso.x","neck.x","neck.y","neck.z",
    "armL.shoulder.x","armL.elbow.x","armR.shoulder.x","armR.elbow.x",
    "legL.hip.x","legL.knee.x","legL.ankle.x",
    "legR.hip.x","legR.knee.x","legR.ankle.x",
  ];
  const EJOINTS = [
    "torso.x","armR.shoulder.x","armR.shoulder.z","armR.elbow.x","armL.shoulder.x",
  ];

  function clearTargets() {
    for (const j of JOINTS) targets.set("p." + j, 0);
    for (const j of EJOINTS) targets.set("e." + j, 0);
    targets.set("bodyRotX", 0);
    targets.set("bodyPosY", 0);
    targets.set("examY", 0);
    targets.set("hammer", 0);
  }

  function jointRef(rig, path) {
    const [part, axis] = path.split(".").length === 3
      ? [rig[path.split(".")[0]][path.split(".")[1]], path.split(".")[2]]
      : [rig[path.split(".")[0]], path.split(".")[1]];
    return { obj: part, axis };
  }

  // ---- base poses -----------------------------------------
  function poseSeated() {
    table.visible = true;
    set("bodyPosY", 0.72);
    set("p.legL.hip.x", -Math.PI / 2); set("p.legR.hip.x", -Math.PI / 2);
    set("p.legL.knee.x", Math.PI / 2); set("p.legR.knee.x", Math.PI / 2);
    set("p.armL.shoulder.x", 0.25);    set("p.armR.shoulder.x", 0.25);
  }
  function poseSupine() {
    table.visible = true;
    set("bodyRotX", -Math.PI / 2);
    set("bodyPosY", 0.86);
    set("p.armL.shoulder.x", 0.12); set("p.armR.shoulder.x", 0.12);
  }
  function poseProne() {
    table.visible = true;
    set("bodyRotX", Math.PI / 2);
    set("bodyPosY", 0.86);
  }

  const SEATED = new Set(["knee","biceps","hoffmann","spurling"]);
  const SUPINE = new Set(["plantar","clonus","neck","kernig","brudzinski","slr","achilles"]);
  const PRONE  = new Set(["femoral"]);

  let hasExaminer = true;
  function show(test) {
    anim = test ? test.anim : "idle";
    hasExaminer = anim !== "idle";
    examiner.body.visible = hasExaminer;
    // snap targets to the new base pose so the first frame doesn't lurch
    clearTargets();
    if (SEATED.has(anim)) poseSeated();
    else if (SUPINE.has(anim)) poseSupine();
    else if (PRONE.has(anim)) poseProne();
    initPose();
  }

  // apply the current targets instantly (used on show to avoid a big sweep)
  function initPose() {
    driveTargets();
    for (const path of JOINTS) {
      const { obj, axis } = jointRef(P, path);
      obj.rotation[axis] = targets.get("p." + path) ?? 0;
    }
    for (const path of EJOINTS) {
      const { obj, axis } = jointRef(E, path);
      obj.rotation[axis] = targets.get("e." + path) ?? 0;
    }
    patient.body.rotation.x = targets.get("bodyRotX");
    patient.body.position.y = targets.get("bodyPosY");
  }

  // ---- per-maneuver motion (writes targets) ---------------
  // returns 0..1 tap value with anticipation + snap + settle
  function tap(t, period = 1.9) {
    const p = (t % period) / period;
    if (p < 0.28) return -0.25 * easeInOut(p / 0.28);          // wind up
    if (p < 0.42) { const x = (p - 0.28) / 0.14; return -0.25 + 1.25 * easeInOut(x); } // strike
    if (p < 0.7)  { const x = (p - 0.42) / 0.28; return (1 - x) * Math.cos(x * 9) * Math.exp(-x * 3); } // rebound
    return 0;
  }
  const osc = (t, hz) => 0.5 + 0.5 * Math.sin(t * hz);

  function driveTargets() {
    const t = clock.getElapsedTime();

    // gentle life on both figures
    set("p.torso.x", (targets.get("p.torso.x") || 0) + 0.015 * Math.sin(t * 1.4));

    switch (anim) {
      case "knee": {                       // patellar reflex
        const k = tap(t);
        set("hammer", 1);
        set("e.armR.shoulder.x", -0.5 - 0.35 * Math.max(0, k));
        set("e.armR.elbow.x", -0.7);
        set("e.torso.x", 0.25);
        set("p.legL.knee.x", Math.PI / 2 - Math.max(0, k) * 1.15);   // kick
        break;
      }
      case "achilles": {
        const k = tap(t);
        set("hammer", 1);
        set("e.armR.shoulder.x", -0.9 - 0.25 * Math.max(0, k));
        set("e.armR.elbow.x", -0.5);
        set("e.torso.x", 0.5);
        set("p.legL.ankle.x", -Math.max(0, k) * 0.7);                // plantarflex
        break;
      }
      case "biceps": {
        const k = tap(t);
        set("hammer", 1);
        set("e.armR.shoulder.x", -0.7 - 0.2 * Math.max(0, k));
        set("e.armR.elbow.x", -0.6);
        set("e.torso.x", 0.15);
        set("p.armL.shoulder.x", 0.25);
        set("p.armL.elbow.x", -0.5 - Math.max(0, k) * 0.5);          // flex elbow
        break;
      }
      case "hoffmann": {
        const k = tap(t, 1.5);
        set("e.armR.shoulder.x", -0.6);
        set("e.armR.elbow.x", -0.9 - 0.15 * Math.max(0, k));
        set("p.armL.shoulder.x", 0.3);
        set("p.armL.elbow.x", -0.6 - Math.max(0, k) * 0.2);
        break;
      }
      case "plantar": {                    // Babinski — stroke the sole
        const p = (t % 2.6) / 2.6;
        const stroking = p < 0.45;
        set("hammer", 1);
        set("e.armR.shoulder.x", -1.0);
        set("e.armR.elbow.x", -0.35);
        set("e.torso.x", 0.55);
        // big toe / foot dorsiflexes after the stroke
        set("p.legL.ankle.x", stroking ? 0 : 0.5 * easeInOut(Math.min(1, (p - 0.45) / 0.3)));
        break;
      }
      case "clonus": {
        set("e.armR.shoulder.x", -0.95);
        set("e.armR.elbow.x", -0.4);
        set("p.legL.ankle.x", 0.3 * Math.sin(t * 11));               // sustained beats
        break;
      }
      case "neck": {                       // nuchal rigidity
        const p = osc(t, 1.3);
        set("e.armR.shoulder.x", -1.1);
        set("e.armR.elbow.x", -0.6);
        set("e.torso.x", 0.4);
        set("p.neck.x", -0.5 * p);
        break;
      }
      case "brudzinski": {
        const p = osc(t, 1.1);
        set("e.armR.shoulder.x", -1.1);
        set("e.armR.elbow.x", -0.6);
        set("p.neck.x", -0.5 * p);
        set("p.legL.hip.x", -0.75 * p); set("p.legR.hip.x", -0.75 * p);
        set("p.legL.knee.x", 0.95 * p);  set("p.legR.knee.x", 0.95 * p);
        break;
      }
      case "kernig": {
        set("e.armR.shoulder.x", -0.8);
        set("e.armR.elbow.x", -0.5);
        set("p.legL.hip.x", -Math.PI / 2);
        set("p.legL.knee.x", (Math.PI / 2) * (0.35 + 0.4 * osc(t, 1.5)));
        break;
      }
      case "slr": {
        const p = 0.5 - 0.5 * Math.cos(t * 1.0);   // smooth raise/lower
        set("e.armR.shoulder.x", -0.5 - 0.5 * p);
        set("e.armR.elbow.x", -0.3);
        set("p.legL.hip.x", -0.95 * easeInOut(p));
        break;
      }
      case "femoral": {
        const p = osc(t, 1.2);
        set("e.armR.shoulder.x", -0.6);
        set("e.armR.elbow.x", -0.7);
        set("p.legL.knee.x", -0.95);
        set("p.legL.hip.x", 0.55 * easeInOut(p));
        break;
      }
      case "spurling": {
        const p = osc(t, 0.9);
        set("e.armR.shoulder.x", -1.0);
        set("e.armR.elbow.x", -0.9);
        set("e.armL.shoulder.x", -0.9);
        set("p.neck.z", 0.32 * p);
        set("p.neck.y", 0.32 * p);
        break;
      }
      default:
        break; // idle: patient stands, breathing only
    }
  }

  // ---- render loop ----------------------------------------
  function animate() {
    const dt = Math.min(clock.getDelta(), 0.05);
    clearTargets();
    if (SEATED.has(anim)) poseSeated();
    else if (SUPINE.has(anim)) poseSupine();
    else if (PRONE.has(anim)) poseProne();
    driveTargets();

    // damp patient joints toward targets
    for (const path of JOINTS) {
      const { obj, axis } = jointRef(P, path);
      obj.rotation[axis] = damp(obj.rotation[axis], targets.get("p." + path) ?? 0, 9, dt);
    }
    patient.body.rotation.x = damp(patient.body.rotation.x, targets.get("bodyRotX"), 12, dt);
    patient.body.position.y = damp(patient.body.position.y, targets.get("bodyPosY"), 12, dt);

    // damp examiner joints
    if (hasExaminer) {
      for (const path of EJOINTS) {
        const { obj, axis } = jointRef(E, path);
        obj.rotation[axis] = damp(obj.rotation[axis], targets.get("e." + path) ?? 0, 8, dt);
      }
    }
    hammer.visible = hasExaminer && (targets.get("hammer") > 0.5);

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight || Math.round(w * 0.82);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();
  clearTargets();
  animate();

  return { show, resize };
}
