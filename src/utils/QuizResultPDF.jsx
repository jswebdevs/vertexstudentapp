import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";

// Register Fonts (Ensure these exist in public/fonts/)
Font.register({
  family: "NotoSansBengali",
  fonts: [
    { src: "/fonts/notosans.ttf" },
    { src: "/fonts/HindSiliguri-Bold.ttf", fontWeight: "bold" },
    { src: "/fonts/HindSiliguri-Medium.ttf", fontWeight: "medium" },
    { src: "/fonts/HindSiliguri-Regular.ttf", fontWeight: "normal" },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: "NotoSansBengali",
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
    borderBottom: "2px solid #4f46e5",
    paddingBottom: 10,
  },
  courseTitle: { fontSize: 14, color: "#555", marginBottom: 5 },
  quizTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4f46e5",
    marginBottom: 10,
  },
  badge: {
    alignSelf: "center",
    backgroundColor: "#f3f4f6",
    padding: "4px 12px",
    borderRadius: 10,
    fontSize: 10,
    color: "#333",
    marginBottom: 10,
  },
  summaryBox: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 5,
    fontSize: 10,
    color: "#444",
  },
  scoreBox: {
    alignSelf: "center",
    backgroundColor: "#f3f4f6",
    padding: "8px 20px",
    borderRadius: 10,
    marginTop: 10,
  },
  scoreText: { fontSize: 16, fontWeight: "bold" },
  questionContainer: {
    marginBottom: 15,
    padding: 10,
    border: "1px solid #e5e7eb",
    borderRadius: 5,
  },
  questionHeader: { flexDirection: "row", marginBottom: 5 },
  qNum: { width: 25, fontWeight: "bold", color: "#6b7280" },
  qText: { flex: 1, fontSize: 12, fontWeight: "bold" },
  imageContainer: { marginVertical: 8 },
  qImage: { height: 150, objectFit: "contain" },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 5,
  },
  option: { fontSize: 10, color: "#444", width: "45%" },
  correctOptionStyle: { color: "#16a34a", fontWeight: "bold" },
  footer: {
    marginTop: 8,
    paddingTop: 8,
    borderTop: "1px dashed #ccc",
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 10,
  },
  label: { color: "#666" },
  valCorrect: { color: "#16a34a", fontWeight: "bold" },
  valWrong: { color: "#dc2626", fontWeight: "bold" },
  valSkipped: { color: "#ca8a04", fontWeight: "bold" },
});

const QuizResultPDF = ({ quizMeta, questions, result, isAttended }) => {
  const totalMarks = questions.reduce((acc, q) => acc + (q.Mark || 1), 0);

  // Get answers from the new record structure
  const userAnswers = isAttended && result ? result.answers : [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* --- Header Section --- */}
        <View style={styles.header}>
          <Text style={styles.courseTitle}>{quizMeta.courseTitle}</Text>
          <Text style={styles.quizTitle}>{quizMeta.quizTitle}</Text>

          <View style={styles.badge}>
            <Text>{isAttended ? "RESULT PAPER" : "QUESTION PAPER"}</Text>
          </View>

          <View style={styles.summaryBox}>
            <Text>Total Questions: {questions.length}</Text>
            <Text>Total Marks: {totalMarks}</Text>
            <Text>Date: {new Date().toLocaleDateString()}</Text>
          </View>

          {isAttended && result && (
            <View style={styles.scoreBox}>
              <Text style={styles.scoreText}>
                Score: {result.score?.toFixed(2)} / {totalMarks}
              </Text>
            </View>
          )}
        </View>

        {/* --- Questions Loop --- */}
        {questions.map((q, index) => {
          // Find user's answer for this question
          const userRecord = userAnswers.find(
            (a) => String(a.questionId) === String(q._id) // Ensure ID type match
          );

          // UPDATED: Use 'selectedAnswer' based on Schema
          const givenAnswer = userRecord ? userRecord.selectedAnswer : null;
          const isCorrect = givenAnswer === q.correctAnswer;

          let imageUrl = null;
          if (q.img && q.img.length > 0 && q.img[0].src) {
            imageUrl = q.img[0].src.startsWith("http")
              ? q.img[0].src
              : `https://backend.vertexforbcs.org${q.img[0].src}`;
          }

          return (
            <View key={index} style={styles.questionContainer} wrap={false}>
              <View style={styles.questionHeader}>
                <Text style={styles.qNum}>{q.serialNo || index + 1}.</Text>
                <Text style={styles.qText}>{q.question_title}</Text>
              </View>

              {imageUrl && (
                <View style={styles.imageContainer}>
                  <Image style={styles.qImage} src={imageUrl} />
                </View>
              )}

              <View style={styles.optionsGrid}>
                {["A", "B", "C", "D"].map((opt) => (
                  <Text
                    key={opt}
                    style={[
                      styles.option,
                      q.correctAnswer === opt ? styles.correctOptionStyle : {},
                    ]}
                  >
                    {opt}) {q[opt]}
                  </Text>
                ))}
              </View>

              <View style={styles.footer}>
                {isAttended ? (
                  <>
                    <Text style={styles.label}>
                      Your Answer:{" "}
                      <Text
                        style={
                          isCorrect
                            ? styles.valCorrect
                            : givenAnswer
                            ? styles.valWrong
                            : styles.valSkipped
                        }
                      >
                        {givenAnswer || "Skipped"}
                      </Text>
                    </Text>
                    <Text style={styles.label}>
                      Correct:{" "}
                      <Text style={styles.valCorrect}>{q.correctAnswer}</Text>
                    </Text>
                  </>
                ) : (
                  <Text style={styles.label}>
                    Correct Answer:{" "}
                    <Text style={styles.valCorrect}>{q.correctAnswer}</Text>
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </Page>
    </Document>
  );
};

export default QuizResultPDF;
