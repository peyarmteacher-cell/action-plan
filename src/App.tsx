import React, { useState } from 'react';
import {
  initialSchoolData,
  initialFiscalYears,
  initialUsers,
  initialStudentsData,
  initialRevenuesData,
  initialBudgetAllocations,
  initialLearnerActivities,
  initialProjectsData,
  initialTransactions,
  initialStrategies,
} from './data/initialData';
import {
  School,
  FiscalYear,
  User,
  StudentLevel,
  RevenueItem,
  BudgetAllocation,
  LearnerActivity,
  Project,
  BudgetTransaction,
  Strategy,
} from './types';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { SchoolInfoView } from './components/SchoolInfoView';
import { StudentDataView } from './components/StudentDataView';
import { RevenueView } from './components/RevenueView';
import { BudgetAllocationView } from './components/BudgetAllocationView';
import { LearnerActivitiesView } from './components/LearnerActivitiesView';
import { AiProjectWriterView } from './components/AiProjectWriterView';
import { ProjectsView } from './components/ProjectsView';
import { ProjectExpensesView } from './components/ProjectExpensesView';
import { DisbursementsView } from './components/DisbursementsView';
import { ActionPlanView } from './components/ActionPlanView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { UsersView } from './components/UsersView';
import { SuperAdminView } from './components/SuperAdminView';
import { PhpPackageModal } from './components/PhpPackageModal';
import { Lock, LogIn, Building2 } from 'lucide-react';

