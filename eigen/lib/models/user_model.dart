class UserModel {
  final String id;
  final String email;
  final String name;
  final List<String> roles;
  final List<String> clubMemberships;
  final String qrCodeIdentifier;

  UserModel({
    required this.id,
    required this.email,
    required this.name,
    required this.roles,
    required this.clubMemberships,
    required this.qrCodeIdentifier,
  });

  // 1. Convert JSON from the Server INTO a Dart Object
  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['_id'] ?? '',
      email: json['email'] ?? '',
      name: json['name'] ?? '',
      roles: List<String>.from(json['roles'] ?? []),
      clubMemberships: List<String>.from(json['clubMemberships'] ?? []),
      qrCodeIdentifier: json['qrCodeIdentifier'] ?? '',
    );
  }

  // 2. Convert the Dart Object BACK into JSON so we can save it in the phone's vault
  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'email': email,
      'name': name,
      'roles': roles,
      'clubMemberships': clubMemberships,
      'qrCodeIdentifier': qrCodeIdentifier,
    };
  }
}