const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");

const outDir = path.join(__dirname, "presentation_output");
fs.mkdirSync(outDir, { recursive: true });

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "OpenWorld Blind AI Team";
pptx.company = "Department Project";
pptx.subject = "AI-based offline object detection system for visually impaired people";
pptx.title = "OpenWorld Blind AI";
pptx.lang = "en-US";
pptx.theme = {
  headFontFace: "Bahnschrift",
  bodyFontFace: "Aptos",
  lang: "en-US",
};
pptx.margin = 0;

const W = 13.333;
const H = 7.5;

const C = {
  bg: "F4FAF7",
  ink: "102A24",
  muted: "61736C",
  green: "2FAD5A",
  teal: "006B5A",
  red: "EF3F36",
  orange: "F59E0B",
  yellow: "F3C623",
  blue: "226CE0",
  line: "BFD8CF",
  white: "FFFFFF",
  black: "000000",
  soft: "E7F4EF",
  softRed: "FFE6E3",
};

function slideBg(slide) {
  slide.background = { color: C.bg };
}

function addFooter(slide, n) {
  slide.addText("OpenWorld Blind AI", {
    x: 0.55,
    y: 7.08,
    w: 2.8,
    h: 0.22,
    fontFace: "Aptos",
    fontSize: 8.5,
    color: C.muted,
    margin: 0,
  });
  slide.addText(String(n).padStart(2, "0"), {
    x: 12.35,
    y: 7.05,
    w: 0.5,
    h: 0.25,
    fontFace: "Bahnschrift",
    fontSize: 9,
    bold: true,
    color: C.teal,
    align: "right",
    margin: 0,
  });
}

function title(slide, text, sub) {
  slide.addText(text, {
    x: 0.62,
    y: 0.42,
    w: 7.8,
    h: 0.55,
    fontFace: "Bahnschrift",
    fontSize: 25,
    bold: true,
    color: C.ink,
    margin: 0,
    breakLine: false,
  });
  if (sub) {
    slide.addText(sub, {
      x: 0.64,
      y: 0.98,
      w: 8.6,
      h: 0.35,
      fontSize: 10.5,
      color: C.muted,
      margin: 0,
    });
  }
}

function pill(slide, text, x, y, w, color, textColor = C.white) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h: 0.38,
    rectRadius: 0.08,
    fill: { color },
    line: { color, transparency: 100 },
  });
  slide.addText(text, {
    x: x + 0.12,
    y: y + 0.08,
    w: w - 0.24,
    h: 0.18,
    fontFace: "Bahnschrift",
    fontSize: 9.5,
    bold: true,
    color: textColor,
    align: "center",
    margin: 0,
  });
}

function bulletList(slide, items, x, y, w, h, opts = {}) {
  const text = items.map((v) => `- ${v}`).join("\n");
  slide.addText(text, {
    x,
    y,
    w,
    h,
    fontSize: opts.size || 16,
    color: opts.color || C.ink,
    breakLine: false,
    fit: "shrink",
    paraSpaceAfterPt: 8,
    breakLine: false,
    margin: 0,
  });
}

function callout(slide, label, value, x, y, w, h, color) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.1,
    fill: { color: C.white },
    line: { color: C.line, width: 1 },
    shadow: { type: "outer", color: "B6C9C1", opacity: 0.16, blur: 2, angle: 45, distance: 1 },
  });
  slide.addText(value, {
    x: x + 0.18,
    y: y + 0.18,
    w: w - 0.36,
    h: 0.45,
    fontFace: "Bahnschrift",
    fontSize: 24,
    bold: true,
    color,
    margin: 0,
  });
  slide.addText(label, {
    x: x + 0.2,
    y: y + 0.78,
    w: w - 0.36,
    h: h - 0.88,
    fontSize: 10.5,
    color: C.muted,
    fit: "shrink",
    margin: 0,
  });
}

function connector(slide, x1, y1, x2, y2, color = C.teal) {
  slide.addShape(pptx.ShapeType.line, {
    x: x1,
    y: y1,
    w: x2 - x1,
    h: y2 - y1,
    line: { color, width: 1.8, endArrowType: "triangle" },
  });
}

