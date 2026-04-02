// lib/services/event_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/event_model.dart';

class EventService {
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  // Replace this with your live Render URL when testing on a real phone!
  final String baseUrl = 'https://eigen-hhcm.onrender.com/api/v1/events';

  Future<List<EventModel>> fetchMyEvents() async {
    try {
      // 1. Grab the VIP Wristband
      String? jwtToken = await _storage.read(key: 'jwt_token');

      if (jwtToken == null) throw Exception("No auth token found");

      // 2. Make the request to the backend
      final response = await http.get(
        Uri.parse('$baseUrl/my-club-events'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $jwtToken',
        },
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = jsonDecode(response.body);

        // 3. The backend sends an array of events inside the 'data' field
        final List<dynamic> eventsJson = responseData['data'];

        // 4. Convert the JSON list into a list of Dart Objects
        return eventsJson.map((json) => EventModel.fromJson(json)).toList();
      } else {
        print("Failed to load events: ${response.body}");
        return [];
      }
    } catch (e) {
      print("Error fetching events: $e");
      return [];
    }
  }
}