import axios from "axios";

// Vercel builds must set VITE_API_URL to the deployed backend URL.
const isLocalHost = ["localhost", "127.0.0.1"].includes(window.location.hostname)
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()
const hasLocalApiUrl = configuredApiUrl && /localhost|127\.0\.0\.1/.test(configuredApiUrl)
const baseURL = configuredApiUrl && (!hasLocalApiUrl || isLocalHost)
    ? configuredApiUrl
    : isLocalHost ? "http://localhost:3000" : ""

const api = axios.create({
    baseURL,
    withCredentials: true,
})


/**
 * @description Service to generate interview report based on user self description, resume and job description.
 */
/**
 * @description Service to generate interview report based on user self description, resume and job description.
 */
export const generateInterviewReport = async ({ jobDescription, selfDescription, resumeFile, onUploadProgress }) => {

    const formData = new FormData()

    // Always append the target job description
    formData.append("jobDescription", jobDescription)

    // Conditionally append the resume only if a valid file exists
    if (resumeFile && resumeFile instanceof File) {
        formData.append("resume", resumeFile)
    }

    // Conditionally append selfDescription only if there's actual text
    if (selfDescription && selfDescription.trim() !== "") {
        formData.append("selfDescription", selfDescription)
    }

    const response = await api.post("/api/interview/", formData, { onUploadProgress })

    return response.data
}


/**
 * @description Service to get interview report by interviewId.
 */
export const getInterviewReportById = async (interviewId) => {
    const response = await api.get(`/api/interview/report/${interviewId}`)

    return response.data
}


/**
 * @description Service to get all interview reports of logged in user.
 */
export const getAllInterviewReports = async () => {
    const response = await api.get("/api/interview/")

    return response.data
}


/**
 * @description Service to generate resume pdf based on user self description, resume content and job description.
 */
export const generateResumePdf = async ({ interviewReportId }) => {
    // 1. Changed from api.post to api.get to match backend tracking params
    // 2. Kept responseType: "blob" so Axios leaves the binary data intact
    const response = await api.get(`/api/interview/resume/pdf/${interviewReportId}`, {
        responseType: "blob"
    })

    return response.data
}

export const generateInterviewPlanPdf = async ({ interviewReportId }) => {
    const response = await api.get(`/api/interview/plan/pdf/${interviewReportId}`, {
        responseType: "blob"
    })

    return response.data
}