<?php
/**
 * ฟังก์ชันกลางสำหรับระบบแผนปฏิบัติการประจำปีและจัดสรรงบประมาณโรงเรียน (Multi-School)
 * Clean State - ปราศจากข้อมูลตัวอย่าง (Ready for Production)
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * ป้องกัน XSS
 */
function sanitize(string $data): string {
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}

/**
 * สร้างและตรวจสอบ CSRF Token
 */
function generateCsrfToken(): string {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verifyCsrfToken(?string $token): bool {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], (string)$token);
}

/**
 * จัดรูปแบบตัวเลขเงินบาท
 */
function formatMoney($amount): string {
    return number_format((float)$amount, 2, '.', ',');
}

/**
 * แปลงวันที่ ค.ศ. เป็น วันที่ภาษาไทย พ.ศ.
 */
function formatThaiDate(?string $dateStr): string {
    if (!$dateStr) return '-';
    $thaiMonths = [
        1 => 'ม.ค.', 2 => 'ก.พ.', 3 => 'มี.ค.', 4 => 'เม.ย.',
        5 => 'พ.ค.', 6 => 'มิ.ย.', 7 => 'ก.ค.', 8 => 'ส.ค.',
        9 => 'ก.ย.', 10 => 'ต.ค.', 11 => 'พ.ย.', 12 => 'ธ.ค.'
    ];
    $ts = strtotime($dateStr);
    if (!$ts) return $dateStr;
    $d = date('j', $ts);
    $m = (int)date('n', $ts);
    $y = (int)date('Y', $ts) + 543;
    return "$d {$thaiMonths[$m]} $y";
}

/**
 * แปลงตัวเลขเป็นคำอ่านเงินบาทไทย (Thai Baht Text)
 */
function bahtText(float $number): string {
    $number = number_format($number, 2, '.', '');
    [$integer, $fraction] = explode('.', $number);
    
    $digits = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
    $positions = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];
    
    $convert = function ($numStr) use ($digits, $positions) {
        $len = strlen($numStr);
        $res = '';
        for ($i = 0; $i < $len; $i++) {
            $d = (int)$numStr[$i];
            $pos = $len - $i - 1;
            if ($d !== 0) {
                if ($pos % 6 === 1 && $d === 1 && $len > 1) {
                    $res .= 'สิบ';
                } elseif ($pos % 6 === 1 && $d === 2) {
                    $res .= 'ยี่สิบ';
                } elseif ($pos % 6 === 0 && $d === 1 && $len > 1 && $i === $len - 1) {
                    $res .= 'เอ็ด';
                } else {
                    $res .= $digits[$d] . $positions[$pos % 6];
                }
            }
            if ($pos % 6 === 0 && $pos > 0) {
                $res .= 'ล้าน';
            }
        }
        return $res;
    };

    $intPart = (int)$integer === 0 ? 'ศูนย์บาท' : $convert($integer) . 'บาท';
    $fracPart = (int)$fraction === 0 ? 'ถ้วน' : $convert($fraction) . 'สตางค์';
    return $intPart . $fracPart;
}

/**
 * ดึงข้อมูลโรงเรียนปัจจุบัน (จาก DB หรือ Clean Default)
 */
function getSchoolData(): array {
    $db = Database::getConnection();
    if ($db) {
        try {
            $schoolId = $_SESSION['school_id'] ?? 1;
            $stmt = $db->prepare("SELECT * FROM schools WHERE id = ? LIMIT 1");
            $stmt->execute([$schoolId]);
            $row = $stmt->fetch();
            if ($row) return $row;
        } catch (Exception $e) {
            // fallback
        }
    }
    return [
        'id' => 1,
        'school_code' => '10400100',
        'smis_code' => '10400100',
        'is_active' => 1,
        'school_key' => 'SCH-10400100',
        'name' => 'โรงเรียนต้นแบบการศึกษาขั้นพื้นฐาน',
        'address' => '',
        'subdistrict' => '',
        'district' => '',
        'province' => '',
        'zipcode' => '',
        'affiliation' => 'สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน (สพฐ.)',
        'education_area' => 'สำนักงานเขตพื้นที่การศึกษา',
        'fiscal_year' => 2568,
        'director_name' => '',
        'phone' => '',
        'email' => '',
        'website' => '',
        'vision' => '',
        'mission' => '',
        'motto' => '',
        'school_colors' => '',
        'logo_url' => '',
        'allow_project_submission' => 1,
    ];
}

/**
 * ดึงข้อมูลปีงบประมาณ
 */
