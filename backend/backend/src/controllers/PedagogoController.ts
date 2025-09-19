import { Request, Response } from "express";
import { db, asArray } from "../config/promise";
import { AuthenticatedRequest } from "../middleware/AuthMiddleware";
import { QueryResultArray } from "../types/mysql";

interface SchoolStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  averageAttendance: number;
  averageGrades: number;
  studentsPerClass: number;
}

interface ClassPerformance {
  idClass: number;
  className: string;
  teacherName: string;
  subject: string;
  studentCount: number;
  averageGrade: number;
  attendanceRate: number;
}

class PedagogoController {
  // Obter estatísticas gerais da escola para o dashboard do pedagogo
  async getSchoolStats(req: AuthenticatedRequest, res: Response) {
    try {
      // 1. Total de alunos
      const [studentCount] = await db.query(`
        SELECT COUNT(*) as total FROM User WHERE role = 'student'
      `);

      // 2. Total de professores
      const [teacherCount] = await db.query(`
        SELECT COUNT(*) as total FROM User WHERE role = 'teacher'
      `);

      // 3. Total de turmas
      const [classCount] = await db.query(`
        SELECT COUNT(*) as total FROM ClassRoom
      `);

      // 4. Média de presença em todas as turmas
      const [attendanceStats] = await db.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present
        FROM AttendanceRecord
      `);

      // 5. Média de notas de todos os alunos
      const [gradesAvg] = await db.query(`
        SELECT AVG(nota) as average FROM Grade
      `);

      // Converter os resultados para os tipos apropriados
      const studentCountArray = asArray<{total: number}>(studentCount);
      const teacherCountArray = asArray<{total: number}>(teacherCount);
      const classCountArray = asArray<{total: number}>(classCount);
      const attendanceStatsArray = asArray<{total: number, present: number}>(attendanceStats);
      const gradesAvgArray = asArray<{average: number}>(gradesAvg);

      // Calcular média de alunos por turma
      const studentsPerClass = classCountArray[0].total > 0 
        ? Math.round(studentCountArray[0].total / classCountArray[0].total)
        : 0;

      // Calcular taxa média de presença
      const averageAttendance = attendanceStatsArray[0].total > 0
        ? Math.round((attendanceStatsArray[0].present / attendanceStatsArray[0].total) * 100)
        : 0;

      const stats: SchoolStats = {
        totalStudents: studentCountArray[0].total || 0,
        totalTeachers: teacherCountArray[0].total || 0,
        totalClasses: classCountArray[0].total || 0,
        averageAttendance,
        averageGrades: gradesAvgArray[0].average ? Math.round(gradesAvgArray[0].average * 10) / 10 : 0,
        studentsPerClass
      };

      return res.status(200).json({
        success: true,
        message: "Estatísticas da escola obtidas com sucesso",
        data: stats
      });
    } catch (error) {
      console.error("Erro ao obter estatísticas da escola:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao obter estatísticas da escola"
      });
    }
  }

  // Obter desempenho de todas as turmas
  async getClassPerformance(req: Request, res: Response) {
    try {
      const [classes] = await db.query(`
        SELECT 
          c.idClass, 
          c.className, 
          c.subject,
          u.nameUser as teacherName
        FROM ClassRoom c
        JOIN User u ON c.teacherId = u.idUser
      `);
      
      const classesArray = asArray(classes);
      const classesWithPerformance: ClassPerformance[] = [];

      for (const classRoom of classesArray) {
        // Contar alunos na turma
        const [studentCount] = await db.query(`
          SELECT COUNT(*) as total 
          FROM Enrollment 
          WHERE classId = ? AND status = 'active'
        `, [classRoom.idClass]);

        // Calcular média de notas na turma
        const [gradesAvg] = await db.query(`
          SELECT AVG(nota) as average 
          FROM Grade 
          WHERE classId = ?
        `, [classRoom.idClass]);

        // Calcular taxa de presença na turma
        const [attendanceStats] = await db.query(`
          SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present
          FROM AttendanceRecord
          WHERE classId = ?
        `, [classRoom.idClass]);
        
        const studentCountArray = asArray<{total: number}>(studentCount);
        const gradesAvgArray = asArray<{average: number}>(gradesAvg);
        const attendanceStatsArray = asArray<{total: number, present: number}>(attendanceStats);

        const attendanceRate = attendanceStatsArray[0].total > 0
          ? Math.round((attendanceStatsArray[0].present / attendanceStatsArray[0].total) * 100)
          : 0;

        classesWithPerformance.push({
          ...classRoom,
          studentCount: studentCountArray[0].total || 0,
          averageGrade: gradesAvgArray[0].average ? Math.round(gradesAvgArray[0].average * 10) / 10 : 0,
          attendanceRate
        });
      }

      return res.status(200).json({
        success: true,
        message: "Desempenho das turmas obtido com sucesso",
        data: classesWithPerformance
      });
    } catch (error) {
      console.error("Erro ao obter desempenho das turmas:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao obter desempenho das turmas"
      });
    }
  }

  // Gerenciar matrículas de alunos em turmas
  async enrollStudent(req: Request, res: Response) {
    const { studentId, classId, status } = req.body;

    if (!studentId || !classId || !status) {
      return res.status(400).json({
        success: false,
        message: "Dados incompletos. Forneça ID do aluno, ID da turma e status da matrícula"
      });
    }

    // Validar status
    const validStatus = ['active', 'inactive', 'pending', 'transferred', 'graduated'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status inválido. Valores aceitos: active, inactive, pending, transferred, graduated"
      });
    }

    try {
      // Verificar se o aluno existe
      const [studentExists] = await db.query(`
        SELECT * FROM User WHERE idUser = ? AND role = 'student'
      `, [studentId]);
      
      const studentExistsArray = asArray(studentExists);

      if (studentExistsArray.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Aluno não encontrado ou usuário não é um aluno"
        });
      }

      // Verificar se a turma existe
      const [classExists] = await db.query(`
        SELECT * FROM ClassRoom WHERE idClass = ?
      `, [classId]);
      
      const classExistsArray = asArray(classExists);

      if (classExistsArray.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Turma não encontrada"
        });
      }

      // Verificar se já existe uma matrícula para este aluno nesta turma
      const [enrollmentExists] = await db.query(`
        SELECT * FROM Enrollment 
        WHERE studentId = ? AND classId = ?
      `, [studentId, classId]);
      
      const enrollmentExistsArray = asArray<{idEnrollment: number}>(enrollmentExists);

      if (enrollmentExistsArray.length > 0) {
        // Se já existe, atualizar o status
        await db.query(`
          UPDATE Enrollment
          SET status = ?
          WHERE studentId = ? AND classId = ?
        `, [status, studentId, classId]);

        return res.status(200).json({
          success: true,
          message: "Status da matrícula atualizado com sucesso",
          data: {
            idEnrollment: enrollmentExistsArray[0].idEnrollment,
            studentId,
            classId,
            status
          }
        });
      }

      // Se não existe, criar uma nova matrícula
      // Gerar ID para a nova matrícula
      const [maxId] = await db.query(`
        SELECT MAX(idEnrollment) as maxId FROM Enrollment
      `);
      
      const maxIdArray = asArray<{maxId: number | null}>(maxId);
      const nextId = maxIdArray[0].maxId ? Number(maxIdArray[0].maxId) + 1 : 1;
      const enrollmentDate = new Date().toISOString().split('T')[0]; // Data atual no formato YYYY-MM-DD

      // Inserir a nova matrícula
      await db.query(`
        INSERT INTO Enrollment (idEnrollment, studentId, classId, enrollmentDate, status)
        VALUES (?, ?, ?, ?, ?)
      `, [nextId, studentId, classId, enrollmentDate, status]);

      return res.status(201).json({
        success: true,
        message: "Aluno matriculado com sucesso",
        data: {
          idEnrollment: nextId,
          studentId,
          classId,
          enrollmentDate,
          status
        }
      });
    } catch (error) {
      console.error("Erro ao matricular aluno:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao matricular aluno"
      });
    }
  }

  // Listar todas as matrículas
  async getEnrollments(req: Request, res: Response) {
    try {
      const [enrollments] = await db.query(`
        SELECT e.*, 
               s.nameUser as studentName,
               c.className,
               c.subject
        FROM Enrollment e
        JOIN User s ON e.studentId = s.idUser
        JOIN ClassRoom c ON e.classId = c.idClass
        ORDER BY e.enrollmentDate DESC
      `);
      
      // Usar a função asArray para converter os resultados
      const enrollmentsArray = asArray(enrollments);

      return res.status(200).json({
        success: true,
        message: "Matrículas listadas com sucesso",
        data: enrollmentsArray
      });
    } catch (error) {
      console.error("Erro ao listar matrículas:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao listar matrículas"
      });
    }
  }

  // Gerar relatório de desempenho de um aluno específico
  async generateStudentReport(req: Request, res: Response) {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "ID do aluno não fornecido"
      });
    }

    try {
      // Verificar se o aluno existe e obter seus dados
      const [student] = await db.query(`
        SELECT * FROM User WHERE idUser = ? AND role = 'student'
      `, [studentId]);
      
      const studentArray = asArray(student);

      if (studentArray.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Aluno não encontrado ou usuário não é um aluno"
        });
      }

      // Obter as turmas em que o aluno está matriculado
      const [enrollments] = await db.query(`
        SELECT e.*, c.className, c.subject, c.idClass
        FROM Enrollment e
        JOIN ClassRoom c ON e.classId = c.idClass
        WHERE e.studentId = ?
      `, [studentId]);
      
      const enrollmentsArray = asArray(enrollments);

      // Para cada turma, obter notas e presenças
      const classesData = [];
      for (const enrollment of enrollmentsArray) {
        // Obter notas
        const [grades] = await db.query(`
          SELECT * FROM Grade
          WHERE studentId = ? AND classId = ?
          ORDER BY assessmentDate DESC
        `, [studentId, enrollment.idClass]);
        
        const gradesArray = asArray(grades);

        // Calcular média das notas
        let totalGrades = 0;
        for (const grade of gradesArray) {
          totalGrades += grade.nota;
        }
        const averageGrade = gradesArray.length > 0 ? Math.round((totalGrades / gradesArray.length) * 10) / 10 : 0;

        // Obter presenças
        const [attendanceStats] = await db.query(`
          SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
            SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
            SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late,
            SUM(CASE WHEN status = 'excused' THEN 1 ELSE 0 END) as excused
          FROM AttendanceRecord
          WHERE studentId = ? AND classId = ?
        `, [studentId, enrollment.idClass]);
        
        const attendanceStatsArray = asArray<{
          total: number;
          present: number;
          absent: number;
          late: number;
          excused: number;
        }>(attendanceStats);

        const attendanceRate = attendanceStatsArray[0].total > 0
          ? Math.round((attendanceStatsArray[0].present / attendanceStatsArray[0].total) * 100)
          : 0;

        classesData.push({
          classInfo: {
            idClass: enrollment.idClass,
            className: enrollment.className,
            subject: enrollment.subject,
            status: enrollment.status
          },
          grades: {
            list: gradesArray,
            average: averageGrade
          },
          attendance: {
            total: attendanceStatsArray[0].total || 0,
            present: attendanceStatsArray[0].present || 0,
            absent: attendanceStatsArray[0].absent || 0,
            late: attendanceStatsArray[0].late || 0,
            excused: attendanceStatsArray[0].excused || 0,
            rate: attendanceRate
          }
        });
      }

      // Gerar o relatório final
      const report = {
        student: studentArray[0],
        enrollmentCount: enrollmentsArray.length,
        classes: classesData
      };

      return res.status(200).json({
        success: true,
        message: "Relatório do aluno gerado com sucesso",
        data: report
      });
    } catch (error) {
      console.error("Erro ao gerar relatório do aluno:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao gerar relatório do aluno"
      });
    }
  }

  // Gerar relatório de desempenho de uma turma específica
  async generateClassReport(req: Request, res: Response) {
    const { classId } = req.params;

    if (!classId) {
      return res.status(400).json({
        success: false,
        message: "ID da turma não fornecido"
      });
    }

    try {
      // Verificar se a turma existe e obter seus dados
      const [classData] = await db.query(`
        SELECT c.*, u.nameUser as teacherName
        FROM ClassRoom c
        JOIN User u ON c.teacherId = u.idUser
        WHERE c.idClass = ?
      `, [classId]);
      
      const classDataArray = asArray(classData);

      if (classDataArray.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Turma não encontrada"
        });
      }

      // Obter todos os alunos matriculados na turma
      const [students] = await db.query(`
        SELECT u.*, e.status, e.enrollmentDate
        FROM User u
        JOIN Enrollment e ON u.idUser = e.studentId
        WHERE e.classId = ? AND u.role = 'student'
        ORDER BY u.nameUser
      `, [classId]);
      
      const studentsArray = asArray(students);

      // Obter estatísticas de notas da turma
      const [gradeStats] = await db.query(`
        SELECT 
          AVG(nota) as average,
          MIN(nota) as minimum,
          MAX(nota) as maximum,
          COUNT(*) as count
        FROM Grade
        WHERE classId = ?
      `, [classId]);
      
      const gradeStatsArray = asArray<{
        average: number | null;
        minimum: number | null;
        maximum: number | null;
        count: number;
      }>(gradeStats);

      // Obter estatísticas de presença da turma
      const [attendanceStats] = await db.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
          SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
          SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late,
          SUM(CASE WHEN status = 'excused' THEN 1 ELSE 0 END) as excused
        FROM AttendanceRecord
        WHERE classId = ?
      `, [classId]);
      
      const attendanceStatsArray = asArray<{
        total: number;
        present: number;
        absent: number;
        late: number;
        excused: number;
      }>(attendanceStats);

      // Para cada aluno, calcular média de notas e taxa de presença
      const studentsWithStats = [];
      for (const student of studentsArray) {
        // Obter notas do aluno
        const [grades] = await db.query(`
          SELECT AVG(nota) as average FROM Grade
          WHERE studentId = ? AND classId = ?
        `, [student.idUser, classId]);
        
        const gradesArray = asArray<{average: number | null}>(grades);

        // Obter presenças do aluno
        const [attendance] = await db.query(`
          SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present
          FROM AttendanceRecord
          WHERE studentId = ? AND classId = ?
        `, [student.idUser, classId]);
        
        const attendanceArray = asArray<{total: number; present: number}>(attendance);

        const attendanceRate = attendanceArray[0].total > 0
          ? Math.round((attendanceArray[0].present / attendanceArray[0].total) * 100)
          : 0;

        studentsWithStats.push({
          ...student,
          averageGrade: gradesArray[0].average ? Math.round(gradesArray[0].average * 10) / 10 : 0,
          attendanceRate
        });
      }

      // Gerar o relatório final
      const report = {
        classInfo: classDataArray[0],
        studentCount: studentsArray.length,
        gradeStats: {
          average: gradeStatsArray[0].average ? Math.round(gradeStatsArray[0].average * 10) / 10 : 0,
          minimum: gradeStatsArray[0].minimum || 0,
          maximum: gradeStatsArray[0].maximum || 0,
          count: gradeStatsArray[0].count || 0
        },
        attendanceStats: {
          total: attendanceStatsArray[0].total || 0,
          present: attendanceStatsArray[0].present || 0,
          absent: attendanceStatsArray[0].absent || 0,
          late: attendanceStatsArray[0].late || 0,
          excused: attendanceStatsArray[0].excused || 0,
          rate: attendanceStatsArray[0].total > 0
            ? Math.round((attendanceStatsArray[0].present / attendanceStatsArray[0].total) * 100)
            : 0
        },
        students: studentsWithStats
      };

      return res.status(200).json({
        success: true,
        message: "Relatório da turma gerado com sucesso",
        data: report
      });
    } catch (error) {
      console.error("Erro ao gerar relatório da turma:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao gerar relatório da turma"
      });
    }
  }
}

export default new PedagogoController();
