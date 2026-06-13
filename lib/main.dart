import 'dart:async';

import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';

import 'src/constants/alert_profiles.dart';
import 'src/models/detection.dart';
import 'src/services/tts_service.dart';
import 'src/services/yolo_service.dart';
import 'src/utils/frame_preprocessor.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const BlindAiApp());
}

class BlindAiApp extends StatelessWidget {
  const BlindAiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'OpenWorld Blind AI',
      theme: ThemeData(
        colorSchemeSeed: Colors.teal,
        useMaterial3: true,
      ),
      home: const BlindAiHomePage(),
    );
  }
}

class BlindAiHomePage extends StatefulWidget {
  const BlindAiHomePage({super.key});

  @override
  State<BlindAiHomePage> createState() => _BlindAiHomePageState();
}

class _BlindAiHomePageState extends State<BlindAiHomePage> {
  final YoloService _yoloService = YoloService();
  final TtsService _ttsService = TtsService();

  CameraController? _cameraController;
  List<Detection> _detections = const [];

  bool _isModelReady = false;
  bool _isDetecting = false;
  bool _isEmergencyMode = true;
  bool _isProcessing = false;

  String _status = 'Stopped';
  double _confidenceThreshold = 0.65;
  double _volume = 1.0;

  int _frameCounter = 0;

  @override
  void initState() {
    super.initState();
    _bootstrap();
  }

  Future<void> _bootstrap() async {
    try {
      await _ttsService.init();
      await _yoloService.init();
      if (!mounted) return;
      setState(() {
        _isModelReady = true;
        _status = 'Ready. Press START';
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _status = 'Initialization failed: $e';
      });
    }
  }

  Future<void> _toggleDetection() async {
    if (_isDetecting) {
      await _stopDetection();
    } else {
      await _startDetection();
    }
  }

  Future<void> _startDetection() async {
    if (!_isModelReady) return;

    final cameraStatus = await Permission.camera.request();
    if (!cameraStatus.isGranted) {
      if (!mounted) return;
      setState(() {
        _status = 'Camera permission denied';
      });
      return;
    }

    final cameras = await availableCameras();
    final back = cameras.firstWhere(
      (c) => c.lensDirection == CameraLensDirection.back,
      orElse: () => cameras.first,
    );

    final controller = CameraController(
      back,
      ResolutionPreset.medium,
      imageFormatGroup: ImageFormatGroup.yuv420,
      enableAudio: false,
    );

    await controller.initialize();

    await controller.startImageStream((frame) {
      _processFrame(frame);
    });

    if (!mounted) return;
    setState(() {
      _cameraController = controller;
      _isDetecting = true;
      _status = 'Detecting...';
    });
  }

  Future<void> _stopDetection() async {
    final controller = _cameraController;

    if (controller != null) {
      if (controller.value.isStreamingImages) {
        await controller.stopImageStream();
      }
      await controller.dispose();
    }

    await _ttsService.stop();

    if (!mounted) return;
    setState(() {
      _cameraController = null;
      _isDetecting = false;
      _detections = const [];
      _status = 'Stopped';
      _isProcessing = false;
    });
  }

