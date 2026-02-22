<?php
session_start();

/* ===============================
   🔐 CONFIG
================================ */
$ADMIN_USER = 'domstoffer';
$ADMIN_PASS_HASH = '$2y$12$fW94KND3EsBQOD24Ds.rHu5HHjL3UKvFT3IB8fKoKZdGuXc4r6YGq';

define('SESSION_LIFETIME', 3600);
define('SECRET_KEY', 'DeinSuperGeheimerKey1234567890!@');

$ordersFile = __DIR__ . '/bestellungen.enc';

/* ===============================
   ⏱️ SESSION TIMEOUT
================================ */
if (isset($_SESSION['admin_time']) && time() - $_SESSION['admin_time'] > SESSION_LIFETIME) {
    session_destroy();
    header("Location: admin.php");
    exit;
}

/* ===============================
   🔐 LOGIN
================================ */
if (isset($_POST['username'], $_POST['password'])) {
    if ($_POST['username'] === $ADMIN_USER && password_verify($_POST['password'], $ADMIN_PASS_HASH)) {
        $_SESSION['admin'] = true;
        $_SESSION['admin_time'] = time();
        header("Location: admin.php");
        exit;
    } else {
        $error = 'Ungültiger Login';
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
<?php if(!empty($error)): ?><div class="error"><?=htmlspecialchars($error)?></div><?php endif; ?>
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
    $iv = substr($raw, 0, 16);
    $enc = substr($raw, 16);
    $json = openssl_decrypt($enc, 'AES-256-CBC', SECRET_KEY, 0, $iv);
    $orders = json_decode($json, true) ?: [];
}

/* ===============================
   ✏️ UPDATE STATUS / NOTE
================================ */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // DELETE ORDER
    if (isset($_POST['delete_order'])) {
        $orders = array_filter($orders, fn($o) => $o['id'] !== $_POST['delete_order']);
    }

    // UPDATE STATUS / NOTE
    if (isset($_POST['order_id'])) {
        foreach ($orders as &$o) {
            if ($o['id'] === $_POST['order_id']) {
                $o['status'] = $_POST['status'] ?? $o['status'];
                $o['note'] = $_POST['note'] ?? '';
            }
        }
        unset($o);
    }

    // SAVE BACK
    $iv = random_bytes(16);
    $enc = openssl_encrypt(json_encode(array_values($orders), JSON_PRETTY_PRINT), 'AES-256-CBC', SECRET_KEY, 0, $iv);
    file_put_contents($ordersFile, base64_encode($iv.$enc));

    header("Location: admin.php");
    exit;
}

$remaining = SESSION_LIFETIME - (time() - ($_SESSION['admin_time'] ?? time()));
if ($remaining < 0) $remaining = 0;
?>

<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<title>Admin Dashboard</title>
<style>
body{font-family:Arial;background:#f4f4f9;padding:30px}
.top{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
.logout{background:#111;color:#fff;padding:10px 14px;border-radius:8px;text-decoration:none}
.order{background:#fff;border-radius:14px;padding:20px;margin-bottom:15px;box-shadow:0 6px 15px rgba(0,0,0,.08)}
.header{display:flex;justify-content:space-between;cursor:pointer}
.details{display:none;margin-top:15px}
select,textarea,button{padding:8px;border-radius:6px;width:100%;margin-top:6px}
button{background:#111;color:#fff;border:none;margin-top:10px;cursor:pointer}
.status{font-weight:700}
.countdown{color:#d32f2f;font-weight:600}
.meta{font-size:13px;color:#555;margin-top:6px}
.delete-btn{background:#d32f2f;color:#fff;margin-top:6px}
</style>

<script>
let t = <?= $remaining ?>;
setInterval(()=>{
  if(t<=0) location.href='?logout=1';
  document.getElementById('cd').innerText =
    'Logout in ' + Math.floor(t/60)+':'+('0'+t%60).slice(-2);
  t--;
},1000);

function toggle(el){
  el.nextElementSibling.style.display =
  el.nextElementSibling.style.display === 'block' ? 'none' : 'block';
}
</script>
</head>
<body>

<div class="top">
<h1>Orders Dashboard</h1>
<div>
<span class="countdown" id="cd"></span>
<a class="logout" href="?logout=1">Logout</a>
</div>
</div>

<?php if(empty($orders)): ?>
<p>Keine Bestellungen vorhanden.</p>
<?php else: foreach($orders as $o): ?>
<div class="order">

<div class="header" onclick="toggle(this)">
<div>
<strong><?=htmlspecialchars($o['shipping']['firstname'].' '.$o['shipping']['lastname'])?></strong><br>

<div class="meta">
🆔 <strong>Order ID:</strong> <?=htmlspecialchars($o['id'])?><br>
📍 <?=htmlspecialchars(
    $o['shipping']['street'].' '.
    $o['shipping']['zip'].' '.
    $o['shipping']['city'].' – '.
    $o['shipping']['country']
)?>
</div>

<?=date('d.m.Y H:i',$o['timestamp'])?> – 
<?=number_format(array_sum(array_map(fn($i)=>floatval(str_replace(',','.',$i['price']))*$i['quantity'],$o['cart'])),2)?> <?=strtoupper($o['currency'])?>
</div>

<div class="status"><?= $o['status'] ?? 'Neu' ?></div>
</div>

<div class="details">
<strong>Artikel:</strong><br>
<?php foreach($o['cart'] as $i): ?>
- <?=htmlspecialchars($i['name'])?> (<?= $i['quantity'] ?> × <?=htmlspecialchars($i['price'])?>)<br>
<?php endforeach; ?>

<form method="post">
<input type="hidden" name="order_id" value="<?=htmlspecialchars($o['id'])?>">
<label>Status</label>
<select name="status">
<?php foreach(['Neu','Bezahlt','Versendet','Erledigt'] as $s): ?>
<option <?=($o['status']??'Neu')===$s?'selected':''?>><?=$s?></option>
<?php endforeach; ?>
</select>

<label>Notiz</label>
<textarea name="note"><?=htmlspecialchars($o['note']??'')?></textarea>
<button>Speichern</button>
</form>

<form method="post">
<input type="hidden" name="delete_order" value="<?=htmlspecialchars($o['id'])?>">
<button class="delete-btn" onclick="return confirm('Möchten Sie diese Bestellung wirklich löschen?')">Bestellung löschen</button>
</form>

</div>

</div>
<?php endforeach; endif; ?>

</body>
</html>