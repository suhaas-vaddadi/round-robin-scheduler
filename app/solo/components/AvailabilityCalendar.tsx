import { useState } from "react";

export interface TimeBlock {
  id: string;
  label: string;
}

export interface DayAvailability {
  date: string;
  blocks: TimeBlock[];
}

interface AvailabilityCalendarProps {
  days: DayAvailability[];
  onComplete: (data: { availability: Record<string, boolean> }) => void;
}

const AvailabilityCalendar = ({
  days,
  onComplete,
}: AvailabilityCalendarProps) => {
  const [availability, setAvailability] = useState<Record<string, boolean>>({});

  const toggleBlock = (blockId: string) => {
    setAvailability((prev) => ({
      ...prev,
      [blockId]: !prev[blockId],
    }));
  };

  const handleSubmit = () => {
    onComplete({ availability });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-8">
      <div className="w-full max-w-4xl flex flex-col gap-12">
        <div className=" space-y-4">
          <p className="text-2xl text-white">
            Please select the days you are available for subsequent parts of this study. To be respectful of other people's time, we ask that you only mark days you are certain you can attend.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 w-full">
          {days.map((day) => (
            <div key={day.date} className="space-y-4">
              <h2 className="text-2xl border-b border-gray-700 pb-2">
                {day.date}
              </h2>
              <div className="space-y-3">
                {day.blocks.map((block) => {
                  const isAvailable = availability[block.id] || false;
                  return (
                    <button
                      key={block.id}
                      onClick={() => toggleBlock(block.id)}
                      className={`w-full p-4 rounded-lg border transition-all duration-200 flex justify-between items-center group ${
                        isAvailable
                          ? "bg-white border-white text-black"
                          : "bg-gray-900 border-gray-700 text-gray-300 hover:border-gray-500"
                      }`}
                    >
                      <span className="font-medium text-left">
                        {block.label}
                      </span>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ml-4 shrink-0 ${
                          isAvailable
                            ? "border-black bg-black"
                            : "border-gray-500"
                        }`}
                      >
                        {isAvailable && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={handleSubmit}
            className="px-10 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors text-xl shadow-lg"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
