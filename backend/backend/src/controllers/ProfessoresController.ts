import { Request, Response } from "express";
import { db } from "../config/promise";
import { AuthenticatedRequest } from "../middleware/AuthMiddleware";

interface TeacherDashboardStats {
  totalStudents: number;
  totalClasses: number;
  attendanceRate: number;
  averageGrade: number;
}

class ProfessoresController {
  // Obter estatísticas do dashboard do professor
  async getDashboardStats(req: AuthenticatedRequest, res: Response) {
    const teacherId = req.data?.idUser;

    if (!teacherId) {
      return res.status(401).json({
        success: false,
        message: "ID do professor não disponível"
      });
    }

    try {
      // 1. Total de turmas do professor
      const [classesCount] = await db.query(`
        SELECT COUNT(*) as totalClasses 
        FROM ClassRoom 
        WHERE teacherId = ?
      `, [teacherId]);

      // 2. Total de alunos nas turmas do professor
      const [studentsCount] = await db.query(`
        SELECT COUNT(DISTINCT e.studentId) as totalStudents
        FROM Enrollment e
        JOIN ClassRoom c ON e.classId = c.idClass
        WHERE c.teacherId = ? AND e.status = 'active'
      `, [teacherId]);

      // 3. Taxa média de presença nas turmas do professor
      const [attendanceStats] = await db.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END) as present
        FROM AttendanceRecord ar
        JOIN ClassRoom c ON ar.classId = c.idClass
        WHERE c.teacherId = ?
      `, [teacherId]);

      // 4. Média de notas nas turmas do professor
      const [gradesAvg] = await db.query(`
        SELECT AVG(g.nota) as averageGrade
        FROM Grade g
        JOIN ClassRoom c ON g.classId = c.idClass
        WHERE c.teacherId = ?
      `, [teacherId]);

      // Converter os resultados para os tipos apropriados
      const attendanceStatsArray = attendanceStats as Array<{total: number, present: number}>;
      const gradesAvgArray = gradesAvg as Array<{averageGrade: number}>;
      const classesCountArray = classesCount as Array<{totalClasses: number}>;
      const studentsCountArray = studentsCount as Array<{totalStudents: number}>;

      // Calcular a taxa de presença
      const attendanceRate = attendanceStatsArray[0].total > 0
        ? Math.round((attendanceStatsArray[0].present / attendanceStatsArray[0].total) * 100)
        : 0;

      // Formatar média de notas para ter apenas 1 casa decimal
      const averageGrade = gradesAvgArray[0].averageGrade
        ? Math.round(gradesAvgArray[0].averageGrade * 10) / 10
        : 0;

      const dashboardStats: TeacherDashboardStats = {
        totalClasses: classesCountArray[0].totalClasses || 0,
        totalStudents: studentsCountArray[0].totalStudents || 0,
        attendanceRate,
        averageGrade
      };

      return res.status(200).json({
        success: true,
        message: "Estatísticas do dashboard obtidas com sucesso",
        data: dashboardStats
      });
    } catch (error) {
      console.error("Erro ao obter estatísticas do dashboard:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao obter estatísticas do dashboard"
      });
    }
  }

  // Listar alunos de uma turma específica
  async getStudentsByClass(req: Request, res: Response) {
    const { classId } = req.params;

    if (!classId) {
      return res.status(400).json({
        success: false,
        message: "ID da turma não fornecido"
      });
    }

    try {
      // Verificar se a turma existe
      const [classExists] = await db.query(`
        SELECT * FROM ClassRoom WHERE idClass = ?
      `, [classId]);

      if (Array.isArray(classExists) && classExists.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Turma não encontrada"
        });
      }

      // Buscar todos os alunos matriculados na turma
      const [students] = await db.query(`
        SELECT u.idUser, u.userName, u.email, u.age, e.enrollmentDate, e.status
        FROM User u
        JOIN Enrollment e ON u.idUser = e.studentId
        WHERE e.classId = ? AND u.role = 'student'
        ORDER BY u.userName
      `, [classId]);

      return res.status(200).json({
        success: true,
        message: "Alunos da turma listados com sucesso",
        data: students
      });
    } catch (error) {
      console.error("Erro ao buscar alunos da turma:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao buscar alunos da turma"
      });
    }
  }

  // Adicionar uma atividade para uma turma
  async addAssignment(req: Request, res: Response) {
    const { classId, title, distribute, maxPoints } = req.body;

    if (!classId || !title || !distribute || maxPoints === undefined) {
      return res.status(400).json({
        success: false,
        message: "Dados incompletos. Forneça ID da turma, título, data de distribuição e pontuação máxima"
      });
    }

    try {
      // Verificar se a turma existe
      const [classExists] = await db.query(`
        SELECT * FROM ClassRoom WHERE idClass = ?
      `, [classId]);

      if (Array.isArray(classExists) && classExists.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Turma não encontrada"
        });
      }

      // Gerar ID para a nova atividade
      const [maxId] = await db.query(`
        SELECT MAX(idAssignment) as maxId FROM Assignment
      `);
      const maxIdArray = maxId as Array<{maxId: number}>;
      const nextId = maxIdArray.length && maxIdArray[0].maxId ? Number(maxIdArray[0].maxId) + 1 : 1;

      // Inserir a nova atividade
      await db.query(`
        INSERT INTO Assignment (idAssignment, classId, title, distribute, maxPoints)
        VALUES (?, ?, ?, ?, ?)
      `, [nextId, classId, title, distribute, maxPoints]);

      return res.status(201).json({
        success: true,
        message: "Atividade criada com sucesso",
        data: {
          idAssignment: nextId,
          classId,
          title,
          distribute,
          maxPoints
        }
      });
    } catch (error) {
      console.error("Erro ao criar atividade:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao criar atividade"
      });
    }
  }

  // Listar atividades de uma turma
  async getAssignmentsByClass(req: Request, res: Response) {
    const { classId } = req.params;

    if (!classId) {
      return res.status(400).json({
        success: false,
        message: "ID da turma não fornecido"
      });
    }

    try {
      const [assignments] = await db.query(`
        SELECT * FROM Assignment WHERE classId = ? ORDER BY distribute DESC
      `, [classId]);

      return res.status(200).json({
        success: true,
        message: "Atividades listadas com sucesso",
        data: assignments
      });
    } catch (error) {
      console.error("Erro ao buscar atividades:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao buscar atividades"
      });
    }
  }

  // Atualizar uma atividade
  async updateAssignment(req: Request, res: Response) {
    const { idAssignment } = req.params;
    const { title, distribute, maxPoints } = req.body;

    if (!idAssignment) {
      return res.status(400).json({
        success: false,
        message: "ID da atividade não fornecido"
      });
    }

    if (!title && !distribute && maxPoints === undefined) {
      return res.status(400).json({
        success: false,
        message: "Nenhum dado fornecido para atualização"
      });
    }

    try {
      // Verificar se a atividade existe
      const [assignmentExists] = await db.query(`
        SELECT * FROM Assignment WHERE idAssignment = ?
      `, [idAssignment]);

      if (Array.isArray(assignmentExists) && assignmentExists.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Atividade não encontrada"
        });
      }

      // Construir a consulta SQL de atualização dinamicamente
      let updateQuery = 'UPDATE Assignment SET ';
      const updateValues = [];
      
      if (title) {
        updateQuery += 'title = ?, ';
        updateValues.push(title);
      }
      
      if (distribute) {
        updateQuery += 'distribute = ?, ';
        updateValues.push(distribute);
      }
      
      if (maxPoints !== undefined) {
        updateQuery += 'maxPoints = ?, ';
        updateValues.push(maxPoints);
      }

      // Remover a vírgula final e adicionar a condição WHERE
      updateQuery = updateQuery.slice(0, -2) + ' WHERE idAssignment = ?';
      updateValues.push(idAssignment);

      // Executar a atualização
      await db.query(updateQuery, updateValues);

      // Buscar a atividade atualizada
      const [updatedAssignment] = await db.query(`
        SELECT * FROM Assignment WHERE idAssignment = ?
      `, [idAssignment]);
      
      const updatedAssignmentArray = updatedAssignment as Array<{
        idAssignment: number;
        classId: number;
        title: string;
        distribute: string;
        maxPoints: number;
      }>;

      return res.status(200).json({
        success: true,
        message: "Atividade atualizada com sucesso",
        data: updatedAssignmentArray[0]
      });
    } catch (error) {
      console.error("Erro ao atualizar atividade:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao atualizar atividade"
      });
    }
  }

  // Excluir uma atividade
  async deleteAssignment(req: Request, res: Response) {
    const { idAssignment } = req.params;

    if (!idAssignment) {
      return res.status(400).json({
        success: false,
        message: "ID da atividade não fornecido"
      });
    }

    try {
      // Verificar se a atividade existe
      const [assignmentExists] = await db.query(`
        SELECT * FROM Assignment WHERE idAssignment = ?
      `, [idAssignment]);

      if (Array.isArray(assignmentExists) && assignmentExists.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Atividade não encontrada"
        });
      }

      // Excluir a atividade
      await db.query(`DELETE FROM Assignment WHERE idAssignment = ?`, [idAssignment]);

      return res.status(200).json({
        success: true,
        message: "Atividade excluída com sucesso"
      });
    } catch (error) {
      console.error("Erro ao excluir atividade:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao excluir atividade"
      });
    }
  }
}

export default new ProfessoresController();
