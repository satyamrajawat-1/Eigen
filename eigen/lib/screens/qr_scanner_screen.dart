import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../models/event_model.dart';

class QRScannerScreen extends StatefulWidget {
  final EventModel event;
  final String scanType;

  const QRScannerScreen({super.key, required this.event, required this.scanType});

  @override
  State<QRScannerScreen> createState() => _QRScannerScreenState();
}

class _QRScannerScreenState extends State<QRScannerScreen> {
  final MobileScannerController cameraController = MobileScannerController();

  bool _isProcessing = false;

  @override
  Widget build(BuildContext context) {
    final Color themeColor = widget.scanType == 'IN' ? Colors.green : Colors.red;

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: Text(
          '${widget.scanType} SCANNER: ${widget.event.title}',
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        backgroundColor: Colors.black,
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            color: Colors.white,
            icon: const Icon(Icons.flash_on), // 🔥 simple static icon
            onPressed: () async {
              await cameraController.toggleTorch(); // 🔥 toggle only
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          MobileScanner(
            controller: cameraController,
            onDetect: _handleBarcode,
          ),

          Container(
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.5),
            ),
            child: Center(
              child: Container(
                width: 250,
                height: 250,
                decoration: BoxDecoration(
                  border: Border.all(color: themeColor, width: 4),
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),

          Positioned(
            bottom: 40,
            left: 0,
            right: 0,
            child: Center(
              child: Text(
                'Align QR Code within the frame to scan ${widget.scanType}',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          )
        ],
      ),
    );
  }

  void _handleBarcode(BarcodeCapture capture) async {
    if (_isProcessing) return;

    final List<Barcode> barcodes = capture.barcodes;
    if (barcodes.isNotEmpty && barcodes.first.rawValue != null) {
      final String scannedData = barcodes.first.rawValue!;

      setState(() => _isProcessing = true);

      print("====================================");
      print("SUCCESSFUL SCAN CAPTURED!");
      print("Event: ${widget.event.title}");
      print("Gate: ${widget.scanType}");
      print("Student QR ID: $scannedData");
      print("====================================");

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Scanned successfully: $scannedData'),
          backgroundColor: widget.scanType == 'IN' ? Colors.green : Colors.red,
          duration: const Duration(seconds: 2),
        ),
      );

      await Future.delayed(const Duration(seconds: 2));
      if (mounted) {
        setState(() => _isProcessing = false);
      }
    }
  }

  @override
  void dispose() {
    cameraController.dispose();
    super.dispose();
  }
}