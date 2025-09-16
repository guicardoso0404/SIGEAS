CREATE TABLE User (
    idUser BIGINT PRIMARY KEY NOT NULL,
    userName VARCHAR(80) NOT NULL,
    email VARCHAR(80) NOT NULL,
    password VARCHAR(250) NOT NULL,
    age TINYINT NOT NULL,
    role VARCHAR(80) NOT NULL
);

CREATE TABLE ClassRoom (
    idClass BIGINT PRIMARY KEY NOT NULL,
    className VARCHAR(50) NOT NULL,
    teacherId BIGINT NOT NULL,
    subject VARCHAR(80) NOT NULL,
    FOREIGN KEY (teacherId) REFERENCES User(idUser)
);

CREATE TABLE Enrollment (
    idEnrollment BIGINT PRIMARY KEY NOT NULL,
    studentId BIGINT NOT NULL,
    classId BIGINT NOT NULL,
    enrollmentDate DATE NOT NULL,
    status VARCHAR(80) NOT NULL,
    FOREIGN KEY (studentId) REFERENCES User(idUser),
    FOREIGN KEY (classId) REFERENCES ClassRoom(idClass)
);

CREATE TABLE Grade (
    idGrade BIGINT PRIMARY KEY NOT NULL,
    studentId BIGINT NOT NULL,
    classId BIGINT NOT NULL,
    assessmentDate DATE NOT NULL,
    disciplina VARCHAR(50) NOT NULL,
    nota TINYINT NOT NULL,
    finalAverage TINYINT NOT NULL,
    FOREIGN KEY (studentId) REFERENCES User(idUser),
    FOREIGN KEY (classId) REFERENCES ClassRoom(idClass)
);

CREATE TABLE AttendanceRecord (
    idAttendanceRecord BIGINT PRIMARY KEY NOT NULL,
    studentId BIGINT NOT NULL,
    classId BIGINT NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(40) NOT NULL,
    FOREIGN KEY (studentId) REFERENCES User(idUser),
    FOREIGN KEY (classId) REFERENCES ClassRoom(idClass)
);

CREATE TABLE Assignment (
    idAssignment BIGINT PRIMARY KEY NOT NULL,
    classId BIGINT NOT NULL,
    title VARCHAR(80) NOT NULL,
    distribute DATE NOT NULL,
    maxPoints INT NOT NULL,
    FOREIGN KEY (classId) REFERENCES ClassRoom(idClass)
);