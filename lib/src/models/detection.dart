import 'dart:ui';

class Detection {
  const Detection({
    required this.classIndex,
    required this.label,
    required this.confidence,
    required this.rect,
    required this.distanceMeters,
    required this.distanceLabel,
    required this.positionLabel,
    required this.alertCategory,
    required this.isCritical,
    required this.isCloseDanger,
  });

  final int classIndex;
  final String label;
  final double confidence;

  // Normalized rect [0..1] relative to model input.
  final Rect rect;

  final double distanceMeters;
  final String distanceLabel;
  final String positionLabel;
  final String alertCategory;
  final bool isCritical;
  final bool isCloseDanger;
}