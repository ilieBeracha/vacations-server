import { s3bucket } from "../1-dal/awsDal";
import * as dotenv from 'dotenv';
dotenv.config()

export async function saveImagesToS3(file: any, imageId: string) {
    try {
        const type = file.name.split('.')[1];
        const params:any = {
            Body: file.data,
            Key: `${imageId}.${type}`,
            Bucket: process.env.AWS_BUCKET,
        }
        await s3bucket.upload(params).promise()
        return params.Key
    } catch (err: any) {
        throw new Error(`S3 upload error: ${err.message}`)
    }
}

export async function deleteImageFromS3(imageId: string) {
    const params:any = { Bucket: process.env.AWS_BUCKET, Key: imageId };
    try {
        const results = await s3bucket.deleteObject(params).promise();
        return results
    } catch (e) {
        console.log(e);
    }
}