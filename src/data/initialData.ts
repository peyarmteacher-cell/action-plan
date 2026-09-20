import {
  School,
  FiscalYear,
  StudentLevel,
  RevenueItem,
  BudgetAllocation,
  LearnerActivity,
  Strategy,
  Goal,
  Indicator,
  Project,
  BudgetTransaction,
  User,
} from '../types';

/**
 * ข้อมูลโรงเรียนเริ่มต้น (Clean Database - พร้อมสำหรับใช้งานจริง)
 */
export const initialSchool: School = {
  id: 1,
  schoolCode: '10400100',
  smisCode: '10400100',
  schoolKey: 'SCH-10400100',
  adminUsername: '10400100',
  adminPasswordPlain: '123456',
  name: 'โรงเรียนต้นแบบการศึกษาขั้นพื้นฐาน',
  address: '',
  subdistrict: '',
  district: '',
  province: '',
  zipcode: '',
  affiliation: 'สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน (สพฐ.)',
  educationArea: 'สำนักงานเขตพื้นที่การศึกษา',
  fiscalYear: 2568,
  directorName: '',
  phone: '',
  email: '',
  website: '',
  vision: '',
  mission: '',
  motto: '',
  schoolColors: '',
  logoUrl: '',
  allowProjectSubmission: true,
  isActive: true,
  notes: 'โรงเรียนพร้อมสำหรับการบันทึกข้อมูลจริง',
  studentCount: 0,
  projectCount: 0,
  totalBudget: 0,
};

export const initialFiscalYears: FiscalYear[] = [
  {
    id: 1,
    schoolId: 1,
    year: 2568,
    isActive: true,
    startDate: '2024-10-01',
    endDate: '2025-09-30',
    totalStudents: 0,
    teacherCount: 0,
  },
];

/**
 * ตารางระดับชั้นนักเรียน (เริ่มต้นเป็น 0 รอการบันทึกจริง หรือนำเข้าจาก Excel)
 */
export const initialStudents: StudentLevel[] = [
  { id: 1, schoolId: 1, fiscalYearId: 1, gradeLevel: 'อนุบาล 1', stage: 'อนุบาล', maleCount: 0, femaleCount: 0, totalCount: 0 },
  { id: 2, schoolId: 1, fiscalYearId: 1, gradeLevel: 'อนุบาล 2', stage: 'อนุบาล', maleCount: 0, femaleCount: 0, totalCount: 0 },
  { id: 3, schoolId: 1, fiscalYearId: 1, gradeLevel: 'อนุบาล 3', stage: 'อนุบาล', maleCount: 0, femaleCount: 0, totalCount: 0 },
  { id: 4, schoolId: 1, fiscalYearId: 1, gradeLevel: 'ประถมศึกษาปีที่ 1', stage: 'ประถม', maleCount: 0, femaleCount: 0, totalCount: 0 },
  { id: 5, schoolId: 1, fiscalYearId: 1, gradeLevel: 'ประถมศึกษาปีที่ 2', stage: 'ประถม', maleCount: 0, femaleCount: 0, totalCount: 0 },
  { id: 6, schoolId: 1, fiscalYearId: 1, gradeLevel: 'ประถมศึกษาปีที่ 3', stage: 'ประถม', maleCount: 0, femaleCount: 0, totalCount: 0 },
  { id: 7, schoolId: 1, fiscalYearId: 1, gradeLevel: 'ประถมศึกษาปีที่ 4', stage: 'ประถม', maleCount: 0, femaleCount: 0, totalCount: 0 },
  { id: 8, schoolId: 1, fiscalYearId: 1, gradeLevel: 'ประถมศึกษาปีที่ 5', stage: 'ประถม', maleCount: 0, femaleCount: 0, totalCount: 0 },
  { id: 9, schoolId: 1, fiscalYearId: 1, gradeLevel: 'ประถมศึกษาปีที่ 6', stage: 'ประถม', maleCount: 0, femaleCount: 0, totalCount: 0 },
];

/**
 * ประมาณการรายรับ สพฐ. (อัตรามาตรฐาน คำนวณตามจำนวนนักเรียนจริง)
 */
