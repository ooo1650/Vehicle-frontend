<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/mailer.php';

$body     = json_decode(file_get_contents("php://input"), true);
$email    = trim($body['email']    ?? '');
$username = trim($body['username'] ?? '');

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    die(json_encode(["success" => false, "message" => "Valid email is required"]));
}

// Check if user exists
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user) {
    // New user — username required
    if (empty($username)) {
        http_response_code(400);
        die(json_encode(["success" => false, "message" => "Name is required for new accounts"]));
    }
    $pdo->prepare("
        INSERT INTO users (email, username, given_name, auth_provider, email_verified)
        VALUES (?, ?, ?, 'email', 0)
    ")->execute([$email, $username, $username]);
}

// Generate OTP
$otp     = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

$pdo->prepare("DELETE FROM otp_tokens WHERE email = ?")->execute([$email]);

// Use MySQL's UTC_TIMESTAMP() so expiry matches NOW() in verify query
$pdo->prepare("INSERT INTO otp_tokens (email, otp, expires_at) VALUES (?, ?, UTC_TIMESTAMP() + INTERVAL 10 MINUTE)")
    ->execute([$email, $otp]);

// Send via Gmail SMTP
$subject = "Your Mero Gadi verification code";
$message = "Hi there,\n\nYour one-time verification code is:\n\n    $otp\n\nThis code expires in 10 minutes.\n\nIf you did not request this, you can safely ignore this email.\n\n— Mero Gadi Team";

$sent = sendMail($email, $subject, $message);

if (!$sent) {
    http_response_code(500);
    die(json_encode(["success" => false, "message" => "Failed to send OTP email. Check mail config."]));
}

echo json_encode([
    "success" => true,
    "message" => "OTP sent to $email",
]);