function box(slide, text, x, y, w, h, fill, line = C.line, txt = C.ink, fs = 12) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.08,
    fill: { color: fill },
    line: { color: line, width: 1 },
  });
  slide.addText(text, {
    x: x + 0.12,
    y: y + 0.13,
    w: w - 0.24,
    h: h - 0.2,
    fontFace: "Bahnschrift",
    fontSize: fs,
    bold: true,
    color: txt,
    align: "center",
    valign: "mid",
    fit: "shrink",
    margin: 0,
  });
}

function addPhoneMock(slide, x, y, w, h) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.2,
    fill: { color: "121915" },
    line: { color: "101010", width: 1 },
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: x + 0.12,
    y: y + 0.18,
    w: w - 0.24,
    h: h - 0.36,
    rectRadius: 0.16,
    fill: { color: "ECF7F2" },
    line: { color: "ECF7F2", width: 1 },
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: x + 0.35,
    y: y + 0.56,
    w: w - 0.7,
    h: 0.74,
    rectRadius: 0.08,
    fill: { color: C.red },
    line: { color: C.red, width: 1 },
  });
  slide.addText("STOP", {
    x: x + 0.35,
    y: y + 0.79,
    w: w - 0.7,
    h: 0.25,
    fontFace: "Bahnschrift",
    fontSize: 15,
    bold: true,
    align: "center",
    color: C.white,
    margin: 0,
  });
  slide.addText("Detecting 2 objects", {
    x: x + 0.35,
    y: y + 1.55,
    w: w - 0.7,
    h: 0.25,
    fontSize: 9.5,
    bold: true,
    color: C.green,
    margin: 0,
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: x + 0.35,
    y: y + 1.92,
    w: w - 0.7,
    h: 2.25,
    rectRadius: 0.08,
    fill: { color: "DCE8E0" },
    line: { color: "DCE8E0", width: 1 },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: x + 0.76,
    y: y + 2.25,
    w: 1.15,
    h: 1.42,
    fill: { color: "DCE8E0", transparency: 100 },
    line: { color: "69E7A2", width: 2 },
  });
  pill(slide, "person 78% center", x + 0.68, y + 2.05, 1.55, C.red);
  slide.addShape(pptx.ShapeType.rect, {
    x: x + 2.18,
    y: y + 2.75,
    w: 0.65,
    h: 0.85,
    fill: { color: "DCE8E0", transparency: 100 },
    line: { color: "69E7A2", width: 2 },
  });
  pill(slide, "bottle 72%", x + 2.05, y + 2.55, 1.1, C.green);
}

let s = 0;

// 1
{
  const slide = pptx.addSlide();
  slideBg(slide);
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: W,
    h: H,
    fill: { color: C.bg },
    line: { color: C.bg },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 4.1,
    h: H,
    fill: { color: C.teal },
    line: { color: C.teal },
  });
  slide.addShape(pptx.ShapeType.arc, {
    x: 3.2,
    y: -0.8,
    w: 5.6,
    h: 8.9,
    line: { color: C.green, width: 2.5, transparency: 15 },
    adjustPoint: 0.45,
  });
  slide.addText("OpenWorld\nBlind AI", {
    x: 0.62,
    y: 0.75,
    w: 3.0,
    h: 1.4,
    fontFace: "Bahnschrift",
    fontSize: 28,
    bold: true,
    color: C.white,
    margin: 0,
    breakLine: false,
  });
  slide.addText("AI-based offline object detection system for visually impaired people", {
    x: 4.7,
    y: 1.05,
    w: 7.6,
    h: 1.45,
    fontFace: "Bahnschrift",
    fontSize: 32,
    bold: true,
    color: C.ink,
    fit: "shrink",
    margin: 0,
  });
  slide.addText("Real-time camera vision, object detection, distance-aware alerts, and Android text-to-speech without internet dependency.", {
    x: 4.75,
    y: 2.82,
    w: 7.1,
    h: 0.65,
    fontSize: 15,
    color: C.muted,
    margin: 0,
    fit: "shrink",
  });
  addPhoneMock(slide, 9.0, 3.15, 2.15, 3.9);
  slide.addText("Presented by", { x: 0.7, y: 5.62, w: 2.4, h: 0.25, fontSize: 10.5, color: "BFE9D3", margin: 0 });
  slide.addText("N.Sharath Kumar - 23261A6634\nSanne Rohith - 23261A6645", {
    x: 0.7,
    y: 5.95,
    w: 3.3,
    h: 0.65,
    fontSize: 12.5,
    bold: true,
    color: C.white,
    fit: "shrink",
    margin: 0,
  });
}

