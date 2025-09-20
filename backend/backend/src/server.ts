import { Request, Response } from "express";

// Importações de módulos
const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const port = 3001;
import { db } from "./config/promise";

// Importações de controllers
import AuthController from "./controllers/AuthController";
import UsuarioController from "./controllers/UsuarioController";
import TurmaController from "./controllers/TurmaController";
import NotasController from "./controllers/NotasController";
import AttendanceController from "./controllers/AttendanceController";
import ProfessoresController from "./controllers/ProfessoresController";
import PedagogoController from "./controllers/PedagogoController";

// Importações de middlewares
import { authMiddleware, AuthenticatedRequest } from "./middleware/AuthMiddleware";
import { isPedagogue, isTeacher, isStudent, isTeacherOrPedagogue } from "./middleware/RoleMiddleware";

// Configurações
app.use(cors());
app.use(express.json());
dotenv.config();
app.use(express.urlencoded({extended: true}));

// Rota de teste
app.get("/", (req: Request, res: Response) => {
    res.send("API do SIGEAS com TypeScript funcionando!");
});

// Rota de teste para buscar turmas do professor diretamente
app.get("/debug-teacher-classes/:teacherId", async (req: Request, res: Response) => {
    try {
        const { db } = require("./config/promise");
        const { teacherId } = req.params;
        
        console.log("🔍 Buscando turmas para professor ID:", teacherId);
        
        const [rows] = await db.query(`
            SELECT c.*, u.userName as teacherName
            FROM ClassRoom c
            JOIN User u ON c.teacherId = u.idUser
            WHERE c.teacherId = ?
        `, [teacherId]);
        
        console.log("📊 Resultado da query:", rows);
        
        res.json({
            success: true,
            message: "Turmas encontradas",
            data: rows
        });
    } catch (error) {
        console.error("❌ Erro:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao buscar turmas",
            error: error instanceof Error ? error.message : "Erro desconhecido"
        });
    }
});

// Rota de teste para verificar conexão com banco
app.get("/test-db", async (req: Request, res: Response) => {
    try {
        const { db } = require("./config/promise");
        
        // Testar conexão
        console.log("🔍 Testando conexão com banco...");
        await db.query("SELECT 1");
        console.log("✅ Conexão com banco OK");
        
        // Verificar usuários
        console.log("🔍 Verificando usuários...");
        const [users] = await db.query("SELECT idUser, userName, email, role FROM User");
        console.log("👥 Usuários encontrados:", users);
        
        // Verificar turmas
        console.log("🔍 Verificando turmas...");
        const [classes] = await db.query("SELECT * FROM ClassRoom");
        console.log("🏫 Turmas encontradas:", classes);
        
        // Verificar turmas por professor específico
        console.log("🔍 Verificando turmas por professor...");
        const [teacherClasses] = await db.query(`
            SELECT c.*, u.userName as teacherName
            FROM ClassRoom c
            JOIN User u ON c.teacherId = u.idUser
            WHERE c.teacherId = 2
        `);
        console.log("👨‍🏫 Turmas do professor João (ID 2):", teacherClasses);
        
        // Verificar matrículas
        console.log("🔍 Verificando matrículas...");
        const [enrollments] = await db.query(`
            SELECT e.*, 
                   u.userName as studentName, 
                   c.className as className
            FROM Enrollment e
            JOIN User u ON e.studentId = u.idUser
            JOIN ClassRoom c ON e.classId = c.idClass
        `);
        console.log("📝 Matrículas encontradas:", enrollments);
        
        res.json({
            success: true,
            message: "Teste de banco realizado com sucesso",
            data: {
                users,
                classes,
                teacherClasses,
                enrollments,
                enrollmentsCount: enrollments.length
            }
        });
    } catch (error) {
        console.error("❌ Erro no teste do banco:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao conectar com banco",
            error: error instanceof Error ? error.message : "Erro desconhecido"
        });
    }
});

