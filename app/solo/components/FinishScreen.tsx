export default function FinishScreen() {
  return (
    <div className="min-h-full w-full flex flex-col items-center justify-center bg-black">
      <div className="bg-black mt-8 p-24 m-24 max-w-7xl mx-auto flex-1 flex flex-col justify-center text-white text-2xl space-y-6">
        <p className="text-2xl">
          Your responses have been submitted. Thank you for your time.
        </p>

        <p className="text-2xl pt-12">
          Please arrive to the session you signed up for through SONA on time
          (found in email). Your research assistant will confirm scheduling at
          the end of the session.
        </p>

        <p className="text-2xl pt-12">
          Additionally, due to the nature of the study, please refrain from
          talking to any other participants before or in-between sessions.
        </p>

        <p className="text-2xl pt-12">
          If you have any questions, please contact us through SONA.
        </p>
      </div>
    </div>
  );
}
