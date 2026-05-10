<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once __DIR__ . '/../config/db.php';

$body  = json_decode(file_get_contents("php://input"), true);
$email = trim($body['email']    ?? '');
$name  = trim($body['username'] ?? '');

if (empty($email) || empty($name)) {
    http_response_code(400);
    die(json_encode(["success" => false, "message" => "Email and name are required"]));
}

// Find user by email
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user) {
    http_response_code(404);
    die(json_encode(["success" => false, "message" => "User not found"]));
}

// Update username and given_name (first word of name)
$given = explode(' ', $name)[0];

$pdo->prepare("UPDATE users SET username = ?, given_name = ? WHERE email = ?")
    ->execute([$name, $given, $email]);

echo json_encode([
    "success"  => true,
    "message"  => "Name updated",
    "username" => $name,
    "given_name" => $given,
]);
