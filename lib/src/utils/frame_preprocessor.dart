import 'dart:math' as math;

import 'package:camera/camera.dart';

class FramePreprocessor {
  static const int modelSize = 640;

  static List<double> toModelInput(CameraImage image) {
    if (image.format.group == ImageFormatGroup.yuv420) {
      return _fromYuv420(image);
    }
    if (image.format.group == ImageFormatGroup.bgra8888) {
      return _fromBgra8888(image);
    }
    throw UnsupportedError('Unsupported camera format: ${image.format.group}');
  }

  static List<double> _fromYuv420(CameraImage image) {

    final yPlane = image.planes[0];
    final uPlane = image.planes[1];
    final vPlane = image.planes[2];

    final yBytes = yPlane.bytes;
    final uBytes = uPlane.bytes;
    final vBytes = vPlane.bytes;

    final yRowStride = yPlane.bytesPerRow;
    final yPixelStride = yPlane.bytesPerPixel ?? 1;
    final uvRowStride = uPlane.bytesPerRow;
    final uvPixelStride = uPlane.bytesPerPixel ?? 1;

    final srcW = image.width;
    final srcH = image.height;

    final tensor = List<double>.filled(1 * 3 * modelSize * modelSize, 0.0);
    final planeSize = modelSize * modelSize;

    for (int y = 0; y < modelSize; y++) {
      final srcY = (y * srcH / modelSize).floor().clamp(0, srcH - 1);
      for (int x = 0; x < modelSize; x++) {
        final srcX = (x * srcW / modelSize).floor().clamp(0, srcW - 1);

        final yIndex = srcY * yRowStride + srcX * yPixelStride;
        final uvIndex = (srcY ~/ 2) * uvRowStride + (srcX ~/ 2) * uvPixelStride;

        final yValue = yBytes[yIndex];
        final uValue = uBytes[uvIndex];
        final vValue = vBytes[uvIndex];

        final rgb = _yuvToRgb(yValue, uValue, vValue);
        final pixelIndex = y * modelSize + x;

        tensor[pixelIndex] = rgb[0] / 255.0;
        tensor[planeSize + pixelIndex] = rgb[1] / 255.0;
        tensor[(planeSize * 2) + pixelIndex] = rgb[2] / 255.0;
      }
    }

    return tensor;
  }

  static List<double> _fromBgra8888(CameraImage image) {
    final plane = image.planes.first;
    final bytes = plane.bytes;
    final rowStride = plane.bytesPerRow;
    final srcW = image.width;
    final srcH = image.height;

    final tensor = List<double>.filled(1 * 3 * modelSize * modelSize, 0.0);
    final planeSize = modelSize * modelSize;

    for (int y = 0; y < modelSize; y++) {
      final srcY = (y * srcH / modelSize).floor().clamp(0, srcH - 1);
      for (int x = 0; x < modelSize; x++) {
        final srcX = (x * srcW / modelSize).floor().clamp(0, srcW - 1);
        final base = srcY * rowStride + (srcX * 4);

        final b = bytes[base];
        final g = bytes[base + 1];
        final r = bytes[base + 2];

        final pixelIndex = y * modelSize + x;
        tensor[pixelIndex] = r / 255.0;
        tensor[planeSize + pixelIndex] = g / 255.0;
        tensor[(planeSize * 2) + pixelIndex] = b / 255.0;
      }
    }

    return tensor;
  }

  static List<int> _yuvToRgb(int y, int u, int v) {
    final yf = y.toDouble();
    final uf = u.toDouble() - 128.0;
    final vf = v.toDouble() - 128.0;

    final r = yf + (1.402 * vf);
    final g = yf - (0.344136 * uf) - (0.714136 * vf);
    final b = yf + (1.772 * uf);

    return [
      _clamp255(r.round()),
      _clamp255(g.round()),
      _clamp255(b.round()),
    ];
  }

  static int _clamp255(int value) => math.min(255, math.max(0, value));
}
