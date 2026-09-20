<?php
$pageTitle = 'ข้อมูลสถานศึกษา';
require_once __DIR__ . '/includes/header.php';
require_once __DIR__ . '/includes/sidebar.php';

$successMsg = null;
$errorMsg = null;
$schoolId = $_SESSION['school_id'] ?? 1;
$pdo = Database::getConnection();

// Handle form submission by School Admin
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['update_school'])) {
    $name = trim($_POST['name'] ?? '');
    $smisCode = trim($_POST['smis_code'] ?? '');
    $schoolCode = trim($_POST['school_code'] ?? '');
    $affiliation = trim($_POST['affiliation'] ?? '');
    $educationArea = trim($_POST['education_area'] ?? '');
    $directorName = trim($_POST['director_name'] ?? '');
    $address = trim($_POST['address'] ?? '');
    $subdistrict = trim($_POST['subdistrict'] ?? '');
    $district = trim($_POST['district'] ?? '');
    $province = trim($_POST['province'] ?? '');
    $zipcode = trim($_POST['zipcode'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $website = trim($_POST['website'] ?? '');
    $vision = trim($_POST['vision'] ?? '');
    $mission = trim($_POST['mission'] ?? '');
    $motto = trim($_POST['motto'] ?? '');
    $logoUrl = trim($_POST['logo_url'] ?? '');

    if (empty($name)) {
        $errorMsg = 'กรุณาระบุชื่อโรงเรียน';
    } else {
        if ($pdo) {
            try {
                $stmt = $pdo->prepare("
                    UPDATE schools SET 
                        name = :name,
                        smis_code = :smis_code,
                        school_code = :school_code,
                        affiliation = :affiliation,
                        education_area = :education_area,
                        director_name = :director_name,
                        address = :address,
                        subdistrict = :subdistrict,
                        district = :district,
                        province = :province,
                        zipcode = :zipcode,
                        phone = :phone,
                        email = :email,
                        website = :website,
                        vision = :vision,
                        mission = :mission,
                        motto = :motto,
                        logo_url = :logo_url
                    WHERE id = :school_id
                ");
                $stmt->execute([
                    ':name' => $name,
                    ':smis_code' => $smisCode,
                    ':school_code' => $schoolCode,
                    ':affiliation' => $affiliation,
                    ':education_area' => $educationArea,
                    ':director_name' => $directorName,
                    ':address' => $address,
                    ':subdistrict' => $subdistrict,
                    ':district' => $district,
                    ':province' => $province,
                    ':zipcode' => $zipcode,
                    ':phone' => $phone,
                    ':email' => $email,
                    ':website' => $website,
                    ':vision' => $vision,
                    ':mission' => $mission,
                    ':motto' => $motto,
                    ':logo_url' => $logoUrl,
                    ':school_id' => $schoolId,
                ]);
                $successMsg = 'บันทึกข้อมูลสถานศึกษาเรียบร้อยแล้ว: ชื่อโรงเรียนได้รับการอัปเดตบนส่วนหัว (Header) ของระบบเรียบร้อยแล้ว';
            } catch (Exception $e) {
                $errorMsg = 'เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' . $e->getMessage();
            }
        } else {
            // Demo/Session storage fallback
            $_SESSION['custom_school_data'] = [
                'name' => $name,
                'smis_code' => $smisCode,
                'school_code' => $schoolCode,
                'affiliation' => $affiliation,
                'education_area' => $educationArea,
                'director_name' => $directorName,
                'address' => $address,
                'subdistrict' => $subdistrict,
                'district' => $district,
                'province' => $province,
                'zipcode' => $zipcode,
                'phone' => $phone,
                'email' => $email,
                'website' => $website,
                'logo_url' => $logoUrl,
            ];
            $successMsg = 'บันทึกข้อมูลสถานศึกษาเรียบร้อยแล้ว (อัปเดตส่วนหัวของระบบทันที)';
        }
    }
}

$school = getSchoolData();
$fiscalYear = getFiscalYearData();
?>

<main class="flex-1 p-4 sm:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
    <!-- Header Title -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
            <h2 class="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                <i data-lucide="building-2" class="w-6 h-6 text-blue-700"></i>
                <span>ข้อมูลสถานศึกษาและการตั้งค่าระบบ</span>
            </h2>
            <p class="text-xs text-slate-500 mt-1">
                สำหรับผู้ดูแลระบบโรงเรียน (Admin) กำหนดชื่อสถานศึกษา รหัส SMIS 8 หลัก และข้อมูลติดต่อสำหรับหัวเรื่องระบบและเอกสารราชการ
            </p>
        </div>

        <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold">
                <i data-lucide="shield-check" class="w-4 h-4 text-blue-600"></i>
                <span>สิทธิ์: ผู้ดูแลระบบโรงเรียน (Admin)</span>
            </span>
        </div>
    </div>

    <?php if ($successMsg): ?>
        <div class="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 shadow-xs">
            <div class="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <i data-lucide="check-circle" class="w-5 h-5"></i>
            </div>
            <div>
                <p class="font-bold text-emerald-950">บันทึกสำเร็จ!</p>
                <p class="text-xs text-emerald-700 mt-0.5"><?= htmlspecialchars($successMsg) ?></p>
            </div>
        </div>
    <?php endif; ?>

    <?php if ($errorMsg): ?>
        <div class="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3 shadow-xs">
            <div class="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0">
                <i data-lucide="alert-triangle" class="w-5 h-5"></i>
            </div>
            <div>
                <p class="font-bold text-rose-950">เกิดข้อผิดพลาด</p>
                <p class="text-xs text-rose-700 mt-0.5"><?= htmlspecialchars($errorMsg) ?></p>
            </div>
        </div>
    <?php endif; ?>

    <!-- Active Header Preview Card -->
    <div class="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-5 mb-6 shadow-md border border-blue-800">
        <div class="flex items-center justify-between pb-3 mb-3 border-b border-blue-800/80">
            <div class="flex items-center gap-2 text-xs font-semibold text-amber-300">
                <i data-lucide="eye" class="w-4 h-4"></i>
                <span>ตัวอย่างการแสดงผลบนส่วนหัวของระบบ (Header Preview)</span>
            </div>
            <span class="text-[11px] bg-blue-800 text-blue-200 px-2.5 py-0.5 rounded-full">
                ปรากฏในทุกหน้าของระบบ
            </span>
        </div>
        <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 overflow-hidden shrink-0">
                <?php if (!empty($school['logo_url'])): ?>
                    <img src="<?= htmlspecialchars($school['logo_url']) ?>" alt="Logo" class="w-full h-full object-cover">
                <?php else: ?>
                    <i data-lucide="building-2" class="w-6 h-6"></i>
                <?php endif; ?>
            </div>
            <div>
                <div class="flex items-center gap-2">
                    <h3 class="text-lg font-bold text-white"><?= htmlspecialchars($school['name']) ?></h3>
                    <?php if (!empty($school['smis_code'])): ?>
                        <span class="text-xs font-mono font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
                            SMIS: <?= htmlspecialchars($school['smis_code']) ?>
                        </span>
                    <?php endif; ?>
                </div>
                <p class="text-xs text-blue-200 mt-0.5">
                    <?= htmlspecialchars($school['affiliation']) ?> • <?= htmlspecialchars($school['education_area'] ?? '') ?> • ปีงบประมาณ พ.ศ. <?= $fiscalYear['year'] ?>
                </p>
            </div>
        </div>
    </div>

    <!-- Edit School Form -->
    <form method="POST" action="school.php" class="space-y-6">
        <input type="hidden" name="update_school" value="1">

        <!-- 1. General Info -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div class="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div class="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <i data-lucide="info" class="w-4 h-4"></i>
                </div>
                <div>
                    <h3 class="text-sm font-bold text-slate-900">1. ข้อมูลพื้นฐานสถานศึกษา (แสดงผลส่วนหัวระบบ)</h3>
                    <p class="text-xs text-slate-500">กำหนดชื่อโรงเรียนและสังกัดที่จะปรากฏบน Header ทุกหน้า</p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                    <label class="block text-xs font-bold text-slate-700 mb-1">
                        ชื่อสถานศึกษา <span class="text-rose-500">* (ชื่อนี้จะแสดงที่ส่วนหัว Header ของทุกหน้า)</span>
                    </label>
                    <input type="text" name="name" required value="<?= htmlspecialchars($school['name']) ?>" placeholder="เช่น โรงเรียนบ้านดอนวิทยาคม" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white">
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1">
                        รหัส SMIS (8 หลัก) <span class="text-rose-500">*</span>
                    </label>
                    <input type="text" name="smis_code" maxlength="8" value="<?= htmlspecialchars($school['smis_code'] ?? '') ?>" placeholder="10400100" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white">
                    <span class="text-[11px] text-slate-400 mt-1 block">รหัสประจำสถานศึกษา 8 หลักของ สพฐ.</span>
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1">
                        รหัสสถานศึกษา 10 หลัก
                    </label>
                    <input type="text" name="school_code" maxlength="10" value="<?= htmlspecialchars($school['school_code'] ?? '') ?>" placeholder="1040010025" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white">
                    <span class="text-[11px] text-slate-400 mt-1 block">รหัส 10 หลักสำหรับการรายงานราชการ</span>
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1">หน่วยงานต้นสังกัด</label>
                    <input type="text" name="affiliation" value="<?= htmlspecialchars($school['affiliation'] ?? 'สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน (สพฐ.)') ?>" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white">
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1">สำนักงานเขตพื้นที่การศึกษา</label>
                    <input type="text" name="education_area" value="<?= htmlspecialchars($school['education_area'] ?? '') ?>" placeholder="เช่น สพป.ขอนแก่น เขต 1" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white">
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1">ชื่อผู้อำนวยการสถานศึกษา</label>
                    <input type="text" name="director_name" value="<?= htmlspecialchars($school['director_name'] ?? '') ?>" placeholder="เช่น นายสมศักดิ์ พัฒนศึกษา" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white">
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1">URL โลโก้ / ตราสัญลักษณ์สถานศึกษา</label>
                    <input type="text" name="logo_url" value="<?= htmlspecialchars($school['logo_url'] ?? '') ?>" placeholder="https://example.com/logo.png" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white">
                </div>
            </div>
        </div>

        <!-- 2. Address & Contact -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div class="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <i data-lucide="map-pin" class="w-4 h-4"></i>
                </div>
                <div>
                    <h3 class="text-sm font-bold text-slate-900">2. ที่ตั้งและการติดต่อสถานศึกษา</h3>
                    <p class="text-xs text-slate-500">ข้อมูลที่อยู่สำหรับส่วนท้ายเอกสารแผนปฏิบัติการและรายงาน</p>
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div class="sm:col-span-2 md:col-span-3">
                    <label class="block text-xs font-semibold text-slate-700 mb-1">ที่อยู่ (เลขที่, หมู่, ถนน)</label>
                    <input type="text" name="address" value="<?= htmlspecialchars($school['address'] ?? '') ?>" placeholder="เช่น 123 หมู่ 4 ถนนมิตรภาพ" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white">
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1">ตำบล / แขวง</label>
                    <input type="text" name="subdistrict" value="<?= htmlspecialchars($school['subdistrict'] ?? '') ?>" placeholder="เช่น ในเมือง" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white">
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1">อำเภอ / เขต</label>
                    <input type="text" name="district" value="<?= htmlspecialchars($school['district'] ?? '') ?>" placeholder="เช่น เมืองขอนแก่น" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white">
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1">จังหวัด</label>
                    <input type="text" name="province" value="<?= htmlspecialchars($school['province'] ?? '') ?>" placeholder="เช่น ขอนแก่น" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white">
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1">รหัสไปรษณีย์</label>
                    <input type="text" name="zipcode" maxlength="5" value="<?= htmlspecialchars($school['zipcode'] ?? '') ?>" placeholder="40000" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white">
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                    <input type="text" name="phone" value="<?= htmlspecialchars($school['phone'] ?? '') ?>" placeholder="เช่น 043-241987" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white">
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1">อีเมลโรงเรียน</label>
                    <input type="email" name="email" value="<?= htmlspecialchars($school['email'] ?? '') ?>" placeholder="school@obec.mail.go.th" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white">
                </div>
            </div>
        </div>

        <!-- Submit Button -->
        <div class="flex items-center justify-end gap-3 pt-2">
            <button type="submit" class="px-6 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2">
                <i data-lucide="save" class="w-4 h-4"></i>
                <span>บันทึกข้อมูลสถานศึกษาและอัปเดตส่วนหัวระบบ</span>
            </button>
        </div>
    </form>
</main>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
