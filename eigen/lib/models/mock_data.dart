// lib/models/mock_data.dart

class FestEvent {
  final String id;
  final String title;
  final String clubName;
  final String startTime;
  final String endTime;

  FestEvent({required this.id, required this.title, required this.clubName, required this.startTime, required this.endTime});
}

class FestStudent {
  final String id;
  final String name;
  final String status; // 'REGISTERED', 'IN', or 'OUT'

  FestStudent({required this.id, required this.name, required this.status});
}

// --- MOCK DATABASE ---
final List<FestEvent> mockEvents = [
  FestEvent(id: '1', title: 'ROBO WARS', clubName: 'ARC ROBOTICS', startTime: '18:00', endTime: '22:00'),
  FestEvent(id: '2', title: 'HACKATHON FINALE', clubName: 'CODEBASE', startTime: '09:00', endTime: '21:00'),
  FestEvent(id: '3', title: 'DJ NIGHT', clubName: 'TECHKNOW', startTime: '22:00', endTime: '02:00'),
];

// Mocking the Attendance Schema for a single event
final List<FestStudent> mockStudents = [
  FestStudent(id: 'u1', name: 'Aarav Sharma', status: 'IN'),
  FestStudent(id: 'u2', name: 'Priya Patel', status: 'IN'),
  FestStudent(id: 'u3', name: 'Rohan Gupta', status: 'REGISTERED'),
  FestStudent(id: 'u4', name: 'Neha Singh', status: 'OUT'),
  FestStudent(id: 'u5', name: 'Kabir Das', status: 'REGISTERED'),
];