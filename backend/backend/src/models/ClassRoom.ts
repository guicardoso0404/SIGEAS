import type { Enrollment } from "./Enrollment";

// Sala de aula
interface ClassRoom {
    idClass: number;
    className: string;
    teacherId: number;
    subject: string;
    enrollment: Enrollment[];
    assingments?: string[];
}

export type { ClassRoom}