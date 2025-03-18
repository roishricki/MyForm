import { Step } from "@/types/myForm";

const StepIndicator: React.FC<{ stepData: Step, isActive: boolean, isMobile: boolean }> = ({ stepData, isActive, isMobile }) => (
    <div className={isMobile ? "" : "flex items-center space-x-4"}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isMobile ? 'border' : 'border-2'} ${
        isActive 
          ? 'bg-light-blue text-marine-blue border-light-blue' 
          : isMobile ? 'border-white text-white' : 'border-white'
      }`}>
        <span className="font-bold">{stepData.num}</span>
      </div>
      {!isMobile && (
        <div>
          <p className="text-light-blue text-sm">{stepData.subtitle}</p>
          <p className="font-medium tracking-wider">{stepData.title}</p>
        </div>
      )}
    </div>
);

export default StepIndicator