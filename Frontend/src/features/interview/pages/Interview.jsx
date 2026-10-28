import React, { useState } from 'react'
import '../style/interview.scss'
import { useInterview } from '../hooks/useInterview.js'
import { useParams } from 'react-router'
import Loader from "../../auth/components/loader.jsx"
import Navbar from '../../auth/components/Navbar.jsx'
import toast from 'react-hot-toast'


const NAV_ITEMS = [
    { id: 'technical', label: 'Technical Questions', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>) },
    { id: 'behavioral', label: 'Behavioral Questions', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>) },
    { id: 'roadmap', label: 'Road Map', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>) },
]

// ── Sub-components ────────────────────────────────────────────────────────────
const QuestionCard = ({ item, index }) => {
    const [open, setOpen] = useState(false)
    return (
        <div className='q-card'>
            <button type='button' className='q-card__header' aria-expanded={open} aria-controls={`question-answer-${index}`} onClick={() => setOpen(o => !o)}>
                <span className='q-card__index'>Q{index + 1}</span>
                <p className='q-card__question'>{item.question}</p>
                <span className={`q-card__chevron ${open ? 'q-card__chevron--open' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </span>
            </button>
            {open && (
                <div className='q-card__body' id={`question-answer-${index}`}>
                    {item.category && <span className='q-card__meta'>{item.category}</span>}
                    {item.difficulty && <span className={`q-card__meta q-card__meta--${String(item.difficulty).toLowerCase()}`}>{item.difficulty}</span>}
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

const RoadMapDay = ({ day, completedTasks, setCompletedTasks }) => {
    const completedForDay = day.tasks.filter((_, taskIndex) => completedTasks.includes(`${day.day}-${taskIndex}`)).length
    const progress = day.tasks.length ? Math.round((completedForDay / day.tasks.length) * 100) : 0

    const toggleTask = (taskIndex) => {
        const taskKey = `${day.day}-${taskIndex}`
        setCompletedTasks((current) => current.includes(taskKey)
            ? current.filter((key) => key !== taskKey)
            : [...current, taskKey])
    }

    return (
        <article className={`roadmap-day ${progress === 100 ? 'roadmap-day--complete' : ''}`}>
            <div className='roadmap-day__header'>
                <span className='roadmap-day__badge'>Day {day.day}</span>
                <h3 className='roadmap-day__focus'>{day.focus}</h3>
                <span className='roadmap-day__progress-label'>{completedForDay}/{day.tasks.length} done</span>
            </div>
            <div className='roadmap-day__progress' role='progressbar' aria-label={`Day ${day.day} progress`} aria-valuenow={progress} aria-valuemin='0' aria-valuemax='100'>
                <span style={{ width: `${progress}%` }} />
            </div>
            <ul className='roadmap-day__tasks'>
                {day.tasks.map((task, i) => {
                    const checked = completedTasks.includes(`${day.day}-${i}`)
                    return (
                        <li key={i} className={checked ? 'roadmap-task roadmap-task--complete' : 'roadmap-task'}>
                            <label>
                                <input type='checkbox' checked={checked} onChange={() => toggleTask(i)} />
                                <span className='roadmap-day__bullet' aria-hidden='true' />
                                <span>{task}</span>
                            </label>
                        </li>
                    )
                })}
            </ul>
        </article>
    )
}

// ── Main Component ────────────────────────────────────────────────────────────
const Interview = () => {
    const [activeNav, setActiveNav] = useState('technical')
    const [questionSearch, setQuestionSearch] = useState('')
    const [completedTasks, setCompletedTasks] = useState([])
    const [downloading, setDownloading] = useState(false) // Local state for resume download
    const [downloadingPlan, setDownloadingPlan] = useState(false)
    const { report, loading, getResumePdf, getInterviewPlanPdf } = useInterview()
    const { interviewId } = useParams()

    const handleDownloadResume = async () => {
        try {
            setDownloading(true)
            await getResumePdf(interviewId)
        } catch (error) {
            console.error("Failed to download resume:", error)
            toast.error('Could not download the resume. Please try again.')
        } finally {
            setDownloading(false)
        }
    }

    const handleDownloadPlan = async () => {
        try {
            setDownloadingPlan(true)
            await getInterviewPlanPdf(interviewId)
        } catch (error) {
            console.error("Failed to download interview plan:", error)
            toast.error('Could not download the interview plan. Please try again.')
        } finally {
            setDownloadingPlan(false)
        }
    }

    if (loading || !report) {
        return (
            <main className='loading-screen'>
                <h1>Loading your interview plan...</h1>
            </main>
        )
    }

    const scoreColor =
        report.matchScore >= 80 ? 'score--high' :
            report.matchScore >= 60 ? 'score--mid' : 'score--low'
    const filterQuestions = (questions) => questions.filter((question) =>
        [question.question, question.intention, question.answer]
            .some((value) => String(value ?? '').toLowerCase().includes(questionSearch.trim().toLowerCase()))
    )

    return (
        <div className='interview-page'>
            <Navbar />
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
                                aria-current={activeNav === item.id ? 'page' : undefined}
                                aria-pressed={activeNav === item.id}
                            >
                                <span className='interview-nav__icon'>{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </div>
                    <div className='interview-download-actions'>
                        <button
                            onClick={handleDownloadResume}
                            disabled={downloading}
                            className='button primary-button' >
                            {downloading ? (
                                <Loader className="loader--small" message="Downloading..." />
                            ) : (
                                <>
                                    <svg height={"0.8rem"} style={{ marginRight: "0.8rem" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.6144 17.7956 11.492 15.7854C12.2731 13.9966 13.6789 12.5726 15.4325 11.7942L17.8482 10.7219C18.6162 10.381 18.6162 9.26368 17.8482 8.92277L15.5079 7.88394C13.7092 7.08552 12.2782 5.60881 11.5105 3.75894L10.6215 1.61673C10.2916.821765 9.19319.821767 8.8633 1.61673L7.97427 3.75892C7.20657 5.60881 5.77553 7.08552 3.97685 7.88394L1.63658 8.92277C.868537 9.26368.868536 10.381 1.63658 10.7219L4.0523 11.7942C5.80589 12.5726 7.21171 13.9966 7.99275 15.7854L8.8704 17.7956C9.20776 18.5682 10.277 18.5682 10.6144 17.7956ZM19.4014 22.6899 19.6482 22.1242C20.0882 21.1156 20.8807 20.3125 21.8695 19.8732L22.6299 19.5353C23.0412 19.3526 23.0412 18.7549 22.6299 18.5722L21.9121 18.2532C20.8978 17.8026 20.0911 16.9698 19.6586 15.9269L19.4052 15.3156C19.2285 14.8896 18.6395 14.8896 18.4628 15.3156L18.2094 15.9269C17.777 16.9698 16.9703 17.8026 15.956 18.2532L15.2381 18.5722C14.8269 18.7549 14.8269 19.3526 15.2381 19.5353L15.9985 19.8732C16.9874 20.3125 17.7798 21.1156 18.2198 22.1242L18.4667 22.6899C18.6473 23.104 19.2207 23.104 19.4014 22.6899Z"></path></svg>
                                    Download Resume
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleDownloadPlan}
                            disabled={downloadingPlan}
                            className='button primary-button' >
                            {downloadingPlan ? (
                                <Loader className="loader--small" message="Downloading plan..." />
                            ) : 'Download Plan'}
                        </button>
                    </div>
                </nav>

                <div className='interview-divider' />

                {/* ── Center Content ── */}
                <main className='interview-content'>
                    <section className='report-overview' aria-label='Interview plan overview'>
                        <div className='report-overview__heading'>
                            <div>
                                <p className='report-overview__eyebrow'>YOUR PERSONALIZED GAME PLAN</p>
                                <h1>{report.title || 'Interview preparation plan'}</h1>
                            </div>
                            <span className='report-overview__badge'>AI ANALYSIS</span>
                        </div>
                        <div className='report-overview__stats'>
                            <div><strong>{report.technicalQuestions.length + report.behavioralQuestions.length}</strong><span>Questions</span></div>
                            <div><strong>{report.skillGaps.length}</strong><span>Skills to sharpen</span></div>
                            <div><strong>{report.preparationPlan.length}</strong><span>Days of preparation</span></div>
                        </div>
                    </section>
                    {activeNav === 'technical' && (
                        <section className='content-section' aria-label='Technical questions'>
                            <div className='content-header'>
                                <h2>Technical Questions</h2>
                                <span className='content-header__count'>{report.technicalQuestions.length} questions</span>
                            </div>
                            <label className='question-search'>
                                <span className='question-search__icon' aria-hidden='true'>⌕</span>
                                <span className='sr-only'>Search technical questions</span>
                                <input value={questionSearch} onChange={(event) => setQuestionSearch(event.target.value)} placeholder='Search questions and answers' />
                            </label>
                            <div className='q-list'>
                                {filterQuestions(report.technicalQuestions).map((q, i) => (
                                    <QuestionCard key={i} item={q} index={i} />
                                ))}
                                {filterQuestions(report.technicalQuestions).length === 0 && <p className='question-empty'>No technical questions match that search.</p>}
                            </div>
                        </section>
                    )}

                    {activeNav === 'behavioral' && (
                        <section className='content-section' aria-label='Behavioral questions'>
                            <div className='content-header'>
                                <h2>Behavioral Questions</h2>
                                <span className='content-header__count'>{report.behavioralQuestions.length} questions</span>
                            </div>
                            <label className='question-search'>
                                <span className='question-search__icon' aria-hidden='true'>⌕</span>
                                <span className='sr-only'>Search behavioral questions</span>
                                <input value={questionSearch} onChange={(event) => setQuestionSearch(event.target.value)} placeholder='Search questions and answers' />
                            </label>
                            <div className='q-list'>
                                {filterQuestions(report.behavioralQuestions).map((q, i) => (
                                    <QuestionCard key={i} item={q} index={i} />
                                ))}
                                {filterQuestions(report.behavioralQuestions).length === 0 && <p className='question-empty'>No behavioral questions match that search.</p>}
                            </div>
                        </section>
                    )}

                    {activeNav === 'roadmap' && (
                        <section className='content-section' aria-label='Preparation roadmap'>
                            <div className='content-header'>
                                <h2>Preparation Road Map</h2>
                                <span className='content-header__count'>{report.preparationPlan.length}-day plan</span>
                            </div>
                            <div className='roadmap-list'>
                                {report.preparationPlan.map((day) => (
                                    <RoadMapDay key={day.day} day={day} completedTasks={completedTasks} setCompletedTasks={setCompletedTasks} />
                                ))}
                            </div>
                        </section>
                    )}
                </main>

                <div className='interview-divider' />

                {/* ── Right Sidebar ── */}
                <aside className='interview-sidebar'>

                    {/* Match Score */}
                    <div className='match-score'>
                        <p className='match-score__label'>Match Score</p>
                        <div
                            className={`match-score__ring ${scoreColor}`}
                            style={{ '--score': `${report.matchScore}%` }}
                            role='progressbar'
                            aria-label='Match score'
                            aria-valuemin='0'
                            aria-valuemax='100'
                            aria-valuenow={report.matchScore}
                        >
                            <span className='match-score__value'>{report.matchScore}</span>
                            <span className='match-score__pct'>%</span>
                        </div>
                        <p className='match-score__sub'>{report.matchScore >= 80 ? 'Strong match for this role' : report.matchScore >= 60 ? 'Good foundation to build on' : 'Opportunity to strengthen your fit'}</p>
                        <p className='match-score__description'>How closely your profile aligns with the requirements in this role.</p>
                    </div>

                    <div className='sidebar-divider' />

                    {/* Skill Gaps */}
                    <div className='skill-gaps'>
                        <p className='skill-gaps__label'>Skill Gaps</p>
                        <div className='skill-gaps__list'>
                            {report.skillGaps.length ? report.skillGaps.map((gap, i) => (
                                <span key={i} className={`skill-tag skill-tag--${gap.severity}`}>
                                    {gap.skill}
                                </span>
                            )) : <span className='skill-gaps__empty'>No major skill gaps identified</span>}
                        </div>
                    </div>

                </aside>
            </div>
        </div>
    )
}

export default Interview