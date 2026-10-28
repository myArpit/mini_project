const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})


const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum(["low", "medium", "high"]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {


    // Enhanced prompt for interview report generation. It explicitly instructs the model to:
    //  • Follow the JSON schema defined by `interviewReportSchema`.
    //  • Produce concise, well‑structured content without extra explanatory text.
    //  • Use professional language and avoid AI‑generated phrasing.
    //  • Include all required sections (matchScore, technicalQuestions, behavioralQuestions,
    //    skillGaps, preparationPlan, title) exactly as defined.
    // Prompt now explicitly asks the model to incorporate the self‑description content.
    const prompt = `You are an expert interview coach. Generate an interview report for a candidate using ONLY the JSON schema provided in the request configuration. Do NOT add any additional text outside the JSON object.

Candidate details:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

Guidelines:
• Populate every field defined in the schema (matchScore, technicalQuestions, behavioralQuestions, skillGaps, preparationPlan, title).
• Use the provided Self Description to tailor the recommendations – reference the candidate’s experience, tech stack, and background where relevant.
• Keep answers concise, actionable, and professional.
• Use clear bullet‑style phrasing for questions and answers.
• Ensure the output is valid JSON that matches the schema exactly.
• Avoid any phrasing that suggests the content was AI‑generated.
`

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(interviewReportSchema),
        }
    })

    return JSON.parse(response.text)


}



async function generatePdfFromHtml(htmlContent) {
    let browser;
    try {
        const puppeteer = require('puppeteer'); // or puppeteer-core depending on your setup

        browser = await puppeteer.launch({
            headless: 'new', // or true
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage', // Prevents memory limits inside Render containers
                '--disable-accelerated-2d-canvas',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();

        // Fix 1: Explicitly reduce the internal navigation timeout block
        await page.setDefaultNavigationTimeout(60000); // Raise to 60s just in case

        // Fix 2: Change wait rules so it doesn't hang waiting for slow CDNs
        await page.setContent(htmlContent, {
            waitUntil: 'domcontentloaded' // Instant compile as soon as HTML is parsed
        });

        await page.emulateMediaType('print');
        await page.addStyleTag({
            content: `
                @page { size: A4 portrait; margin: 20px; }
                html, body { width: 754px !important; margin: 0 !important; }
                body { box-sizing: border-box !important; }
            `
        });

        const contentHeight = await page.evaluate(() => Math.max(
            document.documentElement.scrollHeight,
            document.body.scrollHeight
        ));
        const fitScale = Math.min(1, 1050 / contentHeight);
        await page.addStyleTag({
            content: `body { zoom: ${fitScale} !important; }`
        });

        // Generate the PDF binary buffer footprint
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true, // Ensures styles, background colors, and borders appear
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            }
        });

        await browser.close();
        return pdfBuffer;

    } catch (error) {
        if (browser) await browser.close();
        console.error("Error inside generatePdfFromHtml helper:", error);
        throw error;
    }
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    // Enhanced prompt for resume generation. It asks for a single‑field JSON with HTML content,
    // ensures ATS‑friendliness, professional tone, and a clean design.
    const prompt = `You are a professional resume writer. Generate a resume for a candidate and return it as a JSON object with a single field "html" containing the complete HTML markup.

Candidate details:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

Requirements for the HTML resume:
• Use a clean, simple, professional layout (no excessive colors or fonts).
• Incorporate the Self Description to highlight the candidate’s unique experience, tech stack, and achievements.
• Include standard sections: Header with name/contact, Summary, Experience, Education, Skills, Projects (if relevant).
• Ensure the HTML is well‑structured, uses semantic tags, and is ATS‑friendly (plain text content, minimal tables/graphics).
• Keep the resume concise enough to fit on one A4 page when printed.
• Write in a human‑like tone; avoid phrasing that sounds AI‑generated.
• The JSON must contain ONLY the "html" field and be valid according to the provided schema.
`

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema),
        }
    })


    const jsonContent = JSON.parse(response.text)

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer

}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character])
}

async function generateInterviewPlanPdf({ title, matchScore, preparationPlan }) {
    const planSections = preparationPlan.map(({ day, focus, tasks }) => `
        <section class="day">
            <h2>Day ${escapeHtml(day)} <span>${escapeHtml(focus)}</span></h2>
            <ul>${tasks.map((task) => `<li>${escapeHtml(task)}</li>`).join("")}</ul>
        </section>
    `).join("")

    const htmlContent = `<!doctype html>
        <html>
            <head>
                <meta charset="utf-8">
                <style>
                    * { box-sizing: border-box; }
                    body { color: #17212b; font-family: Arial, sans-serif; font-size: 11px; line-height: 1.35; }
                    header { border-bottom: 2px solid #245b67; margin-bottom: 12px; padding-bottom: 8px; }
                    h1 { color: #163f49; font-size: 22px; margin: 0 0 4px; }
                    .meta { color: #53636b; font-size: 10px; }
                    .plan { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 14px; }
                    .day { border-bottom: 1px solid #d6dfe2; break-inside: avoid; padding: 0 0 6px; }
                    h2 { color: #163f49; font-size: 12px; margin: 0 0 4px; }
                    h2 span { color: #17212b; font-weight: 600; }
                    ul { margin: 0; padding-left: 15px; }
                    li { margin: 0 0 2px; }
                </style>
            </head>
            <body>
                <header>
                    <h1>Interview Preparation Plan</h1>
                    <div class="meta">${escapeHtml(title)} | Match score: ${escapeHtml(matchScore)}%</div>
                </header>
                <main class="plan">${planSections}</main>
            </body>
        </html>`

    return generatePdfFromHtml(htmlContent)
}

module.exports = { generateInterviewReport, generateResumePdf, generateInterviewPlanPdf }