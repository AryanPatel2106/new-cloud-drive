import mongoose from "mongoose";
import { File } from "../models/file.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { uploadToS3, deleteFromS3, getPresignedDownloadUrl } from "../utils/s3.js";

const createFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "File is required");
  }

  const name = req.body.name || req.file.originalname;
  const size = req.file.size;
  const mimeType = req.file.mimetype;

  // Upload the file to S3
  const { url, key } = await uploadToS3(req.file.buffer, req.file.originalname, mimeType);

  const file = await File.create({
    name,
    url,
    s3Key: key,
    size,
    mimeType,
    owner: req.user._id,
  });

  // Generate a temporary download link for the newly uploaded file
  const fileObj = file.toObject();
  fileObj.downloadUrl = await getPresignedDownloadUrl(key);

  return res
    .status(201)
    .json(new ApiResponse(201, fileObj, "File created successfully"));
});

const getUserFiles = asyncHandler(async (req, res) => {
  const files = await File.find({ owner: req.user._id }).sort({
    createdAt: -1,
  });

  // Generate a temporary download link for each file
  const filesWithUrls = [];
  for (let i = 0; i < files.length; i++) {
    const fileObj = files[i].toObject();
    fileObj.downloadUrl = await getPresignedDownloadUrl(fileObj.s3Key);
    filesWithUrls.push(fileObj);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, filesWithUrls, "Files fetched successfully"));
});

const getFileById = asyncHandler(async (req, res) => {
  const { fileId } = req.params;

  if (!mongoose.isValidObjectId(fileId)) {
    throw new ApiError(400, "Invalid file id");
  }

  const file = await File.findOne({
    _id: fileId,
    owner: req.user._id,
  });

  if (!file) {
    throw new ApiError(404, "File not found");
  }

  // Generate a temporary download link for this file
  const fileObj = file.toObject();
  fileObj.downloadUrl = await getPresignedDownloadUrl(fileObj.s3Key);

  return res
    .status(200)
    .json(new ApiResponse(200, fileObj, "File fetched successfully"));
});

const renameFile = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  const { name } = req.body;

  if (!mongoose.isValidObjectId(fileId)) {
    throw new ApiError(400, "Invalid file id");
  }

  if (!name?.trim()) {
    throw new ApiError(400, "File name is required");
  }

  const file = await File.findOneAndUpdate(
    {
      _id: fileId,
      owner: req.user._id,
    },
    {
      $set: { name: name.trim() },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!file) {
    throw new ApiError(404, "File not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, file, "File renamed successfully"));
});

const deleteFile = asyncHandler(async (req, res) => {
  const { fileId } = req.params;

  if (!mongoose.isValidObjectId(fileId)) {
    throw new ApiError(400, "Invalid file id");
  }

  const file = await File.findOne({
    _id: fileId,
    owner: req.user._id,
  });

  if (!file) {
    throw new ApiError(404, "File not found");
  }

  if (file.s3Key) {
    try {
      await deleteFromS3(file.s3Key);
    } catch (error) {
      console.error(`S3 Deletion warning: failed to delete key ${file.s3Key}:`, error);
    }
  }

  await file.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, file, "File deleted successfully"));
});

export {
  createFile,
  deleteFile,
  getFileById,
  getUserFiles,
  renameFile,
};
