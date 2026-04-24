export default function TestPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-neon">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-dark">TEST PAGE WORKING!</h1>
                <p className="text-2xl text-dark mt-4">If you see this, routing is OK</p>
                <a href="/login" className="text-dark underline text-xl">Go to Login</a>
            </div>
        </div>
    )
}
