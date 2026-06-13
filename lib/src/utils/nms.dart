import 'dart:math' as math;

import 'package:openworld_blind_ai/src/models/detection.dart';

class Nms {
  static List<Detection> apply(List<Detection> detections, {double iouThreshold = 0.45}) {
    if (detections.isEmpty) return const [];

    final sorted = [...detections]..sort((a, b) => b.confidence.compareTo(a.confidence));
    final kept = <Detection>[];

    while (sorted.isNotEmpty) {
      final best = sorted.removeAt(0);
      kept.add(best);
      sorted.removeWhere((candidate) => _iou(best, candidate) > iouThreshold);
    }

    return kept;
  }

  static double _iou(Detection a, Detection b) {
    final left = math.max(a.rect.left, b.rect.left);
    final top = math.max(a.rect.top, b.rect.top);
    final right = math.min(a.rect.right, b.rect.right);
    final bottom = math.min(a.rect.bottom, b.rect.bottom);

    final interW = math.max(0.0, right - left);
    final interH = math.max(0.0, bottom - top);
    final interArea = interW * interH;

    if (interArea <= 0) return 0;

    final union = a.rect.width * a.rect.height + b.rect.width * b.rect.height - interArea;
    if (union <= 0) return 0;

    return interArea / union;
  }
}