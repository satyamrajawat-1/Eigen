import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'home_screen.dart';
import 'login_screen.dart';

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
    // 1. Wait 3 seconds for your logo animation to finish
    await Future.delayed(const Duration(seconds: 3));

    // 2. Check the vault for a token
    String? token = await _storage.read(key: 'auth_token');

    if (!mounted) return;

    if (token == null) {
      // 3a. No token -> Go to Login
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const LoginScreen()),
      );
    } else {
      // 3b. Token found -> Go to Home Screen
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const HomeScreen()),
      );
    }
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
              'assets/images/techknow_logo.jpeg',
              width: size,
            );
          },
        ),
      ),
    );
  }
}