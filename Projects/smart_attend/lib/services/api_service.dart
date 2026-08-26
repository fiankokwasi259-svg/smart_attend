import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://172.20.10.3:5000',
  );

  static Map<String, dynamic> _decode(http.Response response) {
    try {
      final decoded = jsonDecode(response.body);
      return decoded is Map<String, dynamic> ? decoded : <String, dynamic>{};
    } catch (_) {
      return <String, dynamic>{};
    }
  }

  static Future<Map<String, dynamic>> register({
    required String fullName,
    required String email,
    required String password,
    required String role,
    String? matricNumber,
    String? department,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'fullName': fullName,
          'email': email,
          'password': password,
          'role': role,
          'matricNumber': matricNumber,
          'department': department,
        }),
      );
      final data = _decode(response);
      if (response.statusCode == 201) {
        return {'success': true, 'data': data};
      }
      return {
        'success': false,
        'error': data['error'] ?? 'Registration failed',
      };
    } catch (_) {
      return {
        'success': false,
        'error': 'Unable to reach the server. Check that the backend is running.',
      };
    }
  }

  static Future<Map<String, dynamic>> login({
    required String email,
    required String password,
    String? expectedRole,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      );
      final data = _decode(response);
      if (response.statusCode == 200) {
        final user = data['user'];
        if (expectedRole != null && user is Map && user['role'] != expectedRole) {
          return {
            'success': false,
            'error': 'This account is registered as a ' + user['role'].toString() + '.',
          };
        }
        return {'success': true, 'data': data};
      }
      return {'success': false, 'error': data['error'] ?? 'Login failed'};
    } catch (_) {
      return {
        'success': false,
        'error': 'Unable to reach the server. Check that the backend is running.',
      };
    }
  }
}
