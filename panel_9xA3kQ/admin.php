<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

session_start();
file_put_contents("debug.txt", file_get_contents("php://input") . PHP_EOL, FILE_APPEND);

/* ===============================
   🔐 CONFIG
================================ */
$ADMIN_USER = 'domstoffer';
$ADMIN_PASS_HASH = '$2y$12$fW94KND3EsBQOD24Ds.rHu5HHjL3UKvFT3IB8fKoKZdGuXc4r6YGq';

define('SESSION_LIFETIME', 3600);
define('SECRET_KEY', 'DeinSuperGeheimerKey1234567890!@');

$ordersFile = __DIR__ . '/bestellungen.enc';
$rateFile   = __DIR__ . '/rate_limit.json';


/* ===============================
   📦 NEW ORDER RECEIVE (API)
================================ */
if (
    $_SERVER['REQUEST_METHOD'] === 'POST' &&
    isset($_SERVER['CONTENT_TYPE']) &&
    strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false
) {

    $ip  = $_SERVER['REMOTE_ADDR'];
    $now = time();

    // Rate limit (max 5 in 10 min)
    $rateData = file_exists($rateFile)
        ? json_decode(file_get_contents($rateFile), true)
        : [];

    $rateData[$ip] = array_filter(
        $rateData[$ip] ?? [],
        function($t) use ($now) { return $t > $now - 600; }
    );

    if (count($rateData[$ip]) >= 5) {
        http_response_code(429);
        exit("Too many requests");
    }

    $rateData[$ip][] = $now;
    file_put_contents($rateFile, json_encode($rateData));

    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {
        http_response_code(400);
        exit("Invalid data");
    }

    if (!empty($data['website'])) {
        http_response_code(403);
        exit("Spam detected");
    }

    if (empty($data['cart']) || empty($data['shipping']['firstname'])) {
        http_response_code(400);
        exit("Missing required fields");
    }

    $orders = [];

    if (file_exists($ordersFile)) {
        $raw = base64_decode(file_get_contents($ordersFile));

        if ($raw && strlen($raw) > 16) {
            $iv  = substr($raw, 0, 16);
            $enc = substr($raw, 16);

            $json = openssl_decrypt(
                $enc,
                'AES-256-CBC',
                SECRET_KEY,
                OPENSSL_RAW_DATA,
                $iv
            );

            if ($json !== false) {
                $orders = json_decode($json, true) ?: [];
            }
        }
    }

$data['id']     = bin2hex(random_bytes(6));
$data['status'] = $data['status'] ?? 'Neu';
$data['note']   = '';
$data['ip']     = $ip;

    $orders[] = $data;

    $iv = random_bytes(16);

    $enc = openssl_encrypt(
        json_encode($orders, JSON_PRETTY_PRINT),
        'AES-256-CBC',
        SECRET_KEY,
        OPENSSL_RAW_DATA,
        $iv
    );

    file_put_contents($ordersFile, base64_encode($iv . $enc));

    echo "OK";
    exit;
}


/* ===============================
   ⏱️ SESSION TIMEOUT
================================ */
if (isset($_SESSION['admin_time']) &&
    time() - $_SESSION['admin_time'] > SESSION_LIFETIME) {

    session_destroy();
    header("Location: admin.php");
    exit;
}


/* ===============================
   🔐 LOGIN
================================ */
if (isset($_POST['username'], $_POST['password'])) {

    if ($_POST['username'] === $ADMIN_USER &&
        password_verify($_POST['password'], $ADMIN_PASS_HASH)) {

        $_SESSION['admin']      = true;
        $_SESSION['admin_time'] = time();

        header("Location: admin.php");
        exit;

    } else {
        $error = "Ungültiger Login";
    }
}


/* ===============================
   🚪 LOGOUT
================================ */
if (isset($_GET['logout'])) {
    session_destroy();
    header("Location: admin.php");
    exit;
}


