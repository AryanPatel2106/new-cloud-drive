import { validationResult } from "express-validator";
import { ApiError } from "../utils/api-error.js";

export const validate = (req, res, next) => {
    const errors = validationResult(req)
    if(errors.isEmpty()){
        return next()
    }
    const extractedErrors = []
    // pushing errors into the empty array above
    errors.array().map((err) => extractedErrors.push({[err.path]: err.msg}))

    return res
        .status(422)
        .json(
            new ApiError(422, "Recieved data is not valid", extractedErrors)
        )

}