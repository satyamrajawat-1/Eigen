import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../models/event_model.dart';
import '../services/event_service.dart';

class QRScannerScreen extends StatefulWidget {
  final EventModel event;
  final String scanType; // Will be 'IN' or 'OUT'

  const QRScannerScreen({super.key, required this.event, required this.scanType});

  @override
  State<QRScannerScreen> createState() => _QRScannerScreenState();
}

class _QRScannerScreenState extends State<QRScannerScreen> {
  // 1. Initialize the new MobileScannerController
  final MobileScannerController controller = MobileScannerController();

  bool _isProcessing = false;
  final EventService _eventService = EventService();

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  // 2. The new detection method
  void _onDetect(BarcodeCapture capture) async {
    final List<Barcode> barcodes = capture.barcodes;

    // Ignore empty scans or if we are already processing one
    if (_isProcessing || barcodes.isEmpty) return;

    final String? code = barcodes.first.rawValue;
    if (code == null) return;

    setState(() => _isProcessing = true);
    controller.stop(); // Freeze the camera to save battery/prevent double scans

    // 1. Show a loading dialog
    _showLoadingDialog();

    // 2. Send the QR string to Rohit's Server
    String resultMessage = await _eventService.submitScan(
        widget.event.id,
        code,
        widget.scanType
    );

    // 3. Close the loading dialog
    if (!mounted) return;
    Navigator.pop(context);

    // 4. Show the result to the volunteer
    bool isSuccess = resultMessage.startsWith("SUCCESS");
    await _showResultDialog(resultMessage, isSuccess);

    // 5. Navigation logic
    if (isSuccess) {
      if (mounted) Navigator.pop(context); // Go back to dashboard on success
    } else {
      setState(() => _isProcessing = false);
      controller.start(); // Resume the camera if they need to try again
    }
  }

  void _showLoadingDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator(color: Colors.white)),
    );
  }

  Future<void> _showResultDialog(String message, bool isSuccess) async {
    return showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.grey.shade900,
        title: Icon(
          isSuccess ? Icons.check_circle : Icons.error,
          color: isSuccess ? Colors.greenAccent : Colors.redAccent,
          size: 60,
        ),
        content: Text(
          message.replaceAll("SUCCESS: ", "").replaceAll("ERROR: ", ""),
          textAlign: TextAlign.center,
          style: const TextStyle(color: Colors.white, fontSize: 18),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK', style: TextStyle(color: Colors.blueAccent, fontSize: 18)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final scanColor = widget.scanType == 'IN' ? Colors.green : Colors.red;

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: Text('SCAN ${widget.scanType}', style: const TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: widget.scanType == 'IN' ? Colors.green.shade900 : Colors.red.shade900,
      ),
      body: Stack(
        children: [
          // 3. The new MobileScanner Widget
          MobileScanner(
            controller: controller,
            onDetect: _onDetect,
          ),

          // 4. Custom UI Overlay (Since mobile_scanner doesn't have QrScannerOverlayShape)
          Center(
            child: Container(
              width: MediaQuery.of(context).size.width * 0.7,
              height: MediaQuery.of(context).size.width * 0.7,
              decoration: BoxDecoration(
                border: Border.all(color: scanColor, width: 4.0),
                borderRadius: BorderRadius.circular(16),
                color: Colors.transparent, // Leaves the center clear
              ),
            ),
          ),

          // 5. Dimmed background outside the scanning box (Optional, but looks pro)
          ColorFiltered(
            colorFilter: ColorFilter.mode(Colors.black.withOpacity(0.5), BlendMode.srcOut),
            child: Container(
              decoration: const BoxDecoration(
                color: Colors.transparent,
              ),
              child: Align(
                alignment: Alignment.center,
                child: Container(
                  width: MediaQuery.of(context).size.width * 0.7,
                  height: MediaQuery.of(context).size.width * 0.7,
                  decoration: BoxDecoration(
                    color: Colors.black,
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              ),
            ),
          ),

          const Positioned(
            bottom: 60,
            left: 0,
            right: 0,
            child: Text(
              'Align the student\'s QR code within the frame',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
          )
        ],
      ),
    );
  }
}