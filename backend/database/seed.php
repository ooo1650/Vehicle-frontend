<?php

require_once __DIR__ . '/../config/db.php';

$username = "admin";
$plainPassword = "admin";
$hashedPassword = password_hash($plainPassword, PASSWORD_BCRYPT);

$stmt = $pdo->prepare(
   "INSERT IGNORE INTO admin (username, password) VALUES (?, ?)"
);
$stmt->execute([$username, $hashedPassword]);

echo "ADMIN account created successfully.\n";

// Seed vehicles
$vehicles = [
    ['Royal Enfield Himalayan', 'Motorcycle', 'Petrol', 2,    2500, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'],
    ['Suzuki Swift',            'Car',        'Petrol', 5,    3500, 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=600'],
    ['Toyota Corolla',          'Car',        'Petrol', 5,    4500, 'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=600'],
    ['Honda CR-V',              'SUV',        'Petrol', 7,    6500, 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600'],
    ['Hiace Van',               'Van',        'Diesel', 12,   8000, 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600'],
];

$vstmt = $pdo->prepare(
    "INSERT IGNORE INTO vehicles (name, type, fuel_type, seats, price_per_day, image_url) VALUES (?, ?, ?, ?, ?, ?)"
);
foreach ($vehicles as $v) {
    $vstmt->execute($v);
}
echo "Vehicles seeded successfully.\n";
