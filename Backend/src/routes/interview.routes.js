const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const interviewController = require("../controllers/interview.controller")
const upload = require("../middlewares/file.middleware")

const interviewRouter = express.Router()



/**
 * @route POST /api/interview/
 * @description generate new interview report on the basis of user self description,resume pdf and job description.
 * @access private
 */
interviewRouter.post("/", authMiddleware.authUser, upload.single("resume"), interviewController.generateInterViewReportController)

/**
 * @route GET /api/interview/report/:interviewId
 * @description get interview report by interviewId.
 * @access private
 */
interviewRouter.get("/report/:interviewId", authMiddleware.authUser, interviewController.getInterviewReportByIdController)

/**
 * @route GET /api/interview/plan/pdf/:interviewReportId
 * @description download the saved preparation plan as a one-page PDF.
 * @access private
 */
interviewRouter.get("/plan/pdf/:interviewReportId", authMiddleware.authUser, interviewController.generateInterviewPlanPdfController)


/**
 * @route GET /api/interview/
 * @description get all interview reports of logged in user.
 * @access private
 */
interviewRouter.get("/", authMiddleware.authUser, interviewController.getAllInterviewReportsController)


/**
 * @route GET /api/interview/resume/pdf
 * @description generate resume pdf on the basis of user self description, resume content and job description.
 * @access private
 */
// interviewRouter.get("/resume/pdf/:interviewReportId", authMiddleware.authUser, interviewController.generateResumePdfController)
interviewRouter.get("/resume/pdf/:interviewReportId", authMiddleware.authUser, async (req, res, next) => {
    try {
        await interviewController.generateResumePdfController(req, res, next);
    } catch (err) {
        console.error("Router level caught crash:", err);
        // Ensure headers are still structurally valid even on total failure
        if (!res.headersSent) {
            res.status(500).json({
                message: "Fatal crash during generation link",
                error: err.message
            });
        }
    }
});



module.exports = interviewRouter