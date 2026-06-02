import { useState, useEffect } from "react";
import axios from "axios";

export default function Quest() {
  const [quest, setQuest] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");
  const [hint, setHint] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:5000/api/quests/quest-001")
      .then(res => setQuest(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleAnswer = async (choice) => {
    const question = quest.questions[currentQuestion];
    const res = await axios.post(
      `http://localhost:5000/api/quests/${quest.id}/answer`,
      { questionId: question.id, answer: choice }
    );

    setMessage(res.data.message);
    setHint(res.data.hint || "");

    if (res.data.correct) {
      setScore(score + res.data.xp);
      setTimeout(() => {
        setMessage("");
        setHint("");
        if (currentQuestion + 1 >= quest.questions.length) {
          setDone(true);
        } else {
          setCurrentQuestion(currentQuestion + 1);
        }
      }, 1500);
    }
  };

  if (!quest) return (
    <div style={styles.container}>
      <p style={styles.loading}>Loading quest... 🎮</p>
    </div>
  );

  if (done) return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🎉 Quest Complete!</h1>
        <p style={styles.subtitle}>You earned {score} XP!</p>
        <p style={styles.reward}>🏆 Reward: {quest.itemReward}</p>
        <p style={styles.maemae}>Ms. Mae-Mae says: "I knew you could do it! You're a math champion!" 🌟</p>
      </div>
    </div>
  );

  const question = quest.questions[currentQuestion];

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>⚔️ {quest.title}</h1>
        <p style={styles.subtitle}>{quest.description}</p>

        <div style={styles.progress}>
          Question {currentQuestion + 1} of {quest.questions.length} • XP: {score}
        </div>

        <div style={styles.questionBox}>
          <p style={styles.question}>{question.question}</p>
        </div>

        <div style={styles.choices}>
          {question.choices.map((choice, i) => (
            <button
              key={i}
              style={styles.choiceBtn}
              onClick={() => handleAnswer(choice)}
            >
              {choice}
            </button>
          ))}
        </div>

        {message && <p style={styles.message}>{message}</p>}
        {hint && <p style={styles.hint}>💡 Hint: {hint}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Arial, sans-serif",
    padding: "20px"
  },
  card: {
    background: "rgba(255,255,255,0.1)",
    borderRadius: "20px",
    padding: "40px",
    maxWidth: "600px",
    width: "100%",
    color: "white",
    textAlign: "center"
  },
  title: { fontSize: "28px", marginBottom: "10px" },
  subtitle: { fontSize: "16px", opacity: 0.8, marginBottom: "20px" },
  progress: { fontSize: "14px", opacity: 0.7, marginBottom: "20px" },
  questionBox: {
    background: "rgba(255,255,255,0.1)",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "20px"
  },
  question: { fontSize: "22px", fontWeight: "bold" },
  choices: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "20px"
  },
  choiceBtn: {
    background: "linear-gradient(135deg, #e94560, #0f3460)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    padding: "16px",
    fontSize: "18px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  message: { fontSize: "20px", fontWeight: "bold", color: "#ffd700" },
  hint: { fontSize: "16px", color: "#90ee90", marginTop: "10px" },
  loading: { color: "white", fontSize: "24px" },
  reward: { fontSize: "22px", color: "#ffd700", margin: "10px 0" },
  maemae: {
    background: "rgba(255,255,255,0.1)",
    borderRadius: "12px",
    padding: "16px",
    marginTop: "20px",
    fontSize: "16px"
  }
};