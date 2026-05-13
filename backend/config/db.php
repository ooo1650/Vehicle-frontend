<?php
// config/db.php
$host = getenv('DB_HOST') ?: "127.0.0.1";
$dbname = getenv('DB_NAME') ?: "vehicle_rental";
$dbuser = getenv('DB_USER') ?: "root";
$dbpass = getenv('DB_PASS') ?: "";
try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $dbuser,
        $dbpass
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    http_response_code(500);
    // Show the real error so you can debug it
    die(json_encode([
        "success" => false,
        "message" => "Database connection failed: " . $e->getMessage()
    ]));
}
