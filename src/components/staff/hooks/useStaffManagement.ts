'use client';
import { useState, useEffect, useCallback } from 'react';
import { StaffProfile, AuditLog } from '../StaffShared';
import { apiUrl } from '@/lib/api';

export function useStaffManagement(
    initialStaff: StaffProfile[],
    initialAuditLogs: AuditLog[],
    activeTab: string,
    logActivity: (action: string, targetId: string, targetType: string, description: string, metadata?: any) => Promise<void>
) {
    const [staffProfiles, setStaffProfiles] = useState<StaffProfile[]>(initialStaff || []);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs || []);
    const [staffSearch, setStaffSearch] = useState('');
    const [isEditingStaff, setIsEditingStaff] = useState(false);
    const [editStaffData, setEditStaffData] = useState<StaffProfile | null>(null);
    const [isSavingStaff, setIsSavingStaff] = useState(false);

    const [editingLog, setEditingLog] = useState<AuditLog | null>(null);
    const [isSavingLog, setIsSavingLog] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [students, setStudents] = useState<StaffProfile[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<StaffProfile | null>(null);
    const [isEditingStudent, setIsEditingStudent] = useState(false);
    const [editStudentData, setEditStudentData] = useState<StaffProfile | null>(null);
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    useEffect(() => {
        if (activeTab === 'staff_mgmt' && staffProfiles.length === 0) {
            const fetchStaff = async () => {
                try {
                    const res = await fetch(apiUrl('/api/admin/list-staff'));
                    const data = await res.json();
                    if (res.ok) setStaffProfiles(data.staff || []);
                } catch (err) {
                    console.error('Error fetching staff:', err);
                }
            };
            fetchStaff();
        }
    }, [activeTab, staffProfiles.length]);

    const fetchLogs = useCallback(async () => {
        try {
            const res = await fetch(apiUrl('/api/admin/audit-logs/list?limit=50'));
            const data = await res.json();
            if (res.ok) setAuditLogs(data.logs || []);
        } catch (err: unknown) {
            console.error('Error fetching logs:', err);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'overview' && auditLogs.length === 0) {
            fetchLogs();
        }
    }, [activeTab, auditLogs.length, fetchLogs]);

    useEffect(() => {
        if (searchTerm.length < 2) { setStudents([]); return; }
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(apiUrl(`/api/admin/search-students?q=${encodeURIComponent(searchTerm)}`));
                const data = await res.json();
                if (res.ok && data.students) {
                    const sorted = [...data.students].sort((a: StaffProfile, b: StaffProfile) => (a.nombre || '').localeCompare(b.nombre || ''));
                    setStudents(sorted);
                }
            } catch (err: unknown) { console.error('Search error:', err); }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleSaveProfile = async () => {
        if (!selectedStudent || !editStudentData) return;
        setIsSavingProfile(true);
        try {
            const res = await fetch(apiUrl('/api/admin/update-profile'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editStudentData)
            });
            const data = await res.json();
            if (res.ok) {
                const updated = data.profile;
                setSelectedStudent(updated);
                setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
                setIsEditingStudent(false);

                await logActivity(
                    'STUDENT_PROFILE_EDIT',
                    updated.id,
                    'profile',
                    `Modificado perfil de alumno: ${updated.nombre} ${updated.apellidos}`,
                    { old: selectedStudent, new: updated }
                );
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (err: unknown) {
            const error = err as Error;
            alert(`Error al conectar con el servidor: ${error.message}`);
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleUpdateStaff = async () => {
        if (!editStaffData) return;
        setIsSavingStaff(true);
        try {
            const res = await fetch(apiUrl('/api/admin/update-staff'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: editStaffData.id,
                    email: editStaffData.email,
                    nombre: editStaffData.nombre,
                    apellidos: editStaffData.apellidos,
                    telefono: editStaffData.telefono
                })
            });
            if (res.ok) {
                setStaffProfiles(prev => prev.map(p => p.id === editStaffData.id ? editStaffData : p));
                setIsEditingStaff(false);
                setEditStaffData(null);

                await logActivity(
                    'STAFF_PROFILE_EDIT',
                    editStaffData.id,
                    'staff',
                    `Modificado perfil de staff: ${editStaffData.nombre}`,
                    { data: editStaffData }
                );
            } else {
                const data = await res.json();
                alert(`Error: ${data.error}`);
            }
        } catch (err: unknown) {
            const error = err as Error;
            alert(`Error de conexión: ${error.message}`);
        } finally {
            setIsSavingStaff(false);
        }
    };

    const handleUpdateLog = async () => {
        if (!editingLog) return;
        setIsSavingLog(true);
        try {
            const res = await fetch(apiUrl('/api/admin/update-log'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    logId: editingLog.id,
                    description: editingLog.description,
                    metadata: editingLog.metadata,
                    target_id: editingLog.target_id,
                    target_type: editingLog.target_type
                })
            });
            if (res.ok) {
                setAuditLogs(prev => prev.map(l => l.id === editingLog.id ? editingLog : l));
                setEditingLog(null);
            } else {
                alert('Error al actualizar log');
            }
        } catch {
            alert('Error de conexión');
        } finally {
            setIsSavingLog(false);
        }
    };

    return {
        staffProfiles,
        setStaffProfiles,
        auditLogs,
        setAuditLogs,
        staffSearch,
        setStaffSearch,
        isEditingStaff,
        setIsEditingStaff,
        editStaffData,
        setEditStaffData,
        isSavingStaff,
        editingLog,
        setEditingLog,
        isSavingLog,
        searchTerm,
        setSearchTerm,
        students,
        setStudents,
        selectedStudent,
        setSelectedStudent,
        isEditingStudent,
        setIsEditingStudent,
        editStudentData,
        setEditStudentData,
        isSavingProfile,
        handleSaveProfile,
        handleUpdateStaff,
        handleUpdateLog,
        fetchLogs
    };
}