// 2
{
  const slide = pptx.addSlide();
  slideBg(slide);
  title(slide, "Problem Statement", "Independent movement becomes harder when surroundings cannot be quickly identified.");
  slide.addText("People with visual impairment often depend on touch, sound, memory, or another person to understand nearby objects and obstacles.", {
    x: 0.72,
    y: 1.65,
    w: 6.4,
    h: 1.15,
    fontFace: "Bahnschrift",
    fontSize: 26,
    bold: true,
    color: C.ink,
    fit: "shrink",
    margin: 0,
  });
  bulletList(slide, [
    "Many assistive apps require internet or cloud AI services.",
    "Delayed feedback can reduce safety in navigation.",
    "Users need simple voice output, not complex visual interfaces.",
    "The system must work on normal mobile phones.",
  ], 0.78, 3.15, 6.1, 2.25, { size: 15 });
  callout(slide, "Target impact: faster awareness of nearby objects through offline voice alerts.", "Need", 8.0, 1.55, 3.6, 1.55, C.red);
  callout(slide, "Camera-based detection helps identify common objects in daily environments.", "Vision", 8.0, 3.2, 3.6, 1.55, C.teal);
  callout(slide, "The design prioritizes large controls and clear status for accessibility.", "Access", 8.0, 4.85, 3.6, 1.55, C.green);
  addFooter(slide, ++s);
}

// 3
{
  const slide = pptx.addSlide();
  slideBg(slide);
  title(slide, "Project Objectives", "Convert camera input into useful spoken awareness.");
  const objs = [
    ["Offline detection", "Run object recognition on-device using a bundled YOLO ONNX model."],
    ["Voice guidance", "Speak object name, approximate position, and distance using Android TTS."],
    ["Accessible UI", "Large start/stop control, readable status, and minimal settings complexity."],
    ["Real-time loop", "Process camera frames continuously while avoiding heavy lag."],
    ["Safety focus", "Highlight critical objects such as person, vehicle, or close obstacle."],
    ["Portable app", "Build with Flutter for Android and future iOS support."],
  ];
  objs.forEach((o, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.75 + col * 6.1;
    const y = 1.55 + row * 1.72;
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w: 5.35,
      h: 1.16,
      rectRadius: 0.08,
      fill: { color: C.white },
      line: { color: C.line, width: 1 },
    });
    slide.addShape(pptx.ShapeType.ellipse, { x: x + 0.18, y: y + 0.24, w: 0.36, h: 0.36, fill: { color: i % 3 === 0 ? C.green : i % 3 === 1 ? C.teal : C.orange }, line: { color: C.white, transparency: 100 } });
    slide.addText(o[0], { x: x + 0.7, y: y + 0.17, w: 4.5, h: 0.25, fontFace: "Bahnschrift", fontSize: 15, bold: true, color: C.ink, margin: 0 });
    slide.addText(o[1], { x: x + 0.7, y: y + 0.48, w: 4.45, h: 0.42, fontSize: 10.5, color: C.muted, fit: "shrink", margin: 0 });
  });
  addFooter(slide, ++s);
}

// 4
{
  const slide = pptx.addSlide();
  slideBg(slide);
  title(slide, "Proposed Solution", "A mobile assistive vision system that works without internet.");
  slide.addShape(pptx.ShapeType.roundRect, { x: 0.82, y: 1.55, w: 11.8, h: 4.75, rectRadius: 0.12, fill: { color: C.white }, line: { color: C.line, width: 1 } });
  const steps = [
    ["Phone camera", "Live frames from back camera"],
    ["Frame preprocessing", "Resize and normalize to 640 x 640"],
    ["YOLOv8 ONNX", "Local inference on mobile device"],
    ["Post-processing", "Confidence filter + NMS"],
    ["TTS alerts", "Speak label, position, distance"],
  ];
  steps.forEach((st, i) => {
    const x = 1.15 + i * 2.3;
    box(slide, st[0], x, 2.15, 1.75, 0.72, i === 2 ? C.softRed : C.soft, i === 2 ? C.red : C.teal, i === 2 ? C.red : C.teal, 11.5);
    slide.addText(st[1], { x: x - 0.05, y: 3.05, w: 1.85, h: 0.46, fontSize: 9.5, color: C.muted, align: "center", fit: "shrink", margin: 0 });
    if (i < steps.length - 1) connector(slide, x + 1.75, 2.5, x + 2.2, 2.5, C.green);
  });
  slide.addText("The user does not need to read the screen. The app converts visual detections into short, repeated voice alerts with cooldown control.", {
    x: 1.2,
    y: 4.3,
    w: 10.3,
    h: 0.72,
    fontFace: "Bahnschrift",
    fontSize: 20,
    bold: true,
    color: C.ink,
    fit: "shrink",
    align: "center",
    margin: 0,
  });
  addFooter(slide, ++s);
}

