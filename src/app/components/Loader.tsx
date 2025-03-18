
const Loader:React.FC<{msg:string}> = ({ msg }) => {
    
    return (
        <div className="min-h-screen bg-magnolia flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <p className="text-marine-blue">{msg}</p>
          </div>
        </div>
      );
}

export default Loader