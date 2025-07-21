export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50" data-testid="loading-container">
      <div className="flex flex-col items-center space-y-4">
        {/* Loading Spinner */}
        <div
          className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"
          data-testid="loading-spinner"
          aria-hidden="true"
        />
        
        {/* Loading Text */}
        <p className="text-gray-600 text-sm">Loading...</p>
      </div>
    </div>
  );
}