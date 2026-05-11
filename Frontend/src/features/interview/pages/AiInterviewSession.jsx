import React, { useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useVapi } from '../hooks/useVapi'
import { useInterview } from '../hooks/useInterview'
import { analyzeInterview } from '../services/interview.api'
import LoadingScreen from '../../../components/LoadingScreen.jsx'
import '../style/vapi.scss'

const isAssistantMessage = (role) => ['assistant', 'bot'].includes(role)

const AiInterviewSession = () => {
    const { interviewId } = useParams()
    const navigate = useNavigate()
    const { report, getReportById, loading: interviewLoading } = useInterview()
    const { startCall, stopCall, isActive, callStatus, messages } = useVapi()
    const [hasManuallyEnded, setHasManuallyEnded] = React.useState(false)
    const [isAnalyzing, setIsAnalyzing] = React.useState(false)
    const [toastMessage, setToastMessage] = React.useState(null)
    const chatEndRef = useRef(null)

    const showToast = (message, type = 'success') => {
        setToastMessage({ message, type })
        setTimeout(() => setToastMessage(null), 4000)
    }

    useEffect(() => {
        if (interviewId && !report) {
            getReportById(interviewId)
        }
    }, [interviewId, report, getReportById])

    useEffect(() => {
        if (report && callStatus === 'inactive' && !hasManuallyEnded) {
            startCall(report)
        }
    }, [report, callStatus, startCall, hasManuallyEnded])

    const handleStopCall = () => {
        setHasManuallyEnded(true)
        stopCall()
    }

    const handleEndSession = async () => {
        setHasManuallyEnded(true)
        stopCall()

        if (messages.length > 0) {
            setIsAnalyzing(true)
            try {
                const transcriptString = messages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n')

                await analyzeInterview(interviewId, transcriptString)
                navigate(`/interview/${interviewId}`, { state: { refetch: true } })
            } catch (err) {
                setIsAnalyzing(false)
            }
        } else {
            navigate(`/interview/${interviewId}`)
        }
    }

    const handleStartCall = () => {
        setHasManuallyEnded(false)
        startCall(report)
    }

    const handleTestMic = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            showToast("Microphone Connected Successfully!", 'success')
            stream.getTracks().forEach(track => track.stop())
        } catch (err) {
            showToast("Microphone Error: " + err.message, 'error')
        }
    }

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    if (interviewLoading || !report) {
        return (
            <LoadingScreen
                title="Loading interview session"
                message="Preparing the voice interviewer and session context."
                label="Voice interview"
            />
        )
    }

    if (isAnalyzing) {
        return (
            <LoadingScreen
                title="Analyzing interview"
                message="Comparing your answers with your resume and job requirements."
                label="Feedback analysis"
            />
        )
    }

    if (callStatus === 'error') {
        return (
            <main className='loading-screen'>
                <h1 style={{ color: '#ef4444' }}>Voice Session Error</h1>
                <p>Could not connect to the AI voice service. Please check your Vapi Public Key and Assistant ID in the .env file.</p>
                <button onClick={() => navigate(`/interview/${interviewId}`)} className='button primary-button' style={{ marginTop: '2rem' }}>
                    Go Back
                </button>
            </main>
        )
    }

    if (callStatus === 'connecting') {
        return (
            <LoadingScreen
                title="Connecting to AI Interviewer"
                message="Establishing your voice connection and preparing the session..."
                label="Voice connection"
            />
        )
    }

    const userTurns = messages.filter(msg => !isAssistantMessage(msg.role)).length
    const aiTurns = messages.filter(msg => isAssistantMessage(msg.role)).length

    return (
        <div className='ai-session-page'>
            {toastMessage && (
                <div className={`toast-notification ${toastMessage.type === 'success' ? 'toast-notification--success' : ''}`}>
                    {toastMessage.type === 'success' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{minWidth: '18px'}}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{minWidth: '18px'}}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    )}
                    <span>{toastMessage.message}</span>
                </div>
            )}
            <header className='session-header'>
                <div className='session-header__content'>
                    <button onClick={() => { handleStopCall(); navigate(`/interview/${interviewId}`) }} className='back-btn'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                        Back to Report
                    </button>

                    <div className='session-header__title'>
                        <h2>AI Voice Interview</h2>
                        <span>{report.title || 'Interview Session'}</span>
                    </div>

                    <div className='session-header__actions'>

                        <button onClick={handleTestMic} className='test-mic-btn'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="22" /></svg>
                            Test Mic
                        </button>

                        <div className='status-badge'>
                            <span className={`status-dot ${isActive ? 'status-dot--active' : ''}`} />
                            {callStatus === 'connecting' ? 'Connecting...' : isActive ? 'Live' : 'Disconnected'}
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {isActive ? (
                                <button
                                    onClick={handleStopCall}
                                    className='action-btn action-btn--stop'
                                    style={{ backgroundColor: '#2a3348', color: '#e6edf3' }}
                                >
                                    Stop
                                </button>
                            ) : (
                                <button
                                    onClick={handleStartCall}
                                    className='action-btn action-btn--start'
                                >
                                    Restart
                                </button>
                            )}
                            <button
                                onClick={handleEndSession}
                                className='action-btn action-btn--stop'
                            >
                                End Session
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className='session-workspace'>
                <main className='chat-container'>
                    <div className='chat-panel-header'>
                        <div>
                            <h3>Conversation</h3>
                        </div>
                        <span>{messages.length} messages</span>
                    </div>

                    <div className='chat-messages'>
                        {messages.length === 0 && callStatus === 'active' && (
                            <div className='empty-chat'>
                                <p>The interviewer is starting the conversation. Please wait...</p>
                            </div>
                        )}

                        {messages.map((msg, index) => (
                            <div key={index} className={`message-bubble ${isAssistantMessage(msg.role) ? 'message-bubble--assistant' : 'message-bubble--user'}`}>
                                <div className='message-role'>{isAssistantMessage(msg.role) ? 'Interviewer' : 'You'}</div>
                                <div className='message-text'>{msg.text}</div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>
                </main>

                <aside className='session-sidebar'>
                    <section className='session-card session-card--listening'>
                        <div className='listening-orb'>
                            <span className={isActive ? 'listening-orb__dot listening-orb__dot--active' : 'listening-orb__dot'} />
                        </div>
                        <p className='session-card__label'>Voice Status</p>
                        <h3>{isActive ? 'AI is listening' : callStatus === 'connecting' ? 'Connecting' : 'Standby'}</h3>
                        <p>{isActive ? 'Speak naturally. Your transcript will appear on the left.' : 'Restart when you are ready to continue.'}</p>
                    </section>

                    <section className='session-card'>
                        <p className='session-card__label'>Interview Role</p>
                        <h3>{report.title || 'Target Role'}</h3>
                        <p>{report.matchScore ? `${report.matchScore}% resume match for this role.` : 'Resume match is available in the report.'}</p>
                    </section>

                    <section className='session-card session-card--metrics'>
                        <div>
                            <span>{userTurns}</span>
                            <p>Your Messages Count</p>
                        </div>
                        <div>
                            <span>{aiTurns}</span>
                            <p>AI Interviewer Messages Count</p>
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    )
}

export default AiInterviewSession

