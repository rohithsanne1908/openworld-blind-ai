import 'dart:async';

import 'package:flutter_tts/flutter_tts.dart';

class TtsService {
  final FlutterTts _tts = FlutterTts();
  final Map<String, DateTime> _lastSpokenAt = {};

  double _volume = 1.0;

  Future<void> init() async {
    await _tts.setLanguage('en-US');
    await _tts.setSpeechRate(0.48);
    await _tts.setPitch(1.0);
    await _tts.setVolume(_volume);
    await _tts.awaitSpeakCompletion(true);
  }

  Future<void> setVolume(double volume) async {
    _volume = volume.clamp(0.0, 1.0);
    await _tts.setVolume(_volume);
  }

  Future<void> speakWithCooldown({
    required String key,
    required String message,
    Duration cooldown = const Duration(seconds: 3),
    bool urgent = false,
  }) async {
    final now = DateTime.now();
    final last = _lastSpokenAt[key];
    if (last != null && now.difference(last) < cooldown) {
      return;
    }

    _lastSpokenAt[key] = now;

    if (urgent) {
      await _tts.stop();
      await _tts.setSpeechRate(0.56);
      await _tts.speak(message);
      await _tts.setSpeechRate(0.48);
      return;
    }

    await _tts.speak(message);
  }

  Future<void> stop() => _tts.stop();

  Future<void> dispose() async {
    await _tts.stop();
  }
}