// 5
{
  const slide = pptx.addSlide();
  slideBg(slide);
  title(slide, "System Architecture", "The app is split into UI, camera pipeline, AI inference, and voice feedback modules.");
  const colX = [0.72, 3.7, 6.68, 9.65];
  const groups = [
    ["Presentation Layer", ["Main screen", "Large START/STOP", "Status + boxes"]],
    ["Input Pipeline", ["Camera plugin", "Image stream", "Frame throttling"]],
    ["AI Engine", ["Preprocessor", "ONNX Runtime", "YOLO decoder + NMS"]],
    ["Feedback Layer", ["TTS service", "Cooldown logic", "Distance/position alert"]],
  ];
  groups.forEach((g, i) => {
    slide.addShape(pptx.ShapeType.roundRect, { x: colX[i], y: 1.55, w: 2.35, h: 4.6, rectRadius: 0.1, fill: { color: i === 2 ? C.softRed : C.white }, line: { color: i === 2 ? C.red : C.line, width: 1 } });
    slide.addText(g[0], { x: colX[i] + 0.16, y: 1.78, w: 2.0, h: 0.32, fontFace: "Bahnschrift", fontSize: 14, bold: true, color: i === 2 ? C.red : C.teal, align: "center", margin: 0 });
    g[1].forEach((item, j) => box(slide, item, colX[i] + 0.28, 2.45 + j * 0.9, 1.8, 0.48, i === 2 ? "FFF6F4" : C.soft, i === 2 ? "F8B4AC" : C.line, C.ink, 9.5));
    if (i < 3) connector(slide, colX[i] + 2.35, 3.85, colX[i + 1] - 0.05, 3.85, C.teal);
  });
  slide.addText("Data stays on the phone. The model and labels are bundled as app assets, supporting offline use.", {
    x: 1.15,
    y: 6.45,
    w: 10.5,
    h: 0.32,
    fontSize: 13,
    color: C.muted,
    align: "center",
    margin: 0,
  });
  addFooter(slide, ++s);
}

// 6
{
  const slide = pptx.addSlide();
  slideBg(slide);
  title(slide, "Technology Stack", "Each technology is selected to support offline mobile inference and accessible feedback.");
  const tech = [
    ["Flutter", "Cross-platform mobile UI and application structure."],
    ["Dart", "App logic, services, model decoding, and state management."],
    ["camera", "Back camera preview and live image stream."],
    ["ONNX Runtime", "Runs exported YOLOv8 model on-device."],
    ["flutter_tts", "Android offline text-to-speech voice alerts."],
    ["permission_handler", "Camera permission handling for Android/iOS."],
    ["YOLOv8n-OIV7", "Object detection model trained on Open Images labels."],
    ["Assets bundle", "Model and labels packaged for internet-free execution."],
  ];
  tech.forEach((t, i) => {
    const x = 0.8 + (i % 4) * 3.1;
    const y = 1.58 + Math.floor(i / 4) * 2.05;
    slide.addShape(pptx.ShapeType.roundRect, { x, y, w: 2.55, h: 1.35, rectRadius: 0.08, fill: { color: C.white }, line: { color: C.line, width: 1 } });
    slide.addText(t[0], { x: x + 0.18, y: y + 0.2, w: 2.18, h: 0.28, fontFace: "Bahnschrift", fontSize: 14.5, bold: true, color: i === 3 ? C.red : C.teal, margin: 0 });
    slide.addText(t[1], { x: x + 0.18, y: y + 0.58, w: 2.2, h: 0.55, fontSize: 9.5, color: C.muted, fit: "shrink", margin: 0 });
  });
  slide.addText("Core dependency idea: keep heavy AI computation local while keeping the user interface simple and accessible.", {
    x: 1.0,
    y: 6.0,
    w: 11.4,
    h: 0.5,
    fontFace: "Bahnschrift",
    fontSize: 18,
    bold: true,
    color: C.ink,
    align: "center",
    margin: 0,
  });
  addFooter(slide, ++s);
}

