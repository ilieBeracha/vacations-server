import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { PRIVATE_KEY } from "../1-dal/jwt";

export async function verifyUser(req: Request, res: Response, next: NextFunction) {
    let token: any = req.headers.authorization?.substring(7);
    if (!token) {
        res.status(401).send('Token not found');
        return;
    }
    
    try {
        verify(token, PRIVATE_KEY);        
        next();

    } catch (e) {
        res.status(401).send('not verified');
    }
}
