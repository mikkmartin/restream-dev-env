export const CornerTopLeft = ({ className }: { className?: string }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M16.5 8.5H10.7857C9.52335 8.5 8.5 9.52335 8.5 10.7857V16.5" stroke="white" strokeWidth={2.28571} strokeLinecap="round" />
    </svg>
)

export const EdgeTop = ({ className }: { className?: string }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <line x1="17.0715" y1="9.07142" x2="7.92864" y2="9.07142" stroke="white" strokeWidth={2.28571} strokeLinecap="round" />
        <line x1="12.4998" y1="10.2143" x2="12.4998" y2="15.9286" stroke="white" strokeWidth={2.28571} strokeLinecap="round" />
    </svg>
)

export const Center = ({ className }: { className?: string }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <line x1={12.4998} y1={8.5} x2={12.4998} y2={17.6429} stroke="white" strokeWidth={2.28571} strokeLinecap="round" />
        <line x1={17.0715} y1={13.0714} x2={7.92864} y2={13.0714} stroke="white" strokeWidth={2.28571} strokeLinecap="round" />
    </svg>
)

