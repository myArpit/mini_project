const PasswordVisibilityIcon = ({ visible }) => (
    <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        {visible ? (
            <>
                <path d="M3 3l18 18" />
                <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                <path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c5.2 0 8.6 4.5 9.5 6-.4.7-1.3 2-2.8 3.4" />
                <path d="M6.2 6.2C3.9 7.7 2.7 9.6 2.5 10c.9 1.5 4.3 6 9.5 6 1 0 1.9-.2 2.7-.5" />
            </>
        ) : (
            <>
                <path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" />
                <circle cx="12" cy="12" r="2.5" />
            </>
        )}
    </svg>
)

export default PasswordVisibilityIcon
