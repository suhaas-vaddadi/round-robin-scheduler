import { useEffect, useRef, useState } from "react";
import Instructions from "./components/ui/Instructions";
import AvailabilityCalendar from "./components/AvailabilityCalendar";
import Demographics from "./components/Demographics";

const AVAILABILITY_DAYS = [
  {
    date: "Monday, March 2nd",
    blocks: [
      { id: "mon_slot1", label: "9:00 AM - 11:30 AM" },
      { id: "mon_slot2", label: "2:00 PM - 4:30 PM" },
      { id: "mon_slot3", label: "5:00 PM - 7:30 PM" },
    ],
  },
  {
    date: "Tuesday, March 3rd",
    blocks: [
      { id: "tue_slot1", label: "8:30 AM - 11:00 AM" },
      { id: "tue_slot2", label: "12:30 PM - 3:00 PM" },
    ],
  },
  {
    date: "Wednesday, March 4th",
    blocks: [
      { id: "wed_slot1", label: "10:00 AM - 12:30 PM" },
      { id: "wed_slot2", label: "3:30 PM - 6:00 PM" },
    ],
  },
  {
    date: "Thursday, March 5th",
    blocks: [
      { id: "thu_slot1", label: "9:30 AM - 12:00 PM" },
      { id: "thu_slot2", label: "1:00 PM - 3:30 PM" },
      { id: "thu_slot3", label: "4:30 PM - 7:00 PM" },
    ],
  },
  {
    date: "Friday, March 6th",
    blocks: [
      { id: "fri_slot1", label: "8:00 AM - 10:30 AM" },
      { id: "fri_slot2", label: "11:30 AM - 2:00 PM" },
      { id: "fri_slot3", label: "3:00 PM - 5:30 PM" },
    ],
  },
];

const INSTRUCTIONS_TEXT = [
  "You will be asked to select dates for subsequent sessions of the study.",
  "Please keep in mind that if you select a date, you are indicating that you are available to attend a session on that date.",
  "If you are unable to attend a scheduled session, please contact us as soon as possible as we would like to be respectful of other's times.",
  "Additionally, our study requires participants to be confident in their english conversational skills.",
  "If you are not confident, please contact us through SONA as this is a requirement for this study.",
];

interface AvailabilityData {
  availability: Record<string, boolean>;
}

interface OutstandingDatesData {
  outstandingDates: string;
}

interface PartnerHistoryData {
  partnerHistory: boolean;
  partnerHistoryMonths: string;
  matrixSelections: Record<number, number>;
}

interface SelfFrequencyData {
  order: string[];
  ratings: Record<string, string | number>;
}

interface MatrixData {
  order: string[];
  matrixSelections: Record<number, number>;
}

interface DemographicsData {
  age: string;
  hispanicLatino: boolean;
  races: string[];
  otherRace: string;
  sex: string;
  zipCode: string;
}

interface ExperienceData {
  sync: number;
  wavelength: number;
  text: string;
}

interface StudyFeedbackData {
  text: string;
}

interface PartnerSlidersData {
  order: string[];
  sliderSelections: Record<number, number>;
}

interface TransitionRating {
  initial: string;
  final: string;
  rating: number;
  person?: string;
}

type StepData =
  | AvailabilityData
  | OutstandingDatesData
  | PartnerHistoryData
  | SelfFrequencyData
  | MatrixData
  | DemographicsData
  | ExperienceData
  | StudyFeedbackData
  | PartnerSlidersData;

interface ClassificationTaskMainProps {
  formData: {
    participantId: string;
    fullName: string;
    sessionTime: string;
    sessionDate: string;
    email: string;
  };
  csvFilePath: string;
  onComplete?: () => void;
}

