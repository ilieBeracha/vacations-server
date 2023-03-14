import { OkPacket } from "mysql2";
import { execute } from "../1-dal/dalSql";
import { VacationInterface } from "../4-models/VacationModel";
import { deleteImageFromS3, saveImagesToS3 } from "./awsLogic";
const uniqid = require('uniqid');

export async function getAllVacations(userId: number, offset: number, likes: string, active: string, coming: string) {
    if (likes === 'true') {
        const query = `SELECT v.id, v.destination, v.description, DATE_FORMAT(v.startingDate, "%Y-%m-%d") AS startingDate, DATE_FORMAT(v.endingDate, "%Y-%m-%d") AS endingDate, v.price, v.imageName, 
        (SELECT vl.userId FROM likes vl WHERE vl.userId = ${userId} AND vl.vacationId = v.id) AS userLikes, 
        (SELECT COUNT(*) FROM likes vl WHERE vl.vacationId = v.id) AS totalLikes
        FROM vacations v
        JOIN likes l ON v.id = l.vacationId
        WHERE l.userId = ${userId}
        GROUP BY v.id
        ORDER BY startingDate
        LIMIT 10 OFFSET ${offset}`
        const [results] = await execute<OkPacket>(query);
        return results;

    } else if (active === 'true') {
        const query = `SELECT id ,destination, description, DATE_FORMAT(startingDate, "%Y-%m-%d") AS startingDate, DATE_FORMAT(endingDate, "%Y-%m-%d") AS endingDate, price, imageName, (select vl.userId from likes vl where vl.userId = ${userId} and vl.vacationId = v.id) as userLikes, (select count(*) from likes vl where vl.vacationId = v.id) as totalLikes from vacations.vacations v where startingDate < now() AND endingDate > now() ORDER BY startingDate LIMIT 10 OFFSET ${offset}`
        const [results] = await execute(query);
        return results;

    } else if (coming === 'true') {
        const query = `SELECT id ,destination, description, DATE_FORMAT(startingDate, "%Y-%m-%d") AS startingDate, DATE_FORMAT(endingDate, "%Y-%m-%d") AS endingDate, price, imageName, (select vl.userId from likes vl where vl.userId = ${userId} and vl.vacationId = v.id) as userLikes, (select count(*) from likes vl where vl.vacationId = v.id) as totalLikes from vacations.vacations v  where startingDate > now() ORDER BY startingDate LIMIT 10 OFFSET ${offset}`
        const [results] = await execute(query);
        return results;
    }
    const query = `SELECT id ,destination, description, DATE_FORMAT(startingDate, "%Y-%m-%d") AS startingDate, DATE_FORMAT(endingDate, "%Y-%m-%d") AS endingDate, price, imageName, (select vl.userId from likes vl where vl.userId = ${userId} and vl.vacationId = v.id) as userLikes, (select count(*) from likes vl where vl.vacationId = v.id) as totalLikes from vacations.vacations v ORDER BY startingDate limit 10 offset ${offset}`
    const [results] = await execute<OkPacket>(query);
    return results;
}

export async function addVacation(vacation: VacationInterface, file: any) {
    const imageKey = uniqid();
    let key = await saveImagesToS3(file, imageKey)
    const { destination, description, startingDate, endingDate, price } = vacation;
    const query = 'INSERT INTO vacations(destination,description,startingDate,endingDate,price,imageName) VALUES(?,?,?,?,?,?)';
    const [results] = await execute<OkPacket>(query, [destination, description, startingDate, endingDate, price, key]);
    return results;
}

export async function deleteVacation(id: number) {
    const getImageNameQuery = 'SELECT imageName FROM vacations WHERE id = ?'
    const [imageNameResults] = await execute<OkPacket>(getImageNameQuery, [id]);
    await deleteImageFromS3(imageNameResults[0].imageName);

    const query = 'DELETE FROM vacations WHERE id = ?'
    const [results] = await execute<OkPacket>(query, [id])
    return results;
}

export async function editVacation(vacation: VacationInterface, file: any) {
    if (file) {
        const { destination, description, startingDate, endingDate, price, id } = vacation;
        const getPrevFileFromDb = 'SELECT imageName FROM vacations WHERE id = ?'
        const [prevFileResults] = await execute<OkPacket>(getPrevFileFromDb, [id]);
        await deleteImageFromS3(prevFileResults[0].imageName)

        const imageKey = uniqid();
        let key = await saveImagesToS3(file.imageName, imageKey)
        const query = 'UPDATE vacations SET destination = ?, description = ?, startingDate = ?, endingDate = ?, price = ?,imageName = ? WHERE id = ?';
        const [results] = await execute<OkPacket>(query, [destination, description, startingDate, endingDate, price, key, id]);
        return results;
    } else {
        const { destination, description, startingDate, endingDate, price, id } = vacation;
        const query = 'UPDATE vacations SET destination = ?, description = ?, startingDate = ?, endingDate = ?, price = ? WHERE id = ?';
        const [results] = await execute<OkPacket>(query, [destination, description, startingDate, endingDate, price, id]);
        return results;
    }

}

export async function getSumOfVacations(userId:number,likes: any, active: any, coming: any) {
    if (likes === 'true') {
        const query = `SELECT count(*) as vacationsSum FROM vacations JOIN likes ON vacations.Id = likes.vacationId WHERE likes.userId = ${userId}`
        const [results] = await execute(query);
        return results;
    } else if (active === "true") {
        const query = 'SELECT count(*) as vacationsSum FROM vacations WHERE startingDate < now() AND endingDate > now()'
        const [results] = await execute(query);
        return results;
    } else if (coming === "true") {
        const query = 'SELECT count(*) as vacationsSum FROM vacations where startingDate > now()'
        const [results] = await execute(query);
        return results;
    }
    const query = 'SELECT count(*) as vacationsSum FROM vacations';
    const [results] = await execute(query);
    return results;
}