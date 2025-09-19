import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "./AuthMiddleware";
import { UserRole } from "../models/UserModel";

/**
 * Middleware que verifica se o usuário possui um dos perfis permitidos
 * @param allowedRoles Array de perfis que têm permissão para acessar a rota
 */
export const roleMiddleware = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Verifica se o usuário está autenticado e tem um perfil definido
    if (!req.data || !req.data.role) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado ou perfil não definido.',
        loginRequired: true,
      });
    }

    // Verifica se o perfil do usuário está na lista de perfis permitidos
    if (!allowedRoles.includes(req.data.role)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Você não tem permissão para acessar este recurso.',
      });
    }

    // Se o usuário tem permissão, continua para o próximo middleware/controlador
    next();
  };
};

// Middlewares específicos para diferentes tipos de usuários
export const isPedagogue = roleMiddleware(['pedagogue']);
export const isTeacher = roleMiddleware(['teacher']);
export const isStudent = roleMiddleware(['student']);
export const isTeacherOrPedagogue = roleMiddleware(['teacher', 'pedagogue']);
export const isPedagogueOrStudent = roleMiddleware(['pedagogue', 'student']);