type UserRole = 'pedagogue' | 'teacher' | 'student'; 

interface BaseUser {
    idUser: number;
    nameUser: string;
    email: string;
    password: string
    age: number;
    role: UserRole;
}

interface Pedagogue extends BaseUser{
    role: 'pedagogue';
    managedClasses: number[];
}

interface Teacher extends BaseUser{
    role: 'teacher';
    subjects: string[];
}

interface Student extends BaseUser {
  role: 'student';
  course: string;
}

type User = Pedagogue | Teacher | Student;

export type { UserRole, User, Pedagogue, Teacher, Student };