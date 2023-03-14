import * as jwt from 'jsonwebtoken';
import { UserInterface } from '../4-models/UserModel';

export const PRIVATE_KEY = "BDJKQsalbjsakbdjsabdjsbdWBDKJQWBJDQWD"

export async function generateToken(user: UserInterface) {
    return jwt.sign({
        'sub': user.id,
        'firstName': user.firstName,
        'lastName': user.lastName,
        'email': user.email,
        'role': user.role
    }, PRIVATE_KEY)
}


export async function getIdFromToken(token: any) {    
    try {
        const verifyToken = jwt.verify(token.substring(7), PRIVATE_KEY);
        return verifyToken.sub
    } catch (e) {
        return e
    }
}