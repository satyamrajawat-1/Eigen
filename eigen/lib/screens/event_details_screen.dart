import 'package:flutter/material.dart';
import '../models/event_model.dart';
import '../models/attendance_model.dart';
import '../services/event_service.dart';
import 'qr_scanner_screen.dart';

class EventDetailsScreen extends StatefulWidget {
  // Notice we use the real EventModel now, not the mock one!
  final EventModel event;

  const EventDetailsScreen({super.key, required this.event});

  @override
  State<EventDetailsScreen> createState() => _EventDetailsScreenState();
}

class _EventDetailsScreenState extends State<EventDetailsScreen> {
  final EventService _eventService = EventService();
  bool _isLoading = true;
  List<AttendanceModel> _allAttendees = [];

  @override
  void initState() {
    super.initState();
    _loadAttendees();
  }

  // This function fetches the live data and updates the screen
  Future<void> _loadAttendees() async {
    setState(() => _isLoading = true);

    List<AttendanceModel> liveData = await _eventService.fetchAttendees(widget.event.id);

    setState(() {
      _allAttendees = liveData;
      _isLoading = false;
    });
  }

  // The "Real-Time" Trick: Wait for the scanner to close, then fetch fresh data!
  Future<void> _openScannerAndRefresh(String type) async {
    // 1. Open the scanner and wait for the user to pop back
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => QRScannerScreen(event: widget.event, scanType: type),
      ),
    );
    // 2. When they return, instantly refresh the list!
    _loadAttendees();
  }

  @override
  Widget build(BuildContext context) {
    // Filter our live data into the specific tabs
    final List<AttendanceModel> insideStudents = _allAttendees.where((s) => s.status == 'IN').toList();
    final List<AttendanceModel> outsideStudents = _allAttendees.where((s) => s.status == 'OUT').toList();

    return DefaultTabController(
      length: 3,
      child: Scaffold(
        backgroundColor: Colors.black,
        appBar: AppBar(
          title: Text(widget.event.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          backgroundColor: Colors.black,
          bottom: const TabBar(
            indicatorColor: Colors.white,
            labelColor: Colors.white,
            unselectedLabelColor: Colors.grey,
            tabs: [
              Tab(text: 'REGISTERED'),
              Tab(text: 'INSIDE'),
              Tab(text: 'EXITED'),
            ],
          ),
        ),
        body: _isLoading
            ? const Center(child: CircularProgressIndicator(color: Colors.white))
            : TabBarView(
          children: [
            _buildStudentList(_allAttendees),
            _buildStudentList(insideStudents),
            _buildStudentList(outsideStudents),
          ],
        ),

        // SCANNER BUTTONS
        bottomNavigationBar: Container(
          padding: const EdgeInsets.all(16.0),
          decoration: const BoxDecoration(
            color: Color(0xFF121212),
            border: Border(top: BorderSide(color: Colors.white24, width: 1)),
          ),
          child: SafeArea(
            child: Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _openScannerAndRefresh('IN'),
                    icon: const Icon(Icons.login, color: Colors.white),
                    label: const Text('SCAN IN', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green.shade800,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _openScannerAndRefresh('OUT'),
                    icon: const Icon(Icons.logout, color: Colors.white),
                    label: const Text('SCAN OUT', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red.shade900,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // Builds the UI for the list items
  Widget _buildStudentList(List<AttendanceModel> students) {
    if (students.isEmpty) {
      return const Center(child: Text('No students in this category.', style: TextStyle(color: Colors.grey)));
    }

    return RefreshIndicator( // Adds "Pull down to refresh" functionality!
      onRefresh: _loadAttendees,
      color: Colors.black,
      backgroundColor: Colors.white,
      child: ListView.builder(
        itemCount: students.length,
        itemBuilder: (context, index) {
          final student = students[index];

          Color statusColor = Colors.grey;
          if (student.status == 'IN') statusColor = Colors.greenAccent;
          if (student.status == 'OUT') statusColor = Colors.redAccent;

          return ListTile(
            leading: CircleAvatar(
              backgroundColor: Colors.white12,
              child: Text(student.name[0].toUpperCase(), style: const TextStyle(color: Colors.white)),
            ),
            title: Text(student.name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            trailing: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: statusColor.withOpacity(0.2),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: statusColor),
              ),
              child: Text(student.status, style: TextStyle(color: statusColor, fontSize: 12, fontWeight: FontWeight.bold)),
            ),
          );
        },
      ),
    );
  }
}