export default function App() {
  // App state
  const [school, setSchool] = useState<School>(() => {
    try {
      const saved = localStorage.getItem('active_school');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialSchoolData;
  });
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>(initialFiscalYears);
  const [activeFiscalYear, setActiveFiscalYear] = useState<FiscalYear>(
    initialFiscalYears.find((fy) => fy.isActive) || initialFiscalYears[0]
  );
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[0]); // default admin
  const [students, setStudents] = useState<StudentLevel[]>(initialStudentsData);
  const [revenues, setRevenues] = useState<RevenueItem[]>(initialRevenuesData);
  const [allocations, setAllocations] = useState<BudgetAllocation[]>(initialBudgetAllocations);
  const [activities, setActivities] = useState<LearnerActivity[]>(initialLearnerActivities);
  const [projects, setProjects] = useState<Project[]>(initialProjectsData);
  const [transactions, setTransactions] = useState<BudgetTransaction[]>(initialTransactions);
  const [strategies, setStrategies] = useState<Strategy[]>(initialStrategies);

  // Navigation & UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPhpModalOpen, setIsPhpModalOpen] = useState(false);
  const [selectedProjectIdForExpenses, setSelectedProjectIdForExpenses] = useState<number | undefined>(undefined);

  // Auth screen state (Login First enforced)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginUsername, setLoginUsername] = useState('10400100');
  const [loginPassword, setLoginPassword] = useState('123456');
  const [loginError, setLoginError] = useState('');

  // First Login Password Change state
  const [pendingPasswordChangeUser, setPendingPasswordChangeUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');

  // Total student count
  const totalStudents = students.reduce((sum, s) => sum + s.totalCount, 0);

  // Total revenue
  const totalRevenue = revenues.reduce((sum, r) => sum + r.calculatedAmount, 0);

  // Count pending projects
  const pendingProjectsCount = projects.filter((p) => !p.approvedBy).length;

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = loginUsername.trim();
    const cleanInputDigits = cleanUsername.replace(/\D/g, '');

    const found = users.find((u) => {
      if (u.username.toLowerCase() === cleanUsername.toLowerCase()) return true;
      if (u.citizenId && u.citizenId.replace(/\D/g, '') === cleanInputDigits) return true;
      if (cleanUsername === school.smisCode && u.role === 'admin') return true;
      return false;
    });

    if (!found) {
      setLoginError('ไม่พบชื่อผู้ใช้งานในระบบ (กรุณาตรวจสอบรหัส SMIS 8 หลัก, เลข ปชช. 13 หลัก หรือ username)');
      return;
    }

    if (!found.isActive) {
      setLoginError('บัญชีผู้ใช้นี้ถูกระงับการใช้งานชั่วคราว กรุณาติดต่อผู้ดูแลระบบ');
      return;
    }

    // Check school active status
    if (found.role !== 'superadmin' && school.isActive === false) {
      setLoginError('สถานศึกษานี้ถูกปิดการใช้งานชั่วคราว กรุณาติดต่อ Super Admin ส่วนกลาง');
      return;
    }

    // Password verification
    const isPasswordValid =
      loginPassword === found.password ||
      (loginPassword === '123456' && (found.password === '123456' || found.mustChangePassword)) ||
      (found.username === 'superadmin' && (loginPassword === 'admin' || loginPassword === '123456'));

    if (!isPasswordValid) {
      setLoginError('รหัสผ่านไม่ถูกต้อง');
      return;
    }

    // Check first-time login password change requirement
    if (found.mustChangePassword) {
      setPendingPasswordChangeUser(found);
      setNewPassword('');
      setConfirmPassword('');
      setPasswordChangeError('');
      setLoginError('');
      return;
    }

    setCurrentUser(found);
    setIsLoggedIn(true);
    setLoginError('');
    if (found.role === 'superadmin') {
      setActiveTab('super_admin');
    } else {
      setActiveTab('dashboard');
    }
  };

  // Handle First-Time Login Password Change submission
  const handleFirstPasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingPasswordChangeUser) return;

    if (newPassword.length < 6) {
      setPasswordChangeError('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    if (newPassword === '123456') {
      setPasswordChangeError('กรุณากำหนดรหัสผ่านใหม่ที่ไม่ใช่รหัสผ่านเริ่มต้น (123456)');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordChangeError('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    const updatedUser: User = {
      ...pendingPasswordChangeUser,
      password: newPassword,
      mustChangePassword: false,
    };

    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    setCurrentUser(updatedUser);
    setPendingPasswordChangeUser(null);
    setIsLoggedIn(true);
    if (updatedUser.role === 'superadmin') {
      setActiveTab('super_admin');
    } else {
      setActiveTab('dashboard');
    }
    setPasswordChangeError('');
    alert('เปลี่ยนรหัสผ่านสำเร็จ ยินดีต้อนรับเข้าสู่ระบบ!');
  };

  // Handle Logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginPassword('');
    setLoginError('');
  };

  // Handle Update School with persistence & backend sync
  const handleUpdateSchool = (updated: School) => {
    setSchool(updated);
    try {
      localStorage.setItem('active_school', JSON.stringify(updated));
    } catch (e) {}
    fetch(`/api/super-admin/schools/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch(() => {});
  };

  // Sync revenue amounts when students change
  const handleUpdateStudents = (updatedList: StudentLevel[]) => {
    setStudents(updatedList);
    const newTotal = updatedList.reduce((sum, s) => sum + s.totalCount, 0);

    // Auto-sync eligible count on head-count dependent revenue items
    setRevenues((prev) =>
      prev.map((r) => {
        if (!r.isCustomRate && (r.itemName.includes('นักเรียน') || r.id <= 6 || r.id === 8)) {
          return {
            ...r,
            eligibleCount: newTotal,
            calculatedAmount: Math.round(r.ratePerHead * newTotal),
          };
        }
        return r;
      })
    );
  };

  // Handle preset rate application
  const handleApplyPresetRates = () => {
    setRevenues((prev) =>
      prev.map((r) => {
        if (r.itemName.includes('เงินอุดหนุนรายหัวนักเรียน')) {
          return { ...r, ratePerHead: 2000, calculatedAmount: 2000 * r.eligibleCount };
        }
        if (r.itemName.includes('หนังสือเรียน')) {
          return { ...r, ratePerHead: 650, calculatedAmount: 650 * r.eligibleCount };
        }
        if (r.itemName.includes('เครื่องแบบ')) {
          return { ...r, ratePerHead: 400, calculatedAmount: 400 * r.eligibleCount };
        }
        if (r.itemName.includes('อุปกรณ์การเรียน')) {
          return { ...r, ratePerHead: 220, calculatedAmount: 220 * r.eligibleCount };
        }
        if (r.itemName.includes('กิจกรรมพัฒนาผู้เรียน')) {
          return { ...r, ratePerHead: 500, calculatedAmount: 500 * r.eligibleCount };
        }
        return r;
      })
    );
  };

  // Handle adding a new fiscal year
  const handleAddFiscalYear = (yearNum: number) => {
    const newId = fiscalYears.length + 1;
    const newFy: FiscalYear = {
      id: newId,
      schoolId: 1,
      year: yearNum,
      startDate: `${yearNum - 543 - 1}-10-01`,
      endDate: `${yearNum - 543}-09-30`,
      isActive: true,
      teacherCount: 15,
    };
    setFiscalYears((prev) => [...prev.map((y) => ({ ...y, isActive: false })), newFy]);
    setActiveFiscalYear(newFy);
  };

  // Handle restoring data from backup JSON
  const handleRestoreData = (backup: any) => {
    if (backup.school) setSchool(backup.school);
    if (backup.activeFiscalYear) setActiveFiscalYear(backup.activeFiscalYear);
    if (backup.students) setStudents(backup.students);
    if (backup.revenues) setRevenues(backup.revenues);
    if (backup.allocations) setAllocations(backup.allocations);
    if (backup.projects) setProjects(backup.projects);
    if (backup.transactions) setTransactions(backup.transactions);
  };

  // Switch to Project Expenses tab for specific project
  const handleOpenExpensesForProject = (project: Project) => {
    setSelectedProjectIdForExpenses(project.id);
    setActiveTab('expenses');
  };

  // Login Screen if logged out
  if (!isLoggedIn) {
    // If user needs to perform First-Time Password Change
    if (pendingPasswordChangeUser) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-tr from-amber-600 via-amber-700 to-amber-900 p-6 text-center text-white">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-white font-black text-2xl shadow-lg mb-2">
                <Lock className="h-7 w-7 text-amber-200" />
              </div>
              <h1 className="text-lg font-bold tracking-tight">
                บังคับเปลี่ยนรหัสผ่านสำหรับการเข้าใช้งานครั้งแรก
              </h1>
              <p className="text-xs text-amber-100 mt-1">
                First-Time Login Security Requirement
              </p>
            </div>

            <form onSubmit={handleFirstPasswordChangeSubmit} className="p-6 sm:p-8 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-950">
                  <span>ผู้ใช้งาน:</span>
                  <span>{pendingPasswordChangeUser.fullName}</span>
                </div>
                <div className="text-amber-800 text-[11px]">
                  ชื่อผู้ใช้: <span className="font-mono font-semibold">{pendingPasswordChangeUser.username}</span> | บทบาท: {pendingPasswordChangeUser.role}
                </div>
                <p className="text-[11px] text-amber-800 pt-1 border-t border-amber-200/60 mt-1">
                  เพื่อความปลอดภัย บัญชีที่ได้รับรหัสผ่านเริ่มต้น (123456) จำเป็นต้องตั้งรหัสผ่านใหม่ส่วนตัวก่อนเข้าใช้งานระบบ
                </p>
              </div>

              {passwordChangeError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                  {passwordChangeError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร) <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="กำหนดรหัสผ่านใหม่ (ห้ามใช้ 123456)"
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ยืนยันรหัสผ่านใหม่อีกครั้ง <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง"
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-amber-600 hover:bg-amber-700 p-2.5 text-sm font-bold text-white shadow transition-colors"
              >
                <Lock className="h-4 w-4" />
                <span>บันทึกรหัสผ่านใหม่และเข้าสู่ระบบ</span>
              </button>

              <button
                type="button"
                onClick={() => setPendingPasswordChangeUser(null)}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 py-1"
              >
                ยกเลิกและกลับไปหน้าเข้าสู่ระบบ
              </button>
            </form>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
          <div className="bg-gradient-to-tr from-blue-950 via-blue-900 to-indigo-950 p-8 text-center text-white">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 font-black text-2xl shadow-lg mb-3">
              สพ
            </div>
            <h1 className="text-lg font-bold tracking-tight">
              ระบบบริหารโครงการและงบประมาณโรงเรียน
            </h1>
            <p className="text-xs text-blue-200 mt-1">
              สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน (สพฐ.)
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="p-6 sm:p-8 space-y-4">
            <div className="text-xs text-slate-500 text-center pb-1">
              เข้าสู่ระบบเพื่อจัดการแผนปฏิบัติการและงบประมาณ
            </div>

            {loginError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                {loginError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อผู้ใช้งาน (Username / รหัส SMIS / เลข ปชช. 13 หลัก)
              </label>
              <input
                id="login-username-input"
                type="text"
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="superadmin / รหัส SMIS / เลขบัตร ปชช. 13 หลัก"
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                * ครูเข้าสู่ระบบด้วยเลขประจำตัวประชาชน 13 หลัก
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รหัสผ่าน (Password)
              </label>
              <input
                id="login-password-input"
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••"
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-700 hover:bg-blue-800 p-2.5 text-sm font-bold text-white shadow transition-colors"
            >
              <LogIn className="h-4 w-4" />
              <span>เข้าสู่ระบบ</span>
            </button>

            {/* Role Guide Shortcuts */}
            <div className="pt-4 border-t border-slate-100 text-center space-y-2">
              <div className="text-[11px] font-semibold text-slate-500">บัญชีสำหรับเข้าใช้งาน:</div>
              <div className="grid grid-cols-2 gap-2 text-left">
                <button
                  type="button"
                  onClick={() => {
                    setLoginUsername('10400100');
                    setLoginPassword('123456');
                  }}
                  className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-left transition-colors"
                >
                  <div className="text-xs font-bold text-blue-900">Admin โรงเรียน (SMIS)</div>
                  <div className="text-[10px] text-blue-700 font-mono">10400100 / 123456</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginUsername('superadmin');
                    setLoginPassword('admin');
                  }}
                  className="p-2 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 text-left transition-colors"
                >
                  <div className="text-xs font-bold text-purple-900">Super Admin (สพฐ.)</div>
                  <div className="text-[10px] text-purple-700 font-mono">superadmin / admin</div>
                </button>
              </div>

              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 text-left">
                <span className="font-bold text-slate-700">คำแนะนำ:</span> สำหรับโรงเรียนหรือคุณครูที่เพิ่มเข้ามาใหม่ รหัสผ่านเริ่มต้นคือ <span className="font-mono font-bold text-blue-700">123456</span> และระบบจะนำท่านสู่หน้าบังคับเปลี่ยนรหัสผ่านก่อนเข้าใช้งานครั้งแรกทันที
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-sans text-slate-900">
      {/* Top Header */}
      <Header
        school={school}
        activeFiscalYear={activeFiscalYear}
        currentUser={currentUser}
        onSwitchUser={(user) => setCurrentUser(user)}
        availableUsers={users}
        onOpenPhpModal={() => setIsPhpModalOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onLogout={handleLogout}
        onNavigateToSuperAdmin={() => setActiveTab('super_admin')}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onOpenPhpModal={() => setIsPhpModalOpen(true)}
          onLogout={handleLogout}
          currentUser={currentUser}
          pendingCount={pendingProjectsCount}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {school.isActive === false && activeTab !== 'super_admin' && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-900 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 font-bold shrink-0">
                    !
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">สถานศึกษาถูกระงับการใช้งานชั่วคราว (Inactive)</h4>
                    <p className="text-xs text-rose-600">
                      Super Admin ได้ระงับการใช้งานโรงเรียนนี้ เพื่อความปลอดภัยข้อมูลจึงถูกล็อกการบันทึก
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('super_admin')}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shrink-0"
                >
                  เปิดหน้า Super Admin เพื่อจัดการ
                </button>
              </div>
            )}

            {activeTab === 'dashboard' && (
              <DashboardView
                school={school}
                activeFiscalYear={activeFiscalYear}
                students={students}
                revenues={revenues}
                allocations={allocations}
                projects={projects}
                transactions={transactions}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'school' && (
              <SchoolInfoView
                school={school}
                activeFiscalYear={activeFiscalYear}
                onUpdateSchool={handleUpdateSchool}
              />
            )}

            {activeTab === 'students' && (
              <StudentDataView
                students={students}
                activeFiscalYear={activeFiscalYear}
                onUpdateStudents={handleUpdateStudents}
              />
            )}

            {activeTab === 'revenue' && (
              <RevenueView
                revenues={revenues}
                activeFiscalYear={activeFiscalYear}
                totalStudents={totalStudents}
                onUpdateRevenues={(updated) => setRevenues(updated)}
              />
            )}

            {activeTab === 'budget' && (
              <BudgetAllocationView
                allocations={allocations}
                activeFiscalYear={activeFiscalYear}
                totalRevenue={totalRevenue}
                onUpdateAllocations={(updated) => setAllocations(updated)}
              />
            )}

            {activeTab === 'learner_activities' && (
              <LearnerActivitiesView
                activities={activities}
                activeFiscalYear={activeFiscalYear}
                revenues={revenues}
                onUpdateActivities={(updated) => setActivities(updated)}
              />
            )}

            {activeTab === 'ai_project_writer' && (
              <AiProjectWriterView
                school={school}
                fiscalYear={activeFiscalYear}
                strategies={strategies}
                currentUser={currentUser}
                onSaveToProjects={(newProject) => {
                  setProjects((prev) => [newProject, ...prev]);
                }}
                onNavigateToProjects={() => setActiveTab('projects')}
              />
            )}

            {activeTab === 'projects' && (
              <ProjectsView
                projects={projects}
                currentUser={currentUser}
                school={school}
                departments={allocations}
                activeFiscalYear={activeFiscalYear}
                onUpdateProjects={(updated) => setProjects(updated)}
                onOpenExpensesForProject={handleOpenExpensesForProject}
                onNavigateToAiWriter={() => setActiveTab('ai_project_writer')}
              />
            )}

            {activeTab === 'expenses' && (
              <ProjectExpensesView
                projects={projects}
                selectedProjectId={selectedProjectIdForExpenses}
                onUpdateProjects={(updated) => setProjects(updated)}
                onBackToProjects={() => setActiveTab('projects')}
              />
            )}

            {activeTab === 'disbursements' && (
              <DisbursementsView
                transactions={transactions}
                projects={projects}
                currentUser={currentUser}
                activeFiscalYear={activeFiscalYear}
                onUpdateTransactions={(updatedTrans, updatedProjects) => {
                  setTransactions(updatedTrans);
                  setProjects(updatedProjects);
                }}
              />
            )}

            {activeTab === 'action_plan' && (
              <ActionPlanView
                projects={projects}
                school={school}
                activeFiscalYear={activeFiscalYear}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView
                school={school}
                activeFiscalYear={activeFiscalYear}
                students={students}
                revenues={revenues}
                allocations={allocations}
                activities={activities}
                projects={projects}
                transactions={transactions}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                school={school}
                fiscalYears={fiscalYears}
                activeFiscalYear={activeFiscalYear}
                onSelectFiscalYear={(fy) => setActiveFiscalYear(fy)}
                onAddFiscalYear={handleAddFiscalYear}
                students={students}
                revenues={revenues}
                allocations={allocations}
                projects={projects}
                transactions={transactions}
                onRestoreData={handleRestoreData}
                onApplyPresetRates={handleApplyPresetRates}
              />
            )}

            {activeTab === 'users' && (
              <UsersView
                users={users}
                currentUser={currentUser}
                onUpdateUsers={(updated) => setUsers(updated)}
              />
            )}

            {activeTab === 'super_admin' && (
              <SuperAdminView
                currentSchool={school}
                onSelectSchool={(selected) => {
                  setSchool(selected);
                  try {
                    localStorage.setItem('active_school', JSON.stringify(selected));
                  } catch (e) {}
                }}
              />
            )}
          </div>
        </main>
      </div>

      {/* cPanel / PHP Installation Package Modal */}
      <PhpPackageModal
        isOpen={isPhpModalOpen}
        onClose={() => setIsPhpModalOpen(false)}
      />
    </div>
  );
}
