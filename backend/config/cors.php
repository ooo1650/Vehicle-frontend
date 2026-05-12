<?php
// config/cors.php
$allowed_origin = getenv('CORS_ORIGIN') ?: '*';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: " . $allowed_origin);
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Admin-Id");
// Only send credentials header when not using wildcard
if ($allowed_origin !== '*') {
    header("Access-Control-Allow-Credentials: true");
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
