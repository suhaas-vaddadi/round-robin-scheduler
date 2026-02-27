"use client";
import { useState } from "react";
import ParticipantForm from "./components/ParticipantInfo";
import ClassificationTaskMain from "./solo/SoloTaskMain";
import FinishScreen from "./solo/components/FinishScreen";

type Screen = "participant info" | "individual difference" | "complete";
export default function Home() {
  const [screen, setScreen] = useState<Screen>("participant info");
  const [formData, setFormData] = useState({
    participantId: "",
    fullName: "",
    sessionTime: "",
    sessionDate: "",
    email: "",
  });

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFormComplete = async () => {
    if(screen == "participant info") {
      const result = await fetch(`/api/users/${formData.participantId}`);
      if(result.status === 404) {
        const result = await fetch(`/api/users/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        if(result.status === 200) {
          setScreen("individual difference")
        }
      }
      else if(result.status === 200) {
        const responseData = await result.json();
        const participant = responseData.data;

        if (participant && (participant.study_status === 0 || participant.session_state === 0)) {
          setScreen("individual difference")
        } else {
          alert("The study has already been completed.")
        }
      }
      else {
        alert("Error: Could not connect to database. Please contact the researcher.");
      }
    }
    else if(screen == "individual difference") {
      setScreen("complete")
    }
  }

  return (
    <div>
      {screen == "participant info" && (
        <ParticipantForm
          formData={formData}
          onChange={handleFormChange}
          onSubmit={() => handleFormComplete()}
        />
      )}
      {screen == "individual difference" && (
        <ClassificationTaskMain
          formData={formData}
          csvFilePath={"disabled"}
          onComplete={() => handleFormComplete()}
        />
      )}
      {screen == "complete" && (
        <FinishScreen />
      )}
    </div>
  );
}