function getFiscalYearData(): array {
    $db = Database::getConnection();
    if ($db) {
        try {
            $schoolId = $_SESSION['school_id'] ?? 1;
            $stmt = $db->prepare("SELECT * FROM fiscal_years WHERE school_id = ? AND is_active = 1 LIMIT 1");
            $stmt->execute([$schoolId]);
            $row = $stmt->fetch();
            if ($row) return $row;
        } catch (Exception $e) {
            // fallback
        }
    }
    return [
        'id' => 1,
        'year' => 2568,
        'is_active' => 1,
        'start_date' => '2024-10-01',
        'end_date' => '2025-09-30',
        'total_students' => 0,
        'teacher_count' => 0
    ];
}

/**
 * ดึงข้อมูลนักเรียน (Clean - 0 คน เริ่มต้น)
 */
function getStudentsData(): array {
    $db = Database::getConnection();
    if ($db) {
        try {
            $schoolId = $_SESSION['school_id'] ?? 1;
            $stmt = $db->prepare("SELECT * FROM students WHERE school_id = ? ORDER BY id ASC");
            $stmt->execute([$schoolId]);
            $rows = $stmt->fetchAll();
            if (!empty($rows)) return $rows;
        } catch (Exception $e) {
            // fallback
        }
    }
    return [
        ['id' => 1, 'grade_level' => 'อนุบาล 1', 'stage' => 'อนุบาล', 'male_count' => 0, 'female_count' => 0, 'total_count' => 0],
        ['id' => 2, 'grade_level' => 'อนุบาล 2', 'stage' => 'อนุบาล', 'male_count' => 0, 'female_count' => 0, 'total_count' => 0],
        ['id' => 3, 'grade_level' => 'อนุบาล 3', 'stage' => 'อนุบาล', 'male_count' => 0, 'female_count' => 0, 'total_count' => 0],
        ['id' => 4, 'grade_level' => 'ประถมศึกษาปีที่ 1', 'stage' => 'ประถม', 'male_count' => 0, 'female_count' => 0, 'total_count' => 0],
        ['id' => 5, 'grade_level' => 'ประถมศึกษาปีที่ 2', 'stage' => 'ประถม', 'male_count' => 0, 'female_count' => 0, 'total_count' => 0],
        ['id' => 6, 'grade_level' => 'ประถมศึกษาปีที่ 3', 'stage' => 'ประถม', 'male_count' => 0, 'female_count' => 0, 'total_count' => 0],
        ['id' => 7, 'grade_level' => 'ประถมศึกษาปีที่ 4', 'stage' => 'ประถม', 'male_count' => 0, 'female_count' => 0, 'total_count' => 0],
        ['id' => 8, 'grade_level' => 'ประถมศึกษาปีที่ 5', 'stage' => 'ประถม', 'male_count' => 0, 'female_count' => 0, 'total_count' => 0],
        ['id' => 9, 'grade_level' => 'ประถมศึกษาปีที่ 6', 'stage' => 'ประถม', 'male_count' => 0, 'female_count' => 0, 'total_count' => 0],
    ];
}

/**
 * ดึงข้อมูลรายรับ (Clean - 0 บาท เริ่มต้น)
 */
function getRevenuesData(): array {
    $db = Database::getConnection();
    if ($db) {
        try {
            $schoolId = $_SESSION['school_id'] ?? 1;
            $stmt = $db->prepare("SELECT * FROM revenues WHERE school_id = ? ORDER BY id ASC");
            $stmt->execute([$schoolId]);
            $rows = $stmt->fetchAll();
            if (!empty($rows)) return $rows;
        } catch (Exception $e) {
            // fallback
        }
    }
    return [
        ['id' => 1, 'category' => 'subsidy', 'item_name' => '1. เงินอุดหนุนรายหัว (การจัดการศึกษาขั้นพื้นฐาน)', 'rate_per_head' => 1980, 'eligible_count' => 0, 'calculated_amount' => 0.00, 'note' => 'เฉลี่ยรวม อ.1-3 และ ป.1-6'],
        ['id' => 2, 'category' => 'subsidy', 'item_name' => '2. เงินอุดหนุนรายหัวส่วนเพิ่ม (Top Up) โรงเรียนคุณภาพ', 'rate_per_head' => 500, 'eligible_count' => 0, 'calculated_amount' => 0.00, 'note' => 'สนับสนุนพัฒนาคุณภาพการศึกษา สพฐ.'],
        ['id' => 3, 'category' => 'welfare', 'item_name' => '3. ค่าหนังสือเรียน (โครงการเรียนฟรี 15 ปี)', 'rate_per_head' => 650, 'eligible_count' => 0, 'calculated_amount' => 0.00, 'note' => 'จัดสรรตามเกณฑ์ระดับการศึกษา สพฐ.'],
        ['id' => 4, 'category' => 'welfare', 'item_name' => '4. ค่าเครื่องแบบนักเรียน (2 ชุด/คน/ปี)', 'rate_per_head' => 380, 'eligible_count' => 0, 'calculated_amount' => 0.00, 'note' => 'อนุบาล 325 บ., ประถม 400 บ.'],
        ['id' => 5, 'category' => 'welfare', 'item_name' => '5. ค่าอุปกรณ์การเรียน (2 ภาคเรียน/ปี)', 'rate_per_head' => 440, 'eligible_count' => 0, 'calculated_amount' => 0.00, 'note' => 'อนุบาล 290 บ./ปี, ประถม 440 บ./ปี'],
        ['id' => 6, 'category' => 'activity', 'item_name' => '6. เงินกิจกรรมพัฒนาคุณภาพผู้เรียน (4 กิจกรรมหลัก สพฐ.)', 'rate_per_head' => 480, 'eligible_count' => 0, 'calculated_amount' => 0.00, 'note' => 'วิชาการ, คุณธรรม, ทัศนศึกษา, ICT'],
        ['id' => 7, 'category' => 'lunch', 'item_name' => '7. เงินอุดหนุนค่าอาหารกลางวัน (อปท.)', 'rate_per_head' => 27, 'eligible_count' => 0, 'calculated_amount' => 0.00, 'note' => 'คำนวณ 27 บาท/วัน จำนวน 200 วันทำการ'],
        ['id' => 8, 'category' => 'other', 'item_name' => '8. เงินรายได้สถานศึกษา / เงินบริจาค', 'rate_per_head' => 0, 'eligible_count' => 0, 'calculated_amount' => 0.00, 'note' => 'เงินระดมทรัพยากรและเงินบริจาคเพื่อการศึกษา'],
    ];
}

