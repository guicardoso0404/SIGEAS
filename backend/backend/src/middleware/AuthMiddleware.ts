import { NextFunction, Response, Request  } from "express";
import { AuthJwtPayload } from "../models/AuthModel";
import * as jwt from 'jsonwebtoken';

// Estende o tipo padrão do Request para incluir a propriedade "data" para que depois possa acessar o req.data. o conteudo

export interface AuthenticatedRequest extends Request {
    data?: AuthJwtPayload;
  }

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    console.log('🔍 AuthMiddleware - Headers recebidos:', req.headers.authorization ? 'Authorization header presente' : 'Authorization header ausente');
    
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1]

    if(!token){
        console.log('❌ AuthMiddleware - Token não fornecido');
        return res.status(401).json({
            success: false,
            message: 'Token não fornecido. Acesso negado.',
            loginRequired: true,
          })
    }
    
    console.log('✅ AuthMiddleware - Token recebido:', token.substring(0, 20) + '...');
    
    try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET as string
        ) as AuthJwtPayload;
        
        console.log('✅ AuthMiddleware - Token decodificado. Usuário:', decoded.idUser, 'Role:', decoded.role);
        req.data = decoded; // Injetar payload no request
        next();
      } catch (error) {
        console.log('❌ AuthMiddleware - Erro ao verificar token:', error);
        return res.status(401).json({
          success: false,
          message: 'Sessão expirada ou token inválido.',
          loginRequired: true,
        });
      }
}