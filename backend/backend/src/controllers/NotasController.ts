import { Request, Response } from "express";
import { db } from "../config/promise";
import { AuthenticatedRequest } from "../middleware/AuthMiddleware";

interface Grade {
    idGrade: number;
    studentId: number;
    classId: number;
    assessmentDate: Date;
    disciplina: string;
    nota: number;
    finalAverage?: number;
}

class NotasController {
    // Obter todas as notas de todas as turmas (acesso apenas para administradores/pedagogos)
    async getAllGrades(req: Request, res: Response) {
        try {
            const [rows] = await db.query(`
                SELECT g.*, 
                       u.userName as studentName, 
                       c.className,
                       c.subject
                FROM Grade g
                JOIN User u ON g.studentId = u.idUser
                JOIN ClassRoom c ON g.classId = c.idClass
                ORDER BY g.classId, g.studentId, g.assessmentDate DESC
            `);
            
            return res.status(200).json({
                success: true,
                message: "Notas listadas com sucesso",
                data: rows
            });
        } catch (error) {
            console.error("Erro ao buscar notas:", error);
            return res.status(500).json({
                success: false,
                message: "Erro interno ao buscar notas"
            });
        }
    }

    // Obter todas as notas de uma turma específica
    async getGradesByClass(req: Request, res: Response) {
        const { classId } = req.params;

        if (!classId) {
            return res.status(400).json({
                success: false,
                message: "ID da turma não fornecido"
            });
        }

        try {
            const [classExists] = await db.query(`
                SELECT idClass FROM ClassRoom WHERE idClass = ?
            `, [classId]);

            if (Array.isArray(classExists) && classExists.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Turma não encontrada"
                });
            }

            const [rows] = await db.query(`
                SELECT g.*, 
                       u.userName as studentName,
                       c.className,
                       c.subject
                FROM Grade g
                JOIN User u ON g.studentId = u.idUser
                JOIN ClassRoom c ON g.classId = c.idClass
                WHERE g.classId = ?
                ORDER BY u.userName, g.assessmentDate DESC
            `, [classId]);
            
