import type { Request, Response, NextFunction } from "express";

// El campo `rol` es texto libre y puede venir con capitalización inconsistente
// (ej. "Administrador" vs "ADMINISTRADOR"), por eso se normaliza antes de comparar.
function normalizarRol(rol: string | undefined): string {
  return (rol ?? "").trim().toUpperCase();
}

/**
 * Permite el acceso solo a usuarios con rol ADMINISTRADOR.
 * Debe usarse después de authMiddleware (que ya pobló req.user).
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (normalizarRol(req.user?.rol) !== "ADMINISTRADOR") {
    res.status(403).json({
      success: false,
      message: "Acceso denegado. Se requieren permisos de administrador.",
    });
    return;
  }
  next();
};

export { normalizarRol };
