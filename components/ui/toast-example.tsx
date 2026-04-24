// Example usage of toast notifications

import { useToast } from '@/components/ui/toast'

export default function ExampleComponent() {
    const { showToast } = useToast()

    const handleSuccess = () => {
        showToast('success', 'Release approved!', 'LOTO status: CLOSE')
    }

    const handleError = () => {
        showToast('error', 'Failed to submit', 'Please check your input and try again.')
    }

    const handleWarning = () => {
        showToast('warning', 'Pending approval', 'HAR approval required before proceeding.')
    }

    const handleInfo = () => {
        showToast('info', 'System update', 'New features have been added to the LOTO system.')
    }

    return (
        <div className="space-y-4">
            <button onClick={handleSuccess}>Show Success Toast</button>
            <button onClick={handleError}>Show Error Toast</button>
            <button onClick={handleWarning}>Show Warning Toast</button>
            <button onClick={handleInfo}>Show Info Toast</button>
        </div>
    )
}
