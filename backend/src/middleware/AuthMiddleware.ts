import { NextFunction, Response, Request  } from "express";
import { AuthJwtPayload } from "../models/AuthModel";
import jwt from 'jsonwebtoken';

// Estende o tipo padrão do Request para incluir a propriedade "data" para que depois possa acessar o req.data. o conteudo

export interface AuthenticatedRequest extends Request {
    data?: AuthJwtPayload;
  }

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1]

    if(!token){
        return res.status(401).json({
            success: false,
            message: 'Token não fornecido. Acesso negado.',
            loginRequired: true,
          })
    }
    try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET as string
        ) as AuthJwtPayload;
        req.data = decoded; // Injetar payload no request
        next();
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Sessão expirada ou token inválido.',
          loginRequired: true,
        });
      }
}