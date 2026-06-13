import 'dart:ui';

import 'package:onnxruntime/onnxruntime.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:openworld_blind_ai/src/constants/alert_profiles.dart';
import 'package:openworld_blind_ai/src/models/detection.dart';
import 'package:openworld_blind_ai/src/utils/nms.dart';

class YoloService {
  static const int inputSize = 640;
  static const int classCount = 601;

  OrtSession? _session;
  String _inputName = 'images';
  List<String> _labels = const [];

  Future<void> init() async {
    if (_session != null) return;

    OrtEnv.instance.init();
    final options = OrtSessionOptions();

    final modelData = await rootBundle.load('assets/models/yolov8n-oiv7.onnx');
    final modelBytes = modelData.buffer.asUint8List();
    _session = OrtSession.fromBuffer(modelBytes, options);

    final labelsText = await rootBundle.loadString('assets/labels/open_images_v7_601.txt');
    _labels = labelsText
        .split('\n')
        .map((e) => e.trim())
        .where((e) => e.isNotEmpty)
        .toList(growable: false);

    if (_labels.length < classCount) {
      _labels = List<String>.generate(classCount, (i) {
        if (i < _labels.length) return _labels[i];
        return 'class_$i';
      });
    }
  }

  Future<List<Detection>> infer({
    required List<double> inputTensor,
    required double confidenceThreshold,
    required bool emergencyMode,
    double iouThreshold = 0.45,
  }) async {
    final session = _session;
    if (session == null) return const [];

    final input = OrtValueTensor.createTensorWithDataList(
      inputTensor,
      [1, 3, inputSize, inputSize],
    );

    final runOptions = OrtRunOptions();

    List<OrtValue?>? outputs;
    try {
      outputs = await session.runAsync(runOptions, {_inputName: input});
    } catch (_) {
      if (_inputName == 'images') {
        _inputName = 'image';
        outputs = await session.runAsync(runOptions, {_inputName: input});
      } else {
        rethrow;
      }
    } finally {
      input.release();
      runOptions.release();
    }

    if (outputs == null || outputs.isEmpty || outputs.first == null) {
      return const [];
    }

    final raw = outputs.first!.value;
    final detections = _decode(raw, confidenceThreshold, emergencyMode);

    for (final output in outputs) {
      output?.release();
    }

    return Nms.apply(detections, iouThreshold: iouThreshold)
      ..sort((a, b) => b.confidence.compareTo(a.confidence));
  }

  List<Detection> _decode(dynamic raw, double confidenceThreshold, bool emergencyMode) {
    final squeezed = _squeezeLeadingSingleton(raw);
    if (squeezed is! List || squeezed.isEmpty) return const [];

    // Expected either [605, 8400] or [8400, 605]
    if (squeezed.first is! List) return const [];

    final firstDim = squeezed.length;
    final secondDim = (squeezed.first as List).length;

    if (firstDim == classCount + 4 && secondDim > 0) {
      return _decode605xN(squeezed, confidenceThreshold, emergencyMode);
    }

    if (secondDim == classCount + 4 && firstDim > 0) {
      return _decodeNx605(squeezed, confidenceThreshold, emergencyMode);
    }

    return const [];
  }

  List<Detection> _decode605xN(List data, double confidenceThreshold, bool emergencyMode) {
    final anchors = (data[0] as List).length;
    final out = <Detection>[];

    for (int i = 0; i < anchors; i++) {
      final cx = _n(data[0][i]);
      final cy = _n(data[1][i]);
      final w = _n(data[2][i]);
      final h = _n(data[3][i]);

      int bestClass = -1;
      double bestScore = 0.0;

      for (int c = 0; c < classCount; c++) {
        final score = _n(data[c + 4][i]);
        if (score > bestScore) {
          bestScore = score;
          bestClass = c;
        }
      }

      if (bestClass < 0 || bestScore < confidenceThreshold) continue;

      final det = _buildDetection(
        classIndex: bestClass,
        conf: bestScore,
        cx: cx,
        cy: cy,
        w: w,
        h: h,
        emergencyMode: emergencyMode,
      );

      if (det != null) {
        out.add(det);
      }
    }

    return out;
  }

