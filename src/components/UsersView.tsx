import React, { useState } from 'react';
import { User } from '../types';
import { ShieldCheck, UserPlus, Edit, Trash2, Check, X, KeyRound, UserCheck, AlertCircle, RefreshCw } from 'lucide-react';

interface UsersViewProps {
  users: User[];
  currentUser: User;
  onUpdateUsers: (updated: User[]) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  currentUser,
  onUpdateUsers,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resetSuccessId, setResetSuccessId] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: '',
    citizenId: '',
    fullName: '',
    email: '',
    role: 'teacher' as User['role'],
    department: 'ฝ่ายบริหารงานวิชาการ',
    position: 'ครูผู้รับผิดชอบโครงการ',
    password: '',
    mustChangePassword: true,
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setValidationError(null);
    setFormData({
      username: '',
      citizenId: '',
      fullName: '',
      email: '',
      role: 'teacher',
      department: 'ฝ่ายบริหารงานวิชาการ',
      position: 'ครูผู้รับผิดชอบโครงการ',
      password: '123456',
      mustChangePassword: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setValidationError(null);
    setFormData({
      username: u.username,
      citizenId: u.citizenId || (u.role === 'teacher' ? u.username : ''),
      fullName: u.fullName,
      email: u.email || '',
      role: u.role,
      department: u.department || 'ฝ่ายบริหารงานวิชาการ',
      position: u.position || '',
      password: '',
      mustChangePassword: !!u.mustChangePassword,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (id === currentUser.id) {
      alert('ไม่สามารถลบบัญชีผู้ใช้งานที่กำลังเข้าสู่ระบบอยู่ได้');
      return;
    }
    if (confirm('ต้องการลบผู้ใช้งานนี้ออกจากระบบใช่หรือไม่?')) {
      onUpdateUsers(users.filter((u) => u.id !== id));
    }
  };

  const handleResetPassword = (u: User) => {
    if (confirm(`ต้องการรีเซ็ตรหัสผ่านของ "${u.fullName}" เป็น 123456 และบังคับเปลี่ยนรหัสผ่านในครั้งถัดไปใช่หรือไม่?`)) {
      const updated = users.map((item) =>
        item.id === u.id
          ? {
              ...item,
              password: '123456',
              mustChangePassword: true,
            }
          : item
      );
      onUpdateUsers(updated);
      setResetSuccessId(u.id);
      setTimeout(() => setResetSuccessId(null), 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedUsername = formData.username.trim();

    // Validation: If teacher, username must be 13-digit Thai Citizen ID
    if (formData.role === 'teacher') {
      const citizenRegex = /^\d{13}$/;
      if (!citizenRegex.test(trimmedUsername)) {
        setValidationError('สำหรับคุณครู ชื่อผู้ใช้ (Username) ต้องเป็นหมายเลขประจำตัวประชาชน 13 หลัก (ตัวเลขล้วน 13 ตัว) เพื่อป้องกันข้อมูลชนกันในระบบ Multi-School');
        return;
      }
    }

    // Check duplicate username
    const isDuplicate = users.some(
      (u) => u.username.toLowerCase() === trimmedUsername.toLowerCase() && (!editingUser || u.id !== editingUser.id)
    );
    if (isDuplicate) {
      setValidationError(`ชื่อผู้ใช้ (Username) "${trimmedUsername}" มีอยู่ในระบบแล้ว กรุณาใช้หมายเลขอื่น`);
      return;
    }

    if (editingUser) {
      const updated = users.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              username: trimmedUsername,
              citizenId: formData.role === 'teacher' ? trimmedUsername : formData.citizenId,
              fullName: formData.fullName.trim(),
              email: formData.email.trim(),
              role: formData.role,
              department: formData.department,
              position: formData.position.trim(),
              password: formData.password.trim() ? formData.password.trim() : u.password,
              mustChangePassword: formData.password.trim() ? true : u.mustChangePassword,
            }
          : u
      );
      onUpdateUsers(updated);
    } else {
      const newId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
      const newUser: User = {
        id: newId,
        schoolId: currentUser.schoolId || 1,
        username: trimmedUsername,
        citizenId: formData.role === 'teacher' ? trimmedUsername : formData.citizenId,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        role: formData.role,
        department: formData.department,
        position: formData.position.trim(),
        password: formData.password.trim() || '123456',
        mustChangePassword: true, // First login forces password change
        isActive: true,
      };
      onUpdateUsers([...users, newUser]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-blue-700" />
            <span>จัดการข้อมูลบุคลากรและระดับสิทธิ์ (Personnel & RBAC)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            กำหนดระดับสิทธิ์: Admin โรงเรียน, ผอ.โรงเรียน, ครูผู้รับผิดชอบโครงการ (คุณครูใช้เลขบัตร ปชช. 13 หลัก)
          </p>
        </div>

        <button
          id="btn-add-user"
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          <span>เพิ่มครู / ผู้ใช้งานใหม่</span>
        </button>
      </div>

      {/* Role explanation boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4">
          <div className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-700"></span>
            <span>Admin โรงเรียน (School Administrator)</span>
          </div>
          <p className="text-[11px] text-blue-800 mt-1">
            ใช้รหัส SMIS 8 หลัก จัดการข้อมูลโรงเรียน บุคลากร นักเรียน งบประมาณ อนุมัติ/ส่งกลับโครงการ และเปิด-ปิดรับโครงการ
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
          <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-600"></span>
            <span>ผู้อำนวยการโรงเรียน (Director)</span>
          </div>
          <p className="text-[11px] text-amber-900 mt-1">
            ดูภาพรวม Dashboard อนุมัติโครงการ ให้ข้อคิดเห็น ตรวจสอบการเบิกจ่าย และลงนามเอกสารราชการ
          </p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
          <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-600"></span>
            <span>ครูผู้รับผิดชอบโครงการ (Teacher)</span>
          </div>
          <p className="text-[11px] text-emerald-900 mt-1">
            ใช้เลขบัตรประชาชน 13 หลัก เห็นเฉพาะโครงการของตนเอง เขียนโครงการด้วย AI เสนอขออนุมัติ และติดตามสถานะ
          </p>
        </div>
      </div>

      {/* Reset password toast notification */}
      {resetSuccessId && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>รีเซ็ตรหัสผ่านเป็น 123456 สำเร็จแล้ว (ระบบจะบังคับให้เปลี่ยนรหัสผ่านใหม่เมื่อเข้าสู่ระบบ)</span>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                <th className="py-3 px-4 w-12 text-center">ที่</th>
                <th className="py-3 px-4 min-w-[170px]">Username (เลข ปชช. / SMIS)</th>
                <th className="py-3 px-4 min-w-[200px]">ชื่อ - นามสกุล</th>
                <th className="py-3 px-4 min-w-[150px]">ฝ่ายงาน / กลุ่มสาระ</th>
                <th className="py-3 px-4 w-36 text-center">ระดับสิทธิ์ (Role)</th>
                <th className="py-3 px-4 w-32 text-center">รหัสผ่านแรกเข้า</th>
                <th className="py-3 px-4 w-28 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    ยังไม่มีข้อมูลบุคลากร กรุณากดปุ่ม "+ เพิ่มครู / ผู้ใช้งานใหม่" ด้านบน
                  </td>
                </tr>
              ) : (
                users.map((u, idx) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">
                      <div>{u.username}</div>
                      {u.role === 'teacher' && (
                        <span className="text-[10px] text-slate-400 font-normal">เลขประจำตัวประชาชน 13 หลัก</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{u.fullName}</div>
                      <div className="text-[11px] text-slate-500">{u.position || 'บุคลากรทางการศึกษา'}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{u.department || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          u.role === 'admin'
                            ? 'bg-blue-100 text-blue-800'
                            : u.role === 'director'
                            ? 'bg-amber-100 text-amber-800'
                            : u.role === 'superadmin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {u.role === 'admin'
                          ? 'Admin โรงเรียน'
                          : u.role === 'director'
                          ? 'ผอ.โรงเรียน'
                          : u.role === 'superadmin'
                          ? 'Super Admin'
                          : 'ครูผู้รับผิดชอบ'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {u.mustChangePassword ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                          <span>รอเปลี่ยนรหัสผ่าน</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                          <Check className="h-3 w-3" />
                          <span>เปลี่ยนแล้ว</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleResetPassword(u)}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                          title="รีเซ็ตรหัสผ่านเป็น 123456"
                        >
                          <KeyRound className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                          title="แก้ไขข้อมูลบุคลากร"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(u.id)}
                          disabled={u.id === currentUser.id}
                          className={`p-1.5 rounded transition-colors ${
                            u.id === currentUser.id
                              ? 'text-slate-300 cursor-not-allowed'
                              : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                          }`}
                          title="ลบผู้ใช้"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add/Edit User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-700" />
                <span>{editingUser ? 'แก้ไขข้อมูลบุคลากร' : 'เพิ่มครู / ผู้ใช้งานใหม่'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
              {validationError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{validationError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ระดับสิทธิ์การใช้งาน (User Role) <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-slate-800"
                >
                  <option value="teacher">ครูผู้รับผิดชอบโครงการ (เข้าใช้ด้วยเลขบัตร ปชช. 13 หลัก)</option>
                  <option value="admin">Admin โรงเรียน (บริหารจัดการระบบโรงเรียน)</option>
                  <option value="director">ผู้อำนวยการโรงเรียน (อนุมัติโครงการและงบประมาณ)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {formData.role === 'teacher' ? (
                    <span>
                      Username (หมายเลขประจำตัวประชาชน 13 หลัก) <span className="text-red-500">*</span>
                    </span>
                  ) : (
                    <span>
                      Username สำหรับเข้าสู่ระบบ <span className="text-red-500">*</span>
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  required
                  maxLength={formData.role === 'teacher' ? 13 : 50}
                  placeholder={formData.role === 'teacher' ? 'เช่น 1100400123456 (ตัวเลข 13 หลัก)' : 'เช่น admin_school'}
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2.5 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                {formData.role === 'teacher' && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    * ต้องเป็นเลขบัตรประจำตัวประชาชน 13 หลัก เพื่อป้องกันชื่อบัญชีชนกันในระบบ Multi-School
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อ - นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น นางสาวใจดี มีวินัย"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ตำแหน่ง</label>
                  <input
                    type="text"
                    placeholder="เช่น ครูชำนาญการพิเศษ"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ฝ่ายงาน / กลุ่มสาระ</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="ฝ่ายบริหารงานวิชาการ">ฝ่ายบริหารงานวิชาการ</option>
                    <option value="ฝ่ายบริหารงานงบประมาณ">ฝ่ายบริหารงานงบประมาณ</option>
                    <option value="ฝ่ายบริหารงานบุคคล">ฝ่ายบริหารงานบุคคล</option>
                    <option value="ฝ่ายบริหารงานทั่วไป">ฝ่ายบริหารงานทั่วไป</option>
                    <option value="กลุ่มสาระภาษาไทย">กลุ่มสาระภาษาไทย</option>
                    <option value="กลุ่มสาระคณิตศาสตร์">กลุ่มสาระคณิตศาสตร์</option>
                    <option value="กลุ่มสาระวิทยาศาสตร์และเทคโนโลยี">กลุ่มสาระวิทยาศาสตร์และเทคโนโลยี</option>
                    <option value="กลุ่มสาระภาษาต่างประเทศ">กลุ่มสาระภาษาต่างประเทศ</option>
                    <option value="ระดับปฐมวัย">ระดับปฐมวัย</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">อีเมล</label>
                  <input
                    type="email"
                    placeholder="name@school.ac.th"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {editingUser ? 'รหัสผ่านใหม่ (เว้นว่างไว้ถ้าไม่ต้องการเปลี่ยน)' : 'รหัสผ่านเริ่มต้น (Default Password)'}
                </label>
                <input
                  type="text"
                  placeholder="123456"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
                <p className="text-[11px] text-amber-700 mt-1 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  * รหัสผ่านเริ่มต้นคือ <strong>123456</strong> โดยระบบจะบังคับให้ผู้ใช้งานเปลี่ยนรหัสผ่านใหม่ทันทีก่อนเข้าใช้งานครั้งแรก
                </p>
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
                  บันทึกข้อมูลบุคลากร
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
