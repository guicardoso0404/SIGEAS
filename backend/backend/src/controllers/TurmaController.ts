import { Request, Response } from "express";
import { db } from "../config/promise";
import { AuthenticatedRequest } from "../middleware/AuthMiddleware";

interface ClassRoom {
    idClass: number;
    className: string;
    teacherId: number;
    subject: string;
}

class TurmaController {
    // Listar todas as turmas
    async getAllClasses(req: Request, res: Response) {
        try {
            const [rows] = await db.query(`
                SELECT c.*, u.nameUser as teacherName
                FROM ClassRoom c
                JOIN User u ON c.teacherId = u.idUser
            `);
            
            return res.status(200).json({
                success: true,
                message: "Turmas listadas com sucesso",
                data: rows
            });
        } catch (error) {
            console.error("Erro ao buscar turmas:", error);
            return res.status(500).json({
                success: false,
                message: "Erro interno ao buscar turmas"
            });
        }
    }

    // Buscar turma por ID
    async getClassById(req: Request, res: Response) {
        const { idClass } = req.params;

        if (!idClass) {
            return res.status(400).json({
                success: false,
                message: "ID da turma não fornecido"
            });
        }

        try {
            const [rows] = await db.query(`
                SELECT c.*, u.nameUser as teacherName
                FROM ClassRoom c
                JOIN User u ON c.teacherId = u.idUser
                WHERE c.idClass = ?
            `, [idClass]);
            
            const classes = rows as ClassRoom[];

            if (classes.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Turma não encontrada"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Turma encontrada com sucesso",
                data: classes[0]
            });
        } catch (error) {
            console.error("Erro ao buscar turma:", error);
            return res.status(500).json({
                success: false,
                message: "Erro interno ao buscar turma"
            });
        }
    }

    // Buscar turmas de um professor
    async getClassesByTeacher(req: AuthenticatedRequest, res: Response) {
        const teacherId = req.data?.idUser;

        if (!teacherId) {
            return res.status(400).json({
                success: false,
                message: "ID do professor não fornecido"
            });
        }

        try {
            const [rows] = await db.query(`
                SELECT c.*, u.nameUser as teacherName
                FROM ClassRoom c
                JOIN User u ON c.teacherId = u.idUser
                WHERE c.teacherId = ?
            `, [teacherId]);
            
            return res.status(200).json({
                success: true,
                message: "Turmas do professor listadas com sucesso",
                data: rows
            });
        } catch (error) {
            console.error("Erro ao buscar turmas do professor:", error);
            return res.status(500).json({
                success: false,
                message: "Erro interno ao buscar turmas do professor"
            });
        }
    }

    // Criar nova turma
    async createClass(req: Request, res: Response) {
        const { className, teacherId, subject } = req.body;

        if (!className || !teacherId || !subject) {
            return res.status(400).json({
                success: false,
                message: "Dados incompletos. Forneça nome da turma, ID do professor e disciplina"
            });
        }

        try {
            // Verificar se o professor existe
            const [teacherExists] = await db.query(`
                SELECT idUser FROM User WHERE idUser = ? AND role = 'teacher'
            `, [teacherId]);

            if (Array.isArray(teacherExists) && teacherExists.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Professor não encontrado ou usuário não é um professor"
                });
            }

            // Gerar ID para a nova turma (em produção você usaria uma abordagem melhor)
            const [maxId] = await db.query(`
                SELECT MAX(idClass) as maxId FROM ClassRoom
            `);
            const maxIdArray = maxId as Array<{maxId: number}>;
            const nextId = maxIdArray.length && maxIdArray[0].maxId ? Number(maxIdArray[0].maxId) + 1 : 1;

            // Inserir a nova turma
            await db.query(`
                INSERT INTO ClassRoom (idClass, className, teacherId, subject)
                VALUES (?, ?, ?, ?)
            `, [nextId, className, teacherId, subject]);

            return res.status(201).json({
                success: true,
                message: "Turma criada com sucesso",
                data: {
                    idClass: nextId,
                    className,
                    teacherId,
                    subject
                }
            });
        } catch (error) {
            console.error("Erro ao criar turma:", error);
            return res.status(500).json({
                success: false,
                message: "Erro interno ao criar turma"
            });
        }
    }

    // Atualizar uma turma existente
    async updateClass(req: Request, res: Response) {
        const { idClass } = req.params;
        const { className, teacherId, subject } = req.body;

        if (!idClass) {
            return res.status(400).json({
                success: false,
                message: "ID da turma não fornecido"
            });
        }

        if (!className && !teacherId && !subject) {
            return res.status(400).json({
                success: false,
                message: "Nenhum dado fornecido para atualização"
            });
        }

        try {
            // Verificar se a turma existe
            const [classExists] = await db.query(`
                SELECT * FROM ClassRoom WHERE idClass = ?
            `, [idClass]);

            if (Array.isArray(classExists) && classExists.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Turma não encontrada"
                });
            }

            // Se teacherId foi fornecido, verificar se o professor existe
            if (teacherId) {
                const [teacherExists] = await db.query(`
                    SELECT idUser FROM User WHERE idUser = ? AND role = 'teacher'
                `, [teacherId]);

                if (Array.isArray(teacherExists) && teacherExists.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Professor não encontrado ou usuário não é um professor"
                    });
                }
            }

            // Construir a consulta SQL de atualização dinamicamente
            let updateQuery = 'UPDATE ClassRoom SET ';
            const updateValues = [];
            
            if (className) {
                updateQuery += 'className = ?, ';
                updateValues.push(className);
            }
            
            if (teacherId) {
                updateQuery += 'teacherId = ?, ';
                updateValues.push(teacherId);
            }
            
            if (subject) {
                updateQuery += 'subject = ?, ';
                updateValues.push(subject);
            }

            // Remover a vírgula final e adicionar a condição WHERE
            updateQuery = updateQuery.slice(0, -2) + ' WHERE idClass = ?';
            updateValues.push(idClass);

            // Executar a atualização
            await db.query(updateQuery, updateValues);

            // Buscar a turma atualizada
            const [updatedClass] = await db.query(`
                SELECT * FROM ClassRoom WHERE idClass = ?
            `, [idClass]);
            
            const updatedClassArray = updatedClass as Array<ClassRoom>;

            return res.status(200).json({
                success: true,
                message: "Turma atualizada com sucesso",
                data: updatedClassArray[0]
            });
        } catch (error) {
            console.error("Erro ao atualizar turma:", error);
            return res.status(500).json({
                success: false,
                message: "Erro interno ao atualizar turma"
            });
        }
    }

    // Excluir uma turma
    async deleteClass(req: Request, res: Response) {
        const { idClass } = req.params;

        if (!idClass) {
            return res.status(400).json({
                success: false,
                message: "ID da turma não fornecido"
            });
        }

        try {
            // Verificar se a turma existe
            const [classExists] = await db.query(`
                SELECT * FROM ClassRoom WHERE idClass = ?
            `, [idClass]);

            if (Array.isArray(classExists) && classExists.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Turma não encontrada"
                });
            }

            // Excluir registros relacionados primeiro (boas práticas para integridade referencial)
            await db.query('DELETE FROM Enrollment WHERE classId = ?', [idClass]);
            await db.query('DELETE FROM Grade WHERE classId = ?', [idClass]);
            await db.query('DELETE FROM AttendanceRecord WHERE classId = ?', [idClass]);
            await db.query('DELETE FROM Assignment WHERE classId = ?', [idClass]);

            // Excluir a turma
            await db.query('DELETE FROM ClassRoom WHERE idClass = ?', [idClass]);

            return res.status(200).json({
                success: true,
                message: "Turma excluída com sucesso"
            });
        } catch (error) {
            console.error("Erro ao excluir turma:", error);
            return res.status(500).json({
                success: false,
                message: "Erro interno ao excluir turma"
            });
        }
    }
}

export default new TurmaController();