            return res.status(200).json({
                success: true,
                message: "Notas da turma listadas com sucesso",
                data: rows
            });
        } catch (error) {
            console.error("Erro ao buscar notas da turma:", error);
            return res.status(500).json({
                success: false,
                message: "Erro interno ao buscar notas da turma"
            });
        }
    }

    // Obter todas as notas de um aluno específico
    async getGradesByStudent(req: AuthenticatedRequest, res: Response) {
        const studentId = req.params.studentId || req.data?.idUser;

        if (!studentId) {
            return res.status(400).json({
                success: false,
                message: "ID do aluno não fornecido"
            });
        }

        try {
            const [studentExists] = await db.query(`
                SELECT idUser FROM User WHERE idUser = ?
            `, [studentId]);

            if (Array.isArray(studentExists) && studentExists.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Aluno não encontrado"
                });
            }

            // Se o usuário logado for um aluno, ele só pode ver suas próprias notas
            if (req.data?.role === 'student' && req.data?.idUser !== Number(studentId)) {
                return res.status(403).json({
                    success: false,
                    message: "Você não tem permissão para ver notas de outros alunos"
                });
            }

            const [rows] = await db.query(`
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
            
            return res.status(200).json({
                success: true,
                message: "Notas do aluno listadas com sucesso",
                data: rows
            });
        } catch (error) {
            console.error("Erro ao buscar notas do aluno:", error);
            return res.status(500).json({
                success: false,
                message: "Erro interno ao buscar notas do aluno"
            });
        }
    }

    // Registrar uma nova nota
    async addGrade(req: Request, res: Response) {
        const { studentId, classId, disciplina, nota, assessmentDate } = req.body;

        if (!studentId || !classId || !disciplina || nota === undefined || !assessmentDate) {
            return res.status(400).json({
                success: false,
                message: "Dados incompletos. Forneça ID do aluno, ID da turma, disciplina, nota e data de avaliação"
            });
        }

        // Validar nota entre 0 e 10
        if (nota < 0 || nota > 10) {
            return res.status(400).json({
                success: false,
                message: "A nota deve estar entre 0 e 10"
            });
        }

        try {
            // Verificar se o aluno existe
            const [studentExists] = await db.query(`
                SELECT idUser FROM User WHERE idUser = ? AND role = 'student'
            `, [studentId]);

            if (Array.isArray(studentExists) && studentExists.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Aluno não encontrado ou usuário não é um aluno"
                });
            }

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

            // Verificar se o aluno está matriculado na turma
            const [enrollmentExists] = await db.query(`
                SELECT idEnrollment FROM Enrollment 
                WHERE studentId = ? AND classId = ? AND status = 'active'
            `, [studentId, classId]);

            if (Array.isArray(enrollmentExists) && enrollmentExists.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "O aluno não está matriculado nesta turma ou a matrícula não está ativa"
                });
            }

            // Gerar ID para a nova nota
            const [maxId] = await db.query(`
                SELECT MAX(idGrade) as maxId FROM Grade
            `);
            const maxIdArray = maxId as Array<{maxId: number}>;
            const nextId = maxIdArray.length && maxIdArray[0].maxId ? Number(maxIdArray[0].maxId) + 1 : 1;

            // Calcular a média final (média das notas do aluno na disciplina)
            const [existingGrades] = await db.query(`
                SELECT nota FROM Grade 
                WHERE studentId = ? AND classId = ? AND disciplina = ?
            `, [studentId, classId, disciplina]);

            const existingGradesArray = existingGrades as Array<{nota: number}>;
            let totalNotes = 0;
            let count = existingGradesArray.length;

            for (const grade of existingGradesArray) {
                totalNotes += grade.nota;
            }

            // Adicionar a nova nota ao cálculo
            totalNotes += nota;
            count += 1;

            const finalAverage = Math.round((totalNotes / count) * 10) / 10; // Arredondado para 1 casa decimal

            // Inserir a nova nota
            await db.query(`
                INSERT INTO Grade (idGrade, studentId, classId, assessmentDate, disciplina, nota, finalAverage)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [nextId, studentId, classId, assessmentDate, disciplina, nota, finalAverage]);

            // Atualizar a média final em todas as notas do aluno para essa disciplina
            await db.query(`
                UPDATE Grade 
                SET finalAverage = ? 
                WHERE studentId = ? AND classId = ? AND disciplina = ?
            `, [finalAverage, studentId, classId, disciplina]);

            return res.status(201).json({
                success: true,
                message: "Nota registrada com sucesso",
                data: {
                    idGrade: nextId,
                    studentId,
                    classId,
                    assessmentDate,
                    disciplina,
                    nota,
                    finalAverage
                }
            });
        } catch (error) {
            console.error("Erro ao registrar nota:", error);
            return res.status(500).json({
                success: false,
                message: "Erro interno ao registrar nota"
            });
        }
    }

    // Atualizar uma nota existente
    async updateGrade(req: Request, res: Response) {
        const { idGrade } = req.params;
        const { nota, assessmentDate } = req.body;

        if (!idGrade) {
            return res.status(400).json({
                success: false,
                message: "ID da nota não fornecido"
            });
        }

        if (nota === undefined && !assessmentDate) {
            return res.status(400).json({
                success: false,
                message: "Nenhum dado fornecido para atualização"
            });
        }

        // Validar nota entre 0 e 10 se fornecida
        if (nota !== undefined && (nota < 0 || nota > 10)) {
            return res.status(400).json({
                success: false,
                message: "A nota deve estar entre 0 e 10"
            });
        }

        try {
            // Verificar se a nota existe e obter seus dados atuais
            const [gradeExists] = await db.query(`
                SELECT * FROM Grade WHERE idGrade = ?
            `, [idGrade]);

            if (Array.isArray(gradeExists) && gradeExists.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Nota não encontrada"
                });
            }

            const gradeExistsArray = gradeExists as Array<Grade>;
            const currentGrade = gradeExistsArray[0];
            const updateValues = [];
            let updateQuery = 'UPDATE Grade SET ';

            // Construir a consulta dinamicamente
            if (nota !== undefined) {
                updateQuery += 'nota = ?, ';
                updateValues.push(nota);
            }

            if (assessmentDate) {
                updateQuery += 'assessmentDate = ?, ';
                updateValues.push(assessmentDate);
            }

            // Se a nota foi alterada, recalcular a média final
            if (nota !== undefined) {
                const [allGrades] = await db.query(`
                    SELECT nota FROM Grade 
                    WHERE studentId = ? AND classId = ? AND disciplina = ? AND idGrade != ?
                `, [currentGrade.studentId, currentGrade.classId, currentGrade.disciplina, idGrade]);

                const allGradesArray = allGrades as Array<{nota: number}>;
                let totalNotes = 0;
                let count = allGradesArray.length;

                for (const grade of allGradesArray) {
                    totalNotes += grade.nota;
                }

                // Adicionar a nota atualizada
                totalNotes += nota;
                count += 1;

                const finalAverage = Math.round((totalNotes / count) * 10) / 10;

                updateQuery += 'finalAverage = ?, ';
                updateValues.push(finalAverage);

                // Atualizar a média em todas as notas relacionadas
                await db.query(`
                    UPDATE Grade 
                    SET finalAverage = ? 
                    WHERE studentId = ? AND classId = ? AND disciplina = ?
                `, [finalAverage, currentGrade.studentId, currentGrade.classId, currentGrade.disciplina]);
            }

            // Remover a vírgula final e adicionar a condição WHERE
            updateQuery = updateQuery.slice(0, -2) + ' WHERE idGrade = ?';
            updateValues.push(idGrade);

            // Executar a atualização
            await db.query(updateQuery, updateValues);

            // Buscar a nota atualizada
            const [updatedGrade] = await db.query(`
                SELECT * FROM Grade WHERE idGrade = ?
            `, [idGrade]);
            
            const updatedGradeArray = updatedGrade as Array<Grade>;

            return res.status(200).json({
                success: true,
                message: "Nota atualizada com sucesso",
                data: updatedGradeArray[0]
            });
        } catch (error) {
            console.error("Erro ao atualizar nota:", error);
            return res.status(500).json({
                success: false,
                message: "Erro interno ao atualizar nota"
            });
        }
    }

    // Excluir uma nota
    async deleteGrade(req: Request, res: Response) {
        const { idGrade } = req.params;

        if (!idGrade) {
            return res.status(400).json({
                success: false,
                message: "ID da nota não fornecido"
            });
        }

        try {
            // Verificar se a nota existe e obter seus dados
            const [gradeExists] = await db.query(`
                SELECT * FROM Grade WHERE idGrade = ?
            `, [idGrade]);

            if (Array.isArray(gradeExists) && gradeExists.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Nota não encontrada"
                });
            }

            const gradeExistsArray = gradeExists as Array<Grade>;
            const currentGrade = gradeExistsArray[0];

            // Excluir a nota
            await db.query('DELETE FROM Grade WHERE idGrade = ?', [idGrade]);

            // Recalcular a média final para as notas restantes
            const [remainingGrades] = await db.query(`
                SELECT nota FROM Grade 
                WHERE studentId = ? AND classId = ? AND disciplina = ?
            `, [currentGrade.studentId, currentGrade.classId, currentGrade.disciplina]);

            const remainingGradesArray = remainingGrades as Array<{nota: number}>;
            
            if (remainingGradesArray.length > 0) {
                let totalNotes = 0;

                for (const grade of remainingGradesArray) {
                    totalNotes += grade.nota;
                }

                const finalAverage = Math.round((totalNotes / remainingGradesArray.length) * 10) / 10;

                // Atualizar a média em todas as notas restantes
                await db.query(`
                    UPDATE Grade 
                    SET finalAverage = ? 
                    WHERE studentId = ? AND classId = ? AND disciplina = ?
                `, [finalAverage, currentGrade.studentId, currentGrade.classId, currentGrade.disciplina]);
            }

            return res.status(200).json({
                success: true,
                message: "Nota excluída com sucesso"
            });
        } catch (error) {
            console.error("Erro ao excluir nota:", error);
            return res.status(500).json({
                success: false,
                message: "Erro interno ao excluir nota"
            });
        }
    }
}

export default new NotasController();
