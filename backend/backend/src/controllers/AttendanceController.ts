import { Request, Response } from "express";
import { db } from "../config/promise";
import { AuthenticatedRequest } from "../middleware/AuthMiddleware";

interface AttendanceRecord {
    idAttendanceRecord: number;
    studentId: number;
    classId: number;
    date: Date;
    status: 'present' | 'absent' | 'late' | 'excused';
}

class AttendanceController {
    // Registrar presença para múltiplos alunos de uma vez (registro de chamada)
    async recordAttendance(req: Request, res: Response) {
        const { classId, date, attendanceData } = req.body;

        if (!classId || !date || !attendanceData || !Array.isArray(attendanceData)) {
            return res.status(400).json({
                success: false,
                message: "Dados incompletos ou formato inválido. Forneça ID da turma, data e lista de presenças"
            });
        }

        try {
            // Verificar se a turma existe
            const [classExists] = await db.query(`
                SELECT idClass FROM ClassRoom WHERE idClass = ?
            `, [classId]);

            if (Array.isArray(classExists) && classExists.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Turma não encontrada"
                });
            }

            // Obter o ID máximo atual para gerar novos IDs
            const [maxId] = await db.query(`
                SELECT MAX(idAttendanceRecord) as maxId FROM AttendanceRecord
            `);
            const maxIdArray = maxId as Array<{maxId: number}>;
            let nextId = maxIdArray.length && maxIdArray[0].maxId ? Number(maxIdArray[0].maxId) + 1 : 1;

            // Verificar se já existe registro de presença para esta turma nesta data
            const [existingRecords] = await db.query(`
                SELECT studentId FROM AttendanceRecord 
                WHERE classId = ? AND date = ?
            `, [classId, date]);
            
            const existingRecordsArray = existingRecords as Array<{studentId: number}>;

            if (existingRecordsArray.length > 0) {
                // Se existir, excluir os registros antigos
                await db.query(`
                    DELETE FROM AttendanceRecord 
                    WHERE classId = ? AND date = ?
                `, [classId, date]);
            }

            // Preparar a consulta de inserção em lote
            const values = [];
            const placeholders = [];

            for (const record of attendanceData) {
                const { studentId, status } = record;
                
                if (!studentId || !status) {
                    continue; // Pular registros inválidos
                }

                // Validar status
                const validStatus = ['present', 'absent', 'late', 'excused'];
                if (!validStatus.includes(status)) {
                    continue; // Pular registros com status inválido
                }

                values.push(nextId, studentId, classId, date, status);
                placeholders.push('(?, ?, ?, ?, ?)');
                nextId++;
            }