// Rota para criar turmas facilmente (temporária para testes)
app.post("/create-test-class", async (req: Request, res: Response) => {
    try {
        const { db } = require("./config/promise");
        const { className, teacherId, subject } = req.body;
        
        console.log("🏫 Criando turma:", { className, teacherId, subject });
        
        // Verificar se já existe
        const [existing] = await db.query(`
            SELECT * FROM ClassRoom WHERE className = ? AND teacherId = ?
        `, [className, teacherId]);
        
        if (Array.isArray(existing) && existing.length > 0) {
            return res.json({
                success: true,
                message: "Turma já existe",
                data: existing[0]
            });
        }
        
        // Criar nova turma
        const [result] = await db.query(`
            INSERT INTO ClassRoom (className, teacherId, subject) VALUES (?, ?, ?)
        `, [className, teacherId, subject]);
        
        // Buscar a turma criada
        const [newClass] = await db.query(`
            SELECT * FROM ClassRoom WHERE className = ? AND teacherId = ?
        `, [className, teacherId]);
        
        console.log("✅ Turma criada:", newClass);
        
        // AUTO-MATRICULAR ALUNOS na nova turma
        const classId = Array.isArray(newClass) ? newClass[0]?.idClass : newClass?.idClass;
        
        if (classId) {
            console.log("🎯 Auto-matriculando alunos na turma", classId);
            
            // Buscar alunos disponíveis
            const [students]: [any[], any] = await db.query(`
                SELECT idUser FROM User WHERE role = 'student' LIMIT 3
            `);
            
            // Matricular cada aluno encontrado
            for (const student of students) {
                try {
                    await db.query(`
                        INSERT IGNORE INTO Enrollment (studentId, classId, enrollmentDate, status)
                        VALUES (?, ?, NOW(), 'active')
                    `, [student.idUser, classId]);
                    console.log(`✅ Aluno ${student.idUser} matriculado na turma ${classId}`);
                } catch (enrollError) {
                    console.log(`⚠️ Aluno ${student.idUser} já matriculado ou erro:`, enrollError);
                }
            }
        }
        
        res.json({
            success: true,
            message: "Turma criada com sucesso e alunos auto-matriculados!",
            data: Array.isArray(newClass) ? newClass[0] : newClass
        });
    } catch (error) {
        console.error("❌ Erro ao criar turma:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao criar turma",
            error: error instanceof Error ? error.message : "Erro desconhecido"
        });
    }
});

// Rota para atualizar as turmas com os nomes corretos
app.get("/update-classes", async (req: Request, res: Response) => {
    try {
        const { db } = require("./config/promise");
        
        console.log("🔄 Atualizando nomes das turmas...");
        
        // Limpar dados relacionados primeiro
        await db.query("DELETE FROM Grade");
        await db.query("DELETE FROM AttendanceRecord");
        await db.query("DELETE FROM Assignment");
        await db.query("DELETE FROM Enrollment");
        await db.query("DELETE FROM ClassRoom");
        
        // Inserir as turmas corretas
        await db.query(`
            INSERT INTO ClassRoom (idClass, className, teacherId, subject) VALUES
            (1, '9° Ano A', 2, 'Matemática'),
            (2, '8° Ano B', 3, 'Português')
        `);
        
        // Inserir matrículas para as novas turmas
        await db.query(`
            INSERT INTO Enrollment (studentId, classId, status) VALUES
            (4, 1, 'active'),
            (5, 1, 'active'),
            (6, 2, 'active')
        `);
        
        // Verificar se foram inseridas corretamente
        const [classes] = await db.query("SELECT * FROM ClassRoom");
        const [enrollments] = await db.query("SELECT * FROM Enrollment");
        console.log("✅ Turmas atualizadas:", classes);
        console.log("✅ Matrículas atualizadas:", enrollments);
        
        res.json({
            success: true,
            message: "Turmas e matrículas atualizadas com sucesso",
            data: { classes, enrollments }
        });
    } catch (error) {
        console.error("❌ Erro ao atualizar turmas:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao atualizar turmas",
            error: error instanceof Error ? error.message : "Erro desconhecido"
        });
    }
});

// Rota de teste de autenticação
app.post("/test-login", AuthController.createLogin);

