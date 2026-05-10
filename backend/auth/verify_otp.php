<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once __DIR__ . '/../config/db.php';

$body  = json_decode(file_get_contents("php://input"), true);
$email = trim($body['email'] ?? '');
$otp   = trim($body['otp']   ?? '');

if (empty($email) || empty($otp)) {
    http_response_code(400);
    die(json_encode(["success" => false, "message" => "Email and OTP are required"]));
}

// Find a valid unused OTP for this email
$stmt = $pdo->prepare("
    SELECT * FROM otp_tokens
    WHERE email = ? AND otp = ? AND used = 0 AND expires_at > UTC_TIMESTAMP()
    ORDER BY created_at DESC
    LIMIT 1
");
$stmt->execute([$email, $otp]);
$token = $stmt->fetch();

if (!$token) {
    http_response_code(401);
    die(json_encode(["success" => false, "message" => "Invalid or expired OTP"]));
}

// Mark OTP as used
$pdo->prepare("UPDATE otp_tokens SET used = 1 WHERE id = ?")->execute([$token['id']]);

// Get the user and update last_login + mark email verified
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user) {
    http_response_code(404);
    die(json_encode(["success" => false, "message" => "User not found"]));
}

$pdo->prepare("UPDATE users SET last_login = CURRENT_TIMESTAMP, email_verified = 1 WHERE email = ?")
    ->execute([$email]);

echo json_encode([
    "success" => true,
    "message" => "Verified successfully",
    "user" => [
        "id"         => (int) $user['id'],
        "email"      => $user['email'],
        "username"   => $user['username'],
        "given_name" => $user['given_name'] ?? $user['username'],
        "picture"    => $user['picture'],
    ]
]);
