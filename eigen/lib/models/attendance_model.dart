class AttendanceModel {
  final String id;
  final String name;
  final String status;

  AttendanceModel({
    required this.id,
    required this.name,
    required this.status,
  });

  factory AttendanceModel.fromJson(Map<String, dynamic> json) {
    return AttendanceModel(
      id: json['_id'] ?? '',
      // We extract the name from the populated 'user' object!
      name: json['user'] != null ? json['user']['name'] : 'Unknown Student',
      status: json['status'] ?? 'REGISTERED',
    );
  }
}