// Rota de teste completo - login + buscar turmas
app.post("/test-full-flow", async (req: Request, res: Response) => {
    try {
        const jwt = require('jsonwebtoken');
        const bcrypt = require('bcrypt');
        const { db } = require("./config/promise");
        
        // 1. Fazer login
        const email = "prof.joao@escola.com";
        const password = "123456";
        
        console.log("🔐 Fazendo login...");
        const [userRows] = await db.query("SELECT * FROM User WHERE email = ?", [email]);
        const users = userRows as any[];
        
        if (users.length === 0) {
            return res.status(401).json({ success: false, message: "Usuário não encontrado" });
        }
        
        const user = users[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: "Senha incorreta" });
        }
        
        // 2. Gerar token
        const payload = {
            idUser: user.idUser,
            email: user.email,
            userName: user.userName,
            role: user.role
        };
        
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
        console.log("✅ Token gerado:", token.substring(0, 20) + "...");
        
        // 3. Buscar turmas
        console.log("🎓 Buscando turmas para professor ID:", user.idUser);
        const [classRows] = await db.query(`
            SELECT c.*, u.userName as teacherName
            FROM ClassRoom c
            JOIN User u ON c.teacherId = u.idUser
            WHERE c.teacherId = ?
        `, [user.idUser]);
        
        console.log("📊 Turmas encontradas:", classRows);
        
        res.json({
            success: true,
            message: "Teste completo realizado com sucesso",
            data: {
                user: {
                    idUser: user.idUser,
                    userName: user.userName,
                    email: user.email,
                    role: user.role
                },
                token,
                classes: classRows
            }
        });
        
    } catch (error) {
        console.error("❌ Erro no teste completo:", error);
        res.status(500).json({
            success: false,
            message: "Erro no teste",
            error: error instanceof Error ? error.message : "Erro desconhecido"
        });
    }
});

// Rota para testar turmas sem autenticação (temporária)
app.get("/test-teacher-classes", async (req: Request, res: Response) => {
    try {
        const { db } = require("./config/promise");
        
        console.log("🔍 Testando busca de turmas para professor ID 2...");
        
        const [rows] = await db.query(`
            SELECT c.*, u.userName as teacherName
            FROM ClassRoom c
            JOIN User u ON c.teacherId = u.idUser
            WHERE c.teacherId = 2
        `);
        
        console.log("📊 Resultado:", rows);
        
        res.json({
            success: true,
            message: "Turmas encontradas",
            data: rows
        });
    } catch (error) {
        console.error("❌ Erro:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao buscar turmas",
            error: error instanceof Error ? error.message : "Erro desconhecido"
        });
    }
});

// Rota para obter apenas o token
app.post("/get-token", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const AuthController = require("./controllers/AuthController").default;
        
        // Simular requisição para o AuthController
        const mockReq = { body: { email, password } } as Request;
        const mockRes = {
            status: (code: number) => ({
                json: (data: any) => {
                    if (data.success && data.data?.token) {
                        res.json({ token: data.data.token });
                    } else {
                        res.status(code).json(data);
                    }
                }
            })
        } as any;
        
        await AuthController.createLogin(mockReq, mockRes);
    } catch (error) {
        res.status(500).json({ error: "Erro ao obter token" });
    }
});

// Rota de teste para verificar o que está no token
app.get("/test-token", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    console.log("🔍 Dados decodificados do token:", req.data);
    res.json({
        success: true,
        message: "Token decodificado com sucesso",
        data: req.data
    });
});

// Rotas de autenticação - públicas
app.post("/auth/login", AuthController.createLogin);

// Middleware de autenticação para todas as rotas abaixo
app.use(authMiddleware);

// Rotas de usuários
app.get("/users", isPedagogue, UsuarioController.getAllUsers);
app.get("/users/me", UsuarioController.getCurrentUser); // Nova rota para obter dados do usuário logado
app.get("/users/:idUser", UsuarioController.getUserById);
app.post("/users", isPedagogue, UsuarioController.createUser);
app.patch("/users/email", UsuarioController.updateUserEmail);
app.patch("/users/name", UsuarioController.updateUserNameUser);

// Rotas de turmas
app.get("/classes", TurmaController.getAllClasses);
app.get("/classes/:idClass", TurmaController.getClassById);
app.get("/teacher/classes", isTeacher, TurmaController.getClassesByTeacher);
app.post("/classes", isPedagogue, TurmaController.createClass);
app.put("/classes/:idClass", isTeacherOrPedagogue, TurmaController.updateClass);
app.delete("/classes/:idClass", isPedagogue, TurmaController.deleteClass);

