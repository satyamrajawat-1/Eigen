import 'package:flutter/material.dart';
import '../models/mock_data.dart';
import 'qr_scanner_screen.dart';

class EventDetailsScreen extends StatelessWidget {
  final FestEvent event;

  const EventDetailsScreen({super.key, required this.event});

  @override
  Widget build(BuildContext context) {
    // Filter our mock data to calculate stats
    final List<FestStudent> allRegistered = mockStudents;
    final List<FestStudent> insideStudents = mockStudents.where((s) => s.status == 'IN').toList();
    final List<FestStudent> outsideStudents = mockStudents.where((s) => s.status == 'OUT').toList();

    return DefaultTabController(
      length: 3, // 3 Tabs: All, In, Out
      child: Scaffold(
        backgroundColor: Colors.black,
        appBar: AppBar(
          title: Text(event.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
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
        body: TabBarView(
          children: [
            _buildStudentList(allRegistered),
            _buildStudentList(insideStudents),
            _buildStudentList(outsideStudents),
          ],
        ),
        // Pins the scanner buttons securely to the bottom of the screen
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
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => QRScannerScreen(event: event, scanType: 'IN'),
                        ),
                      );
                    },
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
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => QRScannerScreen(event: event, scanType: 'OUT'),
                        ),
                      );
                    },
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

  // A helper widget to build the list of students for each tab
  Widget _buildStudentList(List<FestStudent> students) {
    if (students.isEmpty) {
      return const Center(child: Text('No students in this category.', style: TextStyle(color: Colors.grey)));
    }

    return ListView.builder(
      itemCount: students.length,
      itemBuilder: (context, index) {
        final student = students[index];
        // Determine what color the status badge should be
        Color statusColor = Colors.grey;
        if (student.status == 'IN') statusColor = Colors.green;
        if (student.status == 'OUT') statusColor = Colors.red;

        return ListTile(
          leading: CircleAvatar(
            backgroundColor: Colors.white12,
            child: Text(student.name[0], style: const TextStyle(color: Colors.white)),
          ),
          title: Text(student.name, style: const TextStyle(color: Colors.white)),
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
    );
  }
}