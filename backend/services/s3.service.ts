import { S3_BUCKET, S3_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } from "../config/env";
import { S3Client, ListObjectsV2Command, DeleteObjectsCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getS3Client(): S3Client {
    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !S3_REGION) {
        console.error('AWS S3: Missing required environment variables', {
            hasAccessKeyId: !!AWS_ACCESS_KEY_ID,
            hasSecretAccessKey: !!AWS_SECRET_ACCESS_KEY,
            hasRegion: !!S3_REGION,
        });
        throw new Error('AWS S3 initialization failed: Missing credentials');
    }

    return new S3Client({
        region: S3_REGION,
        credentials: {
            accessKeyId: AWS_ACCESS_KEY_ID,
            secretAccessKey: AWS_SECRET_ACCESS_KEY,
        },
        forcePathStyle: false, // Use virtual-hosted style URLs
    });
}

type UploadFile = {
    name: any,
    buffer: any,
    contentType: any
}

//uploadFiles (bucket,boxId,files)
export async function uploadFiles(ownerId: string, boxId: string, files: UploadFile[]) {
    const client = getS3Client();
    const prefix = `${ownerId}/${boxId}/`;
    const uploadPromises = files.map(file => {
        const params = {
            Bucket: S3_BUCKET,
            Key: `${prefix}${file.name}`,
            Body: file.buffer,
            ContentType: file.contentType,
        };
        return client.send(new PutObjectCommand(params));
    });
    await Promise.all(uploadPromises);
    return true;
}

// Generate presigned URL for direct upload to S3
export async function getPresignedUploadUrl(ownerId: string, boxId: string, fileName: string, contentType: string) {
    const client = getS3Client();
    const key = `${ownerId}/${boxId}/${fileName}`;
    
    const command = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        ContentType: contentType,
    });
    
    const presignedUrl = await getSignedUrl(client, command, { 
        expiresIn: 3600,
    });
    return { presignedUrl, key };
}

//listFiles (bucket,ownerId,boxId)
export async function listFiles(ownerId: string, boxId: string) {
    const client = getS3Client();
    const prefix = `${ownerId}/${boxId}/`;

    try {
        const files = await client.send(
            new ListObjectsV2Command({
                Bucket: S3_BUCKET,
                Prefix: prefix,
            })
        );
        return files.Contents ?? [];
    } catch (error) {
        console.error("Error listing box files:", error);
        return [];
    }
}

//deleteFiles (bucket,ownerId,boxId)
export async function deleteFiles(ownerId: string, boxId: string) {
    const client = getS3Client();

    try {
        const listResponse = await listFiles(ownerId, boxId);
        if (!listResponse || listResponse.length === 0) {
            return true;
        }

        const deleteParams = {
            Bucket: S3_BUCKET,
            Delete: {
                Objects: listResponse.map(obj => ({
                    Key: obj.Key!,
                })),
            },
        };

        await client.send(new DeleteObjectsCommand(deleteParams));
        return true;
    } catch (error) {
        console.error("Error deleting box files:", error);
        return false;
    }
}