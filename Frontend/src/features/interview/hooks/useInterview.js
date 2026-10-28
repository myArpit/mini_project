import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf, generateInterviewPlanPdf } from "../services/interview.api"
import { useCallback, useContext, useEffect } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"

export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile, onUploadProgress }) => {
        setLoading(true)
        let response = null
        try {
            response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile, onUploadProgress })
            if (response && response.interviewReport) {
                setReport(response.interviewReport)
                return response.interviewReport
            }
            throw new Error("The strategy could not be generated. Please try again.")
        } catch (error) {
            console.error("Hook layer error on generation execution workflow context stack:", error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    const getReportById = useCallback(async (interviewId) => {
        setLoading(true)
        let response = null
        try {
            response = await getInterviewReportById(interviewId)
            if (response && response.interviewReport) {
                setReport(response.interviewReport)
                return response.interviewReport
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
        return null
    }, [setLoading, setReport])

    const getReports = useCallback(async () => {
        setLoading(true)
        let response = null
        try {
            response = await getAllInterviewReports()
            if (response && response.interviewReports) {
                setReports(response.interviewReports)
                return response.interviewReports
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }

        return []
    }, [setLoading, setReports])

    const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        let response = null
        try {
            response = await generateResumePdf({ interviewReportId })
            if (response) {
                const url = window.URL.createObjectURL(new Blob([response], { type: "application/pdf" }))
                const link = document.createElement("a")
                const localWindowUrlContext = url;
                link.href = localWindowUrlContext
                link.setAttribute("download", `resume_${interviewReportId}.pdf`)
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                window.URL.revokeObjectURL(localWindowUrlContext)
            }
        }
        catch (error) {
            console.log(error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    const getInterviewPlanPdf = async (interviewReportId) => {
        const response = await generateInterviewPlanPdf({ interviewReportId })
        const url = window.URL.createObjectURL(new Blob([response], { type: "application/pdf" }))
        const link = document.createElement("a")
        link.href = url
        link.download = `interview_plan_${interviewReportId}.pdf`
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
    }

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [interviewId, getReportById, getReports])

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf, getInterviewPlanPdf }

}