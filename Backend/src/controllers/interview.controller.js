// const pdfParse = require("pdf-parse"); // Corrected to safely execute standard function references
let pdfParse = require("pdf-parse");
// Fallback check: If it's imported as an object instead of a direct function
if (typeof pdfParse !== "function" && pdfParse.default) {
    pdfParse = pdfParse.default;
} else if (typeof pdfParse !== "function" && typeof pdfParse.parse === "function") {
    pdfParse = pdfParse.parse;
}
const { generateInterviewReport, generateResumePdf, generateInterviewPlanPdf } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")

/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {
    try {
        const { selfDescription, jobDescription } = req.body;

        // 1. Core Safety Guardrail: Job description is always strictly required
        if (!jobDescription || jobDescription.trim() === "") {
            return res.status(400).json({
                message: "Target job description is required to generate a plan."
            });
        }

        // 2. Either/Or Validation: Ensure at least one profile context option exists
        const hasFile = req && req.file && req.file.buffer;
        const hasText = selfDescription && selfDescription.trim() !== "";

        if (!hasFile && !hasText) {
            return res.status(400).json({
                message: "Validation failed: Please provide either a resume upload file OR a self description profile."
            });
        }

        // 3. Process conditional data layout depending on what was provided
        let resumeText = "";
        if (hasFile) {
            // 1. Force require right inside the block to bypass any top-level scoping quirks
            const pdfDecoder = require("pdf-parse");

            // 2. Safely call it depending on how Node resolved the export package
            let parsedData;
            if (typeof pdfDecoder === 'function') {
                parsedData = await pdfDecoder(req.file.buffer);
            } else if (pdfDecoder && typeof pdfDecoder.default === 'function') {
                parsedData = await pdfDecoder.default(req.file.buffer);
            } else {
                // If it's completely corrupted, grab the text out of the buffer via a basic string fallback
                console.warn("pdf-parse resolved to a non-functional object. Using fallback buffer parsing.");
                resumeText = req.file.buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, '');
            }

            if (parsedData && parsedData.text) {
                resumeText = parsedData.text;
            }
        }

        // 4. Forward extracted elements straight to your AI model layer service
        const interViewReportByAi = await generateInterviewReport({
            resume: resumeText, // Will pass empty string if user typed description instead
            selfDescription: selfDescription || "",
            jobDescription
        });

        // 5. Save structured parameters securely into MongoDB 
        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription: selfDescription || "",
            jobDescription,
            ...interViewReportByAi
        });

        return res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        });

    } catch (error) {
        console.error("CRITICAL REPORT GENERATOR ERROR:", error);
        if (!res.headersSent) {
            return res.status(500).json({
                message: "Internal server error during report processing",
                error: error.message
            });
        }
    }
}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {

    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}


/** * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}


/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params;
        console.log("Fetching report ID:", interviewReportId);

        const interviewReport = await interviewReportModel.findById(interviewReportId);

        if (!interviewReport) {
            return res.status(404).json({ message: "Interview report not found." });
        }

        const { resume, jobDescription, selfDescription } = interviewReport;

        // Trace if the AI service itself is failing
        console.log("Calling generateResumePdf AI service...");
        const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription });
        console.log("PDF generated successfully, buffer length:", pdfBuffer ? pdfBuffer.length : "null");

        if (!pdfBuffer) {
            return res.status(500).json({ message: "AI service failed to return a PDF buffer." });
        }

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="resume_${interviewReportId}.pdf"`,
            "Access-Control-Expose-Headers": "Content-Disposition"
        });

        // Ensure we send it cleanly as a binary buffer chunk
        return res.end(Buffer.from(pdfBuffer));

    } catch (error) {
        console.error("CRITICAL PDF CONTROLLER ERROR:", error);
        return res.status(500).json({
            message: "Internal server error during PDF generation",
            error: error.message,
            stack: error.stack
        });
    }
}

async function generateInterviewPlanPdfController(req, res) {
    try {
        const interviewReport = await interviewReportModel.findOne({
            _id: req.params.interviewReportId,
            user: req.user.id
        }).select("title matchScore preparationPlan")

        if (!interviewReport) {
            return res.status(404).json({ message: "Interview report not found." })
        }

        const pdfBuffer = await generateInterviewPlanPdf(interviewReport)
        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="interview_plan_${interviewReport.id}.pdf"`
        })
        return res.end(Buffer.from(pdfBuffer))
    } catch (error) {
        console.error("Interview plan PDF generation failed:", error)
        return res.status(500).json({ message: "Interview plan PDF generation failed." })
    }
}

module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController,
    generateInterviewPlanPdfController
}