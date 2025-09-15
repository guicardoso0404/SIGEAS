import { db } from "../config/promise"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { Request, Response } from "express"
import { AuthLoginPayload, AuthResponse } from "../models/AuthModel"
import { User } from "../models/UserModel"

class AuthSession {
    async createLogin(req: Request, res: Response) {
        // aqui eu vou esperar os dados do meu models que está falando quais dados de quais tipos estão vindo.
        const {email, password, nameUser}: AuthLoginPayload = req.body

        if(!email || !password || !nameUser){
            return res.status(400).json({
                message: "Dados incompletos! Preencha todos os campos!", 
                success: false
            })
        }
        
        try {
            const [userExists] = await db.query(`
            SELECT *
                FROM Users
            WHERE email = ? OR nameUser = ?`, [email, nameUser])
            
            const isUserExists = userExists as User[]

            if(isUserExists.length === 0){
                return res.status(400).json({
                    message: "Usuário não existe.",
                    success: false,
                  });
            }

            const user = isUserExists[0]
            const hashPassword = await bcrypt.compare(password, user.password)

            if(!hashPassword){
                return res.status(400).json({
                    message: "Email ou senha estão incorretos",
                    success: false
                })
            }

            const token = jwt.sign({id: user.idUser,email: user.email}, process.env.JWT_SECRET || "SUperSecreto2014", {"expiresIn": "4days"})

            const response: AuthResponse = {
                message: "Email ou senha estão incorretos",
                success: false,
                data: {
                    user,
                    token: token
                },
            }
            return res.status(201).json(response)
        } catch (error) {
            console.error("Erro interno ao fazer login: ", error)
            return res.status(500).json({
                message: 'Erro interno do servidor.',
                success: false,
            })
        }
    }    
}

export default new AuthSession()