// 7
{
  const slide = pptx.addSlide();
  slideBg(slide);
  title(slide, "Model and Dataset", "YOLOv8n-OIV7 was used for lightweight, multi-class object detection.");
  callout(slide, "Small model size suitable for mobile deployment.", "YOLOv8n", 0.82, 1.62, 2.65, 1.42, C.teal);
  callout(slide, "Open Images object classes loaded from label file.", "601", 3.8, 1.62, 2.65, 1.42, C.green);
  callout(slide, "Input tensor used by the exported ONNX model.", "640 x 640", 6.78, 1.62, 2.65, 1.42, C.blue);
  callout(slide, "Runs locally through ONNX Runtime without cloud calls.", "Offline", 9.76, 1.62, 2.65, 1.42, C.red);
  bulletList(slide, [
    "Original model file: yolov8n-oiv7.pt.",
    "Converted to ONNX for mobile inference.",
    "The app reads the ONNX file from assets/models.",
    "Class names are mapped using open_images_v7_601.txt.",
    "Post-processing selects highest confidence classes and removes duplicates using NMS.",
  ], 1.0, 3.75, 11.25, 1.85, { size: 15 });
  addFooter(slide, ++s);
}

// 8
{
  const slide = pptx.addSlide();
  slideBg(slide);
  title(slide, "Working Flow", "From live camera frame to spoken assistance.");
  const y = 2.15;
  const flow = [
    "Capture",
    "Resize",
    "Normalize",
    "Infer",
    "Decode",
    "Filter",
    "Speak",
  ];
  flow.forEach((f, i) => {
    const x = 0.65 + i * 1.8;
    slide.addShape(pptx.ShapeType.ellipse, { x, y, w: 1.05, h: 1.05, fill: { color: i === 3 ? C.red : C.teal }, line: { color: C.white, width: 1 } });
    slide.addText(String(i + 1), { x, y: y + 0.26, w: 1.05, h: 0.28, fontFace: "Bahnschrift", fontSize: 20, bold: true, color: C.white, align: "center", margin: 0 });
    slide.addText(f, { x: x - 0.25, y: y + 1.22, w: 1.55, h: 0.26, fontFace: "Bahnschrift", fontSize: 12.5, bold: true, color: C.ink, align: "center", margin: 0 });
    if (i < flow.length - 1) connector(slide, x + 1.05, y + 0.53, x + 1.72, y + 0.53, C.green);
  });
  slide.addText("The detection loop is throttled so the phone does not process every camera frame. This reduces lag and keeps the interface responsive.", {
    x: 1.1,
    y: 4.85,
    w: 10.8,
    h: 0.72,
    fontSize: 17,
    bold: true,
    color: C.teal,
    align: "center",
    margin: 0,
  });
  addFooter(slide, ++s);
}

// 9
{
  const slide = pptx.addSlide();
  slideBg(slide);
  title(slide, "Core Modules", "The Flutter project is organized around reusable services and utilities.");
  const modules = [
    ["main.dart", "UI, camera lifecycle, detection state, overlay painter."],
    ["YoloService", "Loads model, runs ONNX inference, decodes detections."],
    ["FramePreprocessor", "Converts camera frame into normalized tensor."],
    ["TtsService", "Speaks short alerts with cooldown and queue handling."],
    ["NMS utility", "Removes duplicate overlapping boxes."],
    ["Detection model", "Stores label, confidence, box, distance, and category."],
  ];
  modules.forEach((m, i) => {
    const x = i < 3 ? 0.9 : 7.0;
    const y = 1.5 + (i % 3) * 1.55;
    slide.addShape(pptx.ShapeType.roundRect, { x, y, w: 5.25, h: 1.05, rectRadius: 0.08, fill: { color: C.white }, line: { color: C.line, width: 1 } });
    slide.addText(m[0], { x: x + 0.22, y: y + 0.17, w: 4.85, h: 0.24, fontFace: "Bahnschrift", fontSize: 13.5, bold: true, color: i === 1 ? C.red : C.teal, margin: 0 });
    slide.addText(m[1], { x: x + 0.22, y: y + 0.47, w: 4.8, h: 0.35, fontSize: 10.5, color: C.muted, fit: "shrink", margin: 0 });
  });
  slide.addText("Separation of concerns makes it easier to tune detection, UI, and voice output independently.", {
    x: 1.25,
    y: 6.25,
    w: 10.5,
    h: 0.36,
    fontSize: 15,
    color: C.ink,
    bold: true,
    align: "center",
    margin: 0,
  });
  addFooter(slide, ++s);
}

