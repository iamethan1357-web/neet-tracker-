export const QUOTES = [
  "The secret of getting ahead is getting started. – Mark Twain",
  "Success is the sum of small efforts repeated day in and day out.",
  "Don't watch the clock; do what it does. Keep going. – Sam Levenson",
  "The future belongs to those who believe in the beauty of their dreams.",
  "It does not matter how slowly you go as long as you do not stop. – Confucius",
  "Believe you can and you're halfway there. – Theodore Roosevelt",
  "The only way to do great work is to love what you do. – Steve Jobs",
  "Hard work beats talent when talent doesn't work hard.",
  "Your limitation—it's only your imagination.",
  "Push yourself, because no one else is going to do it for you.",
  "Great things never come from comfort zones.",
  "Dream it. Wish it. Do it.",
  "Stay focused, go after your dreams and keep moving toward your goals.",
  "The expert in anything was once a beginner.",
  "Strive for progress, not perfection.",
  "A year from now you may wish you had started today.",
  "Medicine is a noble profession. Your journey starts with NEET.",
  "Every hour you study is an investment in your future.",
  "Discipline is choosing between what you want now and what you want most.",
  "The pain of studying is temporary. The pride of becoming a doctor is forever.",
  "Consistency is more important than intensity.",
  "Today's preparation determines tomorrow's achievement.",
  "You are capable of more than you know.",
  "Small daily improvements lead to stunning results.",
  "Success isn't always about greatness. It's about consistency.",
  "Make each day your masterpiece.",
  "Be stronger than your excuses.",
  "Wake up with determination. Go to bed with satisfaction.",
  "Your future self will thank you.",
  "Champions train, losers complain.",
];

export function getDailyQuote(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return QUOTES[dayOfYear % QUOTES.length];
}
