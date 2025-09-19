import { Request, Response } from "express";
import { db } from "../config/promise";
import { User } from "../models/UserModel";
import { AuthenticatedRequest } from "../middleware/AuthMiddleware";
import { AuthError, AuthResponseSuccess } from "../models/AuthModel";

class UserController {
    async getAllUsers(req: Request, res: Response) {
        const responseError = {
            message: "Erro ao exibir todos os Usuários!",
            success: false
        } as AuthError

        try {
            const [rows] = await db.query("SELECT * FROM User")
            const users = rows as User[]

            // Não usamos AuthResponseSuccess aqui porque é para um array de usuários
            return res.status(200).json({
                message: "Sucesso ao exibir todos os usuários!",
                success: true,
                data: users
            })
        } catch (error) {
            console.error("Erro ao buscar usuários", error)
            return res.status(500).json(responseError)
        }
    }

    async getUserById(req: Request, res: Response) {
        const {idUser} = req.params

        if(!idUser){
            return res.status(400).json({message: "Dados incompletos!", success: false})
        }

        try {
            const [rows] = await db.query(`
            SELECT *
            FROM User
            WHERE idUser = ?`, [idUser])
            const user = rows as User[]

            if(user.length === 0){
                return res.status(404).json({message: "Usuário não encontrado."})
            }

            return res.status(200).json(user)
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    }

    async createUser(req: Request, res: Response) {
        const {userName, email, password, role, age} = req.body

        if(!userName || !email || !password || !role){
            return res.status(400).json({message: "Dados incompletos!", success: false})
        }

        try {
            const [isAlreadyCreated] = await db.query(`
            SELECT idUser, userName
            FROM User
            WHERE email = ?
            `, [email])
            const isAlreadyCreatedUser = isAlreadyCreated as User[]

            if(isAlreadyCreatedUser.length > 0) {
                return res.status(409).json({
                    message: "Usuário já existe",
                    success: false
                })
            }

            const [rows] = await db.query(`
            INSERT INTO User(userName, email, password, role, age)
            VALUES
            (?, ?, ?, ?, ?)`, [userName, email, password, role, age || null])

            return res.status(201).json({
                message: "Usuário criado com sucesso",
                success: true
            })
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    }
    
    async updateUserEmail(req: AuthenticatedRequest, res: Response) {
        const responseNotFound = {
            message: "Usuário não existe.",
            success: false,
        } as AuthError

        const userId = req.data?.idUser
        const {email} = req.body

        if(!email) {
            return res.status(400).json({
                message: "Preencha todos os dados!",
                success: false,
            })
        }

        try {
            const [rows] = await db.query(`
            SELECT idUser, email
            FROM User
            WHERE idUser = ?
            `, [userId])
            const user = rows as User[]

            if(user.length === 0){
                return res.status(400).json(responseNotFound)
            }

            await db.query(`
            UPDATE User
            SET email = ?
            WHERE idUser = ?
            `, [email, userId])
            
            return res.status(200).json({
                message: "Sucesso ao atualizar o email do usuário.",
                success: true
            })
        } catch (error) {
            console.error("Erro ao atualizar o email do usuário: ", error)
            return res.status(500).json(
                { message: 'Erro interno ao atualizar usuário', success: false } as AuthError
            );
        }
    } 

    async updateUserNameUser(req: AuthenticatedRequest, res: Response){
        const userId = req.data?.idUser
        const {userName} = req.body

        if(!userName || !userId){
            return res.status(400).json({
                message: "Preencha todos os dados.",
                success: false,
            } as AuthError)
        }

        try {
            const [rows] = await db.query(`
            SELECT * FROM User WHERE idUser = ?
            `, [userId])
            const user = rows as User[]

            if (user.length === 0) {
                return res.status(404).json({
                    message: "Usuário não encontrado.",
                    success: false,
                } as AuthError)
            }

            // Verificar se o nome de usuário já está em uso
            const [existingUser] = await db.query(`
            SELECT * FROM User WHERE userName = ? AND idUser != ?
            `, [userName, userId])
            const exists = existingUser as User[]

            if (exists.length > 0) {
                return res.status(409).json({
                    message: "Nome de usuário já está em uso.",
                    success: false,
                } as AuthError)
            }

            // Atualizar o nome do usuário
            await db.query(`
            UPDATE User
            SET userName = ?
            WHERE idUser = ?
            `, [userName, userId])
            
            return res.status(200).json({
                message: "Sucesso ao atualizar o nome do usuário.",
                success: true
            })
        } catch (error) {
            console.error("Erro ao atualizar o nome do usuário: ", error)
            return res.status(500).json({ 
                message: 'Erro interno ao atualizar usuário', 
                success: false 
            } as AuthError)
        }
    }
    
}

export default new UserController()