// 10
{
  const slide = pptx.addSlide();
  slideBg(slide);
  title(slide, "Detection Logic", "The model output is converted into user-friendly object information.");
  box(slide, "Raw YOLO output\n[boxes + class scores]", 0.9, 1.72, 2.3, 1.0, C.white, C.line, C.ink, 12);
  box(slide, "Best class\nper anchor", 3.7, 1.72, 2.0, 1.0, C.soft, C.line, C.teal, 12);
  box(slide, "Confidence\nthreshold", 6.2, 1.72, 2.0, 1.0, "FFF7E6", "FFD79B", C.orange, 12);
  box(slide, "NMS removes\nduplicates", 8.7, 1.72, 2.0, 1.0, C.soft, C.line, C.teal, 12);
  box(slide, "Final alert\nlabel + position", 11.0, 1.72, 1.65, 1.0, C.softRed, "F6B1AA", C.red, 11);
  connector(slide, 3.2, 2.22, 3.65, 2.22);
  connector(slide, 5.7, 2.22, 6.15, 2.22);
  connector(slide, 8.2, 2.22, 8.65, 2.22);
  connector(slide, 10.7, 2.22, 10.95, 2.22);
  bulletList(slide, [
    "Confidence score decides whether an object is trusted enough to display.",
    "Intersection-over-Union is used by NMS to suppress duplicate boxes.",
    "Bounding box size estimates approximate distance: very close, close, medium, or far.",
    "Horizontal center gives a position label: left, center, or right.",
    "Critical object labels can be styled in red for safety visibility.",
  ], 1.0, 4.0, 11.2, 1.82, { size: 14.5 });
  addFooter(slide, ++s);
}

// 11
{
  const slide = pptx.addSlide();
  slideBg(slide);
  title(slide, "Accessible User Interface", "The UI is designed for quick action and low visual complexity.");
  addPhoneMock(slide, 0.9, 1.25, 2.45, 4.85);
  bulletList(slide, [
    "Large START/STOP button makes the main action easy to find.",
    "Status text shows whether the app is detecting objects.",
    "Camera preview occupies the main screen area.",
    "Green boxes identify normal objects; red boxes identify critical objects.",
    "Settings/emergency controls were simplified to reduce confusion.",
  ], 4.25, 1.65, 7.55, 2.4, { size: 16 });
  slide.addText("Design rule: the phone should feel like an assistive device first, not like a complex AI dashboard.", {
    x: 4.25,
    y: 5.15,
    w: 7.65,
    h: 0.62,
    fontFace: "Bahnschrift",
    fontSize: 20,
    bold: true,
    color: C.teal,
    fit: "shrink",
    margin: 0,
  });
  addFooter(slide, ++s);
}

// 12
{
  const slide = pptx.addSlide();
  slideBg(slide);
  title(slide, "Voice Alert Strategy", "Spoken feedback is the most important output for the target user.");
  slide.addText("\"person center, close\"  |  \"bottle left, far\"  |  \"chair right, medium\"", {
    x: 0.95,
    y: 1.55,
    w: 11.5,
    h: 0.48,
    fontFace: "Bahnschrift",
    fontSize: 22,
    bold: true,
    color: C.teal,
    align: "center",
    margin: 0,
    fit: "shrink",
  });
  const cols = [
    ["Object name", "Directly tells what is detected."],
    ["Position", "Left, center, or right helps orientation."],
    ["Distance", "Very close, close, medium, or far."],
    ["Cooldown", "Avoids repeating the same object too often."],
  ];
  cols.forEach((c, i) => {
    callout(slide, c[1], c[0], 0.9 + i * 3.05, 2.75, 2.55, 1.45, i === 3 ? C.orange : C.green);
  });
  slide.addText("The TTS engine works offline on Android when a local voice package is available.", {
    x: 1.0,
    y: 5.72,
    w: 11.2,
    h: 0.35,
    fontSize: 14,
    color: C.muted,
    align: "center",
    margin: 0,
  });
  addFooter(slide, ++s);
}