  List<Detection> _decodeNx605(List data, double confidenceThreshold, bool emergencyMode) {
    final out = <Detection>[];

    for (final rowDynamic in data) {
      if (rowDynamic is! List || rowDynamic.length < classCount + 4) {
        continue;
      }

      final cx = _n(rowDynamic[0]);
      final cy = _n(rowDynamic[1]);
      final w = _n(rowDynamic[2]);
      final h = _n(rowDynamic[3]);

      int bestClass = -1;
      double bestScore = 0.0;

      for (int c = 0; c < classCount; c++) {
        final score = _n(rowDynamic[c + 4]);
        if (score > bestScore) {
          bestScore = score;
          bestClass = c;
        }
      }

      if (bestClass < 0 || bestScore < confidenceThreshold) continue;

      final det = _buildDetection(
        classIndex: bestClass,
        conf: bestScore,
        cx: cx,
        cy: cy,
        w: w,
        h: h,
        emergencyMode: emergencyMode,
      );

      if (det != null) {
        out.add(det);
      }
    }

    return out;
  }

  Detection? _buildDetection({
    required int classIndex,
    required double conf,
    required double cx,
    required double cy,
    required double w,
    required double h,
    required bool emergencyMode,
  }) {
    if (w <= 0 || h <= 0) return null;

    final x1 = ((cx - (w / 2.0)) / inputSize).clamp(0.0, 1.0);
    final y1 = ((cy - (h / 2.0)) / inputSize).clamp(0.0, 1.0);
    final x2 = ((cx + (w / 2.0)) / inputSize).clamp(0.0, 1.0);
    final y2 = ((cy + (h / 2.0)) / inputSize).clamp(0.0, 1.0);

    if (x2 <= x1 || y2 <= y1) return null;

    final rect = Rect.fromLTRB(x1, y1, x2, y2);

    final areaRatio = rect.width * rect.height;
    final distance = _estimateDistanceMeters(areaRatio);
    final distanceLabel = _distanceText(distance);
    final positionLabel = _positionText(rect.center.dx);

    final label = classIndex >= 0 && classIndex < _labels.length
        ? _labels[classIndex]
        : 'class_$classIndex';

    final isCritical = criticalClasses.contains(label.toLowerCase());
    final isClose = distance <= 1.2;
    final isCloseDanger = emergencyMode && isCritical && isClose;

    final profile = getAlertProfile(
      label: label,
      isCritical: isCritical,
      isClose: isClose,
    );

    return Detection(
      classIndex: classIndex,
      label: label,
      confidence: conf,
      rect: rect,
      distanceMeters: distance,
      distanceLabel: distanceLabel,
      positionLabel: positionLabel,
      alertCategory: profile.name,
      isCritical: isCritical,
      isCloseDanger: isCloseDanger,
    );
  }

  double _estimateDistanceMeters(double areaRatio) {
    if (areaRatio > 0.38) return 0.6;
    if (areaRatio > 0.25) return 0.9;
    if (areaRatio > 0.14) return 1.4;
    if (areaRatio > 0.07) return 2.2;
    if (areaRatio > 0.03) return 3.3;
    return 5.0;
  }

  String _distanceText(double meters) {
    if (meters <= 1.0) return 'very close';
    if (meters <= 2.0) return 'close';
    if (meters <= 3.5) return 'medium';
    return 'far';
  }

  String _positionText(double centerX) {
    if (centerX < 0.33) return 'left';
    if (centerX > 0.66) return 'right';
    return 'center';
  }

  dynamic _squeezeLeadingSingleton(dynamic value) {
    dynamic current = value;
    while (current is List && current.length == 1 && current.first is List) {
      current = current.first;
    }
    return current;
  }

  double _n(dynamic value) {
    if (value is num) return value.toDouble();
    return double.tryParse(value.toString()) ?? 0.0;
  }

  Future<void> dispose() async {
    _session?.release();
    _session = null;
    OrtEnv.instance.release();
  }
}
