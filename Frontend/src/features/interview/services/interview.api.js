import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/interview`;

export const generateInterviewReport = async ({ jobDescription, selfDescription, resumeFile }) => {
    const formData = new FormData();
    formData.append('jobDescription', jobDescription);
    formData.append('selfDescription', selfDescription);
    if (resumeFile) {
        formData.append('resume', resumeFile);
    }
    const response = await axios.post(`${API_URL}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
    });
    return response.data;
};

export const getInterviewReportById = async (interviewId) => {
    const response = await axios.get(`${API_URL}/report/${interviewId}`, { withCredentials: true });
    return response.data;
};

export const getAllInterviewReports = async () => {
    const response = await axios.get(`${API_URL}/`, { withCredentials: true });
    return response.data;
};

export const generateResumePdf = async ({ interviewReportId }) => {
    const response = await axios.post(`${API_URL}/resume/pdf/${interviewReportId}`, {}, {
        responseType: 'blob',
        withCredentials: true
    });
    return response.data;
};

export const analyzeInterview = async (interviewId, transcript) => {
    const response = await axios.post(`${API_URL}/report/${interviewId}/analyze`, { transcript }, { withCredentials: true });
    return response.data;
};