//  Matrícula
interface Enrollment {
    idEnrollment: number;
    studentId: number;
    classId: number
    enrollmentDate: Date;
    status: 'active' | 'inactive' | 'completed' | 'dropped'
}

export type { Enrollment }