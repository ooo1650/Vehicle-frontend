<?php
require_once __DIR__ . '/admin_auth.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    case 'GET':
        if (!empty($_GET['id'])) {
            $stmt = $pdo->prepare("SELECT * FROM vehicles WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            $vehicle = $stmt->fetch();
            if (!$vehicle) { http_response_code(404); echo json_encode(["success" => false, "message" => "Not found"]); exit; }
            echo json_encode(["success" => true, "data" => $vehicle]);
        } else {
            $sql = "SELECT * FROM vehicles";
            $params = [];
            if (!empty($_GET['search'])) {
                $sql .= " WHERE name LIKE ?";
                $params[] = "%" . trim($_GET['search']) . "%";
            }
            $sql .= " ORDER BY created_at DESC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            echo json_encode(["success" => true, "data" => $stmt->fetchAll()]);
        }
        break;

    case 'POST':
        $body = json_decode(file_get_contents("php://input"), true);
        $required = ['name', 'type', 'fuel_type', 'seats', 'price_per_day'];
        foreach ($required as $f) {
            if (empty($body[$f])) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Missing: $f"]);
                exit;
            }
        }
        $stmt = $pdo->prepare("
            INSERT INTO vehicles (name, type, fuel_type, seats, price_per_day, image_url, available)
            VALUES (?, ?, ?, ?, ?, ?, 1)
        ");
        $stmt->execute([
            trim($body['name']),
            $body['type'],
            $body['fuel_type'],
            (int) $body['seats'],
            (float) $body['price_per_day'],
            trim($body['image_url'] ?? ''),
        ]);
        echo json_encode(["success" => true, "message" => "Vehicle added", "id" => (int) $pdo->lastInsertId()]);
        break;

    case 'PUT':
    $body = json_decode(file_get_contents("php://input"), true);
    $id = $body['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "ID required"]);
        exit;
    }

    // Before deactivating, check for active bookings
    if (isset($body['available']) && (int)$body['available'] === 0) {
        $check = $pdo->prepare(
            "SELECT COUNT(*) as total FROM bookings
             WHERE vehicle_id = ?
             AND status IN ('pending', 'confirmed')"
        );
        $check->execute([$id]);
        $row = $check->fetch();
        if ($row['total'] > 0) {
            http_response_code(409);
            echo json_encode([
                "success" => false,
                "message" => "Cannot deactivate. This vehicle has " . $row['total'] . " active booking(s). Please resolve them first."
            ]);
            exit;
        }
    }

    $allowed = ['name', 'type', 'fuel_type', 'seats', 'price_per_day', 'image_url', 'available'];
    $fields = []; $values = [];
    foreach ($allowed as $f) {
        if (isset($body[$f])) { $fields[] = "$f = ?"; $values[] = $body[$f]; }
    }
    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Nothing to update"]);
        exit;
    }
    $values[] = $id;
    $pdo->prepare("UPDATE vehicles SET " . implode(', ', $fields) . " WHERE id = ?")->execute($values);
    echo json_encode(["success" => true, "message" => "Vehicle updated successfully"]);
    break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if (!$id) { http_response_code(400); echo json_encode(["success" => false, "message" => "ID required"]); exit; }
        $pdo->prepare("DELETE FROM vehicles WHERE id = ?")->execute([$id]);
        echo json_encode(["success" => true, "message" => "Vehicle deleted"]);
        break;

    default:
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Method not allowed"]);
}
