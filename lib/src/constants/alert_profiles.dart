import 'package:flutter/material.dart';

enum AlertBucket { red, orange, blue, yellow, green }

class AlertProfile {
  const AlertProfile({required this.bucket, required this.color, required this.name});

  final AlertBucket bucket;
  final Color color;
  final String name;
}

const Set<String> criticalClasses = {
  'person',
  'car',
  'bus',
};

const Set<String> cautionClasses = {
  'bicycle',
  'motorcycle',
  'truck',
  'van',
  'traffic light',
  'stop sign',
};

const Set<String> navigationClasses = {
  'door',
  'stairs',
  'staircase',
  'crosswalk',
  'sidewalk',
  'path',
  'ramp',
  'pedestrian crossing',
};

AlertProfile getAlertProfile({
  required String label,
  required bool isCritical,
  required bool isClose,
}) {
  final lower = label.toLowerCase();

  if (isCritical) {
    return AlertProfile(
      bucket: AlertBucket.red,
      color: Colors.red,
      name: 'RED',
    );
  }

  if (isClose) {
    return AlertProfile(
      bucket: AlertBucket.orange,
      color: Colors.orange,
      name: 'ORANGE',
    );
  }

  if (navigationClasses.contains(lower)) {
    return AlertProfile(
      bucket: AlertBucket.blue,
      color: Colors.blue,
      name: 'BLUE',
    );
  }

  if (cautionClasses.contains(lower)) {
    return AlertProfile(
      bucket: AlertBucket.yellow,
      color: Colors.yellow,
      name: 'YELLOW',
    );
  }

  return AlertProfile(
    bucket: AlertBucket.green,
    color: Colors.green,
    name: 'GREEN',
  );
}