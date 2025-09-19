import { Request, Response } from "express";

// Importações de módulos
const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const port = 3001;

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

// Rotas de autenticação - públicas
app.post("/auth/login", AuthController.createLogin);

// Middleware de autenticação para todas as rotas abaixo
app.use(authMiddleware);

// Rotas de usuários
app.get("/users", isPedagogue, UsuarioController.getAllUsers);
app.get("/users/:idUser", UsuarioController.getUserById);
app.post("/users", isPedagogue, UsuarioController.createUser);
app.patch("/users/email", UsuarioController.updateUserEmail);
app.patch("/users/name", UsuarioController.updateUserNameUser);

// Rotas de turmas
app.get("/classes", UsuarioController.getAllUsers);
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

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});