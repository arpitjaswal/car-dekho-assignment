import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from "dotenv";
dotenv.config();
const genAITest = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
//console.log(genAITest)
//console.log(process.env.PORT)
function getModel() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
 //console.log(genAI)
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
}

const BUDGET_LABELS = {
  under5L:  'Under ₹5 Lakh',
  '5to10L': '₹5–₹10 Lakh',
  '10to20L':'₹10–₹20 Lakh',
  above20L: 'Above ₹20 Lakh',
};

const FAMILY_LABELS = {
  solo:   'solo rider',
  couple: 'couple',
  small:  'small family (3–4 people)',
  large:  'large family (5+ people)',
};

const USAGE_LABELS = {
  cityCommute: 'city commute',
  highway:     'highway driving',
  family:      'family trips',
  mixed:       'mixed city and highway use',
};

const PRIORITY_LABELS = {
  mileage:  'fuel mileage / low running cost',
  safety:   'safety ratings',
  comfort:  'comfort and cabin space',
  features: 'technology and features',
};

export async function generateExplanation(answers, recommendations) {
  const carList = recommendations
    .map((r, i) =>
      `${i + 1}. ${r.car.brand} ${r.car.name} — ₹${(r.car.price / 100000).toFixed(1)} Lakh | ` +
      `${r.car.mileage} | Safety: ${r.car.safetyRating}/5 ⭐ | Score: ${r.score}/100`
    )
    .join('\n');

  const prompt = `You are an expert Indian car advisor. A buyer has shared their preferences and you've matched them with the top 3 cars from a dataset of 50 popular Indian cars.

Buyer profile:
- Budget: ${BUDGET_LABELS[answers.budget]}
- Family size: ${FAMILY_LABELS[answers.familySize]}
- Primary use: ${USAGE_LABELS[answers.usage]}
- Top priority: ${PRIORITY_LABELS[answers.priority]}

Top 3 matched cars:
${carList}

Write a warm, conversational explanation (3–4 sentences) in the context of the Indian market:
- Mention why the #1 pick is the best match for this specific buyer
- Briefly contrast what the #2 and #3 bring differently
- Use ₹ for currency, reference Indian driving conditions where relevant
- Do NOT use bullet points or markdown, just flowing prose`;

  const result = await getModel().generateContent(prompt);
  return result.response.text().trim();
}
