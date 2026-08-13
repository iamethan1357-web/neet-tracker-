export const QUOTES = [
  "The art of medicine consists of amusing the patient while nature cures the disease. – Voltaire",
  "Wherever the art of medicine is loved, there is also a love of humanity. – Hippocrates",
  "The good physician treats the disease; the great physician treats the patient. – William Osler",
  "Medicine is a science of uncertainty and an art of probability. – William Osler",
  "The pain of studying is temporary. The pride of becoming a doctor is forever.",
  "Every question you solve today is a life you'll save tomorrow.",
  "NEET is not the end goal — it's the doorway to saving millions of lives.",
  "Your stethoscope awaits. Keep grinding.",
  "A doctor a day keeps the ignorance away. Study harder.",
  "Future Dr. — that prefix isn't given, it's earned through sacrifice.",
  "Biology today, saving lives tomorrow. Stay consistent.",
  "The human body has 206 bones. You need iron-strong willpower to learn them all.",
  "Chemistry isn't just reactions — it's the pharmacy of the future you'll prescribe.",
  "Physics builds the machines. You'll operate them one day in an OT.",
  "Anatomy is art. Physiology is poetry. Medicine is the masterpiece.",
  "Discipline is choosing between what you want now and what you want most — your MBBS seat.",
  "The mitochondria is the powerhouse of the cell. You are the powerhouse of your future.",
  "Neurons that fire together, wire together. Study daily, build mastery.",
  "Every NCERT page you read brings you closer to your white coat ceremony.",
  "Hard work beats talent when talent doesn't study for NEET.",
  "You're not just memorizing — you're training to hold someone's life in your hands.",
  "Today's revision is tomorrow's reflex in the operation theatre.",
  "Your patient in 2035 is counting on you studying today in 2027.",
  "The best doctors were once students who refused to give up.",
  "Pathology of success: Consistent study + Smart revision + Zero excuses.",
  "Prescription for NEET: 6 hours study, spaced revision, and unshakeable belief.",
  "In the ER of life, your preparation is the only thing that saves.",
  "Osmosis works in cells and in your brain — immerse yourself in study.",
  "Your white coat is stitched with every hour you sacrifice today.",
  "First, do no harm. First, do not skip your study schedule.",
];

export function getDailyQuote(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return QUOTES[dayOfYear % QUOTES.length];
}
