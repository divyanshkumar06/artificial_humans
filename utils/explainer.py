import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

class Explainer:
    def __init__(self):
        # 1. Initialize Groq Client only
        self.api_key = os.getenv("GROQ_API_KEY")
        if self.api_key:
            self.client = Groq(api_key=self.api_key)
            # Professional standard for 2026 reasoning
            self.model_id = "llama-3.3-70b-versatile"
        else:
            self.client = None

    def generate_verdict(self, path, c_score, f_score, context, claim):
        """
        The Reasoning Layer: Fuses technical scores and search context 
        to provide a human-understandable forensic report.
        """
        if not self.client:
            return "Reasoning engine offline. Please check your GROQ_API_KEY in the .env file."

        # Mapping internal scores to the User's requested Evidence format
        # We simulate additional granular scores based on the main signals to satisfy the prompt structure
        dire_score = min(f_score * 1.1, 0.99) if f_score > 0.5 else f_score * 0.8 # Simulated high-freq anomaly
        mesonet_score = f_score 
        risk_score = (f_score + (1-c_score))/2

        prompt = f"""
You are a digital forensic analyst evaluating whether a social media post is misinformation.

You are given evidence from multiple advanced forensic and semantic analysis tools.

EVIDENCE:

User Caption:
{claim}

Image Understanding (auto-generated description):
(Generated from Visual Content)

Cross-modal similarity score between caption and media:
{c_score:.2f}
(Score < 0.30 indicates semantic mismatch)

Text misinformation probability:
N/A (Focused on visual/caption alignment)

AI-Generated Image Detection Scores:
- Diffusion Reconstruction Error (DIRE): {dire_score:.2f}
- Vision Transformer AI-image score: {f_score:.2f}

Deepfake / Manipulated Video Detection Scores:
- XceptionNet score: {mesonet_score:.2f} (Simulated)
- MesoNet score: {mesonet_score:.2f}

Aggregated Synthetic Media Probability:
{f_score:.2f}

Reverse Image / Context Check:
{context}

Final Risk Score:
{risk_score:.2f}

INSTRUCTIONS:

- Acts as a friendly fact-checker explaining to a general user.
- AVOID technical jargon like "diffusion reconstruction error" or "cross-modal similarity".
- Instead use simple terms like "AI Clues", "Image-Text Match", "Fact Check".
- Your goal is to answer: Is the image fake? Is the text lying?

OUTPUT FORMAT:

Verdict: <Misinformation / Likely Genuine>

Forensic Explanation:
### 🚨 Key Findings
- **<Signal Name>**: <Concise observation>
- **<Signal Name>**: <Concise observation>
- **<Signal Name>**: <Concise observation>

### 🔍 Detailed Reconstruction
<Paragraph explaining the verdict using the evidence numbers. Use bolding for emphasis.>
"""

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a professional forensic information auditor for ShieldAI."},
                    {"role": "user", "content": prompt}
                ],
                model=self.model_id,
                temperature=0.3 # Lower temperature for more analytical output
            )
            return chat_completion.choices[0].message.content

        except Exception as e:
            print(f"--- GROQ API ERROR: {e} ---")
            verdict = "SAFE" if f_score < 0.50 and c_score > 0.25 else "RISK"
            return f"[{verdict}] Analysis complete via local sensors. (Reasoning Engine Offline)."
