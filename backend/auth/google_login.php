<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/mailer.php';

$body = json_decode(file_get_contents("php://input"), true);
if (!$body) { http_response_code(400); die(json_encode(["success" => false, "message" => "Invalid JSON"])); }

$google_id      = trim($body['sub']          ?? '');
$email          = trim($body['email']        ?? '');
$username       = trim($body['name']         ?? '');
$given_name     = trim($body['given_name']   ?? '');
$family_name    = trim($body['family_name']  ?? '');
$picture        = trim($body['picture']      ?? '');
$email_verified = !empty($body['email_verified']) ? 1 : 0;

if (empty($google_id) || empty($email)) {
    http_response_code(400);
    die(json_encode(["success" => false, "message" => "Missing google_id or email"]));
}

try {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE google_id = ?");
    $stmt->execute([$google_id]);
    $existing = $stmt->fetch();

    if ($existing) {
        $pdo->prepare("UPDATE users SET last_login = CURRENT_TIMESTAMP, picture = ? WHERE google_id = ?")
            ->execute([$picture, $google_id]);
    } else {
        // Check if email already exists under a different provider
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            // Link Google to existing account
            $pdo->prepare("UPDATE users SET google_id = ?, picture = ?, auth_provider = 'google' WHERE email = ?")
                ->execute([$google_id, $picture, $email]);
        } else {
            $pdo->prepare("
                INSERT INTO users (google_id, email, username, given_name, family_name, picture, email_verified, auth_provider)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'google')
            ")->execute([$google_id, $email, $username, $given_name, $family_name, $picture, $email_verified]);
        }
    }

    // Generate OTP for this Google login
    $otp     = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

    $pdo->prepare("DELETE FROM otp_tokens WHERE email = ?")->execute([$email]);
    $pdo->prepare("INSERT INTO otp_tokens (email, otp, expires_at) VALUES (?, ?, UTC_TIMESTAMP() + INTERVAL 10 MINUTE)")
        ->execute([$email, $otp]);

    // Send OTP via Gmail SMTP
    $subject = "Your Mero Gadi verification code";
    $message = "Hi {$given_name},\n\nYour one-time verification code is:\n\n    $otp\n\nThis code expires in 10 minutes.\n\n— Mero Gadi Team";
    sendMail($email, $subject, $message);

    echo json_encode([
        "success"    => true,
        "message"    => "OTP sent to $email",
        "email"      => $email,
        "given_name" => $given_name ?: $username,
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
