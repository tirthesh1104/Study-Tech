import { User, Student, AttendanceRecord, Assignment, ChatInteraction, Exam, LiveClass, SubjectNote } from '../types';

/**
 * MySQL Service (Client-side proxy for Backend API)
 * This service handles all CRUD operations by communicating with the Node.js/MySQL backend.
 */

const API_BASE_URL = (import.meta as any).env.VITE_MYSQL_API_URL || 'http://localhost:3000/api';

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Database operation failed');
    }
    return response.json();
};

export const mysqlService = {
    // --- User Operations ---
    async getUser(id: string): Promise<User | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${id}`);
            return await handleResponse(response);
        } catch (err) {
            console.error('MySQL GetUser error:', err);
            return null;
        }
    },

    async upsertUser(user: User): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        await handleResponse(response);
    },

    // --- Student Operations ---
    async getStudent(id: string): Promise<Student | null> {
        const response = await fetch(`${API_BASE_URL}/students/${id}`);
        return await handleResponse(response);
    },

    async updateStudent(student: Student): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/students/${student.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(student)
        });
        await handleResponse(response);
    },

    // --- Attendance Operations ---
    async addAttendance(record: AttendanceRecord & { studentId: string }): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/attendance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(record)
        });
        await handleResponse(response);
    },

    // --- Chat Analytics ---
    async saveInteraction(interaction: ChatInteraction): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/interactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(interaction)
        });
        await handleResponse(response);
    },

    // --- Exam Operations ---
    async createExam(exam: Exam): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/exams`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(exam)
        });
        await handleResponse(response);
    },

    // --- Migration Utility ---
    async migrateFromSource(data: any): Promise<{ success: boolean; count: number }> {
        const response = await fetch(`${API_BASE_URL}/migrate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await handleResponse(response);
    }
};
