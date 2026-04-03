import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/user_model.dart';

class AuthService {
  final GoogleSignIn _googleSignIn = GoogleSignIn.instance;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  bool _isInitialized = false;

  Future<void> _ensureInitialized() async {
    if (!_isInitialized) {
      await _googleSignIn.initialize(
        serverClientId: '1038582138858-krl5jmj73vk3776khbqia4ocgqfkkqrl.apps.googleusercontent.com',
        hostedDomain: 'iiitkota.ac.in',
      );
      _isInitialized = true;
    }
  }

  Future<UserModel?> loginWithGoogle() async {
    try {
      await _ensureInitialized();

      // 1. Get the Google Passport
      final GoogleSignInAccount googleUser = await _googleSignIn.authenticate(
        scopeHint: ['email', 'profile'],
      );
      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final String? googleIdToken = googleAuth.idToken;

      if (googleIdToken == null) throw Exception("Failed to get Google ID Token");

      // 2. Send the Google Token to your live Render API
      final response = await http.post(
        Uri.parse('https://eigen-hhcm.onrender.com/api/v1/users/login/google'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'googleToken': googleIdToken}),
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = jsonDecode(response.body);

        // 3. Extract the VIP Wristband (JWT) and the User Data
        final String jwtToken = responseData['data']['token'];
        final Map<String, dynamic> userDataJson = responseData['data']['user'];
        //printing the jwt token
        print("DEBUG: Copy this JWT for Postman: $jwtToken");
        // 4. Save the JWT securely
        await _storage.write(key: 'jwt_token', value: jwtToken);

        // 5. Turn the user JSON into a raw string and save it to the vault!
        String userString = jsonEncode(userDataJson);
        await _storage.write(key: 'cached_user', value: userString);

        // 6. Convert JSON to our Dart Model and return it
        return UserModel.fromJson(userDataJson);
      } else {
        print("Backend Error: ${response.statusCode} - ${response.body}");
        return null;
      }
    } catch (error) {
      print("Login Error: $error");
      return null;
    }
  }

  // --- THIS IS THE LOGOUT LOGIC ---
  Future<void> logout() async {
    // We MUST delete both the token and the cached user so the next person can't see them!
    await _storage.delete(key: 'jwt_token');
    await _storage.delete(key: 'cached_user');
    await _googleSignIn.disconnect();
  }
}