// 13
{
  const slide = pptx.addSlide();
  slideBg(slide);
  title(slide, "Implementation Challenges", "The project required practical debugging across model export, Android build, and runtime performance.");
  const challenges = [
    ["ONNX opset support", "Original export used a newer opset; mobile runtime required compatible opset export."],
    ["Runtime input type", "ONNX expected tensor(float), so input was changed to Float32List instead of double."],
    ["Camera lifecycle", "Disposed controller caused preview crashes; lifecycle checks were added."],
    ["OneDrive locks", "Build files were locked by sync, so project was moved to a normal dev folder."],
    ["False detections", "Thresholds, NMS, label mapping, and filtering were tuned repeatedly."],
    ["Lag", "Frame throttling and reduced UI work were used to reduce dropped buffers."],
  ];
  challenges.forEach((c, i) => {
    const x = i % 2 === 0 ? 0.8 : 6.85;
    const y = 1.48 + Math.floor(i / 2) * 1.62;
    slide.addText(c[0], { x, y, w: 4.9, h: 0.28, fontFace: "Bahnschrift", fontSize: 14.5, bold: true, color: i < 2 ? C.red : C.teal, margin: 0 });
    slide.addShape(pptx.ShapeType.line, { x, y: y + 0.38, w: 4.8, h: 0, line: { color: C.line, width: 1 } });
    slide.addText(c[1], { x, y: y + 0.52, w: 5.0, h: 0.48, fontSize: 10.5, color: C.muted, fit: "shrink", margin: 0 });
  });
  addFooter(slide, ++s);
}

// 14
{
  const slide = pptx.addSlide();
  slideBg(slide);
  title(slide, "Testing and Observations", "Testing focused on real phone behavior, not only desktop model output.");
  callout(slide, "The app successfully opens the camera preview and processes frames.", "Camera", 0.8, 1.45, 2.8, 1.45, C.green);
  callout(slide, "Model loads from bundled assets and runs offline on mobile.", "Offline", 3.95, 1.45, 2.8, 1.45, C.teal);
  callout(slide, "TTS engine connects and can speak alerts after detection.", "Voice", 7.1, 1.45, 2.8, 1.45, C.blue);
  callout(slide, "Open Images labels may create unexpected detections for small objects.", "Limits", 10.25, 1.45, 2.25, 1.45, C.orange);
  bulletList(slide, [
    "Tested with person, phone, bottle, laptop, toothbrush, and indoor objects.",
    "Detection quality depends strongly on lighting, focus, object size, and training labels.",
    "Small or unusual objects can be missed because the lightweight model has limited accuracy.",
    "Better results can be achieved with custom fine-tuning on target daily-use objects.",
  ], 1.0, 3.9, 11.25, 1.65, { size: 15 });
  addFooter(slide, ++s);
}

// 15
{
  const slide = pptx.addSlide();
  slideBg(slide);
  title(slide, "Applications and Benefits", "The system supports safer awareness in everyday spaces.");
  const apps = [
    "Indoor navigation support",
    "Object finding assistance",
    "Obstacle awareness",
    "Learning aid for assistive AI",
    "Low-cost accessibility prototype",
    "Offline support in low-connectivity areas",
  ];
  apps.forEach((a, i) => {
    const angle = (Math.PI * 2 * i) / apps.length - Math.PI / 2;
    const cx = 6.65 + Math.cos(angle) * 3.35;
    const cy = 3.75 + Math.sin(angle) * 1.85;
    box(slide, a, cx - 1.25, cy - 0.36, 2.5, 0.72, i % 2 === 0 ? C.white : C.soft, C.line, i % 2 === 0 ? C.teal : C.ink, 11);
  });
  slide.addShape(pptx.ShapeType.ellipse, { x: 5.35, y: 2.65, w: 2.6, h: 2.0, fill: { color: C.teal }, line: { color: C.teal } });
  slide.addText("Assistive\nAwareness", { x: 5.65, y: 3.16, w: 2.0, h: 0.65, fontFace: "Bahnschrift", fontSize: 18, bold: true, color: C.white, align: "center", margin: 0, fit: "shrink" });
  addFooter(slide, ++s);
}

