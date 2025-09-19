-- Script SQL para criar o banco de dados SIGEAS

-- Criar o banco de dados (se não existir)
CREATE DATABASE IF NOT EXISTS meubanco;
USE meubanco;

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS User (
    idUser INT AUTO_INCREMENT PRIMARY KEY,
    userName VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'teacher', 'pedagogue') NOT NULL,
    age INT,
    registrationDate DATE DEFAULT (CURRENT_DATE),
    lastAccess DATETIME
);

-- Tabela de Turmas
CREATE TABLE IF NOT EXISTS ClassRoom (
    idClass INT AUTO_INCREMENT PRIMARY KEY,
    className VARCHAR(50) NOT NULL,
    teacherId INT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    FOREIGN KEY (teacherId) REFERENCES User(idUser) ON DELETE CASCADE
);

-- Tabela de Matrículas
CREATE TABLE IF NOT EXISTS Enrollment (
    idEnrollment INT AUTO_INCREMENT PRIMARY KEY,
    studentId INT NOT NULL,
    classId INT NOT NULL,
    enrollmentDate DATE DEFAULT (CURRENT_DATE),
    status ENUM('active', 'inactive', 'pending', 'transferred', 'graduated') NOT NULL DEFAULT 'active',
    FOREIGN KEY (studentId) REFERENCES User(idUser) ON DELETE CASCADE,
    FOREIGN KEY (classId) REFERENCES ClassRoom(idClass) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (studentId, classId)
);

-- Tabela de Notas
CREATE TABLE IF NOT EXISTS Grade (
    idGrade INT AUTO_INCREMENT PRIMARY KEY,
    studentId INT NOT NULL,
    classId INT NOT NULL,
    assessmentDate DATE NOT NULL,
    disciplina VARCHAR(50) NOT NULL,
    nota DECIMAL(4, 2) NOT NULL,
    finalAverage DECIMAL(4, 2),
    FOREIGN KEY (studentId) REFERENCES User(idUser) ON DELETE CASCADE,
    FOREIGN KEY (classId) REFERENCES ClassRoom(idClass) ON DELETE CASCADE
);

-- Tabela de Registro de Presença
CREATE TABLE IF NOT EXISTS AttendanceRecord (
    idAttendanceRecord INT AUTO_INCREMENT PRIMARY KEY,
    studentId INT NOT NULL,
    classId INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'late', 'excused') NOT NULL,
    FOREIGN KEY (studentId) REFERENCES User(idUser) ON DELETE CASCADE,
    FOREIGN KEY (classId) REFERENCES ClassRoom(idClass) ON DELETE CASCADE
);

-- Tabela de Atividades
CREATE TABLE IF NOT EXISTS Assignment (
    idAssignment INT AUTO_INCREMENT PRIMARY KEY,
    classId INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    distribute DATE NOT NULL,
    maxPoints DECIMAL(5, 2) NOT NULL,
    FOREIGN KEY (classId) REFERENCES ClassRoom(idClass) ON DELETE CASCADE
);

-- Inserir usuários iniciais com senha "123456" usando bcrypt
-- A senha hash a seguir é "$2b$10$F0XTY0QN66VfrAdgdUIy6.wtvDZ1ayXhjsL/7lvJG/nBmGmuPVMEO"
-- Usamos INSERT IGNORE para evitar erro de duplicidade
INSERT IGNORE INTO User (userName, email, password, role, age) VALUES
('Admin Sistema', 'admin@escola.com', '$2b$10$F0XTY0QN66VfrAdgdUIy6.wtvDZ1ayXhjsL/7lvJG/nBmGmuPVMEO', 'pedagogue', 35),
('João Silva', 'prof.joao@escola.com', '$2b$10$F0XTY0QN66VfrAdgdUIy6.wtvDZ1ayXhjsL/7lvJG/nBmGmuPVMEO', 'teacher', 42),
('Maria Santos', 'prof.maria@escola.com', '$2b$10$F0XTY0QN66VfrAdgdUIy6.wtvDZ1ayXhjsL/7lvJG/nBmGmuPVMEO', 'teacher', 38),
('Ana Costa', 'ana.costa@escola.com', '$2b$10$F0XTY0QN66VfrAdgdUIy6.wtvDZ1ayXhjsL/7lvJG/nBmGmuPVMEO', 'student', 16),
('Lucas Mendes', 'lucas.mendes@escola.com', '$2b$10$F0XTY0QN66VfrAdgdUIy6.wtvDZ1ayXhjsL/7lvJG/nBmGmuPVMEO', 'student', 17),
('Pedro Oliveira', 'pedro.oliveira@escola.com', '$2b$10$F0XTY0QN66VfrAdgdUIy6.wtvDZ1ayXhjsL/7lvJG/nBmGmuPVMEO', 'student', 16);

-- Inserir turmas iniciais
INSERT IGNORE INTO ClassRoom (className, teacherId, subject) VALUES
('1A', 2, 'Matemática'),
('2B', 3, 'Português'),
('3C', 2, 'Física');

-- Inserir matrículas iniciais
INSERT IGNORE INTO Enrollment (studentId, classId, status) VALUES
(4, 1, 'active'),
(5, 1, 'active'),
(6, 1, 'active'),
(4, 2, 'active'),
(5, 2, 'active'),
(6, 3, 'active');

-- Inserir algumas notas
INSERT IGNORE INTO Grade (studentId, classId, assessmentDate, disciplina, nota) VALUES
(4, 1, '2023-03-10', 'Matemática', 8.5),
(5, 1, '2023-03-10', 'Matemática', 7.0),
(6, 1, '2023-03-10', 'Matemática', 9.0),
(4, 2, '2023-03-15', 'Português', 7.5),
(5, 2, '2023-03-15', 'Português', 8.0);

-- Inserir registros de presença
INSERT IGNORE INTO AttendanceRecord (studentId, classId, date, status) VALUES
(4, 1, '2023-03-10', 'present'),
(5, 1, '2023-03-10', 'present'),
(6, 1, '2023-03-10', 'absent'),
(4, 2, '2023-03-15', 'present'),
(5, 2, '2023-03-15', 'late');

-- Inserir algumas atividades
INSERT IGNORE INTO Assignment (classId, title, distribute, maxPoints) VALUES
(1, 'Prova de Álgebra', '2023-03-20', 10.0),
(2, 'Redação: Cidadania', '2023-03-25', 10.0),
(3, 'Experimento: Leis de Newton', '2023-04-05', 10.0);