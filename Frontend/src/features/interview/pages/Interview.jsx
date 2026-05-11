import React, { useState, useEffect } from 'react'
import '../style/interview.scss'
import '../style/vapi.scss'
import { useInterview } from '../hooks/useInterview.js'
import { useVapi } from '../hooks/useVapi'
import { useNavigate, useParams, useLocation } from 'react-router'
import LoadingScreen from '../../../components/LoadingScreen.jsx'



const NAV_ITEMS = [
    { id: 'technical', label: 'Technical Questions', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>) },
    { id: 'behavioral', label: 'Behavioral Questions', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>) },
    { id: 'roadmap', label: 'Road Map', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>) },
    { id: 'feedback', label: 'Interview Feedback', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>) },
]

// ── Sub-components ────────────────────────────────────────────────────────────
const QuestionCard = ({ item, index }) => {
    const [ open, setOpen ] = useState(false)
    return (
        <div className='q-card'>
            <div className='q-card__header' onClick={() => setOpen(o => !o)}>
                <span className='q-card__index'>Q{index + 1}</span>
                <p className='q-card__question'>{item.question}</p>
                <span className={`q-card__chevron ${open ? 'q-card__chevron--open' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </span>
            </div>
            {open && (
                <div className='q-card__body'>
                    <div className='q-card__section'>
                        <span className='q-card__tag q-card__tag--intention'>Intention</span>
                        <p>{item.intention}</p>
                    </div>
                    <div className='q-card__section'>
                        <span className='q-card__tag q-card__tag--answer'>Model Answer</span>
                        <p>{item.answer}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

const RoadMapDay = ({ day }) => (
    <div className='roadmap-day'>
        <div className='roadmap-day__header'>
            <span className='roadmap-day__badge'>Day {day.day}</span>
            <h3 className='roadmap-day__focus'>{day.focus}</h3>
        </div>
        <ul className='roadmap-day__tasks'>
            {day.tasks.map((task, i) => (
                <li key={i}>
                    <span className='roadmap-day__bullet' />
                    {task}
                </li>
            ))}
        </ul>
    </div>
)

const getFeedbackSessions = (report) => {
    const history = Array.isArray(report.feedbackHistory) ? report.feedbackHistory : []

    if (history.length > 0) {
        return [...history].reverse()
    }

    if (report.overallScore) {
        return [{
            sessionNumber: 1,
            overallScore: report.overallScore,
            strengths: report.strengths,
            weaknesses: report.weaknesses,
            resumeComparison: report.resumeComparison,
            feedback: report.feedback,
            createdAt: report.updatedAt
        }]
    }

    return []
}

const FeedbackCard = ({ session, index, total, matchScore }) => {
    const [open, setOpen] = useState(false)
    const sessionDate = session.createdAt ? new Date(session.createdAt).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : 'Unknown date'

    const interviewScore = session.overallScore || 0
    const resumeScore = matchScore || 0
    const overallScore = Math.round((interviewScore + resumeScore) / 2)
    const sessionNumber = session.sessionNumber || total - index

    return (
        <div className='feedback-accordion'>
            <div className='feedback-accordion__header' onClick={() => setOpen(o => !o)}>
                <div className='feedback-accordion__top-row'>
                    <div className='feedback-accordion__title'>
                        <span className='feedback-accordion__badge'>Session {sessionNumber}</span>
                        <span className='feedback-accordion__date'>{sessionDate}</span>
                    </div>
                    <span className={`q-card__chevron ${open ? 'q-card__chevron--open' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                    </span>
                </div>
                <div className='feedback-accordion__scores'>
                    <div className='feedback-accordion__score-pill feedback-accordion__score-pill--resume'>
                        <span className='feedback-accordion__score-label'>Resume Match</span>
                        <span className='feedback-accordion__score-value'>{resumeScore}%</span>
                    </div>
                    <div className='feedback-accordion__score-pill feedback-accordion__score-pill--interview'>
                        <span className='feedback-accordion__score-label'>Interview</span>
                        <span className='feedback-accordion__score-value'>{interviewScore}%</span>
                    </div>
                    <div className='feedback-accordion__score-pill feedback-accordion__score-pill--overall'>
                        <span className='feedback-accordion__score-label'>Overall</span>
                        <span className='feedback-accordion__score-value'>{overallScore}%</span>
                    </div>
                </div>
            </div>
            {open && (
                <div className='feedback-accordion__body'>
                    <div className='feedback-grid'>
                        <div className='feedback-card feedback-card--strengths'>
                            <h3>💪 Strengths</h3>
                            <ul>
                                {session.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                        <div className='feedback-card feedback-card--weaknesses'>
                            <h3>📉 Areas for Improvement</h3>
                            <ul>
                                {session.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
                            </ul>
                        </div>
                    </div>
                    <div className='feedback-full'>
                        <h3>📄 Resume Comparison</h3>
                        <p>{session.resumeComparison}</p>
                    </div>
                    <div className='feedback-full'>
                        <h3>💬 Detailed Feedback</h3>
                        <p>{session.feedback}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

const FeedbackSection = ({ report, sessions }) => {
    if (sessions.length === 0) return null

    return (
        <div className='feedback-section'>
            {sessions.map((session, i) => (
                <FeedbackCard key={session._id || session.createdAt || i} session={session} index={i} total={sessions.length} matchScore={report.matchScore} />
            ))}
        </div>
    )
}

// ── Main Component ────────────────────────────────────────────────────────────
const Interview = () => {
    const [ activeNav, setActiveNav ] = useState('technical')
    const { report, getReportById, loading, getResumePdf } = useInterview()
    const { startCall, stopCall, isActive, callStatus } = useVapi()
    const navigate = useNavigate()
    const location = useLocation()
    const { interviewId } = useParams()

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
            if (location.state?.refetch) {
                setActiveNav('feedback')
            }
        }
    }, [ interviewId, location.state?.refetch ])



    if (loading || !report) {
        return (
            <LoadingScreen
                title="Loading your interview plan"
                message="Pulling together questions, roadmap, score, and feedback."
                label="Interview report"
            />
        )
    }

    const scoreColor =
        report.matchScore >= 80 ? 'score--high' :
            report.matchScore >= 60 ? 'score--mid' : 'score--low'
    const feedbackSessions = getFeedbackSessions(report)
    const hasFeedbackSessions = feedbackSessions.length > 0


    return (
        <div className='interview-page'>
            <div className='interview-layout'>

                {/* ── Left Nav ── */}
                <nav className='interview-nav'>
                    <div className="nav-content">
                        <p className='interview-nav__label'>Sections</p>
                        {NAV_ITEMS.map(item => (
                            <button
                                key={item.id}
                                className={`interview-nav__item ${activeNav === item.id ? 'interview-nav__item--active' : ''}`}
                                onClick={() => setActiveNav(item.id)}
                            >
                                <span className='interview-nav__icon'>{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </div>
                    <div className='interview-nav__actions'>
                        <button
                            onClick={() => navigate(`/interview/${interviewId}/session`)}
                            className='ai-interview-button'
                        >
                            <span className='ai-interview-button__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
                            </span>
                            Take AI Interview
                        </button>

                        <button
                            onClick={() => { getResumePdf(interviewId) }}
                            className='download-resume-button'
                        >
                            <svg className='download-resume-button__icon' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.6144 17.7956 11.492 15.7854C12.2731 13.9966 13.6789 12.5726 15.4325 11.7942L17.8482 10.7219C18.6162 10.381 18.6162 9.26368 17.8482 8.92277L15.5079 7.88394C13.7092 7.08552 12.2782 5.60881 11.5105 3.75894L10.6215 1.61673C10.2916.821765 9.19319.821767 8.8633 1.61673L7.97427 3.75892C7.20657 5.60881 5.77553 7.08552 3.97685 7.88394L1.63658 8.92277C.868537 9.26368.868536 10.381 1.63658 10.7219L4.0523 11.7942C5.80589 12.5726 7.21171 13.9966 7.99275 15.7854L8.8704 17.7956C9.20776 18.5682 10.277 18.5682 10.6144 17.7956ZM19.4014 22.6899 19.6482 22.1242C20.0882 21.1156 20.8807 20.3125 21.8695 19.8732L22.6299 19.5353C23.0412 19.3526 23.0412 18.7549 22.6299 18.5722L21.9121 18.2532C20.8978 17.8026 20.0911 16.9698 19.6586 15.9269L19.4052 15.3156C19.2285 14.8896 18.6395 14.8896 18.4628 15.3156L18.2094 15.9269C17.777 16.9698 16.9703 17.8026 15.956 18.2532L15.2381 18.5722C14.8269 18.7549 14.8269 19.3526 15.2381 19.5353L15.9985 19.8732C16.9874 20.3125 17.7798 21.1156 18.2198 22.1242L18.4667 22.6899C18.6473 23.104 19.2207 23.104 19.4014 22.6899Z"></path></svg>
                            Download Resume
                        </button>
                    </div>
                </nav>

                <div className='interview-divider' />

                {/* ── Center Content ── */}
                <main className='interview-content'>
                    {activeNav === 'technical' && (
                        <section>
                            <div className='content-header'>
                                <h2>Technical Questions</h2>
                                <span className='content-header__count'>{report.technicalQuestions.length} questions</span>
                            </div>
                            <div className='q-list'>
                                {report.technicalQuestions.map((q, i) => (
                                    <QuestionCard key={i} item={q} index={i} />
                                ))}
                            </div>
                        </section>
                    )}

                    {activeNav === 'behavioral' && (
                        <section>
                            <div className='content-header'>
                                <h2>Behavioral Questions</h2>
                                <span className='content-header__count'>{report.behavioralQuestions.length} questions</span>
                            </div>
                            <div className='q-list'>
                                {report.behavioralQuestions.map((q, i) => (
                                    <QuestionCard key={i} item={q} index={i} />
                                ))}
                            </div>
                        </section>
                    )}

                    {activeNav === 'roadmap' && (
                        <section>
                            <div className='content-header'>
                                <h2>Preparation Road Map</h2>
                                <span className='content-header__count'>{report.preparationPlan.length}-day plan</span>
                            </div>
                            <div className='roadmap-list'>
                                {report.preparationPlan.map((day) => (
                                    <RoadMapDay key={day.day} day={day} />
                                ))}
                            </div>
                        </section>
                    )}

                    {activeNav === 'feedback' && (
                        <section>
                            <div className='content-header'>
                                <h2>Interview Analysis</h2>
                                {hasFeedbackSessions ? (
                                    <span className='content-header__count'>
                                        {feedbackSessions.length} session{feedbackSessions.length > 1 ? 's' : ''} completed
                                    </span>
                                ) : (
                                    <span className='content-header__count' style={{ color: '#94a3b8' }}>Complete an interview to see feedback</span>
                                )}
                            </div>
                            {hasFeedbackSessions ? (
                                <FeedbackSection report={report} sessions={feedbackSessions} />
                            ) : (
                                <div className='empty-feedback'>
                                    <p>You haven't completed an AI interview session for this role yet.</p>
                                    <button 
                                        onClick={() => navigate(`/interview/${interviewId}/session`)}
                                        className='button primary-button'
                                        style={{ marginTop: '1.5rem' }}
                                    >
                                        Start AI Interview Now
                                    </button>
                                </div>
                            )}
                        </section>
                    )}
                </main>

                <div className='interview-divider' />

                {/* ── Right Sidebar ── */}
                <aside className='interview-sidebar'>

                    {/* Match Score */}
                    <div className='match-score'>
                        <p className='match-score__label'>Match Score</p>
                        <div className={`match-score__ring ${scoreColor}`}>
                            <span className='match-score__value'>{report.matchScore}</span>
                            <span className='match-score__pct'>%</span>
                        </div>
                        <p className='match-score__sub'>Strong match for this role</p>
                    </div>

                    <div className='sidebar-divider' />

                    {/* Skill Gaps */}
                    <div className='skill-gaps'>
                        <p className='skill-gaps__label'>Skill Gaps</p>
                        <div className='skill-gaps__list'>
                            {report.skillGaps.map((gap, i) => (
                                <span key={i} className={`skill-tag skill-tag--${gap.severity}`}>
                                    {gap.skill}
                                </span>
                            ))}
                        </div>
                    </div>

                </aside>
            </div>
        </div>
    )
}

export default Interview
