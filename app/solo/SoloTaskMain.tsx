import { useEffect, useRef, useState } from "react";
import Instructions from "./components/ui/Instructions";
import AvailabilityCalendar, { DayAvailability } from "./components/AvailabilityCalendar";
import Demographics from "./components/Demographics";

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
  hispanicLatino: boolean | undefined;
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
  const [availabilityDays, setAvailabilityDays] = useState<DayAvailability[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isFetchingInitialData, setIsFetchingInitialData] = useState<boolean>(true);
  const [initialAvailability, setInitialAvailability] = useState<Record<string, boolean>>({});
  const [initialDemographics, setInitialDemographics] = useState<DemographicsData | null>(null);

  useEffect(() => {
    const loadTimes = async () => {
      try {
        setIsFetchingInitialData(true);
        const [resTimes, resAvlbl, resDemo] = await Promise.all([
          fetch("/api/available_times"),
          fetch(`/api/availability?participant_id=${_formData.participantId}`),
          fetch(`/api/demographics?participant_id=${_formData.participantId}`)
        ]);
        
        const jsonTimes = await resTimes.json();
        if (jsonTimes.data) {
          const rows = jsonTimes.data as { session_date: string; session_time: string }[];
          const grouped: Record<string, { id: string; label: string }[]> = {};
          
          for (const row of rows) {
            if (!grouped[row.session_date]) {
              grouped[row.session_date] = [];
            }
            grouped[row.session_date].push({
              id: `${row.session_date}_${row.session_time}`,
              label: row.session_time,
            });
          }

          const parseTime = (timeStr: string) => {
            const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
            if (!match) return 0;
            let hours = parseInt(match[1]);
            const minutes = parseInt(match[2]);
            const isPM = match[3].toUpperCase() === "PM";
            if (isPM && hours !== 12) hours += 12;
            if (!isPM && hours === 12) hours = 0;
            return hours * 60 + minutes;
          };

          const formatted = Object.keys(grouped).map((date) => {
            // Sort blocks within this day chronologically
            const sortedBlocks = grouped[date].sort((a, b) => parseTime(a.label) - parseTime(b.label));
            return {
              date,
              blocks: sortedBlocks,
            };
          });

          // Sort the days themselves chronologically
          formatted.sort((a, b) => {
            const parseDateString = (d: string) => {
              const parts = d.split(",");
              const datePart = parts.length > 1 ? parts.slice(1).join(",").trim() : d.trim();
              const clean = datePart.replace(/(\d+)(st|nd|rd|th)/gi, "$1");
              const time = new Date(clean).getTime();
              return isNaN(time) ? 0 : time;
            };
            return parseDateString(a.date) - parseDateString(b.date);
          });

          setAvailabilityDays(formatted);
        }

        if (resAvlbl.ok) {
          const jsonAvlbl = await resAvlbl.json();
          if (jsonAvlbl.data && Array.isArray(jsonAvlbl.data)) {
            const availMap: Record<string, boolean> = {};
            jsonAvlbl.data.forEach((row: any) => {
              if (row.availability_string) {
                const id = row.availability_string.replace(": ", "_");
                availMap[id] = true;
              }
            });
            setInitialAvailability(availMap);
          }
        }

        if (resDemo.ok) {
          const jsonDemo = await resDemo.json();
          if (jsonDemo.data) {
            const row = jsonDemo.data;
            let parsedRaces: string[] = [];
            try {
              parsedRaces = typeof row.races === "string" ? JSON.parse(row.races) : (row.races || []);
            } catch (e) {
              if (typeof row.races === "string") {
                parsedRaces = row.races.split(",").map((s: string) => s.trim());
              }
            }
            setInitialDemographics({
              age: row.age?.toString() || "",
              hispanicLatino: row.hispanic_latino === 1 ? true : row.hispanic_latino === 0 ? false : undefined,
              races: parsedRaces,
              otherRace: row.other_race || "",
              sex: row.sex || "",
              zipCode: row.zip_code || ""
            });
          }
        }
      } catch (e) {
        console.error("Failed to load initial data", e);
      } finally {
        setIsFetchingInitialData(false);
      }
    };
    loadTimes();
  }, [_formData.participantId]);

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
          setIsSubmitting(true);
          const availabilityData = (stepData as AvailabilityData)?.availability;
          const selections = availabilityData || {};

          const allBlocks = availabilityDays.flatMap((d) => d.blocks);

          const selectedLabels = Object.entries(selections)
            .filter(([_, isSelected]) => isSelected)
            .map(([id, _]) => {
              const block = allBlocks.find((b) => b.id === id);
              const day = availabilityDays.find((d) =>
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
            setIsSubmitting(false);
            return;
          }
        } catch (e) {
          console.error("Failed to save availability data", e);
        } finally {
          setIsSubmitting(false);
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
          setIsSubmitting(true);
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
            setIsSubmitting(false);
            return;
          }
        } catch (e) {
          console.error("Failed to save demographics data", e);
        } finally {
          setIsSubmitting(false);
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

  if (isFetchingInitialData) {
    return (
      <div className="min-h-full w-full flex flex-col items-center justify-center bg-black">
        <h1 className="text-white text-2xl animate-pulse">Loading participant data...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-full w-full flex flex-col items-center justify-center bg-black">
      <div className=" w-full mx-auto px-8">
        {currentStep === "availability" && (
          <AvailabilityCalendar
            days={availabilityDays}
            loading={isSubmitting}
            initialAvailability={initialAvailability}
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
            loading={isSubmitting}
            initialData={initialDemographics}
            onContinue={(data) => handleStepComplete(data)}
          />
        )}
      </div>
    </div>
  );
}

export default ClassificationTaskMain;
