// ============================================================
//  NeuroExam Pocket Guide — test content
// ============================================================
//  Content drafted from Bates' Guide to Physical Examination
//  and History Taking. REVIEW EACH CARD FOR CLINICAL ACCURACY
//  before relying on it. This is a study aid, not a clinical
//  reference of record.
//
//  Each test:
//    id        unique key
//    name      display name
//    category  one of the CATEGORIES keys below
//    anim      which 3D animation to play (see viewer.js)
//    how       one-line technique
//    positive  what a positive / abnormal finding looks like
//    indicates what it tells you
//    conditions associated diseases (kept short)
//    root      nerve root(s), when relevant (else "")
// ============================================================

export const CATEGORIES = {
  pathological: { label: "Pathological Reflexes", color: "#e05a5a", icon: "⚡" },
  meningeal:    { label: "Meningeal Irritation", color: "#e0953a", icon: "🧠" },
  radicular:    { label: "Radicular / Nerve Root", color: "#3a9ee0", icon: "⚡" },
  dtr:          { label: "Deep Tendon Reflexes", color: "#4caf7d", icon: "🔨" },
};

export const TESTS = [
  // ---------------- Pathological reflexes ----------------
  {
    id: "babinski",
    name: "Babinski Sign (Plantar Response)",
    category: "pathological",
    anim: "plantar",
    how: "Stroke the lateral sole from heel to ball, curving toward the big toe.",
    positive: "Big toe dorsiflexes (moves up) and the other toes fan out.",
    indicates: "Upper motor neuron lesion in the corticospinal (pyramidal) tract.",
    conditions: "Stroke, spinal cord lesion, MS, motor neuron disease. (Normal in infants < 1–2 yr.)",
    root: "",
  },
  {
    id: "hoffmann",
    name: "Hoffmann Sign",
    category: "pathological",
    anim: "hoffmann",
    how: "Flick the nail of the middle finger downward, letting it snap back.",
    positive: "Reflex flexion of the thumb and index finger.",
    indicates: "Upper motor neuron dysfunction, often cervical cord / corticospinal tract.",
    conditions: "Cervical myelopathy, MS. (Can be normal if symmetric and no other signs.)",
    root: "",
  },
  {
    id: "clonus",
    name: "Ankle Clonus",
    category: "pathological",
    anim: "clonus",
    how: "Support the knee, sharply dorsiflex the foot and hold gentle pressure.",
    positive: "Rhythmic, repeating beats of plantar/dorsiflexion at the ankle.",
    indicates: "Hyperactive stretch reflex from an upper motor neuron lesion.",
    conditions: "Stroke, spinal cord injury, MS, severe hyperreflexia.",
    root: "",
  },

  // ---------------- Meningeal irritation ----------------
  {
    id: "nuchal",
    name: "Nuchal Rigidity",
    category: "meningeal",
    anim: "neck",
    how: "With the patient supine, gently flex the neck to bring chin toward chest.",
    positive: "Resistance and pain preventing passive neck flexion.",
    indicates: "Meningeal irritation.",
    conditions: "Meningitis, subarachnoid haemorrhage.",
    root: "",
  },
  {
    id: "kernig",
    name: "Kernig Sign",
    category: "meningeal",
    anim: "kernig",
    how: "Flex the hip and knee to 90°, then try to straighten (extend) the knee.",
    positive: "Pain and resistance to knee extension, often with hamstring spasm.",
    indicates: "Meningeal irritation.",
    conditions: "Meningitis, subarachnoid haemorrhage.",
    root: "",
  },
  {
    id: "brudzinski",
    name: "Brudzinski Sign",
    category: "meningeal",
    anim: "brudzinski",
    how: "With the patient supine, passively flex the neck.",
    positive: "Involuntary flexion of the hips and knees.",
    indicates: "Meningeal irritation.",
    conditions: "Meningitis, subarachnoid haemorrhage.",
    root: "",
  },

  // ---------------- Radicular / nerve root ----------------
  {
    id: "slr",
    name: "Straight Leg Raise (Lasègue)",
    category: "radicular",
    anim: "slr",
    how: "Supine, lift the straightened leg by the heel until pain appears.",
    positive: "Radiating leg pain between about 30° and 70° of elevation.",
    indicates: "Lumbosacral nerve root tension (sciatica).",
    conditions: "L5 / S1 disc herniation, lumbar radiculopathy.",
    root: "L5–S1",
  },
  {
    id: "femoral",
    name: "Femoral Stretch Test",
    category: "radicular",
    anim: "femoral",
    how: "Prone, flex the knee and extend the hip (lift the thigh).",
    positive: "Pain in the front of the thigh.",
    indicates: "Upper lumbar nerve root tension.",
    conditions: "L2–L4 radiculopathy, upper lumbar disc herniation.",
    root: "L2–L4",
  },
  {
    id: "spurling",
    name: "Spurling Test",
    category: "radicular",
    anim: "spurling",
    how: "Extend and rotate the neck toward the painful side, apply gentle downward pressure.",
    positive: "Pain radiating down the arm on the tested side.",
    indicates: "Cervical nerve root compression.",
    conditions: "Cervical radiculopathy, foraminal disc herniation.",
    root: "C5–C8",
  },

  // ---------------- Deep tendon reflexes ----------------
  {
    id: "patellar",
    name: "Patellar (Knee) Reflex",
    category: "dtr",
    anim: "knee",
    how: "With the knee bent and relaxed, tap the patellar tendon below the kneecap.",
    positive: "Normal: quick knee extension (leg kicks). Grade 0–4+.",
    indicates: "Integrity of the L2–L4 reflex arc; brisk = UMN, absent = LMN.",
    conditions: "Absent in radiculopathy/neuropathy; brisk in UMN lesions.",
    root: "L2–L4",
  },
  {
    id: "biceps",
    name: "Biceps Reflex",
    category: "dtr",
    anim: "biceps",
    how: "Rest your thumb on the biceps tendon at the elbow crease and tap your thumb.",
    positive: "Normal: slight flexion of the elbow. Grade 0–4+.",
    indicates: "Integrity of the C5–C6 reflex arc.",
    conditions: "Altered in C5–C6 radiculopathy or UMN lesions.",
    root: "C5–C6",
  },
  {
    id: "achilles",
    name: "Achilles (Ankle) Reflex",
    category: "dtr",
    anim: "achilles",
    how: "Dorsiflex the foot slightly and tap the Achilles tendon.",
    positive: "Normal: plantar flexion (foot points down). Grade 0–4+.",
    indicates: "Integrity of the S1 reflex arc.",
    conditions: "Absent/slow in S1 radiculopathy, peripheral neuropathy.",
    root: "S1",
  },
];
