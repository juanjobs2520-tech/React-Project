interface StepperProps {
  steps: string[];
  currentStep: number;
}

const Stepper = ({ steps, currentStep }: StepperProps) => (
  <ol className="edugest-stepper">
    {steps.map((label, index) => {
      const stepNum = index + 1;
      const isActive = stepNum === currentStep;
      const isDone = stepNum < currentStep;
      return (
        <li
          key={label}
          className={`edugest-stepper-item ${isActive ? 'edugest-stepper-item-active' : ''} ${isDone ? 'edugest-stepper-item-done' : ''}`}
        >
          <span className="edugest-stepper-number">{stepNum}</span>
          <span className="edugest-stepper-label">{label}</span>
        </li>
      );
    })}
  </ol>
);

export default Stepper;
