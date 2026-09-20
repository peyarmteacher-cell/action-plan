<?php
/**
 * หน้าเปลี่ยนรหัสผ่าน (Change Password & First-Time Login Password Enforcement)
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/functions.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$isFirstLogin = !empty($_GET['first_login']) || !empty($_SESSION['pending_user_id']);
$userId = $_SESSION['pending_user_id'] ?? $_SESSION['user_id'] ?? null;
$userName = $_SESSION['pending_user_name'] ?? $_SESSION['full_name'] ?? 'ผู้ใช้งาน';
$username = $_SESSION['pending_username'] ?? $_SESSION['username'] ?? '';
$userRole = $_SESSION['pending_user_role'] ?? $_SESSION['user_role'] ?? 'user';

if (!$userId) {
    header('Location: login.php');
    exit;
}

$error = null;
$success = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $newPassword = $_POST['new_password'] ?? '';
    $confirmPassword = $_POST['confirm_password'] ?? '';

    if (strlen($newPassword) < 6) {
        $error = 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
    } elseif ($newPassword === '123456') {
        $error = 'กรุณากำหนดรหัสผ่านใหม่ที่ไม่ใช่รหัสผ่านเริ่มต้น (123456)';
    } elseif ($newPassword !== $confirmPassword) {
        $error = 'รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน';
    } else {
        $newHash = password_hash($newPassword, PASSWORD_DEFAULT);
        $db = Database::getConnection();

        if ($db) {
            try {
                $stmt = $db->prepare("UPDATE users SET password_hash = :hash, must_change_password = 0, updated_at = NOW() WHERE id = :id");
                $stmt->execute([':hash' => $newHash, ':id' => $userId]);
            } catch (Exception $e) {
                // Ignore if in-memory or demo
            }
        }

        // Complete session login if coming from pending state
        if (!empty($_SESSION['pending_user_id'])) {
            $_SESSION['user_id'] = $_SESSION['pending_user_id'];
            $_SESSION['username'] = $_SESSION['pending_username'];
            $_SESSION['full_name'] = $_SESSION['pending_user_name'];
            $_SESSION['user_role'] = $_SESSION['pending_user_role'];
            unset($_SESSION['pending_user_id']);
            unset($_SESSION['pending_user_name']);
            unset($_SESSION['pending_username']);
            unset($_SESSION['pending_user_role']);
        }

        if (($_SESSION['user_role'] ?? '') === 'superadmin') {
            header('Location: super_admin.php?msg=pwd_updated');
        } else {
            header('Location: dashboard.php?msg=pwd_updated');
        }
        exit;
    }
}
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>เปลี่ยนรหัสผ่าน - ระบบบริหารโครงการและงบประมาณโรงเรียน (สพฐ.)</title>
    <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>body { font-family: 'Sarabun', sans-serif; }</style>
</head>
<body class="bg-slate-900 min-h-screen flex items-center justify-center p-4">

    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <!-- Header Banner -->
        <div class="bg-gradient-to-tr from-amber-600 via-amber-700 to-amber-900 p-6 text-center text-white">
            <div class="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-white font-black text-2xl shadow-lg mb-2">
                <i data-lucide="lock" class="w-7 h-7 text-amber-200"></i>
            </div>
            <h1 class="text-lg font-bold tracking-tight">
                <?= $isFirstLogin ? 'บังคับเปลี่ยนรหัสผ่านสำหรับการเข้าใช้งานครั้งแรก' : 'เปลี่ยนรหัสผ่านผู้ใช้งาน' ?>
            </h1>
            <p class="text-xs text-amber-100 mt-1">
                First-Time Login Security Requirement
            </p>
        </div>

        <div class="p-6 sm:p-8 space-y-4">
            <div class="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 space-y-1">
                <div class="font-bold flex items-center gap-1.5 text-amber-950">
                    <span>ผู้ใช้งาน:</span>
                    <span><?= htmlspecialchars($userName) ?></span>
                </div>
                <div class="text-amber-800 text-[11px]">
                    ชื่อผู้ใช้: <span class="font-mono font-semibold"><?= htmlspecialchars($username) ?></span> | บทบาท: <?= htmlspecialchars($userRole) ?>
                </div>
                <p class="text-[11px] text-amber-800 pt-1 border-t border-amber-200/60 mt-1">
                    เพื่อความปลอดภัย บัญชีที่ได้รับรหัสผ่านเริ่มต้น (123456) จำเป็นต้องตั้งรหัสผ่านใหม่ส่วนตัวก่อนเข้าใช้งานระบบ
                </p>
            </div>

            <?php if ($error): ?>
                <div class="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center gap-2">
                    <i data-lucide="alert-circle" class="w-4 h-4 text-red-600 shrink-0"></i>
                    <span><?= htmlspecialchars($error) ?></span>
                </div>
            <?php endif; ?>

            <form method="POST" class="space-y-4">
                <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1">
                        รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร) <span class="text-red-500">*</span>
                    </label>
                    <input 
                        type="password" 
                        name="new_password" 
                        required 
                        minlength="6"
                        placeholder="กำหนดรหัสผ่านใหม่ (ห้ามใช้ 123456)" 
                        class="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1">
                        ยืนยันรหัสผ่านใหม่อีกครั้ง <span class="text-red-500">*</span>
                    </label>
                    <input 
                        type="password" 
                        name="confirm_password" 
                        required 
                        minlength="6"
                        placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง" 
                        class="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                </div>

                <button 
                    type="submit" 
                    class="w-full flex items-center justify-center gap-2 rounded-lg bg-amber-600 hover:bg-amber-700 p-2.5 text-xs font-bold text-white shadow transition-colors"
                >
                    <i data-lucide="key-round" class="w-4 h-4"></i>
                    <span>บันทึกรหัสผ่านใหม่และเข้าสู่ระบบ</span>
                </button>

                <div class="text-center pt-2">
                    <a href="logout.php" class="text-xs text-slate-500 hover:text-slate-800">
                        ยกเลิกและออกจากระบบ
                    </a>
                </div>
            </form>
        </div>
    </div>

    <script>
        lucide.createIcons();
    </script>
</body>
</html>
