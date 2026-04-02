import 'dart:convert';
import 'package:eigen/screens/main_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../models/user_model.dart';
import 'login_screen.dart';
import 'profile_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  @override
  void initState() {
    super.initState();
    _routeUser();
  }

  Future<void> _routeUser() async {
    // 1. Wait a couple of seconds for the TechKnow animation
    await Future.delayed(const Duration(seconds: 2));

    // 2. Check the vault for the JWT AND the Cached User
    String? jwtToken = await _storage.read(key: 'jwt_token');
    String? cachedUserString = await _storage.read(key: 'cached_user');

    if (!mounted) return;

    // 3. If either is missing, they need to log in again
    if (jwtToken == null || cachedUserString == null) {
      _goToLogin();
      return;
    }

    try {
      // 4. OFFLINE-FIRST MAGIC: Instantly load the user from the cached string!
      Map<String, dynamic> userJson = jsonDecode(cachedUserString);
      UserModel cachedUser = UserModel.fromJson(userJson);

      // 5. Immediately show the ID card (No internet required!)
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => MainScreen(user: cachedUser)),
      );

    } catch (e) {
      print("Error reading cache. Forcing re-login: $e");
      // If the cache is corrupted, sweep it out and force a login
      await _storage.delete(key: 'jwt_token');
      await _storage.delete(key: 'cached_user');
      _goToLogin();
    }
  }

  void _goToLogin() {
    if (!mounted) return;
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const LoginScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final double screenWidth = MediaQuery.of(context).size.width;
    final double startWidth = screenWidth * 0.30;
    final double targetLogoWidth = screenWidth * 0.45;

    return Scaffold(
      backgroundColor: Colors.black,
      body: Center(
        child: TweenAnimationBuilder<double>(
          tween: Tween<double>(begin: startWidth, end: targetLogoWidth),
          duration: const Duration(seconds: 2),
          curve: Curves.easeOutBack,
          builder: (BuildContext context, double size, Widget? child) {
            return Image.asset(
              'assets/images/techknow_logo.jpeg', // Or 'techknow_logo.jpeg' depending on your setup!
              width: size,
            );
          },
        ),
      ),
    );
  }
}