// 16
{
  const slide = pptx.addSlide();
  slideBg(slide);
  title(slide, "Future Scope", "Next improvements can make the system more accurate, faster, and more useful.");
  const roadmap = [
    ["Custom training", "Fine-tune on daily objects such as phone, bottle, chair, laptop, toothbrush, knife, and vehicle classes."],
    ["Better model", "Use newer mobile-friendly detection models or quantized ONNX/TFLite versions."],
    ["Depth support", "Improve distance estimation using stereo/depth sensors where available."],
    ["Navigation mode", "Add path guidance, obstacle priority, and vibration feedback."],
    ["User profiles", "Allow adjustable speech speed, sensitivity, and preferred object categories."],
  ];
  roadmap.forEach((r, i) => {
    const y = 1.45 + i * 1.0;
    slide.addShape(pptx.ShapeType.ellipse, { x: 0.92, y: y + 0.05, w: 0.35, h: 0.35, fill: { color: i === 0 ? C.red : C.green }, line: { color: C.white, transparency: 100 } });
    slide.addText(r[0], { x: 1.45, y, w: 2.6, h: 0.25, fontFace: "Bahnschrift", fontSize: 14.5, bold: true, color: C.ink, margin: 0 });
    slide.addText(r[1], { x: 4.05, y: y - 0.03, w: 8.0, h: 0.42, fontSize: 10.8, color: C.muted, fit: "shrink", margin: 0 });
    if (i < roadmap.length - 1) slide.addShape(pptx.ShapeType.line, { x: 1.09, y: y + 0.42, w: 0, h: 0.58, line: { color: C.line, width: 1.6 } });
  });
  addFooter(slide, ++s);
}

// 17
{
  const slide = pptx.addSlide();
  slideBg(slide);
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: H, fill: { color: C.teal }, line: { color: C.teal } });
  slide.addShape(pptx.ShapeType.arc, { x: -0.5, y: -1.2, w: 8.8, h: 9.5, line: { color: C.green, width: 3, transparency: 20 } });
  slide.addText("Conclusion", {
    x: 0.9,
    y: 0.85,
    w: 4.3,
    h: 0.6,
    fontFace: "Bahnschrift",
    fontSize: 34,
    bold: true,
    color: C.white,
    margin: 0,
  });
  slide.addText("OpenWorld Blind AI demonstrates how offline computer vision can become a practical assistive layer on a normal smartphone.", {
    x: 0.95,
    y: 2.05,
    w: 10.9,
    h: 1.25,
    fontFace: "Bahnschrift",
    fontSize: 30,
    bold: true,
    color: C.white,
    fit: "shrink",
    margin: 0,
  });
  slide.addText("The project combines Flutter, camera streaming, YOLOv8 ONNX inference, post-processing, and text-to-speech to provide spoken object awareness without internet dependency.", {
    x: 0.98,
    y: 4.05,
    w: 9.9,
    h: 0.75,
    fontSize: 16,
    color: "D7F4E6",
    fit: "shrink",
    margin: 0,
  });
  slide.addText("Thank You", {
    x: 0.98,
    y: 5.78,
    w: 3.2,
    h: 0.42,
    fontFace: "Bahnschrift",
    fontSize: 22,
    bold: true,
    color: C.white,
    margin: 0,
  });
  slide.addText("N.Sharath Kumar - 23261A6634\nSanne Rohith - 23261A6645", {
    x: 0.98,
    y: 6.25,
    w: 4.1,
    h: 0.48,
    fontSize: 11.5,
    color: "D7F4E6",
    fit: "shrink",
    margin: 0,
  });
}

const out = path.join(outDir, "AI_Based_Offline_Object_Detection_OpenWorld_Blind_AI.pptx");
pptx.writeFile({ fileName: out }).then(() => {
  console.log(out);
});