function ClassificationTaskMain({
  formData: _formData,
  csvFilePath,
  onComplete,
}: ClassificationTaskMainProps) {
  const trail_number = useRef<number>(1);
  const csvEscape = (value: unknown) => {
    const s = value !== undefined && value !== null ? String(value) : "";
    if (
      s.includes(",") ||
      s.includes('"') ||
      s.includes("\n") ||
      s.includes("\r")
    ) {
      const noNewlines = s.replace(/\r?\n|\r/g, " ");
      const escapedQuotes = noNewlines.replace(/"/g, '""');
      return `"${escapedQuotes}"`;
    }
    return s;
  };

  const ratingPeople = ["your partner", "an average UW-Madison student"];

  const [currentStep, setCurrentStep] = useState<string>("instructions");
  const [instructionIndex, setInstructionIndex] = useState<number>(0);
  const [currentPersonIndex, setCurrentPersonIndex] = useState<number>(0);
  const [shuffledPeople] = useState<string[]>(() =>
    [...ratingPeople].sort(() => Math.random() - 0.5),
  );
  const [blockRandomized] = useState<string[]>(() =>
    ["loneliness", "socialConnectedness", "expressivity"].sort(
      () => Math.random() - 0.5,
    ),
  );

  const [allRatings, setAllRatings] = useState<TransitionRating[]>([]);
  const [showTransition, setShowTransition] = useState<boolean>(false);
  const [formOrder, setFormOrder] = useState<string[]>([
    "emotionTransitions",
    "selfFrequency",
    "experience",
    "partnerSliders",
    blockRandomized[0],
    blockRandomized[1],
    blockRandomized[2],
    "autism",
    "partnerHistory",
    "demographics",
    "studyFeedback",
  ]);
  const [currentFormIndex, setCurrentFormIndex] = useState<number>(0);

  const handleStepComplete = async (stepData?: StepData) => {
    switch (currentStep) {
      case "availability":
        try {
          const availabilityData = (stepData as AvailabilityData)?.availability;
          const selections = availabilityData || {};

          const allBlocks = AVAILABILITY_DAYS.flatMap((d) => d.blocks);

          const selectedLabels = Object.entries(selections)
            .filter(([_, isSelected]) => isSelected)
            .map(([id, _]) => {
              const block = allBlocks.find((b) => b.id === id);
              const day = AVAILABILITY_DAYS.find((d) =>
                d.blocks.some((b) => b.id === id),
              );
              return block && day ? `${day.date}: ${block.label}` : id;
            });

          const result = await fetch(`/api/availability`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              participant_id: _formData.participantId,
              availabilities: selectedLabels,
            }),
          });

          if (!result.ok) {
            alert("Failed to connect to database. Please contact the researchers.");
            return;
          }
        } catch (e) {
          console.error("Failed to save availability data", e);
        }

        setCurrentStep("demographics");
        break;
      case "instructions":
        setCurrentStep("availability");
        break;
      case "demographics":
        const demoData = stepData as DemographicsData;
        console.log("demoData", demoData);
        try {
          const result = await fetch(`/api/demographics`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              participant_id: _formData.participantId,
              age: demoData.age,
              hispanicLatino: demoData.hispanicLatino,
              races: demoData.races,
              otherRace: demoData.otherRace,
              sex: demoData.sex,
              zipCode: demoData.zipCode,
            }),
          });

          if (!result.ok) {
            alert("Failed to connect to database. Please contact the researchers.");
            return;
          }
        } catch (e) {
          console.error("Failed to save demographics data", e);
        }
        setCurrentStep("completed");
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const handleKeyPress = async (_event: KeyboardEvent) => {
      if (currentStep === "instructions") {
        if (instructionIndex >= INSTRUCTIONS_TEXT.length - 1) {
          handleStepComplete();
          return;
        }
        setInstructionIndex((i) => i + 1);
        return;
      }

      if (currentStep === "ratings" && showTransition && _event.key === " ") {
        _event.preventDefault();
        return;
      }

      if (currentStep === "completed") {
        onComplete?.();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentStep, instructionIndex, showTransition, onComplete]);

  if (currentStep === "completed") {
    onComplete?.();
    return null;
  }

  return (
    <div className="min-h-full w-full flex flex-col items-center justify-center bg-black">
      <div className=" w-full mx-auto px-8">
        {currentStep === "availability" && (
          <AvailabilityCalendar
            days={AVAILABILITY_DAYS}
            onComplete={(data) => handleStepComplete(data)}
          />
        )}
        {currentStep === "instructions" && (
          <div className="overflow-hidden h-screen justify-center items-center">
            <Instructions
              onBack={() => setInstructionIndex((i) => Math.max(0, i - 1))}
              instructionIndex={instructionIndex}
              groupSize={3}
              instructions={INSTRUCTIONS_TEXT}
            />
          </div>
        )}
        {currentStep === "demographics" && (
          <Demographics onContinue={(data) => handleStepComplete(data)} />
        )}
      </div>
    </div>
  );
}

export default ClassificationTaskMain;
