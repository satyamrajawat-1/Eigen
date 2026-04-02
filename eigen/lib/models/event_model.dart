// lib/models/event_model.dart

class EventModel {
  final String id;
  final String title;
  final String clubName;
  final String date;
  final String startTime;
  final String endTime;
  final String location;
  final String image;
  final String participationType;

  EventModel({
    required this.id,
    required this.title,
    required this.clubName,
    required this.date,
    required this.startTime,
    required this.endTime,
    required this.location,
    required this.image,
    required this.participationType,
  });

  factory EventModel.fromJson(Map<String, dynamic> json) {
    return EventModel(
      id: json['_id'] ?? '',
      title: json['title'] ?? 'UNKNOWN EVENT',
      clubName: json['clubName'] ?? '',
      date: json['date'] ?? '',
      startTime: json['startTime'] ?? '',
      endTime: json['endTime'] ?? '',
      location: json['location'] ?? 'IIIT KOTA CAMPUS',
      image: json['image'] ?? '',
      participationType: json['participationType'] ?? 'INDIVIDUAL',
    );
  }
}