import 'package:flutter/material.dart';
import 'screens/splash_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TechKnow Scanner',
      debugShowCheckedModeBanner: false,
      // The sleek Black and White Theme
      theme: ThemeData(
        brightness: Brightness.dark, // Forces dark mode
        scaffoldBackgroundColor: Colors.black, // Pure black background
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.black,
          foregroundColor: Colors.white, // White text on app bar
          elevation: 1,
          shadowColor: Colors.white24,
        ),
        colorScheme: const ColorScheme.dark(
          primary: Colors.white, // Primary accents are white
          secondary: Colors.grey, // Secondary elements are grey
          surface: Color(0xFF121212), // Slightly lighter black for cards
        ),
      ),
      home: const SplashScreen(),
    );
  }
}