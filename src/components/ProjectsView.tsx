import React, { useState } from 'react';
import { Project, User, BudgetAllocation, FiscalYear, School, ApprovalStatus } from '../types';
import {
  FolderGit2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  Edit,
  Trash2,
  Check,
  ShieldCheck,
  X,
  Calendar,
  UserCheck,
  Bot,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  MessageSquare,
  Send,
  Eye,
} from 'lucide-react';

interface ProjectsViewProps {
  projects: Project[];
  currentUser: User;
  school?: School;
  departments: BudgetAllocation[];
  activeFiscalYear: FiscalYear;
  onUpdateProjects: (updated: Project[]) => void;
  onOpenExpensesForProject: (project: Project) => void;
  onNavigateToAiWriter?: () => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  currentUser,
  school,
  departments,
  activeFiscalYear,
  onUpdateProjects,
  onOpenExpensesForProject,
  onNavigateToAiWriter,
}) => {
  const isTeacher = currentUser.role === 'teacher';
  const isSubmissionAllowed = school?.allowProjectSubmission !== false;

  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [approvalFilter, setApprovalFilter] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [viewScope, setViewScope] = useState<'my' | 'all'>(isTeacher ? 'my' : 'all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Review / Approval Modal state
  const [reviewingProject, setReviewingProject] = useState<Project | null>(null);
  const [reviewStatus, setReviewStatus] = useState<ApprovalStatus>('approved');
  const [reviewComment, setReviewComment] = useState('');

  // Form State for new/edit
  const [formData, setFormData] = useState<Partial<Project>>({
    projectCode: '',
    projectName: '',
    semester: 1,
    rationales: '',
    objectives: '',
    quantitativeTarget: '',
    qualitativeTarget: '',
    kpi: '',
    procedures: '',
    duration: `ตลอดปีการศึกษา ${activeFiscalYear.year}`,
    location: school?.name || 'โรงเรียน',
    targetGroup: 'นักเรียนและบุคลากรในโรงเรียน',
    responsiblePerson: currentUser.fullName,
    responsibleId: currentUser.id,
    department: departments[0]?.departmentName || 'ฝ่ายบริหารงานวิชาการ',
    budgetSource: 'เงินอุดหนุนรายหัว (สพฐ.)',
    allocatedBudget: 30000,
    status: 'not_started',
    approvalStatus: isTeacher ? 'pending' : 'approved',
    reviewComment: '',
  });

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    // Teacher Scope Filter: My projects vs All
    if (isTeacher && viewScope === 'my') {
      const isMyProject =
        p.responsibleId === currentUser.id ||
        p.responsiblePerson.trim().toLowerCase() === currentUser.fullName.trim().toLowerCase();
      if (!isMyProject) return false;
    }

    const matchSearch =
      p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.projectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.responsiblePerson.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept = deptFilter === 'all' || p.department === deptFilter;
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchApproval = approvalFilter === 'all' || (p.approvalStatus || 'approved') === approvalFilter;
    const matchSemester = semesterFilter === 'all' || String(p.semester || 1) === semesterFilter;

    return matchSearch && matchDept && matchStatus && matchApproval && matchSemester;
  });

  const myProjectsCount = projects.filter(
    (p) =>
      p.responsibleId === currentUser.id ||
      p.responsiblePerson.trim().toLowerCase() === currentUser.fullName.trim().toLowerCase()
  ).length;

  const handleOpenAddModal = () => {
    if (!isSubmissionAllowed && isTeacher) {
      alert('ขณะนี้ทางโรงเรียนได้ปิดระบบรับการเสนอโครงการใหม่ กรุณาติดต่อ Admin หรือฝ่ายแผนงาน');
      return;
    }

    setEditingProject(null);
    const codeNum = projects.length + 1;
    setFormData({
      projectCode: `P${activeFiscalYear.year.toString().slice(-2)}-${codeNum < 10 ? '0' + codeNum : codeNum}`,
      projectName: '',
      semester: 1,
      rationales: 'เพื่อส่งเสริมและพัฒนาการจัดการศึกษาตามมาตรฐานการศึกษาขั้นพื้นฐาน (สพฐ.)',
      objectives: '1. เพื่อพัฒนาศักยภาพผู้เรียนตามมาตรฐานการศึกษา\n2. เพื่อยกระดับผลสัมฤทธิ์ทางการเรียนและการประเมิน',
      quantitativeTarget: 'นักเรียนไม่น้อยกว่าร้อยละ 85 ได้รับการพัฒนาทักษะและผ่านเกณฑ์ประเมิน',
      qualitativeTarget: 'ผู้เรียนมีคุณลักษณะอันพึงประสงค์และสมรรถนะสำคัญตามหลักสูตรแกนกลาง',
      kpi: 'ร้อยละของนักเรียนที่ผ่านเกณฑ์การประเมินไม่น้อยกว่า 85%',
      procedures: '1. ขั้นเตรียมการและเสนอขออนุมัติโครงการ (Plan)\n2. ขั้นดำเนินกิจกรรมตามแผนงาน (Do)\n3. ขั้นติดตาม ตรวจสอบ และนิเทศภายใน (Check)\n4. ขั้นประเมินผล รายงาน และสรุปผลการดำเนินงาน (Act)',
      duration: `พฤษภาคม ${activeFiscalYear.year} - มีนาคม ${activeFiscalYear.year + 1}`,
      location: school?.name || 'โรงเรียน',
      targetGroup: 'นักเรียนและครูผู้สอนทุกคน',
      responsiblePerson: currentUser.fullName,
      responsibleId: currentUser.id,
      department: departments[0]?.departmentName || 'ฝ่ายบริหารงานวิชาการ',
      budgetSource: 'เงินอุดหนุนรายหัว (สพฐ.)',
      allocatedBudget: 30000,
      status: 'not_started',
      approvalStatus: isTeacher ? 'pending' : 'approved',
      reviewComment: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Project) => {
    setEditingProject(p);
    setFormData({
      ...p,
      semester: p.semester || 1,
    });
    setIsModalOpen(true);
  };

  const handleDeleteProject = (id: number) => {
    if (confirm('ยืนยันการลบโครงการนี้ออกจากแผนปฏิบัติการประจำปี?')) {
      const updated = projects.filter((p) => p.id !== id);
      onUpdateProjects(updated);
    }
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectName || !formData.projectCode) {
      alert('กรุณากรอกรหัสและชื่อโครงการ');
      return;
    }

    if (editingProject) {
      // Update
      const updated = projects.map((p) => {
        if (p.id === editingProject.id) {
          const alloc = Number(formData.allocatedBudget) || 0;
          return {
            ...p,
            ...(formData as Project),
            allocatedBudget: alloc,
            remainingBudget: Math.max(0, alloc - p.spentBudget),
            // If it was in revision and teacher saved it, move back to pending
            approvalStatus:
              p.approvalStatus === 'revision' && isTeacher ? 'pending' : (formData.approvalStatus as ApprovalStatus) || p.approvalStatus,
          };
        }
        return p;
      });
      onUpdateProjects(updated);
    } else {
      // Create new
      const newId = projects.length > 0 ? Math.max(...projects.map((p) => p.id)) + 1 : 1;
      const alloc = Number(formData.allocatedBudget) || 0;
      const newProj: Project = {
        ...(formData as Project),
        id: newId,
        schoolId: school?.id || 1,
        fiscalYearId: activeFiscalYear.id,
        semester: (Number(formData.semester) as 1 | 2) || 1,
        allocatedBudget: alloc,
        spentBudget: 0,
        remainingBudget: alloc,
        status: 'not_started',
        approvalStatus: isTeacher ? 'pending' : 'approved',
        responsiblePerson: currentUser.fullName,
        responsibleId: currentUser.id,
      };
      onUpdateProjects([...projects, newProj]);
    }
    setIsModalOpen(false);
  };

  // Submit for approval (for draft or revision projects)
  const handleSubmitForApproval = (project: Project) => {
    const updated = projects.map((p) =>
      p.id === project.id ? { ...p, approvalStatus: 'pending' as ApprovalStatus } : p
    );
    onUpdateProjects(updated);
    alert(`ส่งเสนอโครงการ "${project.projectName}" เพื่อขออนุมัติเรียบร้อยแล้ว`);
  };

  // Open Review modal for Admin or Director
  const handleOpenReviewModal = (project: Project) => {
    setReviewingProject(project);
    setReviewStatus(project.approvalStatus === 'pending' ? 'approved' : project.approvalStatus);
    setReviewComment(project.reviewComment || '');
  };

  const handleSaveReview = () => {
    if (!reviewingProject) return;

    if (reviewStatus === 'revision' && !reviewComment.trim()) {
      alert('กรณีส่งกลับเพื่อแก้ไข กรุณาระบุข้อคิดเห็นหรือสิ่งที่ต้องปรับปรุงแก้ไข');
      return;
    }

    const updated = projects.map((p) => {
      if (p.id === reviewingProject.id) {
        return {
          ...p,
          approvalStatus: reviewStatus,
          reviewComment: reviewComment.trim(),
          approvedBy: reviewStatus === 'approved' ? currentUser.fullName : undefined,
          approvedDate: reviewStatus === 'approved' ? new Date().toISOString().split('T')[0] : undefined,
          status: reviewStatus === 'approved' && p.status === 'not_started' ? 'in_progress' : p.status,
        };
      }
      return p;
    });

    onUpdateProjects(updated);
    setReviewingProject(null);
  };

  return (
    <div className="space-y-6">
      {/* Submission Closed Warning Banner */}
      {!isSubmissionAllowed && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-900 shadow-xs">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold block text-sm text-amber-950">
              ระบบปิดรับการเสนอโครงการใหม่ชั่วคราว
            </span>
            ผู้ดูแลระบบได้ปิดสวิตช์การรับการเสนอโครงการ คุณครูยังสามารถดูโครงการเดิมและบันทึกค่าใช้จ่ายได้ตามปกติ หากต้องการเสนอโครงการเพิ่มเติม กรุณาประสานงานฝ่ายแผนงาน
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FolderGit2 className="h-6 w-6 text-blue-700" />
            <span>ระบบบริหารโครงการตามแผนปฏิบัติการ (Project Management)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isTeacher
              ? 'จัดการโครงการที่ท่านรับผิดชอบ เสนอขออนุมัติ และบันทึกค่าใช้จ่ายโครงการ'
              : 'บันทึกรายละเอียด วัตถุประสงค์ ตัวชี้วัด กิจกรรม ตรวจสอบและอนุมัติโครงการ'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToAiWriter && (
            <button
              id="btn-nav-ai-writer-shortcut"
              type="button"
              onClick={onNavigateToAiWriter}
              disabled={!isSubmissionAllowed && isTeacher}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-all ${
                !isSubmissionAllowed && isTeacher
                  ? 'bg-slate-400 cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700'
              }`}
              title="เปิดระบบเขียนโครงการด้วย AI ตามแบบฟอร์ม สพฐ."
            >
              <Bot className="h-4 w-4 text-amber-300" />
              <span>ใช้ AI ช่วยเขียนโครงการ</span>
            </button>
          )}

          <button
            id="btn-add-new-project"
            type="button"
            onClick={handleOpenAddModal}
            disabled={!isSubmissionAllowed && isTeacher}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors ${
              !isSubmissionAllowed && isTeacher
                ? 'bg-slate-400 cursor-not-allowed opacity-60'
                : 'bg-blue-700 hover:bg-blue-800'
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>เสนอโครงการใหม่</span>
          </button>
        </div>
      </div>

      {/* Teacher View Scope Tabs */}
      {isTeacher && (
        <div className="flex items-center gap-2 bg-slate-200/70 p-1 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setViewScope('my')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              viewScope === 'my'
                ? 'bg-white text-blue-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>โครงการของฉัน (My Projects)</span>
            <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px]">
              {myProjectsCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setViewScope('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              viewScope === 'all'
                ? 'bg-white text-blue-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>โครงการทั้งหมดในโรงเรียน ({projects.length})</span>
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full md:w-72">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            id="input-search-project"
            type="text"
            placeholder="ค้นหารหัส, ชื่อโครงการ, ผู้รับผิดชอบ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Semester Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span>ภาคเรียน:</span>
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 bg-white py-1.5 px-2 focus:outline-none"
            >
              <option value="all">ทุกภาคเรียน</option>
              <option value="1">ภาคเรียนที่ 1</option>
              <option value="2">ภาคเรียนที่ 2</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="h-3.5 w-3.5" />
            <span>ฝ่าย:</span>
            <select
              id="select-filter-dept"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 bg-white py-1.5 px-2 focus:outline-none"
            >
              <option value="all">ทุกฝ่ายงาน</option>
              {departments.map((d) => (
                <option key={d.id} value={d.departmentName}>
                  {d.departmentName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span>การอนุมัติ:</span>
            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 bg-white py-1.5 px-2 focus:outline-none"
            >
              <option value="all">ทุกสถานะอนุมัติ</option>
              <option value="approved">อนุมัติแล้ว</option>
              <option value="pending">รออนุมัติ</option>
              <option value="revision">ส่งกลับแก้ไข</option>
              <option value="rejected">ไม่อนุมัติ</option>
              <option value="draft">ฉบับร่าง</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                <th className="py-3 px-3 w-20">รหัส</th>
                <th className="py-3 px-3 min-w-[260px]">ชื่อโครงการ / ภาคเรียน</th>
                <th className="py-3 px-3 w-28">ฝ่ายงาน</th>
                <th className="py-3 px-3 w-32">ผู้รับผิดชอบ</th>
                <th className="py-3 px-3 w-28 text-right">งบจัดสรร (บาท)</th>
                <th className="py-3 px-3 w-28 text-right font-semibold text-emerald-700">คงเหลือ (บาท)</th>
                <th className="py-3 px-3 w-32 text-center">สถานะการอนุมัติ</th>
                <th className="py-3 px-3 w-36 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FolderGit2 className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                    <div>ยังไม่มีโครงการในแผนงาน</div>
                    {isSubmissionAllowed && (
                      <p className="text-xs text-slate-500 mt-1">
                        กดปุ่ม "+ เสนอโครงการใหม่" หรือ "ใช้ AI ช่วยเขียนโครงการ" ด้านบนเพื่อเริ่มร่างโครงการ
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => {
                  const isMyOwn =
                    p.responsibleId === currentUser.id ||
                    p.responsiblePerson.trim().toLowerCase() === currentUser.fullName.trim().toLowerCase();
                  const canEdit = !isTeacher || isMyOwn;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-blue-700">{p.projectCode}</td>
                      <td className="py-3 px-3 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{p.projectName}</span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                            ภาค {p.semester || 1}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{p.objectives}</div>

                        {/* Revision Feedback alert for teachers */}
                        {p.approvalStatus === 'revision' && p.reviewComment && (
                          <div className="mt-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-1.5">
                            <MessageSquare className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold">ฝ่ายบริหารส่งกลับแก้ไข:</span> {p.reviewComment}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                          {p.department}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium">
                        <div>{p.responsiblePerson}</div>
                        {isMyOwn && isTeacher && (
                          <span className="text-[10px] text-blue-600 font-semibold">(ของฉัน)</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                        {p.allocatedBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600">
                        {p.remainingBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            p.approvalStatus === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.approvalStatus === 'revision'
                              ? 'bg-amber-100 text-amber-800'
                              : p.approvalStatus === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : p.approvalStatus === 'pending'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {p.approvalStatus === 'approved' ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              <span>อนุมัติแล้ว</span>
                            </>
                          ) : p.approvalStatus === 'revision' ? (
                            <>
                              <RotateCcw className="h-3 w-3" />
                              <span>ส่งกลับแก้ไข</span>
                            </>
                          ) : p.approvalStatus === 'rejected' ? (
                            <>
                              <X className="h-3 w-3" />
                              <span>ไม่อนุมัติ</span>
                            </>
                          ) : p.approvalStatus === 'pending' ? (
                            <>
                              <Clock className="h-3 w-3" />
                              <span>รออนุมัติ</span>
                            </>
                          ) : (
                            <span>ฉบับร่าง</span>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Teacher action: Submit for approval if draft or revision */}
                          {isTeacher && isMyOwn && (p.approvalStatus === 'draft' || p.approvalStatus === 'revision') && (
                            <button
                              type="button"
                              onClick={() => handleSubmitForApproval(p)}
                              className="p-1.5 text-blue-700 hover:bg-blue-50 rounded transition-colors"
                              title="ส่งขออนุมัติโครงการ"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          )}

                          {/* Admin & Director action: Review / Approve */}
                          {!isTeacher && (
                            <button
                              type="button"
                              onClick={() => handleOpenReviewModal(p)}
                              className="p-1.5 text-indigo-700 hover:bg-indigo-50 rounded transition-colors"
                              title="พิจารณาอนุมัติ / ส่งกลับแก้ไข"
                            >
                              <ShieldCheck className="h-4 w-4" />
                            </button>
                          )}

                          {/* Expenses link */}
                          <button
                            type="button"
                            onClick={() => onOpenExpensesForProject(p)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                            title="แจกแจงค่าใช้จ่ายและบันทึกการเบิกจ่าย"
                          >
                            <FileSpreadsheet className="h-4 w-4" />
                          </button>

                          {/* Edit project */}
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(p)}
                              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                              title="แก้ไขโครงการ"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}

                          {/* Delete project */}
                          {canEdit && (!isTeacher || p.approvalStatus !== 'approved') && (
                            <button
                              type="button"
                              onClick={() => handleDeleteProject(p.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="ลบโครงการ"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add/Edit Project */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FolderGit2 className="h-5 w-5 text-blue-700" />
                <span>{editingProject ? 'แก้ไขข้อมูลโครงการ' : 'เสนอโครงการใหม่ตามแผนปฏิบัติการ'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    รหัสโครงการ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.projectCode}
                    onChange={(e) => setFormData({ ...formData, projectCode: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อโครงการ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 font-semibold text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ภาคเรียน</label>
                  <select
                    value={formData.semester || 1}
                    onChange={(e) => setFormData({ ...formData, semester: (Number(e.target.value) as 1 | 2) || 1 })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value={1}>ภาคเรียนที่ 1</option>
                    <option value={2}>ภาคเรียนที่ 2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ฝ่ายงานที่รับผิดชอบ</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.departmentName}>
                        {d.departmentName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">งบประมาณที่จัดสรร (บาท)</label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={formData.allocatedBudget}
                    onChange={(e) => setFormData({ ...formData, allocatedBudget: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ผู้รับผิดชอบโครงการ</label>
                  <input
                    type="text"
                    value={formData.responsiblePerson}
                    onChange={(e) => setFormData({ ...formData, responsiblePerson: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">แหล่งงบประมาณ</label>
                  <input
                    type="text"
                    value={formData.budgetSource}
                    onChange={(e) => setFormData({ ...formData, budgetSource: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">หลักการและเหตุผล</label>
                <textarea
                  rows={3}
                  value={formData.rationales || formData.rationale}
                  onChange={(e) => setFormData({ ...formData, rationales: e.target.value, rationale: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">วัตถุประสงค์</label>
                <textarea
                  rows={2}
                  value={formData.objectives}
                  onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">เป้าหมายเชิงปริมาณ</label>
                  <textarea
                    rows={2}
                    value={formData.quantitativeTarget || formData.quantitativeGoals}
                    onChange={(e) =>
                      setFormData({ ...formData, quantitativeTarget: e.target.value, quantitativeGoals: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">เป้าหมายเชิงคุณภาพ</label>
                  <textarea
                    rows={2}
                    value={formData.qualitativeTarget || formData.qualitativeGoals}
                    onChange={(e) =>
                      setFormData({ ...formData, qualitativeTarget: e.target.value, qualitativeGoals: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-xs font-semibold text-white shadow-sm"
                >
                  {isTeacher ? 'บันทึกและเสนอขออนุมัติ' : 'บันทึกโครงการ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review & Approval Modal (For Admin & Director) */}
      {reviewingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-700" />
                <span>พิจารณาอนุมัติโครงการ</span>
              </h3>
              <button
                type="button"
                onClick={() => setReviewingProject(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900 text-sm">{reviewingProject.projectName}</div>
                <div className="text-xs text-slate-500 mt-1">
                  รหัส: {reviewingProject.projectCode} | ผู้เสนอ: {reviewingProject.responsiblePerson} | งบ: {reviewingProject.allocatedBudget.toLocaleString()} บาท
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">ผลการพิจารณา</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewStatus('approved')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      reviewStatus === 'approved'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800 ring-2 ring-emerald-500'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span>อนุมัติโครงการ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewStatus('revision')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      reviewStatus === 'revision'
                        ? 'bg-amber-50 border-amber-400 text-amber-800 ring-2 ring-amber-500'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <RotateCcw className="h-5 w-5 text-amber-600" />
                    <span>ส่งกลับแก้ไข</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewStatus('rejected')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      reviewStatus === 'rejected'
                        ? 'bg-rose-50 border-rose-400 text-rose-800 ring-2 ring-rose-500'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <X className="h-5 w-5 text-rose-600" />
                    <span>ไม่อนุมัติ</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ข้อคิดเห็น / คำแนะนำจากผู้พิจารณา {reviewStatus === 'revision' && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  rows={3}
                  placeholder={
                    reviewStatus === 'revision'
                      ? 'ระบุสิ่งที่ต้องปรับปรุงแก้ไข เช่น ปรับลดวงเงินหมวดค่าใช้สอย หรือเพิ่มตัวชี้วัด'
                      : 'ระบุข้อคิดเห็นเพิ่มเติม (ถ้ามี)'
                  }
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setReviewingProject(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleSaveReview}
                  className="px-5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-xs font-semibold text-white shadow-sm"
                >
                  บันทึกผลการพิจารณา
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
