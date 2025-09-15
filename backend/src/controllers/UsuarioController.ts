import { Request, Response } from "express";
import { db } from "../config/promise";
import { User } from "../models/UserModel";
import { AuthenticatedRequest } from "../middleware/AuthMiddleware";

class UserController {
    async getAllUsers(req: Request, res: Response) {
        try {
            const [rows] = await db.query("SELECT * FROM Users")
            const users = rows as User[]
            return res.status(200).json({
                message: "Sucesso ao exibir todos os usuários!",
                success: true,
                data: users[0]
            })
        } catch (error) {
            console.error("Erro ao buscar usuários", error)
            return res.status(500).json({
                message: "Erro interno ao buscar usuários",
                success: false,
            })
        }
    }

    async getUserById(req: Request, res: Response) {
        const {idUser} = req.params

        if(!idUser){
            return res.status(400).json({message: "Dados incomplementos!", success: false})
        }

        try {
            const [rows] = await db.query(`
            SELECT *
            FROM Users
            WHERE idUser = ?`, [idUser])
            const user = rows as User[]

            if(user.length === 0){
                return res.status(404).json({message: "User não encontrado."})
            }

            return res.status(200).json(user)
        } catch (error) {
            console.error('Error fetching user:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    async createUser(req: Request, res: Response) {
        const {nameUser, email, password} = req.body

        if(!nameUser || !email || !password){
            return res.status(400).json({message: "Dados incomplementos!", success: false})
        }

        try {
            const [isAlreadyCreated] = await db.query(`
            SELECT idUser, nameUser
            FROM User
            WHERE nameUser = ? AND email = ?
            `, [nameUser, email])
            const isAlreadyCreatedUser = isAlreadyCreated as User[]

            if(isAlreadyCreatedUser.length > 0) {
                return res.status(409).json({
                    message: "Categoria já existe",
                    success: false
                })
            }

            const [rows] = await db.query(`
            INSERT INTO User(nameUser, email, password)
            VALUES
            (?, ?, ?)`, [nameUser, email, password])
            const user = rows as User[]

            return res.status(200).json(user)
        } catch (error) {
            console.error('Error fetching user:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    
    async updateUserEmail(req: AuthenticatedRequest, res: Response) {
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
            SELECT * 
            FROM Users
            WHERE userId = 
            `, [userId])

            
        } catch (error) {
            
        }
    }
    
}

export default new UserController()