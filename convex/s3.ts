import { action } from "./_generated/server";
import { v } from "convex/values";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const generateUploadUrl = action({
    args: {
        fileName: v.string(),
        fileType: v.string(),
    },
    handler: async (ctx, args) => {
        const region = process.env.AWS_S3_REGION;
        const accessKeyId = process.env.AWS_S3_ACCESS_KEY_ID;
        const secretAccessKey = process.env.AWS_S3_SECRET_ACCESS_KEY;
        const bucketName = process.env.AWS_S3_BUCKET || process.env.AWS_S3_BUCKET_NAME;

        if (!region || !accessKeyId || !secretAccessKey || !bucketName) {
            throw new Error("S3 environment variables are missing.");
        }

        const s3Client = new S3Client({
            region,
            credentials: { accessKeyId, secretAccessKey },
            // Standard settings to avoid DOMParser/Buffer issues
        });

        const key = `${Date.now()}-${args.fileName}`;

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            // ContentType intentionally omitted to match headerless frontend upload
        });

        // Generate the pre-signed URL
        const uploadUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 300,
        });

        // Public URL for viewing
        const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

        return { uploadUrl, fileUrl, fileName: key };
    },
});