export const initialRevenueItems: RevenueItem[] = [
  {
    id: 1,
    schoolId: 1,
    fiscalYearId: 1,
    category: 'subsidy',
    itemName: '1. เงินอุดหนุนรายหัว (การจัดการศึกษาขั้นพื้นฐาน)',
    ratePerHead: 1980,
    eligibleCount: 0,
    calculatedAmount: 0,
    isCustomRate: false,
    note: 'เฉลี่ยรวม อ.1-3 (1,800 บ.) และ ป.1-6 (2,050 บ.) คำนวณอัตโนมัติ',
  },
  {
    id: 2,
    schoolId: 1,
    fiscalYearId: 1,
    category: 'subsidy',
    itemName: '2. เงินอุดหนุนรายหัวส่วนเพิ่ม (Top Up) โรงเรียนคุณภาพ',
    ratePerHead: 500,
    eligibleCount: 0,
    calculatedAmount: 0,
    isCustomRate: false,
    note: 'สนับสนุนพัฒนาคุณภาพการศึกษา สพฐ.',
  },
  {
    id: 3,
    schoolId: 1,
    fiscalYearId: 1,
    category: 'welfare',
    itemName: '3. ค่าหนังสือเรียน (โครงการเรียนฟรี 15 ปี)',
    ratePerHead: 650,
    eligibleCount: 0,
    calculatedAmount: 0,
    isCustomRate: false,
    note: 'จัดสรรตามเกณฑ์ระดับการศึกษา สพฐ.',
  },
  {
    id: 4,
    schoolId: 1,
    fiscalYearId: 1,
    category: 'welfare',
    itemName: '4. ค่าเครื่องแบบนักเรียน (2 ชุด/คน/ปี)',
    ratePerHead: 380,
    eligibleCount: 0,
    calculatedAmount: 0,
    isCustomRate: false,
    note: 'อนุบาล 325 บ., ประถม 400 บ.',
  },
  {
    id: 5,
    schoolId: 1,
    fiscalYearId: 1,
    category: 'welfare',
    itemName: '5. ค่าอุปกรณ์การเรียน (2 ภาคเรียน/ปี)',
    ratePerHead: 440,
    eligibleCount: 0,
    calculatedAmount: 0,
    isCustomRate: false,
    note: 'อนุบาล 290 บ., ประถม 440 บ.',
  },
  {
    id: 6,
    schoolId: 1,
    fiscalYearId: 1,
    category: 'activity',
    itemName: '6. เงินกิจกรรมพัฒนาคุณภาพผู้เรียน (4 กิจกรรมหลัก สพฐ.)',
    ratePerHead: 480,
    eligibleCount: 0,
    calculatedAmount: 0,
    isCustomRate: false,
    note: 'วิชาการ, คุณธรรม/ลูกเสือ, ทัศนศึกษา, ICT',
  },
  {
    id: 7,
    schoolId: 1,
    fiscalYearId: 1,
    category: 'lunch',
    itemName: '7. เงินอุดหนุนค่าอาหารกลางวัน (อปท.)',
    ratePerHead: 27,
    eligibleCount: 0,
    calculatedAmount: 0,
    isCustomRate: false,
    note: 'คำนวณ 27 บาท/วัน จำนวน 200 วันทำการ',
  },
  {
    id: 8,
    schoolId: 1,
    fiscalYearId: 1,
    category: 'other',
    itemName: '8. เงินรายได้สถานศึกษา / เงินบริจาค',
    ratePerHead: 0,
    eligibleCount: 0,
    calculatedAmount: 0,
    isCustomRate: true,
    note: 'เงินระดมทรัพยากร ดอกเบี้ยเงินฝาก และเงินบริจาคเพื่อการศึกษา',
  },
];

/**
 * กรอบการจัดสรรงบประมาณตาม 4 ฝ่ายบริหารงาน สพฐ. + งบกลาง
 */
export const initialBudgetAllocations: BudgetAllocation[] = [
  {
    id: 1,
    schoolId: 1,
    fiscalYearId: 1,
    departmentName: 'ฝ่ายบริหารงานวิชาการ',
    percentage: 45,
    allocatedPercentage: 45,
    allocatedAmount: 0,
    spentAmount: 0,
    remainingAmount: 0,
    colorHex: '#3B82F6',
    description: 'พัฒนาหลักสูตร สื่อการสอน เทคโนโลยี และยกระดับผลสัมฤทธิ์ทางการเรียน',
  },
  {
    id: 2,
    schoolId: 1,
    fiscalYearId: 1,
    departmentName: 'ฝ่ายบริหารงานงบประมาณ',
    percentage: 15,
    allocatedPercentage: 15,
    allocatedAmount: 0,
    spentAmount: 0,
    remainingAmount: 0,
    colorHex: '#10B981',
    description: 'บริหารแผนงาน การเงิน บัญชี พัสดุ และตรวจสอบภายใน',
  },
  {
    id: 3,
    schoolId: 1,
    fiscalYearId: 1,
    departmentName: 'ฝ่ายบริหารงานบุคคล',
    percentage: 10,
    allocatedPercentage: 10,
    allocatedAmount: 0,
    spentAmount: 0,
    remainingAmount: 0,
    colorHex: '#F59E0B',
    description: 'พัฒนาครู วินัย สวัสดิการ และการสร้างขวัญกำลังใจบุคลากร',
  },
  {
    id: 4,
    schoolId: 1,
    fiscalYearId: 1,
    departmentName: 'ฝ่ายบริหารงานทั่วไป',
    percentage: 20,
    allocatedPercentage: 20,
    allocatedAmount: 0,
    spentAmount: 0,
    remainingAmount: 0,
    colorHex: '#8B5CF6',
    description: 'อาคารสถานที่ สิ่งแวดล้อม สัมพันธ์ชุมชน และระบบสาธารณูปโภค',
  },
  {
    id: 5,
    schoolId: 1,
    fiscalYearId: 1,
    departmentName: 'งบกลาง / เงินสำรองจ่ายฉุกเฉิน',
    percentage: 10,
    allocatedPercentage: 10,
    allocatedAmount: 0,
    spentAmount: 0,
    remainingAmount: 0,
    colorHex: '#EF4444',
    description: 'กรณีภัยธรรมชาติ อุบัติเหตุ ซ่อมแซมเร่งด่วน และงานนโยบายเร่งด่วน',
  },
];

