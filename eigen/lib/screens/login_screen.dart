import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../services/auth_service.dart';
import 'home_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final AuthService _authService = AuthService();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  bool _isLoading = false;

  Future<void> _handleLogin() async {
    setState(() => _isLoading = true);

    // 1. Call Google to get the ID Token
    String? idToken = await _authService.loginWithGoogle();

    if (idToken != null) {
      debugPrint('\n========== GOOGLE ID TOKEN ==========');
      // Print in chunks of 500 characters to avoid console limits
      final int chunkSize = 500;
      for (int i = 0; i < idToken.length; i += chunkSize) {
        debugPrint(idToken.substring(
            i,
            i + chunkSize > idToken.length ? idToken.length : i + chunkSize
        ));
      }
      debugPrint('=====================================\n');
      // 2. Success! Save the token in the phone's secure vault
      // (Later, we will swap this for your Node.js JWT, but this works for now)
      await _storage.write(key: 'auth_token', value: idToken);

      if (!mounted) return;

      // 3. Destroy the Login screen and go to the Home Screen
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const HomeScreen()),
      );
    } else {
      // Login failed or was canceled
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Login canceled or failed.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black, // Dark theme
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text(
                'RESTRICTED ACCESS',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 2,
                ),
              ),
              const SizedBox(height: 10),
              const Text(
                'Sign in with your official college ID to continue.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey, fontSize: 16),
              ),
              const SizedBox(height: 50),

              // Show a loading spinner if they clicked the button
              _isLoading
                  ? const CircularProgressIndicator(color: Colors.white)
                  : SizedBox(
                width: double.infinity,
                height: 55,
                child: ElevatedButton.icon(
                  onPressed: _handleLogin,
                  icon: const Icon(Icons.login, color: Colors.black),
                  label: const Text(
                    'SIGN IN WITH GOOGLE',
                    style: TextStyle(
                      color: Colors.black,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}