/**
 * ดึงข้อมูลการจัดสรรงบประมาณตามฝ่าย (Clean - เริ่มต้น 0 บาท)
 */
function getBudgetAllocations(): array {
    $db = Database::getConnection();
    if ($db) {
        try {
            $schoolId = $_SESSION['school_id'] ?? 1;
            $stmt = $db->prepare("SELECT * FROM budget_allocations WHERE school_id = ? ORDER BY id ASC");
            $stmt->execute([$schoolId]);
            $rows = $stmt->fetchAll();
            if (!empty($rows)) return $rows;
        } catch (Exception $e) {
            // fallback
        }
    }
    return [
        ['id' => 1, 'department_name' => 'ฝ่ายบริหารงานวิชาการ', 'percentage' => 45.0, 'allocated_amount' => 0.00, 'spent_amount' => 0.00, 'remaining_amount' => 0.00, 'color_hex' => '#2563eb', 'description' => 'พัฒนาหลักสูตร การจัดการเรียนการสอน สื่อ นวัตกรรม'],
        ['id' => 2, 'department_name' => 'ฝ่ายบริหารงานงบประมาณ', 'percentage' => 15.0, 'allocated_amount' => 0.00, 'spent_amount' => 0.00, 'remaining_amount' => 0.00, 'color_hex' => '#0284c7', 'description' => 'การเงิน บัญชี พัสดุ สินทรัพย์ และแผนงานงบประมาณ'],
        ['id' => 3, 'department_name' => 'ฝ่ายบริหารงานบุคคล', 'percentage' => 10.0, 'allocated_amount' => 0.00, 'spent_amount' => 0.00, 'remaining_amount' => 0.00, 'color_hex' => '#059669', 'description' => 'พัฒนาครู วินัย สวัสดิการ และการสรรหาบุคลากร'],
        ['id' => 4, 'department_name' => 'ฝ่ายบริหารงานทั่วไป', 'percentage' => 20.0, 'allocated_amount' => 0.00, 'spent_amount' => 0.00, 'remaining_amount' => 0.00, 'color_hex' => '#d97706', 'description' => 'อาคารสถานที่ สิ่งแวดล้อม และสัมพันธ์ชุมชน'],
        ['id' => 5, 'department_name' => 'งบกลาง / สำรองจ่ายฉุกเฉิน', 'percentage' => 10.0, 'allocated_amount' => 0.00, 'spent_amount' => 0.00, 'remaining_amount' => 0.00, 'color_hex' => '#7c3aed', 'description' => 'กรณีภัยพิบัติและกิจกรรมเร่งด่วน'],
    ];
}

/**
 * ดึงข้อมูลโครงการ (Clean - เริ่มต้นว่างเปล่า 0 โครงการ)
 */
function getProjectsData(): array {
    $db = Database::getConnection();
    if ($db) {
        try {
            $schoolId = $_SESSION['school_id'] ?? 1;
            $stmt = $db->prepare("SELECT * FROM projects WHERE school_id = ? ORDER BY id DESC");
            $stmt->execute([$schoolId]);
            $rows = $stmt->fetchAll();
            return $rows ?: [];
        } catch (Exception $e) {
            // fallback
        }
    }
    return $_SESSION['projects'] ?? [];
}