/**
 * 4 กิจกรรมพัฒนาคุณภาพผู้เรียนตามระเบียบ สพฐ.
 */
export const initialLearnerActivities: LearnerActivity[] = [
  {
    id: 1,
    schoolId: 1,
    fiscalYearId: 1,
    activityName: '1. กิจกรรมวิชาการ / ค่ายพัฒนาทักษะวิชาการ',
    percentage: 30,
    allocatedPercentage: 30,
    allocatedAmount: 0,
    spentAmount: 0,
    remainingAmount: 0,
    note: 'ค่ายคณิตศาสตร์-วิทยาศาสตร์, ค่ายภาษาอังกฤษ, สัปดาห์ห้องสมุด',
    description: 'ค่ายคณิตศาสตร์-วิทยาศาสตร์, ค่ายภาษาอังกฤษ, สัปดาห์ห้องสมุด',
  },
  {
    id: 2,
    schoolId: 1,
    fiscalYearId: 1,
    activityName: '2. กิจกรรมคุณธรรม จริยธรรม และลูกเสือ-เนตรนารี',
    percentage: 25,
    allocatedPercentage: 25,
    allocatedAmount: 0,
    spentAmount: 0,
    remainingAmount: 0,
    note: 'ค่ายพุทธบุตร, อบรมคุณธรรมประจำโรงเรียน, อยู่ค่ายพักแรมลูกเสือ',
    description: 'ค่ายพุทธบุตร, อบรมคุณธรรมประจำโรงเรียน, อยู่ค่ายพักแรมลูกเสือ',
  },
  {
    id: 3,
    schoolId: 1,
    fiscalYearId: 1,
    activityName: '3. กิจกรรมทัศนศึกษาตามแหล่งเรียนรู้',
    percentage: 25,
    allocatedPercentage: 25,
    allocatedAmount: 0,
    spentAmount: 0,
    remainingAmount: 0,
    note: 'นำนักเรียนศึกษาดูงานแหล่งเรียนรู้นอกสถานที่ พิพิธภัณฑ์ แหล่งวัฒนธรรม',
    description: 'นำนักเรียนศึกษาดูงานแหล่งเรียนรู้นอกสถานที่ พิพิธภัณฑ์ แหล่งวัฒนธรรม',
  },
  {
    id: 4,
    schoolId: 1,
    fiscalYearId: 1,
    activityName: '4. กิจกรรมการจัดการเรียนรู้ ICT และเทคโนโลยีดิจิทัล',
    percentage: 20,
    allocatedPercentage: 20,
    allocatedAmount: 0,
    spentAmount: 0,
    remainingAmount: 0,
    note: 'ฝึกทักษะ Coding, วิทยาการคำนวณ, ใช้สื่อดิจิทัลเพื่อการเรียนรู้',
    description: 'ฝึกทักษะ Coding, วิทยาการคำนวณ, ใช้สื่อดิจิทัลเพื่อการเรียนรู้',
  },
];

/**
 * ยุทธศาสตร์การพัฒนาการศึกษาขั้นพื้นฐาน (สพฐ.)
 */
