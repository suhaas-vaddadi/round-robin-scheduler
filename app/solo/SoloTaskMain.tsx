import { useEffect, useRef, useState } from "react";
import Instructions from "./components/ui/Instructions";
import AvailabilityCalendar from "./components/AvailabilityCalendar";
import Demographics from "./components/Demographics";

const AVAILABILITY_DAYS = [
  {
    date: "Monday, October 23rd",
    blocks: [
      { id: "mon_slot1", label: "10:00 AM - 11:30 AM" },
      { id: "mon_slot2", label: "2:00 PM - 3:30 PM" },
      { id: "mon_slot3", label: "4:00 PM - 5:00 PM" },
    ],
  },
  {
    date: "Tuesday, October 24th",
    blocks: [
      { id: "tue_slot1", label: "9:00 AM - 10:30 AM" },
      { id: "tue_slot2", label: "1:00 PM - 2:30 PM" },
    ],
  },
    {
    date: "Tuesday, October 24th",
    blocks: [
      { id: "tue_slot1", label: "9:00 AM - 10:30 AM" },
      { id: "tue_slot2", label: "1:00 PM - 2:30 PM" },
    ],
  },
    {
    date: "Tuesday, October 24th",
    blocks: [
      { id: "tue_slot1", label: "9:00 AM - 10:30 AM" },
      { id: "tue_slot2", label: "1:00 PM - 2:30 PM" },
    ],
  },
    {
    date: "Tuesday, October 24th",
    blocks: [
      { id: "tue_slot1", label: "9:00 AM - 10:30 AM" },
      { id: "tue_slot2", label: "1:00 PM - 2:30 PM" },
    ],
  },
    {
    date: "Tuesday, October 24th",
    blocks: [
      { id: "tue_slot1", label: "9:00 AM - 10:30 AM" },
      { id: "tue_slot2", label: "1:00 PM - 2:30 PM" },
    ],
  },
    {
    date: "Tuesday, October 24th",
    blocks: [
      { id: "tue_slot1", label: "9:00 AM - 10:30 AM" },
      { id: "tue_slot2", label: "1:00 PM - 2:30 PM" },
    ],
  },
];

const INSTRUCTIONS_TEXT = [
  "You will be asked to select dates for subsequent sessions of the study.",
  "Please keep in mind that if you select a date, you are indicating that you are available to attend a session on that date.",
  "If you are unable to attend a scheduled session, please contact us as soon as possible as we would like to be respectful of other's times.",
  "Additionally, our study requires participants to be confident in their english conversational skills.",
  "If you are not confident, please contact us through SONA as this is a requirement for this study."
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
  hispanicLatino: string;
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
    dyadId: string;
    participantId: string;
    subjectInitials: string;
    raName: string;
    sessionTime: string;
    sessionDate: string;
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

  const writeCSVRow = async (
    ratingTask: string,
    subTask: string,
    emotion1: string = "",
    emotion2: string = "",
    ratingPerson: string = "",
    response: number | string = "",
  ) => {
    return;
    const row = [
      _formData.dyadId,
      _formData.participantId,
      _formData.subjectInitials,
      _formData.raName,
      _formData.sessionTime,
      _formData.sessionDate,
      new Date().toISOString(),
      ratingTask,
      subTask,
      emotion1,
      emotion2,
      ratingPerson,
      response,
      trail_number.current,
      "1.0.3",
    ]
      .map(csvEscape)
      .join(",");
  };

  const [currentStep, setCurrentStep] = useState<string>("instructions");
  const [instructionIndex, setInstructionIndex] = useState<number>(0);
  const [currentPersonIndex, setCurrentPersonIndex] = useState<number>(0);
  const [shuffledPeople, setShuffledPeople] = useState<string[]>([]);
  const [allRatings, setAllRatings] = useState<TransitionRating[]>([]);
  const [showTransition, setShowTransition] = useState<boolean>(false);
  const [formOrder, setFormOrder] = useState<string[]>([]);
  const [currentFormIndex, setCurrentFormIndex] = useState<number>(0);

  const ratingPeople = [
    "yourself",
    "your partner",
    "an average UW-Madison student",
  ];

  useEffect(() => {
    const shuffled = [...ratingPeople].sort(() => Math.random() - 0.5);
    setShuffledPeople(shuffled);
    const blockRandomized = [
      "loneliness",
      "socialConnectedness",
      "expressivity",
    ].sort(() => Math.random() - 0.5);

    const forms = [
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
    ];
    setFormOrder(forms);
  }, [csvFilePath, _formData]);

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


  const handleAllTransitionsComplete = async (ratings: TransitionRating[]) => {
    setAllRatings((prev) => [...prev, ...ratings]);

    if (currentPersonIndex + 1 < shuffledPeople.length) {
      setShowTransition(true);
    } else {
      setCurrentFormIndex(1);
      setCurrentStep("selfFrequency");
      console.log("All ratings completed:", allRatings.concat(ratings));
    }
  };


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

          await writeCSVRow(
            "availability_calendar",
            `Selected Availability Slots`,
            "",
            "",
            "",
            selectedLabels.join("; "),
          );
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
        await writeCSVRow(
          "demographics",
          "Enter your age:",
          "",
          "",
          "",
          demoData?.age ?? "",
        );
        await writeCSVRow(
          "demographics",
          "Are you Spanish, Hispanic, or Latino?",
          "",
          "",
          "",
          demoData?.hispanicLatino ?? "",
        );
        await writeCSVRow(
          "demographics",
          "Choose one or more races that you consider yourself to be:",
          "",
          "",
          "",
          demoData?.races?.join(";") ?? "",
        );
        await writeCSVRow(
          "demographics",
          "Please specify (other race):",
          "",
          "",
          "",
          demoData?.otherRace ?? "",
        );
        await writeCSVRow(
          "demographics",
          "What is your sex?",
          "",
          "",
          "",
          demoData?.sex ?? "",
        );
        await writeCSVRow(
          "demographics",
          "Please provide the zip code of your permanent address (where you grew up):",
          "",
          "",
          "",
          demoData?.zipCode ?? "",
        );
        setCurrentStep("completed");
        onComplete?.();
        break;
      default:
        break;
    }
  };

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
          <Demographics
          onContinue={(data) => handleStepComplete(data)}
          />
        )}
      </div>
    </div>
  );
}

export default ClassificationTaskMain;
