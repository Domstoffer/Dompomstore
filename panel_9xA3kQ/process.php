<?php
header('Content-Type: application/json');

// 🔐 MUSS IDENTISCH zu admin.php sein
define('SECRET_KEY', 'DeinSuperGeheimerKey1234567890!@');

// 🔹 Datei
$ordersFile = __DIR__ . '/bestellungen.enc';

// 🔹 POST lesen
$input = file_get_contents('php://input');
if (!$input) {
    echo json_encode(['error' => 'Keine Daten']);
    exit;
}

$data = json_decode($input, true);
if (!$data || !isset($data['cart'], $data['shipping'], $data['currency'])) {
    echo json_encode(['error' => 'Ungültige Daten']);
    exit;
}

// 🔹 Bestellung
$order = [
    'id' => 'order_' . uniqid(),
    'timestamp' => time(),
    'cart' => $data['cart'],
    'shipping' => $data['shipping'],
    'currency' => $data['currency'],
    'totalPrice' => array_reduce($data['cart'], function($sum, $i) {
        $price = floatval(preg_replace('/[^0-9.]/','',$i['price']));
        return $sum + ($price * intval($i['quantity']));
    }, 0)
];

// 🔹 Alte Bestellungen entschlüsseln
$orders = [];
if (file_exists($ordersFile)) {
    $raw = base64_decode(file_get_contents($ordersFile));
    $iv = substr($raw, 0, 16);
    $encrypted = substr($raw, 16);
    $json = openssl_decrypt($encrypted, 'AES-256-CBC', SECRET_KEY, 0, $iv);
    $orders = json_decode($json, true) ?: [];
}

// 🔹 Neue anhängen
$orders[] = $order;

// 🔹 Neu verschlüsseln
$iv = random_bytes(16);
$encrypted = openssl_encrypt(json_encode($orders, JSON_PRETTY_PRINT), 'AES-256-CBC', SECRET_KEY, 0, $iv);
file_put_contents($ordersFile, base64_encode($iv . $encrypted));

echo json_encode(['ok' => true, 'orderId' => $order['id']]);