export const initialStrategies: Strategy[] = [
  {
    id: 1,
    schoolId: 1,
    fiscalYearId: 1,
    code: 'ยศ.1',
    strategyCode: 'ยศ.1',
    name: 'ยุทธศาสตร์ที่ 1: จัดการศึกษาเพื่อความมั่นคงของสังคมและประเทศชาติ',
    description: 'ส่งเสริมคุณธรรม จริยธรรม ความเป็นพลเมือง และศาสตร์พระราชา',
    sortOrder: 1,
  },
  {
    id: 2,
    schoolId: 1,
    fiscalYearId: 1,
    code: 'ยศ.2',
    strategyCode: 'ยศ.2',
    name: 'ยุทธศาสตร์ที่ 2: พัฒนาคุณภาพผู้เรียนและส่งเสริมการจัดการศึกษาเพื่อสร้างขีดความสามารถในการแข่งขัน',
    description: 'ยกระดับผลสัมฤทธิ์ ทักษะในศตวรรษที่ 21 วิทยาศาสตร์ ภาษา และ Coding',
    sortOrder: 2,
  },
  {
    id: 3,
    schoolId: 1,
    fiscalYearId: 1,
    code: 'ยศ.3',
    strategyCode: 'ยศ.3',
    name: 'ยุทธศาสตร์ที่ 3: พัฒนาและเสริมสร้างศักยภาพทรัพยากรมนุษย์ (ครูและบุคลากร)',
    description: 'พัฒนาสมรรถนะครูสู่ความเป็นมืออาชีพด้านการจัดการเรียนรู้เชิงรุก (Active Learning)',
    sortOrder: 3,
  },
  {
    id: 4,
    schoolId: 1,
    fiscalYearId: 1,
    code: 'ยศ.4',
    strategyCode: 'ยศ.4',
    name: 'ยุทธศาสตร์ที่ 4: สร้างโอกาสและความเสมอภาคทางการศึกษาเพื่อลดความเหลื่อมล้ำ',
    description: 'ดูแลช่วยเหลือนักเรียนยากจนพิเศษ ด้อยโอกาส และผู้เรียนที่มีความต้องการจำเป็นพิเศษ',
    sortOrder: 4,
  },
  {
    id: 5,
    schoolId: 1,
    fiscalYearId: 1,
    code: 'ยศ.5',
    strategyCode: 'ยศ.5',
    name: 'ยุทธศาสตร์ที่ 5: พัฒนาประสิทธิภาพระบบการบริหารจัดการสถานศึกษา',
    description: 'บริหารจัดการตามหลักธรรมาภิบาล นำเทคโนโลยีดิจิทัลมาเพิ่มประสิทธิภาพการทำงาน',
    sortOrder: 5,
  },
];

export const initialGoals: Goal[] = [];
export const initialIndicators: Indicator[] = [];

/**
 * โครงการเริ่มต้น: สะอาดหมดจด (Clean Database = 0 โครงการตัวอย่าง)
 * พร้อมให้ครูและโรงเรียนสร้างโครงการจริง
 */
export const initialProjects: Project[] = [];

/**
 * รายการเบิกจ่ายงบประมาณเริ่มต้น: สะอาดหมดจด (Clean Database = 0 รายการ)
 */
export const initialTransactions: BudgetTransaction[] = [];

/**
 * ผู้ใช้งานเริ่มต้นของระบบ:
 * 1. Super Admin: จัดการระบบส่วนกลาง
 * 2. School Admin: เข้าใช้งานด้วยรหัส SMIS 8 หลัก (รหัสผ่านเริ่มต้น 123456 และต้องเปลี่ยนรหัสผ่านในครั้งแรก)
 * 3. ครู: จะใช้เลขประจำตัวประชาชน 13 หลัก เป็น username เมื่อโรงเรียนเพิ่มครูเข้าระบบ
 */
export const initialUsers: User[] = [
  {
    id: 1,
    username: 'superadmin',
    fullName: 'ผู้ดูแลระบบส่วนกลาง (Super Admin)',
    email: 'superadmin@obec.go.th',
    role: 'superadmin',
    position: 'ผู้ดูแลระบบส่วนกลาง',
    phone: '02-288-5555',
    schoolId: 0,
    isActive: true,
    password: 'admin',
    mustChangePassword: false,
  },
  {
    id: 2,
    username: '10400100', // รหัส SMIS 8 หลัก
    fullName: 'ผู้ดูแลระบบโรงเรียน (Admin)',
    email: 'admin_10400100@obec.mail.go.th',
    role: 'admin',
    position: 'หัวหน้างานแผนงานและงบประมาณ',
    department: 'ฝ่ายบริหารงานงบประมาณ',
    phone: '',
    schoolId: 1,
    isActive: true,
    password: '123456',
    mustChangePassword: true, // บังคับเปลี่ยนรหัสผ่านครั้งแรก
  },
];

// Compatibility aliases
export const initialSchoolData = initialSchool;
export const initialStudentsData = initialStudents;
export const initialRevenuesData = initialRevenueItems;
export const initialProjectsData = initialProjects;
