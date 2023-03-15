import express from 'express';
import { hashedPassword } from '../1-dal/hashedPssword';
import { generateToken } from '../1-dal/jwt';
import { getAllUsers, register } from '../2-logic/usersLogic';
import { UserInterface } from '../4-models/UserModel';

export const UserRoute = express.Router();

UserRoute.post('/register', async (req, res) => {
    const user: UserInterface = req.body;
    user.password = hashedPassword(user.password)
    try {
        const response = await register(user)
        console.log(response);
        if (response.length > 0) {
            console.log('have');
            
            res.status(404).json(response)
            return;
        } else {
            console.log('registered');
            
            const token = await generateToken(user)
            res.status(200).json(token)
        }

    } catch (e) {
        res.status(400).json(e)
    }
})

UserRoute.post('/login', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const users = await getAllUsers();
    try {
        const user: any = users.find((u: any) => u.email === email && u.password === hashedPassword(password));
        if (user) {
            const token = await generateToken(user)
            res.status(200).json(token);
        } else {
            res.status(401).json('Wrong email or password');
        }
    } catch (e) {
        res.status(400).json('Something went wrong...')
    }
})