// Rotas de notas
app.get("/grades", isPedagogue, NotasController.getAllGrades);
app.get("/classes/:classId/grades", isTeacherOrPedagogue, NotasController.getGradesByClass);
app.get("/students/:studentId/grades", NotasController.getGradesByStudent);
app.get("/student/grades", isStudent, NotasController.getGradesByStudent);
app.post("/grades", isTeacher, NotasController.addGrade);
app.put("/grades/:idGrade", isTeacher, NotasController.updateGrade);
app.delete("/grades/:idGrade", isTeacher, NotasController.deleteGrade);

// Rotas de presença
app.post("/attendance", isTeacher, AttendanceController.recordAttendance);
app.get("/classes/:classId/attendance/:date", isTeacherOrPedagogue, AttendanceController.getAttendanceByClassAndDate);
app.get("/students/:studentId/attendance", AttendanceController.getAttendanceByStudent);
app.get("/student/attendance", isStudent, AttendanceController.getAttendanceByStudent);
app.get("/classes/:classId/attendance-summary", isTeacherOrPedagogue, AttendanceController.getAttendanceSummaryByClass);
app.put("/attendance/:idAttendanceRecord", isTeacher, AttendanceController.updateAttendance);
app.delete("/attendance/:idAttendanceRecord", isTeacher, AttendanceController.deleteAttendance);

// Rotas específicas para professores
app.get("/teacher/dashboard", isTeacher, ProfessoresController.getDashboardStats);
app.get("/classes/:classId/students", isTeacher, ProfessoresController.getStudentsByClass);
app.post("/assignments", isTeacher, ProfessoresController.addAssignment);
app.get("/classes/:classId/assignments", isTeacherOrPedagogue, ProfessoresController.getAssignmentsByClass);
app.put("/assignments/:idAssignment", isTeacher, ProfessoresController.updateAssignment);
app.delete("/assignments/:idAssignment", isTeacher, ProfessoresController.deleteAssignment);

// Rotas específicas para pedagogos
app.get("/pedagogue/dashboard", isPedagogue, PedagogoController.getSchoolStats);
app.get("/pedagogue/class-performance", isPedagogue, PedagogoController.getClassPerformance);
app.post("/enrollments", isPedagogue, PedagogoController.enrollStudent);
app.get("/enrollments", isPedagogue, PedagogoController.getEnrollments);
app.get("/students/:studentId/report", isPedagogue, PedagogoController.generateStudentReport);
app.get("/classes/:classId/report", isPedagogue, PedagogoController.generateClassReport);

