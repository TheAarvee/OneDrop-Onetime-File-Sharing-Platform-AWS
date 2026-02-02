import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand, DeleteCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { deleteFiles } from "./s3.service";
import { BOX_SHARES_TABLE, BOXES_TABLE, S3_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } from "../config/env";

const client = new DynamoDBClient({
    region: S3_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID!,
        secretAccessKey: AWS_SECRET_ACCESS_KEY!,
    },
});
const docClient = DynamoDBDocumentClient.from(client);

interface Box {
    boxId: string;
    ownerId: string;
    boxName: string;
    boxImage: string;
    status: boolean;
    createdAt: number;
}

interface BoxShare {
    shareToken: string;
    boxId: string;
    expiresAt: number;
    downloadCount: number;
}

//InsertBox(boxId,ownerId,boxName,status,createdAt)
export async function insertBox(box: Box) {
    const params = {
        TableName: BOXES_TABLE,
        Item: box,
        ConditionExpression: "attribute_not_exists(boxId)",
    };

    try {
        await docClient.send(new PutCommand(params));
        return true;
    } catch (error) {
        console.error("Error inserting box:", error);
        return false;
    }
}

//GetBox(ownerId)
export async function getBoxes(ownerId: string) {

    if (!ownerId) {
        throw new Error("There is no OwnerId!");
    }
    const params = {
        TableName: BOXES_TABLE,
        IndexName: "ownerId-index",
        KeyConditionExpression: "ownerId = :ownerId",
        ExpressionAttributeValues: {
            ":ownerId": ownerId
        },
    }
    try {
        const data = await docClient.send(new QueryCommand(params));
        return data.Items ?? [];
    } catch (error) {
        console.error("Error getting box:", error);
        return [];
    }

}

//DeleteBox(boxId) along files call deletfiles(s3)
export async function deleteBox(ownerId: string, boxId: string) {
    const params = {
        TableName: BOXES_TABLE,
        Key: {
            boxId: boxId
        }
    }
    try {
        await deleteFiles(ownerId, boxId);
        await docClient.send(new DeleteCommand(params));
        return true;
    } catch (error) {
        console.error("Error deleting box:", error);
        return false;
    }
}

//Insert BoxShare(shareToken,boxId,expiresAt,downloadCount)
export async function insertBoxShare(boxShare: BoxShare) {
    const params = {
        TableName: BOX_SHARES_TABLE,
        Item: boxShare,
        ConditionExpression: "attribute_not_exists(shareToken)",
    };

    try {
        await docClient.send(new PutCommand(params));
        return true;
    } catch (error) {
        console.error("Error inserting box:", error);
        return false;
    }
}

//GetBoxShare(shareToken)
export async function getBoxShare(shareToken: string) {
    const params = {
        TableName: BOX_SHARES_TABLE,
        Key: {
            shareToken: shareToken
        },
    }
    try {
        console.log("Getting box share with params:", JSON.stringify(params));
        const data = await docClient.send(new GetCommand(params));
        console.log("DynamoDB response:", JSON.stringify(data));
        if (data.Item) {
            return [data.Item];
        }
        return [];
    } catch (error) {
        console.error("Error getting box share:", error);
        throw error; // Re-throw to see actual error in logs
    }
}

//DeleteBoxShare(shareToken)
export async function deleteBoxShare(shareToken: string) {
    const params = {
        TableName: BOX_SHARES_TABLE,
        Key: {
            shareToken: shareToken
        }
    }
    try {
        await docClient.send(new DeleteCommand(params));
        return true;
    } catch (error) {
        console.error("Error deleting box share:", error);
        return false;
    }
}