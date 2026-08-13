import jsPDF from "jspdf";

interface UserData {
  name: string;
  username: string;
  className?: string;
  targetScore?: number;
}

interface DailyLog {
  date: string;
  physicsStudy: boolean;
  chemistryStudy: boolean;
  botanyStudy: boolean;
  zoologyStudy: boolean;
  questionsPracticed: number;
  physicsTime: number;
  chemistryTime: number;
  botanyTime: number;
  zoologyTime: number;
  physicsQuestions: number;
  chemistryQuestions: number;
  botanyQuestions: number;
  zoologyQuestions: number;
  waterIntake: number;
  sleepHours: number;
  completed: boolean;
}

interface MockTest {
  date: string;
  score: number;
  totalMarks: number;
  physicsScore: number;
  chemistryScore: number;
  botanyScore: number;
  zoologyScore: number;
}

interface ProgressData {
  user: UserData;
  logs: DailyLog[];
  tests: MockTest[];
  streak: number;
  longestStreak: number;
}

export function generateProgressPDF(data: ProgressData) {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  let y = 20;

  const addText = (text: string, x: number, yPos: number, options?: { fontSize?: number; fontStyle?: string; color?: number[] }) => {
    const { fontSize = 12, fontStyle = "normal", color = [0, 0, 0] } = options || {};
    pdf.setFontSize(fontSize);
    pdf.setFont("helvetica", fontStyle);
    pdf.setTextColor(color[0], color[1], color[2]);
    pdf.text(text, x, yPos);
  };

  const addLine = (yPos: number) => {
    pdf.setDrawColor(220, 220, 220);
    pdf.line(20, yPos, pageWidth - 20, yPos);
  };

  const checkNewPage = (height: number) => {
    if (y + height > 280) {
      pdf.addPage();
      y = 20;
    }
  };

  // Header
  addText("NEET 2027 STUDY TRACKER", pageWidth / 2 - 45, y, { fontSize: 20, fontStyle: "bold" });
  y += 8;
  addText("Progress Report", pageWidth / 2 - 22, y, { fontSize: 12, color: [100, 100, 100] });
  y += 5;
  addLine(y);
  y += 15;

  // User Info Section
  addText("STUDENT INFORMATION", 20, y, { fontSize: 14, fontStyle: "bold" });
  y += 10;
  
  addText(`Name: ${data.user.name || data.user.username}`, 20, y, { fontSize: 11 });
  y += 7;
  addText(`Username: @${data.user.username}`, 20, y, { fontSize: 11 });
  y += 7;
  addText(`Class: ${data.user.className || "Not specified"}`, 20, y, { fontSize: 11 });
  y += 7;
  addText(`Target Score: ${data.user.targetScore || 720}/720`, 20, y, { fontSize: 11 });
  y += 7;
  addText(`Report Generated: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`, 20, y, { fontSize: 11 });
  y += 10;
  addLine(y);
  y += 15;

  // Streak Info
  addText("CONSISTENCY", 20, y, { fontSize: 14, fontStyle: "bold" });
  y += 10;
  addText(`Current Streak: ${data.streak} days`, 20, y, { fontSize: 11 });
  y += 7;
  addText(`Longest Streak: ${data.longestStreak} days`, 20, y, { fontSize: 11 });
  y += 7;
  
  const completedDays = data.logs.filter(l => l.completed).length;
  const totalDays = data.logs.length;
  const consistency = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
  addText(`Completed Days: ${completedDays}/${totalDays} (${consistency}% consistency)`, 20, y, { fontSize: 11 });
  y += 10;
  addLine(y);
  y += 15;

  // NEET Countdown
  const neetDate = new Date("2027-05-03");
  const today = new Date();
  const daysLeft = Math.ceil((neetDate.getTime() - today.getTime()) / 86400000);
  addText(`Days Until NEET 2027: ${daysLeft}`, 20, y, { fontSize: 12, fontStyle: "bold", color: [0, 0, 0] });
  y += 10;
  addLine(y);
  y += 15;

  // Study Statistics
  checkNewPage(60);
  addText("STUDY STATISTICS", 20, y, { fontSize: 14, fontStyle: "bold" });
  y += 12;

  const totalPhysicsTime = data.logs.reduce((s, l) => s + (l.physicsTime || 0), 0);
  const totalChemistryTime = data.logs.reduce((s, l) => s + (l.chemistryTime || 0), 0);
  const totalBotanyTime = data.logs.reduce((s, l) => s + (l.botanyTime || 0), 0);
  const totalZoologyTime = data.logs.reduce((s, l) => s + (l.zoologyTime || 0), 0);
  const totalTime = totalPhysicsTime + totalChemistryTime + totalBotanyTime + totalZoologyTime;

  const totalPhysicsQ = data.logs.reduce((s, l) => s + (l.physicsQuestions || 0), 0);
  const totalChemistryQ = data.logs.reduce((s, l) => s + (l.chemistryQuestions || 0), 0);
  const totalBotanyQ = data.logs.reduce((s, l) => s + (l.botanyQuestions || 0), 0);
  const totalZoologyQ = data.logs.reduce((s, l) => s + (l.zoologyQuestions || 0), 0);
  const totalQuestions = data.logs.reduce((s, l) => s + (l.questionsPracticed || 0), 0);

  addText(`Total Study Time: ${totalTime.toFixed(1)} hours`, 20, y, { fontSize: 11 });
  y += 7;
  addText(`Total Questions Solved: ${totalQuestions}`, 20, y, { fontSize: 11 });
  y += 12;

  // Subject-wise breakdown
  addText("Subject-wise Breakdown:", 20, y, { fontSize: 11, fontStyle: "bold" });
  y += 8;

  const subjects = [
    { name: "Physics", time: totalPhysicsTime, questions: totalPhysicsQ },
    { name: "Chemistry", time: totalChemistryTime, questions: totalChemistryQ },
    { name: "Botany", time: totalBotanyTime, questions: totalBotanyQ },
    { name: "Zoology", time: totalZoologyTime, questions: totalZoologyQ },
  ];

  // Table header
  pdf.setFillColor(245, 245, 245);
  pdf.rect(20, y - 4, pageWidth - 40, 8, "F");
  addText("Subject", 25, y, { fontSize: 10, fontStyle: "bold" });
  addText("Hours", 80, y, { fontSize: 10, fontStyle: "bold" });
  addText("Questions", 120, y, { fontSize: 10, fontStyle: "bold" });
  addText("% of Total", 160, y, { fontSize: 10, fontStyle: "bold" });
  y += 10;

  subjects.forEach((s) => {
    const percent = totalTime > 0 ? Math.round((s.time / totalTime) * 100) : 0;
    addText(s.name, 25, y, { fontSize: 10 });
    addText(`${s.time.toFixed(1)}h`, 80, y, { fontSize: 10 });
    addText(`${s.questions}`, 120, y, { fontSize: 10 });
    addText(`${percent}%`, 160, y, { fontSize: 10 });
    y += 7;
  });

  y += 5;
  addLine(y);
  y += 15;

  // Weak Subject Analysis
  checkNewPage(30);
  const weakest = subjects.reduce((a, b) => (a.time + a.questions < b.time + b.questions ? a : b));
  addText("WEAK SUBJECT ANALYSIS", 20, y, { fontSize: 14, fontStyle: "bold" });
  y += 10;
  addText(`Needs Improvement: ${weakest.name}`, 20, y, { fontSize: 11, color: [200, 100, 0] });
  y += 7;
  addText(`Only ${weakest.time.toFixed(1)} hours and ${weakest.questions} questions practiced`, 20, y, { fontSize: 10, color: [100, 100, 100] });
  y += 10;
  addLine(y);
  y += 15;

  // Health Tracking
  checkNewPage(40);
  addText("HEALTH & WELLNESS", 20, y, { fontSize: 14, fontStyle: "bold" });
  y += 10;

  const avgWater = data.logs.length > 0 ? data.logs.reduce((s, l) => s + (l.waterIntake || 0), 0) / data.logs.length : 0;
  const avgSleep = data.logs.length > 0 ? data.logs.reduce((s, l) => s + (l.sleepHours || 0), 0) / data.logs.length : 0;
  
  addText(`Average Water Intake: ${avgWater.toFixed(1)}L / day (Target: 4L)`, 20, y, { fontSize: 11 });
  y += 7;
  addText(`Average Sleep: ${avgSleep.toFixed(1)} hours / night (Target: 7-8h)`, 20, y, { fontSize: 11 });
  y += 10;
  addLine(y);
  y += 15;

  // Mock Test Performance
  if (data.tests.length > 0) {
    checkNewPage(60);
    addText("MOCK TEST PERFORMANCE", 20, y, { fontSize: 14, fontStyle: "bold" });
    y += 12;

    const avgScore = data.tests.reduce((s, t) => s + t.score, 0) / data.tests.length;
    const highestScore = Math.max(...data.tests.map(t => t.score));
    const latestScore = data.tests[0]?.score || 0;

    addText(`Tests Attempted: ${data.tests.length}`, 20, y, { fontSize: 11 });
    y += 7;
    addText(`Average Score: ${avgScore.toFixed(0)}/720`, 20, y, { fontSize: 11 });
    y += 7;
    addText(`Highest Score: ${highestScore}/720`, 20, y, { fontSize: 11 });
    y += 7;
    addText(`Latest Score: ${latestScore}/720`, 20, y, { fontSize: 11 });
    y += 12;

    // Recent tests table
    addText("Recent Tests:", 20, y, { fontSize: 11, fontStyle: "bold" });
    y += 8;

    pdf.setFillColor(245, 245, 245);
    pdf.rect(20, y - 4, pageWidth - 40, 8, "F");
    addText("Date", 25, y, { fontSize: 9, fontStyle: "bold" });
    addText("Score", 60, y, { fontSize: 9, fontStyle: "bold" });
    addText("Phy", 95, y, { fontSize: 9, fontStyle: "bold" });
    addText("Chem", 120, y, { fontSize: 9, fontStyle: "bold" });
    addText("Bot", 145, y, { fontSize: 9, fontStyle: "bold" });
    addText("Zoo", 170, y, { fontSize: 9, fontStyle: "bold" });
    y += 8;

    data.tests.slice(0, 5).forEach((t) => {
      checkNewPage(10);
      addText(t.date, 25, y, { fontSize: 9 });
      addText(`${t.score}`, 60, y, { fontSize: 9 });
      addText(`${t.physicsScore}`, 95, y, { fontSize: 9 });
      addText(`${t.chemistryScore}`, 120, y, { fontSize: 9 });
      addText(`${t.botanyScore}`, 145, y, { fontSize: 9 });
      addText(`${t.zoologyScore}`, 170, y, { fontSize: 9 });
      y += 7;
    });

    y += 5;
    addLine(y);
    y += 15;
  }

  // Weekly Summary (last 4 weeks)
  checkNewPage(50);
  addText("WEEKLY SUMMARY (Last 4 Weeks)", 20, y, { fontSize: 14, fontStyle: "bold" });
  y += 12;

  const now = new Date();
  for (let w = 0; w < 4; w++) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (w * 7 + now.getDay()));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weekLogs = data.logs.filter((l) => {
      return l.date >= weekStart.toISOString().split("T")[0] && l.date <= weekEnd.toISOString().split("T")[0];
    });

    const weekHours = weekLogs.reduce((s, l) => s + (l.physicsTime || 0) + (l.chemistryTime || 0) + (l.botanyTime || 0) + (l.zoologyTime || 0), 0);
    const weekQuestions = weekLogs.reduce((s, l) => s + (l.questionsPracticed || 0), 0);
    const weekCompleted = weekLogs.filter(l => l.completed).length;

    addText(`Week ${w + 1}: ${weekHours.toFixed(1)}h studied, ${weekQuestions} questions, ${weekCompleted}/7 days completed`, 20, y, { fontSize: 10 });
    y += 7;
  }

  y += 5;
  addLine(y);
  y += 15;

  // Footer
  checkNewPage(30);
  addText("MOTIVATIONAL NOTE", 20, y, { fontSize: 14, fontStyle: "bold" });
  y += 10;
  
  const quotes = [
    "Every hour you study brings you closer to your dream of becoming a doctor.",
    "Consistency beats intensity. Keep showing up every day!",
    "Your hard work today will pay off tomorrow. Stay focused!",
    "The pain of discipline is far less than the pain of regret.",
  ];
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "italic");
  pdf.setTextColor(80, 80, 80);
  const splitQuote = pdf.splitTextToSize(`"${randomQuote}"`, pageWidth - 40);
  pdf.text(splitQuote, 20, y);
  y += splitQuote.length * 5 + 15;

  // Final footer
  addLine(y);
  y += 8;
  addText("Generated by NEET 2027 Study Tracker", pageWidth / 2 - 40, y, { fontSize: 9, color: [150, 150, 150] });
  y += 5;
  addText("Best of luck for your NEET journey! 🎯", pageWidth / 2 - 35, y, { fontSize: 9, color: [150, 150, 150] });

  return pdf;
}

export function downloadPDF(data: ProgressData) {
  const pdf = generateProgressPDF(data);
  const fileName = `NEET_Progress_${data.user.username}_${new Date().toISOString().split("T")[0]}.pdf`;
  pdf.save(fileName);
}

export function sharePDF(data: ProgressData): Blob {
  const pdf = generateProgressPDF(data);
  return pdf.output("blob");
}
