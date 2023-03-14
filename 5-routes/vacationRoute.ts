import express from 'express';
import { execute } from '../1-dal/dalSql';
import { getIdFromToken } from '../1-dal/jwt';
import { addVacation, deleteVacation, editVacation, getAllVacations, getSumOfVacations } from '../2-logic/vacationLogic';
import { verifyUser } from '../3-middlewares/verifyUser';

export const VacationRoute = express.Router();

VacationRoute.get('/vacation', verifyUser, async (req: any, res: any) => {
    const offset = req.query.offset || 0
    const likes = req.query.likes
    const active = req.query.active
    const coming = req.query.coming

    try {
        const token = req.headers.authorization;
        const userId: any = await getIdFromToken(token);
        const response = await getAllVacations(userId, +offset, likes, active, coming);
        res.status(200).json(response)
    } catch (e) {
        res.status(400).json(e)
    }
})

VacationRoute.post('/vacation/add', verifyUser, async (req: any, res: any) => {
    const vacation = req.body
    const file = req.files.imageName
    try {
        const response = await addVacation(vacation, file);
        res.status(200).json(response)
    } catch (e) {
        res.status(400).json(e)
    }
})

VacationRoute.delete('/vacation/delete/:id', verifyUser, async (req: any, res: any) => {
    const id = req.params.id;
    try {
        const response = await deleteVacation(+id);
        res.status(200).json(response);
    } catch (e) {
        res.status(400).json(e)
    }
})

VacationRoute.put('/vacation/edit', async (req: any, res: any) => {
    const vacation = req.body
    const file = req.files
    try {
        const response = await editVacation(vacation, file);
        res.status(200).json(response)
    } catch (e) {
        res.status(400).json(e)
    }
})

VacationRoute.get('/vacation/sum', async (req, res) => {
    const likes = req.query.likes
    const active = req.query.active
    const coming = req.query.coming
    try {
        const token = req.headers.authorization;
        const userId: any = await getIdFromToken(token);
        const response = await getSumOfVacations(userId, likes, active, coming);
        res.status(200).json(response)
    } catch (e) {
        res.status(400).json(e)
    }
})