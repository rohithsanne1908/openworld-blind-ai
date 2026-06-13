# OpenWorld Blind AI (Flutter)

Offline assistive mobile app for visually impaired users with:

- Real-time object detection from phone camera
- YOLOv8n Open Images V7 (601 classes)
- ONNX Runtime inference on-device
- Spoken alerts with 3-second cooldown
- Emergency mode for close critical objects
- Confidence + distance estimation + position cues

## Implemented Logic

- Camera frame stream (back camera)
- Resize + convert to model input `1x3x640x640`
- ONNX inference
- Post-processing with:
  - `confThreshold` default `0.65`
  - NMS IoU `0.45`
- Critical classes: `person`, `car`, `bus`
- 5 alert categories: `RED`, `ORANGE`, `BLUE`, `YELLOW`, `GREEN`
- TTS cooldown: 3 seconds per object-position key
- Emergency urgent speech when close critical object is detected

## Asset Paths

- Model: `assets/models/yolov8n-oiv7.onnx`
- Labels: `assets/labels/open_images_v7_601.txt` (already included, 601 lines)

## Important

Replace `assets/models/yolov8n-oiv7.onnx` placeholder text file with your actual ONNX model.

## Run

```bash
flutter pub get
flutter run
```

## Permissions

- Android: `CAMERA`, `INTERNET`
- iOS: camera usage description in `Info.plist`

## Notes

- App is designed to run fully offline after assets are bundled.
- `INTERNET` permission is kept only for optional fallback distribution workflows.
- If your ONNX model uses a different input name than `images` / `image`, update `_inputName` handling in `lib/src/services/yolo_service.dart`.