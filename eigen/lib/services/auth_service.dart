import 'package:google_sign_in/google_sign_in.dart';

class AuthService {
  // 1. Grab the global instance
  final GoogleSignIn _googleSignIn = GoogleSignIn.instance;
  bool _isInitialized = false;

  // 2. A helper to make sure Google is ready before we pop up the login
  Future<void> _ensureInitialized() async {
    if (!_isInitialized) {
      await _googleSignIn.initialize(
        serverClientId: '1038582138858-krl5jmj73vk3776khbqia4ocgqfkkqrl.apps.googleusercontent.com',
        hostedDomain: 'iiitkota.ac.in',
        // Notice: 'scopes' is gone from here! That fixes the first red line.
      );
      _isInitialized = true;
    }
  }

  Future<String?> loginWithGoogle() async {
    try {
      await _ensureInitialized();

      // 3. Trigger the modern Authentication flow.
      // Notice: We pass the scopes here now using 'scopeHint'! (Fixes the first and second red lines)
      final GoogleSignInAccount googleUser = await _googleSignIn.authenticate(
        scopeHint: ['email', 'profile'],
      );

      // 4. We don't need '.currentUser' anymore because 'authenticate()' directly returned 'googleUser' above! (Fixes the third red line)
      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;

      print("SUCCESS! ID Token Generated.");
      return googleAuth.idToken;

    } on GoogleSignInException catch (e) {
      // In v7, if the user cancels the popup, it throws an exception instead of returning null
      print("Google Sign In canceled or failed: ${e.code}");
      return null;
    } catch (error) {
      print("Unexpected error during Google Sign In: $error");
      return null;
    }
  }

  // A quick helper function to log the user out later
  Future<void> logout() async {
    await _googleSignIn.disconnect();
  }
}