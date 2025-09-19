// Chamada
interface AttendanceRecord { 
    idRecord: number;
    studentId: number;
    classId: number;
    date: Date;
    status: 'present' | 'absent' | 'excused'
}

export type { AttendanceRecord };