            if (placeholders.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Nenhum registro de presença válido fornecido"
                });
            }

            // Inserir todos os registros de presença de uma vez
            const query = `
                INSERT INTO AttendanceRecord (idAttendanceRecord, studentId, classId, date, status)
                VALUES ${placeholders.join(', ')}
            `;
            
            await db.query(query, values);

            return res.status(201).json({
                success: true,
                message: "Registro de presença realizado com sucesso",
                recordCount: placeholders.length
            });
        } catch (error) {
            console.error("Erro ao registrar presença:", error);
            return res.status(500).json({
                success: false,
                message: "Erro interno ao registrar presença"
            });
        }
    }

    // Obter registros de presença de uma turma em uma data específica
    async getAttendanceByClassAndDate(req: Request, res: Response) {
        const { classId, date } = req.params;

        if (!classId || !date) {
            return res.status(400).json({
                success: false,
                message: "ID da turma e data são obrigatórios"
            });
        }

        try {
            const [rows] = await db.query(`
                SELECT ar.*, u.nameUser as studentName
                FROM AttendanceRecord ar
                JOIN User u ON ar.studentId = u.idUser
                WHERE ar.classId = ? AND ar.date = ?
                ORDER BY u.nameUser
            `, [classId, date]);
            
            return res.status(200).json({
                success: true,
                message: "Registros de presença encontrados com sucesso",
                data: rows
            });
        } catch (error) {
            console.error("Erro ao buscar registros de presença:", error);
            return res.status(500).json({
                success: false,
                message: "Erro interno ao buscar registros de presença"
            });
        }
    }

    // Obter registros de presença de um aluno específico
    async getAttendanceByStudent(req: AuthenticatedRequest, res: Response) {
        const studentId = req.params.studentId || req.data?.idUser;

        if (!studentId) {
            return res.status(400).json({
                success: false,
                message: "ID do aluno não fornecido"
            });
        }

        try {
            // Se o usuário logado for um aluno, ele só pode ver suas próprias presenças
            if (req.data?.role === 'student' && req.data?.idUser !== Number(studentId)) {
                return res.status(403).json({
                    success: false,
                    message: "Você não tem permissão para ver registros de presença de outros alunos"
                });
            }

            const [rows] = await db.query(`
                SELECT ar.*, 
                       c.className,
                       c.subject
                FROM AttendanceRecord ar
                JOIN ClassRoom c ON ar.classId = c.idClass
                WHERE ar.studentId = ?
                ORDER BY ar.date DESC
            `, [studentId]);
            
            return res.status(200).json({
                success: true,
                message: "Registros de presença encontrados com sucesso",
                data: rows
            });
        } catch (error) {
            console.error("Erro ao buscar registros de presença:", error);
            return res.status(500).json({
                success: false,
                message: "Erro interno ao buscar registros de presença"
            });
        }
    }

    // Obter resumo de presença por turma (estatísticas)
    async getAttendanceSummaryByClass(req: Request, res: Response) {
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
                SELECT idClass FROM ClassRoom WHERE idClass = ?
            `, [classId]);

            if (Array.isArray(classExists) && classExists.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Turma não encontrada"
                });
            }

            // Buscar todos os alunos matriculados na turma
            const [students] = await db.query(`
                SELECT e.studentId, u.nameUser
                FROM Enrollment e
                JOIN User u ON e.studentId = u.idUser
                WHERE e.classId = ? AND e.status = 'active'
                ORDER BY u.nameUser
            `, [classId]);

            const studentsArray = students as Array<{studentId: number, nameUser: string}>;
            
            // Se não houver alunos, retornar uma lista vazia
            if (studentsArray.length === 0) {
                return res.status(200).json({
                    success: true,
                    message: "Não há alunos matriculados nesta turma",
                    data: []
                });
            }

            // Para cada aluno, buscar suas estatísticas de presença
            const studentsWithStats = [];

            for (const student of studentsArray) {
                // Contar totais por status
                const [statusCounts] = await db.query(`
                    SELECT 
                        COUNT(*) as total,
                        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
                        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
                        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late,
                        SUM(CASE WHEN status = 'excused' THEN 1 ELSE 0 END) as excused
                    FROM AttendanceRecord
                    WHERE studentId = ? AND classId = ?
                `, [student.studentId, classId]);

                const statusCountsArray = statusCounts as Array<{
                    total: number,
                    present: number,
                    absent: number,
                    late: number,
                    excused: number
                }>;
                
                const stats = statusCountsArray[0];
                
                // Calcular porcentagem de presença
                const attendanceRate = stats.total > 0 
                    ? Math.round((stats.present / stats.total) * 100) 
                    : 0;

                studentsWithStats.push({
                    studentId: student.studentId,
                    nameUser: student.nameUser,
                    stats: {
                        total: stats.total,
                        present: stats.present,
                        absent: stats.absent,
                        late: stats.late,
                        excused: stats.excused,
                        attendanceRate: attendanceRate
                    }
                });
            }

            return res.status(200).json({
                success: true,
                message: "Resumo de presença obtido com sucesso",
                data: studentsWithStats
            });
        } catch (error) {
            console.error("Erro ao buscar resumo de presença:", error);
            return res.status(500).json({
                success: false,
                message: "Erro interno ao buscar resumo de presença"
            });
        }
    }

    // Atualizar o status de presença de um aluno específico
    async updateAttendance(req: Request, res: Response) {
        const { idAttendanceRecord } = req.params;
        const { status } = req.body;

        if (!idAttendanceRecord) {
            return res.status(400).json({
                success: false,
                message: "ID do registro de presença não fornecido"
            });
        }

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Novo status não fornecido"
            });
        }

        // Validar status
        const validStatus = ['present', 'absent', 'late', 'excused'];
        if (!validStatus.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status inválido. Valores aceitos: present, absent, late, excused"
            });
        }

        try {
            // Verificar se o registro existe
            const [recordExists] = await db.query(`
                SELECT * FROM AttendanceRecord WHERE idAttendanceRecord = ?
            `, [idAttendanceRecord]);

            if (Array.isArray(recordExists) && recordExists.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Registro de presença não encontrado"
                });
            }

            // Atualizar o status
            await db.query(`
                UPDATE AttendanceRecord
                SET status = ?
                WHERE idAttendanceRecord = ?
            `, [status, idAttendanceRecord]);

            // Buscar o registro atualizado
            const [updatedRecord] = await db.query(`
                SELECT * FROM AttendanceRecord WHERE idAttendanceRecord = ?
            `, [idAttendanceRecord]);
            
            const updatedRecordArray = updatedRecord as Array<AttendanceRecord>;

            return res.status(200).json({
                success: true,
                message: "Status de presença atualizado com sucesso",
                data: updatedRecordArray[0]
            });
        } catch (error) {
            console.error("Erro ao atualizar status de presença:", error);
            return res.status(500).json({
                success: false,
                message: "Erro interno ao atualizar status de presença"
            });
        }
    }

    // Excluir um registro de presença
    async deleteAttendance(req: Request, res: Response) {
        const { idAttendanceRecord } = req.params;

        if (!idAttendanceRecord) {
            return res.status(400).json({
                success: false,
                message: "ID do registro de presença não fornecido"
            });
        }

        try {
            // Verificar se o registro existe
            const [recordExists] = await db.query(`
                SELECT * FROM AttendanceRecord WHERE idAttendanceRecord = ?
            `, [idAttendanceRecord]);

            if (Array.isArray(recordExists) && recordExists.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Registro de presença não encontrado"
                });
            }

            // Excluir o registro
            await db.query(`
                DELETE FROM AttendanceRecord WHERE idAttendanceRecord = ?
            `, [idAttendanceRecord]);

            return res.status(200).json({
                success: true,
                message: "Registro de presença excluído com sucesso"
            });
        } catch (error) {
            console.error("Erro ao excluir registro de presença:", error);
            return res.status(500).json({
                success: false,
                message: "Erro interno ao excluir registro de presença"
            });
        }
    }
}

export default new AttendanceController();