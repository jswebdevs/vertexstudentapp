import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import QuizResultPDF from "./QuizResultPDF"; // Ensure path is correct

const API_BASE_URL = "https://backend.vertexforbcs.org/api";

export const generateQuizPDF = async (studentId, quizId) => {
  Swal.fire({
    title: "Generating PDF...",
    html: "Fetching data and generating document...",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    // 1. Fetch Essential Data (Questions & Quiz Metadata)
    const [questionsRes, metaRes] = await Promise.all([
      fetch(`${API_BASE_URL}/questions?quizId=${quizId}`),
      fetch(`${API_BASE_URL}/quizzes/${quizId}`),
    ]);

    if (!questionsRes.ok || !metaRes.ok) {
      throw new Error("Failed to fetch quiz content.");
    }

    const questions = await questionsRes.json();
    const quizMeta = await metaRes.json();

    // 2. Try Fetch User Result from the specific record endpoint
    let result = null;
    let isAttended = false;

    try {
      // UPDATED ENDPOINT HERE
      const resultRes = await fetch(
        `${API_BASE_URL}/${studentId}/record/${quizId}`
      );

      if (resultRes.ok) {
        result = await resultRes.json();
        isAttended = true;
      } else {
        console.warn(
          "User record not found (404), generating blank question paper."
        );
      }
    } catch (e) {
      console.warn("Error checking user result:", e);
    }

    // 3. Generate PDF Blob
    const blob = await pdf(
      <QuizResultPDF
        quizMeta={quizMeta}
        questions={questions}
        result={result}
        isAttended={isAttended}
      />
    ).toBlob();

    // 4. Save File
    const fileName = `${quizMeta.quizTitle.replace(/\s+/g, "_")}_${
      isAttended ? "Result" : "Paper"
    }.pdf`;

    saveAs(blob, fileName);

    Swal.fire({
      icon: "success",
      title: "Downloaded",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (error) {
    console.error("PDF Logic Error:", error);
    Swal.fire("Error", "Could not generate PDF. Check console.", "error");
  }
};
