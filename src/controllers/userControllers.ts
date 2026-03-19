import type { Request, Response } from "express";
import * as userService from "../services/userServices"
import { findDepartment } from "../services/departmentServices";

export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            nombre, apellido, rol, email, telefono, departamento
        } = req.body;
        
        const newUser = userService.createUser({
            nombre, apellido, rol, email, telefono, departamento:{
                connect:{
                    id:departamento
                }
            }
        })
        res.status(201).json({
            success: true,
            data: newUser,
        });
    }
    catch (error: any) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error al crear el usuario',
            error: error.message,
        });
    }
}