import React, { useState, useRef } from 'react'
import "../style/home.scss"
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate } from 'react-router'
import toast from 'react-hot-toast'
import { useAuth } from '../../auth/hooks/useAuth.js'
import Navbar from '../../auth/components/Navbar.jsx'

const Home = () => {
    const { generateReport, reports } = useInterview()
    const { user } = useAuth()
    const [jobDescription, setJobDescription] = useState("")
    const [selfDescription, setSelfDescription] = useState("")
    const [selectedFile, setSelectedFile] = useState(null)
    const [isDragging, setIsDragging] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [isGenerating, setIsGenerating] = useState(false)
    const resumeInputRef = useRef()
    const navigate = useNavigate()

    const handleFileSelection = (file) => {
        if (!file) return

        const extension = file.name.split('.').pop()?.toLowerCase()
        if (!['pdf', 'docx'].includes(extension) || file.size > 3 * 1024 * 1024) {
            toast.error('Choose a PDF or DOCX file smaller than 3 MB.')
            if (resumeInputRef.current) resumeInputRef.current.value = ""
            return
        }

        setSelectedFile(file)
        setSelfDescription("")
    }

    const handleFileChange = (event) => {
        handleFileSelection(event.target.files?.[0])
    }

    const handleDrop = (event) => {
        event.preventDefault()
        setIsDragging(false)
        handleFileSelection(event.dataTransfer.files?.[0])
    }

    const clearFile = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (resumeInputRef.current) resumeInputRef.current.value = "";
        setSelectedFile(null);
    }

    const handleGenerateReport = async () => {
        if (isGenerating) return

        // Require authentication before generating a report
        if (!user) {
            toast.error('Please login to generate your interview strategy')
            navigate('/login')
            return
        }

        // 1. Core target job validation
        if (!jobDescription.trim()) {
            toast.error("Please paste the target job description.")
            return
        }

        // 2. Either/Or validation logic
        if (!selectedFile && !selfDescription.trim()) {
            toast.error("Please provide either a Resume upload OR a Self Description to proceed.")
            return
        }

        setIsGenerating(true)
        try {
            setUploadProgress(0)
            // Pass whatever is active; the hooks/backend will handle the filled parameters
            const data = await generateReport({
                jobDescription,
                selfDescription: selectedFile ? "" : selfDescription,
                resumeFile: selectedFile,
                onUploadProgress: (event) => {
                    if (event.total) setUploadProgress(Math.round((event.loaded / event.total) * 100))
                }
            })

            if (data && data._id) {
                toast.success('Your interview strategy is ready.')
                navigate(`/interview/${data._id}`)
            } else if (data && data.interviewReport && data.interviewReport._id) {
                toast.success('Your interview strategy is ready.')
                navigate(`/interview/${data.interviewReport._id}`)
            } else {
                throw new Error('Your strategy was generated, but no report link was returned.')
            }
        } catch (error) {
            console.error("Failed to generate interview strategy:", error)
            toast.error(error?.response?.data?.message || error.message || "Failed to generate interview strategy. Please try again.")
        } finally {
            setIsGenerating(false)
        }
    }

    // Determine states based on user choice
    const isFileActive = !!selectedFile;
    const isTextActive = selfDescription.trim().length > 0;

    return (
        <div className='home-page' id='main-content'>
            <Navbar />
            <header className='page-header'>
                <span className='page-header__eyebrow'><span className='status-dot' /> YOUR NEXT INTERVIEW, BETTER PREPARED</span>
                <h1>Your Next Job Starts With <span className='highlight'>Better Preparation.</span></h1>
                <p>Turn your resume and target job description into a personalized interview strategy, skill-gap analysis, and career roadmap.</p>
            </header>

            <div className='career-visual' aria-hidden='true'>
                <div className='career-visual__orbit career-visual__orbit--outer' />
                <div className='career-visual__orbit career-visual__orbit--inner' />
                <div className='career-visual__document'>
                    <span className='career-visual__document-icon'>CV</span>
                    <span className='career-visual__line career-visual__line--long' />
                    <span className='career-visual__line' />
                    <span className='career-visual__line career-visual__line--short' />
                </div>
                <span className='career-visual__skill career-visual__skill--one'>Your experience</span>
                <span className='career-visual__skill career-visual__skill--two'>Target role</span>
                <span className='career-visual__spark'>✦</span>
            </div>

            <ol className='workflow-steps' aria-label='Plan creation steps'>
                <li className='workflow-step workflow-step--active'><span>01</span><div><strong>Add a role</strong><small>Paste the job description</small></div></li>
                <li className={`workflow-step ${isFileActive || isTextActive ? 'workflow-step--complete' : ''}`}><span>02</span><div><strong>Share your profile</strong><small>Resume or a quick intro</small></div></li>
                <li className='workflow-step'><span>03</span><div><strong>Get your game plan</strong><small>Questions, gaps & roadmap</small></div></li>
            </ol>

            <section className='plan-builder' aria-label='Create an interview plan'>
            <div className='plan-builder__intro'>
                <span className='plan-builder__kicker'>PERSONALIZED PREPARATION</span>
                <h2>Start with the role you want</h2>
                <p>Share the job details and a little about your experience. We’ll take it from there.</p>
            </div>
            <div className='interview-card' aria-label='Create an interview plan'>
            <div className='interview-card__body'>

                    {/* Left Panel - Job Description */}
                    <div className='panel panel--left'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                            </span>
                            <h2>Target Job Description</h2>
                            <span className='badge badge--required'>Required</span>
                        </div>
                        <label className='section-label' htmlFor='jobDescription'>Paste the job description</label>
                        <textarea
                            id='jobDescription'
                            name='jobDescription'
                            onChange={(e) => setJobDescription(e.target.value)}
                            value={jobDescription}
                            className='panel__textarea'
                            placeholder="Paste the job description here — include responsibilities, required skills, and qualifications..."
                            maxLength={5000}
                            required
                        />
                        <div className='char-counter' aria-live='polite' aria-atomic='true'>{jobDescription.length} / 5000 chars</div>
                    </div>

                    {/* Vertical Divider */}
                    <div className='panel-divider' />

                    {/* Right Panel - Profile (Enforced Exclusive Option) */}
                    <div className='panel panel--right'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </span>
                            <h2>Your Profile</h2>
                            <span className={`badge ${isFileActive || isTextActive ? 'badge--complete' : 'badge--required'}`}>
                                {isFileActive || isTextActive ? 'Profile added' : 'Choose one option'}
                            </span>
                        </div>

                        {/* Option A: Upload Resume */}
                        <div className='upload-section'>
                            <p className='section-label'>
                                Option A: Upload Resume
                            </p>
                                <label
                                    className={`dropzone ${isFileActive ? 'dropzone--has-file' : ''} ${isDragging ? 'dropzone--dragging' : ''}`}
                                    htmlFor='resume'
                                    onDragOver={(event) => { event.preventDefault(); setIsDragging(true) }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={handleDrop}
                                >
                                    <span className='dropzone__icon'>
                                    {isFileActive ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
                                    )}
                                </span>
                                <p className='dropzone__title'>
                                    {isFileActive ? selectedFile.name : "Drop your resume here"}
                                </p>
                                {!isFileActive && <p className='dropzone__subtitle'>or click to browse · PDF or DOCX · Up to 3 MB</p>}
                                <input
                                    ref={resumeInputRef}
                                    onChange={handleFileChange}
                                    className='dropzone__input'
                                    type='file'
                                    id='resume'
                                    name='resume'
                                    accept='.pdf,.docx'
                                />
                            </label>
                            {isFileActive && (
                                <button type='button' onClick={clearFile} className='clear-file-btn'>
                                    Remove resume
                                </button>
                            )}
                        </div>

                        {/* OR Separation Graphic */}
                        <div className='or-divider'><span>OR</span></div>

                        {/* Option B: Quick Self-Description */}
                        <div className={`self-description ${isFileActive ? 'disabled-zone' : ''}`}>
                            <label className='section-label' htmlFor='selfDescription'>Option B: Quick Self-Description</label>
                            <textarea
                                id='selfDescription'
                                name='selfDescription'
                                value={selfDescription}
                                onChange={(event) => {
                                    if (selectedFile) {
                                        setSelectedFile(null)
                                        if (resumeInputRef.current) resumeInputRef.current.value = ""
                                    }
                                    setSelfDescription(event.target.value)
                                }}
                                className='panel__textarea panel__textarea--short'
                                placeholder="For example: 3 years building React apps, experienced with Node.js and MongoDB..."
                            />
                        </div>

                        {/* Dynamic Requirement Help Box */}
                        <div className={`info-box ${isFileActive || isTextActive ? 'info-box--success' : ''}`} aria-live='polite'>
                            <span className='info-box__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" stroke="#1a1f27" strokeWidth="2" /><line x1="12" y1="16" x2="12.01" y2="16" stroke="#1a1f27" strokeWidth="2" /></svg>
                            </span>
                            <p>
                                {isFileActive && <span>Resume ready. Remove it to switch to a written profile.</span>}
                                {isTextActive && <span>Your written profile is ready. Uploading a resume will replace this text.</span>}
                                {!isFileActive && !isTextActive && <span>Choose <strong>one</strong> profile option to personalize your interview strategy.</span>}
                            </p>
                        </div>
                        </div>
                </div>

                <div className='interview-card__footer'>
                    <span className='footer-info'><span className='footer-info__sparkle'>✦</span> AI-powered analysis · Usually ready in under a minute</span>
                    {isGenerating && selectedFile && (
                        <div className='upload-progress' aria-live='polite'>
                            <div className='upload-progress__label'>
                                <span>Sending resume with your job details</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <div className='upload-progress__track' role='progressbar' aria-label='Resume upload progress' aria-valuemin='0' aria-valuemax='100' aria-valuenow={uploadProgress}>
                                <span style={{ width: `${uploadProgress}%` }} />
                            </div>
                        </div>
                    )}
                    <button onClick={handleGenerateReport} disabled={isGenerating} className='generate-btn'>
                        {isGenerating ? (
                            <>
                                <span className='btn-spinner' />
                                Building your plan…
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
                                Generate My Interview Strategy
                            </>
                        )}
                    </button>
                </div>
            </div>
            </section>

            {/* Recent Reports List */}
            {reports && reports.length > 0 && (
                <section className='recent-reports'>
                    <h2>My Recent Interview Plans</h2>
                    <ul className='reports-list'>
                        {reports.map(report => (
                            <li key={report._id}>
                                <button type='button' className='report-item' onClick={() => navigate(`/interview/${report._id}`)}>
                                <h3>{report.title || 'Untitled Position'}</h3>
                                <p className='report-meta'>Generated on {new Date(report.createdAt).toLocaleDateString()}</p>
                                <p className={`match-score ${report.matchScore >= 80 ? 'score--high' : report.matchScore >= 60 ? 'score--mid' : 'score--low'}`}>Match Score: {report.matchScore}%</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <footer className='page-footer'>
                <span>Thoughtful preparation. Confident conversations.</span>
                <a href='#main-content'>Back to top ↑</a>
            </footer>
        </div>
    )
}

export default Home