import { Router } from "express";
import {
  createFile,
  deleteFile,
  getFileById,
  getUserFiles,
  renameFile,
} from "../controllers/file.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getUserFiles).post(upload.single("file"), createFile);
router.route("/:fileId").get(getFileById).patch(renameFile).delete(deleteFile);

export default router;
