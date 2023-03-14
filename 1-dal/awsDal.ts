import AWS from 'aws-sdk';
import * as dotenv from 'dotenv'
dotenv.config()

export const s3bucket = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESSKEYID,
    secretAccessKey: process.env.AWS_SECRETKEYACCESSKEY,
});