<?php
/**
 * Root Entry Point for PHP Web Server
 * ระบบแผนปฏิบัติการประจำปีและจัดสรรงบประมาณโรงเรียน
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// หน้าแรกต้องเป็นหน้า login เข้าสู่ระบบ หากยังไม่ได้ล็อกอิน
if (empty($_SESSION['user_id'])) {
    header('Location: login.php');
    exit;
}

// หากล็อกอินแล้ว ให้เปิดไปยังหน้าตามบทบาทผู้ใช้งาน
if (($_SESSION['user_role'] ?? '') === 'superadmin') {
    header('Location: super_admin.php');
    exit;
} else {
    header('Location: dashboard.php');
    exit;
}