/* ===============================
   🔑 LOGIN PAGE
================================ */
if (!isset($_SESSION['admin'])):
?>
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<title>Admin Login</title>
<style>
body{font-family:Arial;background:#f4f4f9;display:flex;justify-content:center;align-items:center;height:100vh}
.box{background:#fff;padding:30px;border-radius:14px;width:340px;box-shadow:0 10px 30px rgba(0,0,0,.1)}
input,button{width:100%;padding:12px;margin-bottom:14px;border-radius:8px;border:1px solid #ccc}
button{background:#111;color:#fff;border:none;font-weight:600;cursor:pointer}
.error{color:red;margin-bottom:10px}
</style>
</head>
<body>
<div class="box">
<h2>Admin Login</h2>
<?php if(!empty($error)): ?>
<div class="error"><?=htmlspecialchars($error)?></div>
<?php endif; ?>
<form method="post">
<input name="username" placeholder="Username" required>
<input name="password" type="password" placeholder="Password" required>
<button>LOGIN</button>
</form>
</div>
</body>
</html>
<?php exit; endif; ?>


<?php
/* ===============================
   🔓 LOAD & DECRYPT ORDERS
================================ */
$orders = [];

if (file_exists($ordersFile)) {

    $raw = base64_decode(file_get_contents($ordersFile));

    if ($raw && strlen($raw) > 16) {

        $iv  = substr($raw, 0, 16);
        $enc = substr($raw, 16);

        $json = openssl_decrypt(
            $enc,
            'AES-256-CBC',
            SECRET_KEY,
            OPENSSL_RAW_DATA,
            $iv
        );

        if ($json !== false) {
            $orders = json_decode($json, true) ?: [];
        }
    }
}
// ===============================
// 🗑 ORDER DELETE
// ===============================
if (isset($_GET['delete']) && isset($_SESSION['admin'])) {

    $deleteId = $_GET['delete'];

    $orders = array_filter($orders, function($order) use ($deleteId) {
        return $order['id'] !== $deleteId;
    });

    $orders = array_values($orders);

    $iv = random_bytes(16);

    $enc = openssl_encrypt(
        json_encode($orders, JSON_PRETTY_PRINT),
        'AES-256-CBC',
        SECRET_KEY,
        OPENSSL_RAW_DATA,
        $iv
    );

    file_put_contents($ordersFile, base64_encode($iv . $enc));

    header("Location: admin.php");
    exit;
}

$remaining = SESSION_LIFETIME - (time() - $_SESSION['admin_time']);
?>
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<title>Orders Dashboard</title>

<style>
body{
  font-family:'Montserrat', sans-serif;
  background:#f8f9fb;
  padding:40px;
  color:#111;
}

.top{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:40px;
}

h1{
  font-size:18px;
  letter-spacing:0.25em;
  font-weight:600;
}

.logout{
  background:#000;
  color:#fff;
  padding:10px 16px;
  border-radius:6px;
  text-decoration:none;
  font-size:12px;
  letter-spacing:0.15em;
  transition:.2s;
}

.logout:hover{
  background:#222;
}

.order{
  background:#fff;
  border:1px solid #eee;
  border-radius:14px;
  padding:24px;
  margin-bottom:20px;
  transition:.2s ease;
}

.order:hover{
  box-shadow:0 10px 30px rgba(0,0,0,.05);
}

.header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  cursor:pointer;
}

.name{
  font-size:16px;
  font-weight:600;
  letter-spacing:0.05em;
}

.badge{
  padding:6px 12px;
  border-radius:20px;
  font-size:11px;
  letter-spacing:0.15em;
  font-weight:600;
}

.badge.neu{
  background:#f3f3f3;
  color:#555;
}

.badge.bezahlt{
  background:#e6f7ec;
  color:#1c7c3a;
}

.badge.versandt{
  background:#e6f0ff;
  color:#1a4ed8;
}

.badge.storniert{
  background:#fdecec;
  color:#b42323;
}

.details{
  margin-top:20px;
  display:none;
  font-size:14px;
  line-height:1.7;
  border-top:1px solid #eee;
  padding-top:18px;
}

.section{
  margin-bottom:18px;
}

.section strong{
  display:block;
  margin-bottom:6px;
  font-size:12px;
  letter-spacing:0.15em;
  color:#777;
  text-transform:uppercase;
}

.countdown{
  font-size:12px;
  opacity:0.6;
}
</style>

<script>
let t = <?= $remaining ?>;
setInterval(()=>{
  if(t<=0) location.href='?logout=1';
  t--;
},1000);

function toggle(el){
  let d = el.parentElement.querySelector('.details');
  d.style.display = d.style.display === 'block' ? 'none' : 'block';
}
</script>
</head>
<body>

<div class="top">
<h1>📦 Orders Dashboard</h1>
<div>
<span class="countdown">Auto Logout nach 1 Stunde</span>
<a class="logout" href="?logout=1">Logout</a>
</div>
</div>

<?php if(empty($orders)): ?>
<p>Keine Bestellungen vorhanden.</p>
<?php else: foreach(array_reverse($orders) as $o): ?>

<div class="order">

  <div class="header" onclick="toggle(this)">

    <div class="name">
      <?=htmlspecialchars($o['shipping']['firstname'].' '.$o['shipping']['lastname'])?>
    </div>

    <?php
    $status = $o['status'] ?? 'Neu';
    $statusClass = strtolower($status);
    ?>

    <div class="badge <?=$statusClass?>">
      <?=htmlspecialchars($status)?>
    </div>

    <a href="?delete=<?=htmlspecialchars($o['id'])?>"
       onclick="event.stopPropagation(); return confirm('Bestellung wirklich löschen?')"
       style="margin-left:12px; font-size:13px; color:#b42323; text-decoration:none;">
       ✕
    </a>

  </div>

  <div class="details">

    <div class="section">
      <strong>🆔 Order Infos</strong>
      Order ID: <?=htmlspecialchars($o['id'])?><br>
      Datum: <?=date('d.m.Y H:i', intval(($o['timestamp'] ?? 0) / 1000))?><br>
      IP: <?=htmlspecialchars($o['ip'])?><br>
      Währung: <?=htmlspecialchars($o['currency'])?>
    </div>

    <div class="section">
      <strong>🚚 Versandadresse</strong>
      <?=htmlspecialchars($o['shipping']['firstname'].' '.$o['shipping']['lastname'])?><br>
      <?=htmlspecialchars($o['shipping']['street'])?><br>
      <?=htmlspecialchars($o['shipping']['zip'].' '.$o['shipping']['city'])?><br>
      <?=htmlspecialchars($o['shipping']['country'] ?? '')?>
    </div>

    <div class="section">
      <strong>🛒 Artikel</strong>
      <?php 
      $total = 0;
      if(!empty($o['cart']) && is_array($o['cart'])):
        foreach($o['cart'] as $i):
          $price = isset($i['price']) ? floatval(str_replace(',','.',$i['price'])) : 0;
          $qty   = isset($i['quantity']) ? intval($i['quantity']) : 1;
          $sum = $price * $qty;
          $total += $sum;
      ?>
        - <?=htmlspecialchars($i['name'] ?? 'Unbekannt')?> 
        (<?= $qty ?> × <?= number_format($price,2) ?>)<br>
      <?php endforeach; endif; ?>
      <br>
      <strong>Gesamt: <?= number_format($total,2) ?> <?=htmlspecialchars($o['currency'] ?? '')?></strong>
    </div>

  </div>

</div>

<?php endforeach; endif; ?>

</body>
</html>