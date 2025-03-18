import React, { ReactNode } from "react";

const ErrorMsg:React.FC<{error:ReactNode}> = ({error}) => {
    return (
        <div className="min-h-screen bg-magnolia flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <p className="text-strawberry-red">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-marine-blue text-white rounded-md"
            >
              Retry
            </button>
          </div>
        </div>
      );
}

export default ErrorMsg