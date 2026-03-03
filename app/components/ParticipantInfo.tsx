"use client";
interface ParticipantFormProps {
  formData: {
    participantId: string;
    fullName: string;
    sessionTime: string;
    sessionDate: string;
    email: string;
  };
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
  loading?: boolean;
}

function ParticipantForm({
  formData,
  onChange,
  onSubmit,
  loading = false,
}: ParticipantFormProps) {
  return (
    <div className="w-full flex flex-col items-center justify-center bg-black cursor-auto overflow-hidden h-screen">
      <div className="text-center max-w-2xl mx-auto px-8">
        <h1 className="text-white text-4xl font-bold mb-8">
          {`Please Enter Your Information`}
        </h1>
        <p className="text-white text-lg mb-8">
          {`You should find the information for your session in the email you received.`}
        </p>
        <div className="space-y-4">
          <div className="flex w-full gap-4">
            <div className="w-full">
              <label className="block text-white text-lg mb-2">
                Participant ID:
              </label>
              <input
                autoComplete="off"
                type="text"
                value={formData.participantId}
                onChange={(e) => onChange("participantId", e.target.value)}
                className="w-full p-3 text-white bg-gray-800 border border-white rounded-lg focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>
          <div className="flex w-full gap-4">
            <div className="w-full">
              <label className="block text-white text-lg mb-2">
                Full Name:
              </label>
              <input
                autoComplete="off"
                type="text"
                value={formData.fullName}
                onChange={(e) => onChange("fullName", e.target.value)}
                className="w-full p-3 text-white bg-gray-800 border border-white rounded-lg focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>
          <div className="flex w-full gap-4">
            <div className="w-full">
              <label className="block text-white text-lg mb-2">
                Email:
              </label>
              <input
                autoComplete="off"
                type="text"
                value={formData.email}
                onChange={(e) => onChange("email", e.target.value)}
                className="w-full p-3 text-white bg-gray-800 border border-white rounded-lg focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-lg mb-2">
                Session Date:
              </label>
              <input
                autoComplete="off"
                type="text"
                value={formData.sessionDate}
                onChange={(e) => onChange("sessionDate", e.target.value)}
                className="w-full p-3 text-white bg-gray-800 border border-white rounded-lg focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-white text-lg mb-2">
                Session Time:
              </label>
              <input
                autoComplete="off"
                type="text"
                value={formData.sessionTime}
                onChange={(e) => onChange("sessionTime", e.target.value)}
                className="w-full p-3 text-white bg-gray-800 border border-white rounded-lg focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          <button
            onClick={onSubmit}
            disabled={loading}
            className={`w-full px-8 py-4 text-white text-xl border border-white transition-colors mt-6 ${
              loading
                ? "bg-gray-500 text-gray-300 cursor-not-allowed border-gray-500"
                : "bg-black hover:bg-gray-800"
            }`}
          >
            {loading ? "Loading..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ParticipantForm;
