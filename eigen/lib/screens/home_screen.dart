import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../services/auth_service.dart';
import '../models/mock_data.dart';
import 'login_screen.dart';
import 'event_details_screen.dart'; // We will build this next

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  Future<void> _logout(BuildContext context) async {
    const storage = FlutterSecureStorage();
    await storage.delete(key: 'auth_token');
    await AuthService().logout();
    if (!context.mounted) return;
    Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) => const LoginScreen()));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('ACTIVE EVENTS', style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
        actions: [
          IconButton(icon: const Icon(Icons.logout, color: Colors.white), onPressed: () => _logout(context)),
        ],
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: mockEvents.length,
        itemBuilder: (context, index) {
          final event = mockEvents[index];
          return Card(
            color: const Color(0xFF1E1E1E), // Dark grey card
            margin: const EdgeInsets.only(bottom: 16),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: ListTile(
              contentPadding: const EdgeInsets.all(16),
              title: Text(
                event.title,
                style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
              ),
              subtitle: Padding(
                padding: const EdgeInsets.only(top: 8.0),
                child: Text(
                  '${event.clubName} • ${event.startTime} - ${event.endTime}',
                  style: const TextStyle(color: Colors.grey),
                ),
              ),
              trailing: const Icon(Icons.arrow_forward_ios, color: Colors.white),
              onTap: () {
                // Navigate to the dashboard for this specific event
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => EventDetailsScreen(event: event)),
                );
              },
            ),
          );
        },
      ),
    );
  }
}