// Endpoint para verificar alunos de uma turma (sem autenticação para debug)
app.get('/debug-class-students/:classId', async (req: Request, res: Response) => {
    try {
        const { classId } = req.params;
        
        // Verificar enrollments
        const [enrollments]: [any[], any] = await db.query(`
            SELECT e.*, u.userName as studentName, u.email as studentEmail
            FROM Enrollment e
            JOIN User u ON e.studentId = u.idUser
            WHERE e.classId = ?
        `, [classId]);

        // Verificar se a turma existe
        const [classInfo]: [any[], any] = await db.query(`
            SELECT c.*, u.userName as teacherName
            FROM ClassRoom c
            JOIN User u ON c.teacherId = u.idUser
            WHERE c.idClass = ?
        `, [classId]);

        res.json({
            success: true,
            message: 'Dados da turma recuperados',
            data: {
                classInfo: classInfo[0] || null,
                enrollments: enrollments,
                studentsCount: enrollments.length
            }
        });
    } catch (error) {
        console.error('Erro ao buscar alunos da turma:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar alunos da turma',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});

// Endpoint para verificar todas as enrollments
app.get('/debug-all-enrollments', async (req: Request, res: Response) => {
    try {
        const [enrollments]: [any[], any] = await db.query(`
            SELECT e.*, 
                   u.userName as studentName, 
                   c.className as className,
                   t.userName as teacherName
            FROM Enrollment e
            JOIN User u ON e.studentId = u.idUser
            JOIN ClassRoom c ON e.classId = c.idClass
            JOIN User t ON c.teacherId = t.idUser
        `);

        res.json({
            success: true,
            message: 'Todas as matrículas recuperadas',
            data: {
                enrollments: enrollments,
                totalCount: enrollments.length
            }
        });
    } catch (error) {
        console.error('Erro ao buscar matrículas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar matrículas',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});

// Endpoint para criar matrículas de teste
app.post('/create-test-enrollments', async (req: Request, res: Response) => {
    try {
        // Buscar alunos (estudantes)
        const [students]: [any[], any] = await db.query(`
            SELECT idUser FROM User WHERE role = 'student'
        `);

        // Buscar turmas
        const [classes]: [any[], any] = await db.query(`
            SELECT idClass FROM ClassRoom
        `);

        const studentsList = students;
        const classesList = classes;

        if (studentsList.length === 0 || classesList.length === 0) {
            return res.json({
                success: false,
                message: 'Não há estudantes ou turmas suficientes para criar matrículas'
            });
        }

        // Criar matrículas de teste
        const enrollments = [];
        
        // Matricular cada aluno em pelo menos uma turma
        for (let i = 0; i < studentsList.length; i++) {
            const student = studentsList[i];
            const classIndex = i % classesList.length; // Distribuir alunos entre as turmas
            const classRoom = classesList[classIndex];
            
            // Verificar se já existe a matrícula
            const [existing]: [any[], any] = await db.query(`
                SELECT * FROM Enrollment WHERE studentId = ? AND classId = ?
            `, [student.idUser, classRoom.idClass]);
            
            if (existing.length === 0) {
                await db.query(`
                    INSERT INTO Enrollment (studentId, classId, enrollmentDate)
                    VALUES (?, ?, NOW())
                `, [student.idUser, classRoom.idClass]);
                
                enrollments.push({
                    studentId: student.idUser,
                    classId: classRoom.idClass
                });
            }
        }

        res.json({
            success: true,
            message: `${enrollments.length} matrículas criadas com sucesso`,
            data: enrollments
        });
    } catch (error) {
        console.error('Erro ao criar matrículas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar matrículas',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});

// Endpoint simples para matricular alunos nas turmas criadas pelo botão
app.post('/quick-enroll', async (req: Request, res: Response) => {
    try {
        const { db } = require("./config/promise");
        
        // Matricular Ana Costa (ID: 4) na turma 7
        await db.query(`
            INSERT IGNORE INTO Enrollment (studentId, classId, enrollmentDate, status)
            VALUES (4, 7, NOW(), 'active')
        `);
        
        // Matricular Lucas Mendes (ID: 5) na turma 7
        await db.query(`
            INSERT IGNORE INTO Enrollment (studentId, classId, enrollmentDate, status)
            VALUES (5, 7, NOW(), 'active')
        `);
        
        // Matricular Pedro Oliveira (ID: 6) na turma 8
        await db.query(`
            INSERT IGNORE INTO Enrollment (studentId, classId, enrollmentDate, status)
            VALUES (6, 8, NOW(), 'active')
        `);
        
        res.json({
            success: true,
            message: 'Alunos matriculados nas novas turmas com sucesso!'
        });
    } catch (error) {
        console.error('Erro ao matricular alunos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao matricular alunos',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});

// Endpoint para criar notas de teste para uma turma
app.post('/create-test-grades', async (req: Request, res: Response) => {
    try {
        const { classId } = req.body;
        
        if (!classId) {
            return res.status(400).json({
                success: false,
                message: "É necessário informar o ID da turma"
            });
        }
        
        console.log(`🔍 Criando notas de teste para a turma ${classId}...`);
        
        // Verificar se a turma existe
        const [classExists]: [any[], any] = await db.query(`
            SELECT * FROM ClassRoom WHERE idClass = ?
        `, [classId]);
        
        if (Array.isArray(classExists) && classExists.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Turma não encontrada"
            });
        }
        
        // Buscar alunos matriculados na turma
        const [students]: [any[], any] = await db.query(`
            SELECT u.idUser, u.userName
            FROM User u
            JOIN Enrollment e ON u.idUser = e.studentId
            WHERE e.classId = ? AND u.role = 'student'
        `, [classId]);
        
        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Nenhum aluno matriculado nesta turma"
            });
        }
        
        // Verificar disciplina da turma
        const classInfo = classExists[0];
        const subject = classInfo.subject || 'Matemática';
        
        // Para cada aluno, criar notas de teste
        const gradesToCreate = [];
        for (const student of students) {
            // Verificar se já existe um ID para a próxima nota
            const [maxId] = await db.query(`SELECT MAX(idGrade) as maxId FROM Grade`);
            const maxIdArray = maxId as any[];
            const nextId = maxIdArray[0].maxId ? Number(maxIdArray[0].maxId) + 1 : 1;
            
            // Criar 3 notas para cada aluno
            const nota1 = Math.floor(Math.random() * 4) + 7; // Nota entre 7 e 10
            const nota2 = Math.floor(Math.random() * 4) + 7; // Nota entre 7 e 10
            const media = ((nota1 + nota2) / 2).toFixed(1);
            
            await db.query(`
                INSERT INTO Grade (idGrade, studentId, classId, assessmentDate, disciplina, nota, finalAverage)
                VALUES 
                (?, ?, ?, DATE_SUB(NOW(), INTERVAL 30 DAY), ?, ?, NULL),
                (?, ?, ?, DATE_SUB(NOW(), INTERVAL 15 DAY), ?, ?, NULL),
                (?, ?, ?, NOW(), ?, NULL, ?)
            `, [
                nextId, student.idUser, classId, `${subject} - Prova 1`, nota1,
                nextId + 1, student.idUser, classId, `${subject} - Prova 2`, nota2,
                nextId + 2, student.idUser, classId, `${subject} - Média Final`, media
            ]);
            
            gradesToCreate.push({
                studentId: student.idUser,
                studentName: student.userName,
                provas: [`${subject} - Prova 1: ${nota1}`, `${subject} - Prova 2: ${nota2}`],
                mediaFinal: media
            });
        }
        
        // Buscar todas as notas criadas
        const [allGrades]: [any[], any] = await db.query(`
            SELECT g.*, u.userName as studentName
            FROM Grade g
            JOIN User u ON g.studentId = u.idUser
            WHERE g.classId = ?
            ORDER BY g.studentId, g.assessmentDate
        `, [classId]);
        
        return res.json({
            success: true,
            message: `Notas de teste criadas com sucesso para ${students.length} alunos`,
            data: {
                gradesCreated: gradesToCreate,
                totalGrades: allGrades.length
            }
        });
    } catch (error) {
        console.error('❌ Erro ao criar notas de teste:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar notas de teste',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});

// Endpoint para forçar criação de matrículas com SQL direto
app.get('/force-enrollments', async (req: Request, res: Response) => {
    try {
        console.log('🔥 FORÇANDO criação de matrículas...');
        
        // Deletar matrículas existentes das turmas 7 e 8 (para evitar duplicatas)
        await db.execute(`DELETE FROM Enrollment WHERE classId IN (7, 8)`);
        
        // Inserir matrículas uma por uma
        const result1 = await db.execute(`
            INSERT INTO Enrollment (studentId, classId, enrollmentDate, status)
            VALUES (4, 7, NOW(), 'active')
        `);
        console.log('✅ Matrícula 1 criada:', result1);
        
        const result2 = await db.execute(`
            INSERT INTO Enrollment (studentId, classId, enrollmentDate, status)
            VALUES (5, 7, NOW(), 'active')
        `);
        console.log('✅ Matrícula 2 criada:', result2);
        
        const result3 = await db.execute(`
            INSERT INTO Enrollment (studentId, classId, enrollmentDate, status)
            VALUES (6, 8, NOW(), 'active')
        `);
        console.log('✅ Matrícula 3 criada:', result3);
        
        // Verificar se foram criadas
        const [check]: [any[], any] = await db.query(`
            SELECT e.*, u.userName as studentName, c.className
            FROM Enrollment e
            JOIN User u ON e.studentId = u.idUser
            JOIN ClassRoom c ON e.classId = c.idClass
            WHERE e.classId IN (7, 8)
        `);
        
        res.json({
            success: true,
            message: `${check.length} matrículas criadas com sucesso nas turmas 7 e 8!`,
            data: check
        });
    } catch (error) {
        console.error('❌ Erro ao forçar matrículas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao forçar matrículas',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});

// Endpoint para testar notas de alunos SEM autenticação
app.get('/debug-student-grades/:studentId', async (req: Request, res: Response) => {
    try {
        const { studentId } = req.params;
        
        console.log(`🔍 Buscando notas do aluno ${studentId}...`);
        
        // Verificar se o aluno existe
        const [studentExists] = await db.query(`
            SELECT idUser FROM User WHERE idUser = ?
        `, [studentId]);

        if (Array.isArray(studentExists) && studentExists.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Aluno não encontrado"
            });
        }
        
        // Buscar notas do aluno
        const [rows]: [any[], any] = await db.query(`
            SELECT g.*, 
                   c.className,
                   c.subject,
                   u.userName as teacherName
            FROM Grade g
            JOIN ClassRoom c ON g.classId = c.idClass
            JOIN User u ON c.teacherId = u.idUser
            WHERE g.studentId = ?
            ORDER BY g.assessmentDate DESC
        `, [studentId]);
        
        console.log(`✅ Encontradas ${rows.length} notas para o aluno ${studentId}`);
        
        // Vamos criar algumas notas de teste se não existirem
        if (rows.length === 0) {
            console.log(`⚠️ Nenhuma nota encontrada, criando notas de teste...`);
            
            // Buscar turmas em que o aluno está matriculado
            const [enrollments]: [any[], any] = await db.query(`
                SELECT e.*, c.subject 
                FROM Enrollment e 
                JOIN ClassRoom c ON e.classId = c.idClass 
                WHERE e.studentId = ?
            `, [studentId]);
            
            if (enrollments.length > 0) {
                // Criar notas para o primeiro enrollment
                const enrollment = enrollments[0];
                
                // Verificar se já existe um ID para a próxima nota
                const [maxId] = await db.query(`SELECT MAX(idGrade) as maxId FROM Grade`);
                const maxIdArray = maxId as any[];
                const nextId = maxIdArray[0].maxId ? Number(maxIdArray[0].maxId) + 1 : 1;
                
                // Criar uma nota de teste
                await db.query(`
                    INSERT INTO Grade (idGrade, studentId, classId, assessmentDate, disciplina, nota, finalAverage)
                    VALUES (?, ?, ?, NOW(), ?, ?, ?)
                `, [nextId, studentId, enrollment.classId, enrollment.subject || 'Matemática', 8.5, 8.5]);
                
                console.log(`✅ Nota de teste criada com ID ${nextId}`);
                
                // Buscar novamente as notas
                const [newRows]: [any[], any] = await db.query(`
                    SELECT g.*, 
                           c.className,
                           c.subject,
                           u.userName as teacherName
                    FROM Grade g
                    JOIN ClassRoom c ON g.classId = c.idClass
                    JOIN User u ON c.teacherId = u.idUser
                    WHERE g.studentId = ?
                    ORDER BY g.assessmentDate DESC
                `, [studentId]);
                
                return res.json({
                    success: true,
                    message: `Notas do aluno ${studentId} encontradas (incluindo notas de teste)`,
                    data: newRows,
                    count: newRows.length
                });
            }
        }
        
        return res.json({
            success: true,
            message: `Notas do aluno ${studentId} encontradas`,
            data: rows,
            count: rows.length
        });
    } catch (error) {
        console.error('❌ Erro ao buscar notas do aluno:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar notas do aluno',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});

// Endpoint de debug para testar busca de alunos SEM autenticação
app.get('/debug-students/:classId', async (req: Request, res: Response) => {
    try {
        const { db } = require("./config/promise");
        const { classId } = req.params;
        
        console.log(`🔍 Buscando alunos da turma ${classId}...`);
        
        // Exatamente a mesma query do ProfessoresController
        const [students] = await db.query(`
            SELECT u.idUser, u.userName, u.email, u.age, e.enrollmentDate, e.status
            FROM User u
            JOIN Enrollment e ON u.idUser = e.studentId
            WHERE e.classId = ? AND u.role = 'student'
            ORDER BY u.userName
        `, [classId]);
        
        console.log(`✅ Encontrados ${students.length} alunos na turma ${classId}`);
        
        res.json({
            success: true,
            message: `Alunos da turma ${classId} encontrados`,
            data: students,
            count: students.length
        });
    } catch (error) {
        console.error('❌ Erro ao buscar alunos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar alunos',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});