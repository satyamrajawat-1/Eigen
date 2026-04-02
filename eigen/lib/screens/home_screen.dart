// lib/screens/home_screen.dart
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/event_model.dart';
import '../services/event_service.dart';
import 'event_details_screen.dart'; // <-- UNCOMMENTED THIS!

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final EventService _eventService = EventService();
  late Future<List<EventModel>> _myEvents;

  @override
  void initState() {
    super.initState();
    // Fire the API call as soon as the screen loads
    _myEvents = _eventService.fetchMyEvents();
  }

  // Helper function to make MongoDB dates look pretty (e.g., "Oct 12")
  String _formatDate(String dateString) {
    try {
      final DateTime parsed = DateTime.parse(dateString);
      return DateFormat('MMM dd').format(parsed);
    } catch (e) {
      return dateString;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('MY DUTY ROSTER', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.5)),
        backgroundColor: Colors.black,
      ),
      body: FutureBuilder<List<EventModel>>(
        future: _myEvents,
        builder: (context, snapshot) {
          // 1. Show a loading spinner while waiting for the server
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator(color: Colors.white));
          }

          // 2. Handle errors
          if (snapshot.hasError) {
            return Center(child: Text('Error loading events.', style: TextStyle(color: Colors.red.shade300)));
          }

          // 3. Handle Empty State (No clubs or no events created yet)
          final events = snapshot.data ?? [];
          if (events.isEmpty) {
            return const Center(
              child: Text(
                'No upcoming events for your clubs.',
                style: TextStyle(color: Colors.grey, fontSize: 16),
              ),
            );
          }

          // 4. Build the List of Live Events!
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: events.length,
            itemBuilder: (context, index) {
              final event = events[index];
              return _buildEventCard(event, context); // Passed context here!
            },
          );
        },
      ),
    );
  }

  // Added context as a parameter so Navigator knows where it is on the screen
  Widget _buildEventCard(EventModel event, BuildContext context) {
    return Card(
      color: Colors.grey.shade900,
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () {
          // <-- THIS IS THE MAGIC THAT CHANGES THE SCREEN -->
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => EventDetailsScreen(event: event),
            ),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            children: [
              // Event Date Bubble
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
                decoration: BoxDecoration(
                  color: Colors.blueAccent.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  children: [
                    Text(
                      _formatDate(event.date).split(' ')[0].toUpperCase(), // Month
                      style: const TextStyle(color: Colors.blueAccent, fontWeight: FontWeight.bold),
                    ),
                    Text(
                      _formatDate(event.date).split(' ').last, // Day
                      style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 16),

              // Event Details
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      event.title,
                      style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${event.clubName} • ${event.participationType}',
                      style: const TextStyle(color: Colors.grey, fontSize: 12),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.access_time, color: Colors.grey, size: 14),
                        const SizedBox(width: 4),
                        Text(
                          '${event.startTime} - ${event.endTime}',
                          style: const TextStyle(color: Colors.grey, fontSize: 14),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const Icon(Icons.arrow_forward_ios, color: Colors.grey, size: 16),
            ],
          ),
        ),
      ),
    );
  }
}