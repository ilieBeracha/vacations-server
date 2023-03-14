import express from 'express';
import { getIdFromToken } from '../1-dal/jwt';
import { getAllLikesForGraph, likeOrUnlikeVacation } from '../2-logic/likesLogic';
import { verifyUser } from '../3-middlewares/verifyUser';

export const LikesRoute = express.Router();

LikesRoute.post('/likes', verifyUser, async (req: any, res: any) => {
    const vacationId = req.body.vacationId;
    try {
        const token = req.headers.authorization;
        const userId = await getIdFromToken(token);
        const response = await likeOrUnlikeVacation(Number(userId), vacationId);
        res.status(200).json(response);
    } catch (e) {
        res.status(400).json(e)
    }
})

LikesRoute.get('/likes/graph',async (req,res)=>{
    try{
        const response = await getAllLikesForGraph();
        res.status(200).json(response);
    }catch(e){
        res.status(400).json(e)
    }
})