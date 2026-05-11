const pdfParse = require("pdf-parse")
const { generateInterviewReport, generateResumePdf, analyzeInterviewExperience } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")

async function generateInterViewReportController(req, res) {

    const { selfDescription, jobDescription } = req.body

    if (!req.file && !selfDescription) {
        return res.status(400).json({
            message: "Please provide either a resume file or a self description to generate the interview report."
        })
    }

    const resumeContent = req.file
        ? await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
        : { text: "" }

    const interViewReportByAi = await generateInterviewReport({
        resume: resumeContent.text,
        selfDescription,
        jobDescription
    })

    const interviewReport = await interviewReportModel.create({
        user: req.user.id,
        resume: resumeContent.text,
        selfDescription,
        jobDescription,
        ...interViewReportByAi
    })

    res.status(201).json({
        message: "Interview report generated successfully.",
        interviewReport
    })

}

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

async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}

async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params

    const interviewReport = await interviewReportModel.findById(interviewReportId)

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    const { resume, jobDescription, selfDescription } = interviewReport

    const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
    })

    res.send(pdfBuffer)
}

async function analyzeInterviewController(req, res) {
    const { interviewId } = req.params
    const { transcript } = req.body

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

    if (!interviewReport) {
        return res.status(404).json({ message: "Interview report not found." })
    }

    try {
        const feedbackData = await analyzeInterviewExperience({
            resume: interviewReport.resume,
            jobDescription: interviewReport.jobDescription,
            transcript
        })

        if ((!interviewReport.feedbackHistory || interviewReport.feedbackHistory.length === 0) && interviewReport.overallScore) {
            interviewReport.feedbackHistory.push({
                sessionNumber: 1,
                transcript: interviewReport.transcript,
                overallScore: interviewReport.overallScore,
                strengths: interviewReport.strengths,
                weaknesses: interviewReport.weaknesses,
                resumeComparison: interviewReport.resumeComparison,
                feedback: interviewReport.feedback,
                createdAt: interviewReport.updatedAt || interviewReport.createdAt || new Date()
            })
        }

        const sessionFeedback = {
            sessionNumber: (interviewReport.feedbackHistory?.length || 0) + 1,
            transcript,
            ...feedbackData,
            createdAt: new Date()
        }

        interviewReport.feedbackHistory.push(sessionFeedback)
        interviewReport.transcript = transcript

        const updatedReport = await interviewReport.save()

        res.status(200).json({
            message: "Interview feedback generated successfully.",
            interviewReport: updatedReport
        })
    } catch (error) {
        res.status(500).json({ message: "AI Analysis failed", error: error.message });
    }
}

module.exports = { generateInterViewReportController, getInterviewReportByIdController, getAllInterviewReportsController, generateResumePdfController, analyzeInterviewController }
