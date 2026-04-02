// lib/screens/main_screen.dart
import 'package:flutter/material.dart';
import '../models/user_model.dart';
import 'home_screen.dart';
import 'profile_screen.dart';

class MainScreen extends StatefulWidget {
  final UserModel user;

  const MainScreen({super.key, required this.user});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;
  late final List<Widget> _screens;

  @override
  void initState() {
    super.initState();
    // These are the two screens we will slide between.
    // Notice we pass the user data right into the ProfileScreen here!
    _screens = [
      const HomeScreen(),
      ProfileScreen(user: widget.user),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // IndexedStack is a magical widget. It keeps BOTH screens alive in the background.
      // This means when you switch back to the scanner, the camera doesn't have to reboot!
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: BottomNavigationBar(
        backgroundColor: Colors.black,
        selectedItemColor: Colors.white,
        unselectedItemColor: Colors.grey.shade800,
        currentIndex: _currentIndex,
        type: BottomNavigationBarType.fixed,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.qr_code_scanner),
            label: 'SCANNER',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.badge),
            label: 'MY ID',
          ),
        ],
      ),
    );
  }
}