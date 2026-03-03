import { useState } from "react";
import ConfirmationModal from "./ui/ConfirmationModal";


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

export interface ClassifcationTaskProps {
  onContinue?: (data?: StepData) => void;
  loading?: boolean;
  initialData?: DemographicsData | null;
}

export default function Demographics({ onContinue, loading = false, initialData = null }: ClassifcationTaskProps) {
  const [age, setAge] = useState<string>(initialData?.age || "");
  const [hispanicLatino, setHispanicLatino] = useState<boolean | undefined>(initialData?.hispanicLatino);
  const [races, setRaces] = useState<string[]>(initialData?.races || []);
  const [otherRace, setOtherRace] = useState<string>(initialData?.otherRace || "");
  const [sex, setSex] = useState<string>(initialData?.sex || "");
  const [zipCode, setZipCode] = useState<string>(initialData?.zipCode || "");
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);

  const raceOptions = [
    "White",
    "Asian",
    "Black or African American",
    "Native Hawaiian or Pacific Islander",
    "American Indian or Alaska Native",
    "Other",
  ];

  const handleRaceChange = (race: string) => {
    setRaces((prev) => {
      if (prev.includes(race)) {
        return prev.filter((r) => r !== race);
      } else {
        return [...prev, race];
      }
    });
  };

  const isFormValid = () => {
    const hasAge = age.trim() !== "";
    const hasHispanicLatino = hispanicLatino;
    const hasRace = races.length > 0;
    const hasOtherRaceSpecified =
      !races.includes("Other") || otherRace.trim() !== "";
    const hasSex = sex !== "";
    const hasZipCode = zipCode.trim() !== "";

    return (
      hasAge &&
      hasHispanicLatino &&
      hasRace &&
      hasOtherRaceSpecified &&
      hasSex &&
      hasZipCode
    );
  };

  const handleContinue = () => {
    if (isFormValid()) {
      const data = {
        age,
        hispanicLatino,
        races,
        otherRace,
        sex,
        zipCode,
      };
      onContinue?.(data);
    } else {
      setShowConfirmationModal(true);
    }
  };

  const handleConfirmContinue = () => {
    setShowConfirmationModal(false);
    const data = {
      age,
      hispanicLatino,
      races,
      otherRace,
      sex,
      zipCode,
    };
    onContinue?.(data);
  };

  const handleCancelContinue = () => {
    setShowConfirmationModal(false);
  };

  return (
    <div className="min-h-full w-full flex flex-col items-center justify-center bg-black">
      <div className="bg-black mt-8 p-8 text-center max-w-7xl mx-auto flex-1 flex flex-col justify-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <label className="block text-white text-lg mb-2 text-left">
              Enter your age:
            </label>
            <input
              type="text"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full p-3 text-white bg-gray-800 border border-white rounded-lg focus:outline-none focus:border-blue-400"
              placeholder="Enter your age"
            />
          </div>

          <div>
            <label className="block text-white text-lg mb-2 text-left">
              Are you Spanish, Hispanic, or Latino?
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setHispanicLatino(true)}
                className={`flex-1 px-4 py-3 border border-white rounded-lg transition-colors ${
                  hispanicLatino === true
                    ? "bg-white text-black"
                    : "bg-gray-800 hover:bg-gray-700 text-white"
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setHispanicLatino(false)}
                className={`flex-1 px-4 py-3 border border-white rounded-lg transition-colors ${
                  hispanicLatino === false
                    ? "bg-white text-black"
                    : "bg-gray-800 hover:bg-gray-700 text-white"
                }`}
              >
                None of these
              </button>
            </div>
          </div>

          <div>
            <label className="block text-white text-lg mb-2 text-left">
              Choose one or more races that you consider yourself to be:
            </label>
            <div className="space-y-3">
              {raceOptions.map((race) => (
                <label
                  key={race}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={races.includes(race)}
                    onChange={() => handleRaceChange(race)}
                    className="w-5 h-5 text-blue-600 bg-gray-800 border-white rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-white text-lg">{race}</span>
                </label>
              ))}
            </div>
            {races.includes("Other") && (
              <div className="mt-4">
                <input
                  type="text"
                  value={otherRace}
                  onChange={(e) => setOtherRace(e.target.value)}
                  className="w-full p-3 text-white bg-gray-800 border border-white rounded-lg focus:outline-none focus:border-blue-400"
                  placeholder="Please specify"
                />
              </div>
            )}
          </div>

          {/* Sex */}
          <div>
            <label className="block text-white text-lg mb-2 text-left">
              What is your sex?
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setSex("male")}
                className={`flex-1 px-4 py-3 border border-white rounded-lg transition-colors ${
                  sex === "male"
                    ? "bg-white text-black"
                    : "bg-gray-800 hover:bg-gray-700 text-white"
                }`}
              >
                Male
              </button>
              <button
                type="button"
                onClick={() => setSex("female")}
                className={`flex-1 px-4 py-3 border border-white rounded-lg transition-colors ${
                  sex === "female"
                    ? "bg-white text-black"
                    : "bg-gray-800 hover:bg-gray-700 text-white"
                }`}
              >
                Female
              </button>
            </div>
            <div className="flex space-x-4 mt-2">
              <button
                type="button"
                onClick={() => setSex("prefer not to say")}
                className={`flex-1 px-4 py-3 border border-white rounded-lg transition-colors ${
                  sex === "prefer not to say"
                    ? "bg-white text-black"
                    : "bg-gray-800 hover:bg-gray-700 text-white"
                }`}
              >
                Prefer Not To Say
              </button>
              <button
                type="button"
                onClick={() => setSex("other")}
                className={`flex-1 px-4 py-3 border border-white rounded-lg transition-colors ${
                  sex === "other"
                    ? "bg-white text-black"
                    : "bg-gray-800 hover:bg-gray-700 text-white"
                }`}
              >
                Other
              </button>
            </div>
          </div>

          {/* Zip Code */}
          <div>
            <label className="block text-white text-lg mb-2 text-left">
              Please provide the zip code of your permanent address (where you
              grew up). If you grew up outside the United States, please enter
              the country name:
            </label>
            <input
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              className="w-full p-3 text-white bg-gray-800 border border-white rounded-lg focus:outline-none focus:border-blue-400"
              placeholder="Enter zip code"
            />
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="w-full flex justify-center pb-8">
        <button
          type="button"
          onClick={handleContinue}
          disabled={loading}
          className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
            loading
              ? "bg-gray-500 text-gray-300 cursor-not-allowed"
              : "bg-white text-black hover:bg-gray-200"
          }`}
        >
          {loading ? "Loading..." : "Continue"}
        </button>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={handleCancelContinue}
        onConfirm={handleConfirmContinue}
      />
    </div>
  );
}