  Future<void> _processFrame(CameraImage frame) async {
    if (!_isDetecting || _isProcessing) return;

    _frameCounter += 1;
    if (_frameCounter % 3 != 0) {
      return;
    }

    _isProcessing = true;

    try {
      final input = FramePreprocessor.toModelInput(frame);
      final detections = await _yoloService.infer(
        inputTensor: input,
        confidenceThreshold: _confidenceThreshold,
        emergencyMode: _isEmergencyMode,
        iouThreshold: 0.45,
      );

      if (!mounted) return;

      setState(() {
        _detections = detections;
        _status = detections.isEmpty
            ? 'No objects detected'
            : 'Detecting ${detections.length} objects';
      });

      await _speakDetections(detections);
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _status = 'Detection error: $e';
      });
    } finally {
      _isProcessing = false;
    }
  }

  Future<void> _speakDetections(List<Detection> detections) async {
    if (detections.isEmpty) return;

    final top = detections.take(3);
    for (final d in top) {
      final percent = (d.confidence * 100).toStringAsFixed(0);
      final meters = d.distanceMeters.toStringAsFixed(1);

      if (d.isCloseDanger) {
        await _ttsService.speakWithCooldown(
          key: 'danger-${d.label}-${d.positionLabel}',
          message: 'Danger! ${d.label} very close on your ${d.positionLabel}',
          urgent: true,
        );
        continue;
      }

      final spoken =
          '${d.label}, ${d.positionLabel}, $percent percent confidence, about $meters meters';

      await _ttsService.speakWithCooldown(
        key: '${d.label}-${d.positionLabel}',
        message: spoken,
      );
    }
  }

  void _openSettings() {
    showModalBottomSheet<void>(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'Settings',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      const SizedBox(width: 110, child: Text('Volume')),
                      Expanded(
                        child: Slider(
                          value: _volume,
                          min: 0.0,
                          max: 1.0,
                          onChanged: (v) async {
                            setModalState(() => _volume = v);
                            setState(() => _volume = v);
                            await _ttsService.setVolume(v);
                          },
                        ),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      const SizedBox(width: 110, child: Text('Sensitivity')),
                      Expanded(
                        child: Slider(
                          value: _confidenceThreshold,
                          min: 0.35,
                          max: 0.90,
                          onChanged: (v) {
                            setModalState(() => _confidenceThreshold = v);
                            setState(() => _confidenceThreshold = v);
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  void dispose() {
    unawaited(_stopDetection());
    unawaited(_yoloService.dispose());
    unawaited(_ttsService.dispose());
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cameraController = _cameraController;
    final hasCamera = cameraController != null && cameraController.value.isInitialized;

    final statusColor = _isDetecting ? Colors.green : Colors.red;

    return Scaffold(
      appBar: AppBar(
        title: const Text('OpenWorld Blind AI'),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              flex: 4,
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: SizedBox.expand(
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _isDetecting ? Colors.red : Colors.green,
                      foregroundColor: Colors.white,
                      textStyle: const TextStyle(
                        fontSize: 40,
                        fontWeight: FontWeight.bold,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                      ),
                    ),
                    onPressed: _toggleDetection,
                    child: Text(_isDetecting ? 'STOP' : 'START'),
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                children: [
                  Icon(Icons.circle, color: statusColor, size: 14),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _status,
                      style: TextStyle(
                        color: statusColor,
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              flex: 4,
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 12),
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Colors.black,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: hasCamera
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: Stack(
                          fit: StackFit.expand,
                          children: [
                            CameraPreview(cameraController),
                            CustomPaint(
                              painter: DetectionPainter(_detections),
                            ),
                          ],
                        ),
                      )
                    : const Center(
                        child: Text(
                          'Camera preview will appear here',
                          style: TextStyle(color: Colors.white70),
                        ),
                      ),
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              child: Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _isEmergencyMode ? Colors.red : Colors.grey[600],
                        foregroundColor: Colors.white,
                        minimumSize: const Size.fromHeight(52),
                      ),
                      onPressed: () {
                        setState(() => _isEmergencyMode = !_isEmergencyMode);
                      },
                      icon: const Icon(Icons.warning_amber_rounded),
                      label: Text(_isEmergencyMode ? 'Emergency ON' : 'Emergency OFF'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _openSettings,
                      icon: const Icon(Icons.settings),
                      label: const Text('Settings'),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class DetectionPainter extends CustomPainter {
  const DetectionPainter(this.detections);

  final List<Detection> detections;

  @override
  void paint(Canvas canvas, Size size) {
    final boxPaint = Paint()
      ..color = Colors.greenAccent
      ..strokeWidth = 2.2
      ..style = PaintingStyle.stroke;

    for (final d in detections) {
      final rect = Rect.fromLTRB(
        d.rect.left * size.width,
        d.rect.top * size.height,
        d.rect.right * size.width,
        d.rect.bottom * size.height,
      );

      canvas.drawRect(rect, boxPaint);

      final profile = getAlertProfile(
        label: d.label,
        isCritical: d.isCritical,
        isClose: d.distanceMeters < 1.2,
      );

      final label =
          '${d.label} ${(d.confidence * 100).toStringAsFixed(0)}% ${d.distanceLabel} ${profile.name}';

      final tp = TextPainter(
        text: TextSpan(
          text: label,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 12,
            fontWeight: FontWeight.w600,
          ),
        ),
        textDirection: TextDirection.ltr,
      )..layout(maxWidth: size.width * 0.9);

      final bgRect = Rect.fromLTWH(
        rect.left,
        (rect.top - tp.height - 6).clamp(0.0, size.height - tp.height - 4),
        tp.width + 8,
        tp.height + 4,
      );

      final bgPaint = Paint()
        ..color = profile.color.withOpacity(0.86)
        ..style = PaintingStyle.fill;

      canvas.drawRRect(
        RRect.fromRectAndRadius(bgRect, const Radius.circular(4)),
        bgPaint,
      );

      tp.paint(canvas, Offset(bgRect.left + 4, bgRect.top + 2));
    }
  }

  @override
  bool shouldRepaint(covariant DetectionPainter oldDelegate) {
    return oldDelegate.detections != detections;
  }
}
