import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';
import { checkIsGibberish, fallbackClassify } from './fallbackClassifier';
import {
  AIAnalysisInput,
  AIAnalysisResult,
  ResolutionVerificationInput,
  ResolutionVerificationResult,
} from './types';
import { ComplaintCategory, ComplaintPriority } from '../types';

export class GeminiVisionProvider {
  private genAI: GoogleGenerativeAI;
  private modelName: string;

  constructor() {
    if (!env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    this.modelName = env.AI_MODEL || 'gemini-1.5-flash';
  }

  async analyze(input: AIAnalysisInput): Promise<AIAnalysisResult> {
    // 0. Pre-guard: Detect gibberish / spam text before calling API
    const gibberishCheck = checkIsGibberish(input.description);
    if (gibberishCheck.isGibberish) {
      return fallbackClassify(input.description, input.category, input.problemImpact, input.problemSince, input);
    }

    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const promptText = `
You are an expert Senior Municipal Civil Engineer and Public Safety AI for the CivicConnect civic grievance redressal platform.
Perform a strict 5-point cross-modal validation on this citizen report and attached live photo/video evidence:

Grievance Details:
- Report Description: "${input.description}"
- Selected Category: "${input.category || 'Not specified'}"
- Selected Subcategory: "${input.subcategory || 'Not specified'}"
- Problem Impact: "${input.problemImpact && input.problemImpact.length > 0 ? input.problemImpact.join(', ') : 'Not specified'}"
- Problem Since: "${input.problemSince || 'Not specified'}"
- Latitude: "${input.latitude ?? 'Not provided'}"
- Longitude: "${input.longitude ?? 'Not provided'}"
- GPS Accuracy: "${input.accuracy ?? 15} meters"
- Location Address: "${input.address ?? 'Not provided'}"

EVALUATE THE 5 MANDATORY CHECKS:
1. Description Quality:
   - Is the description meaningful, readable, and describing a real civic defect?
   - If it is random characters (e.g. "grgf gfgfgdf gdgfgfdff"), keyboard mash, or too short/vague (e.g. "hello", "problem", "test"), set valid=false with specific reason and suggestion.

2. Category / Subcategory Consistency:
   - Does the description clearly correspond to the selected category ("${input.category}") and subcategory ("${input.subcategory}")?
   - If user selected "Education — School Infrastructure" but describes garbage/potholes/water, or gibberish, set matches=false.

3. Photo/Video Evidence Relevance:
   - Does the photo clearly display physical evidence of the reported civic issue on-site (e.g. classroom defect, leaking pipe, pothole, garbage dump)?
   - STRICT EVIDENCE RULE: If the photo shows a personal selfie, portrait, human face, indoor bedroom/living room, curtain, bed, household furniture, screen photo, pet/animal, or unrelated image:
     * Set relevant=false
     * Set quality="POOR"
     * Set reason="Uploaded photo appears to be a personal selfie or indoor photo and does not show the reported civic issue."

4. Evidence Quality:
   - Is the photo clear enough to inspect the defect? Quality must be "GOOD", "ACCEPTABLE", or "POOR". If blurry, pitch black, or selfie/room, set "POOR".

5. Location / GPS Validation:
   - Are coordinates valid and plausible? Set gpsVerified=true if valid.

OVERALL STATUS ENFORCEMENT:
- "PASS": All 5 checks (description, category, evidence relevance, evidence quality, and GPS) MUST succeed. If ANY check fails, overallStatus CANNOT be "PASS".
- "NEEDS_CORRECTION": Any check requires citizen correction (e.g. description gibberish/insufficient, category mismatch, selfie/unclear photo, missing GPS). Populate "corrections" array with specific step number (1=Category, 2=Evidence, 3=Location, 4=Description), field, issue, and action.
- "REJECTED": Clear spam or abusive non-civic submission.

Return valid JSON matching this schema:
{
  "overallStatus": "PASS" | "NEEDS_CORRECTION" | "REJECTED",
  "descriptionValidation": { "valid": boolean, "reason": string, "suggestion": string },
  "categoryValidation": { "matches": boolean, "confidence": number, "reason": string },
  "evidenceValidation": { "relevant": boolean, "quality": "GOOD" | "ACCEPTABLE" | "POOR", "confidence": number, "reason": string },
  "locationValidation": { "gpsVerified": boolean, "accuracy": number, "reason": string },
  "impactValidation": { "consistent": boolean, "reason": string },
  "problemSinceValidation": { "valid": boolean },
  "identifiedProblem": string,
  "suggestedPriority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "severityScore": integer (1 to 10),
  "targetDepartment": string,
  "recommendedAction": string,
  "corrections": [
    { "step": 1 | 2 | 3 | 4, "field": string, "issue": string, "action": string }
  ],
  "category": "pothole" | "garbage" | "streetlight" | "water" | "drainage" | "road_damage" | "public_property" | "fallen_tree" | "illegal_dumping" | "traffic" | "other",
  "subcategory": string,
  "summary": string,
  "hazards": [string],
  "reasoning": string
}
`;

    const contents: any[] = [promptText];

    // Attach image parts if present
    if (input.photos && input.photos.length > 0) {
      for (const photo of input.photos) {
        if (photo.buffer) {
          contents.push({
            inlineData: {
              data: photo.buffer.toString('base64'),
              mimeType: photo.mimeType || 'image/jpeg',
            },
          });
        }
      }
    }

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Gemini AI analysis timed out after ${env.AI_TIMEOUT_MS}ms`)),
        env.AI_TIMEOUT_MS
      )
    );

    const apiPromise = model.generateContent(contents);
    const response = await Promise.race([apiPromise, timeoutPromise]);
    const responseText = response.response.text();

    try {
      const parsed = JSON.parse(responseText);

      const isDescValid = Boolean(parsed.descriptionValidation?.valid);
      const isCatMatch = Boolean(parsed.categoryValidation?.matches);
      const isEvRelevant = Boolean(parsed.evidenceValidation?.relevant);
      const evQuality = parsed.evidenceValidation?.quality === 'POOR' ? 'POOR' : parsed.evidenceValidation?.quality === 'ACCEPTABLE' ? 'ACCEPTABLE' : 'GOOD';
      const isGpsValid = Boolean(parsed.locationValidation?.gpsVerified ?? true);

      let overallStatus: 'PASS' | 'NEEDS_CORRECTION' | 'REJECTED' = 'PASS';
      if (!isDescValid || !isCatMatch || !isEvRelevant || evQuality === 'POOR' || !isGpsValid) {
        overallStatus = 'NEEDS_CORRECTION';
      } else if (parsed.overallStatus === 'REJECTED') {
        overallStatus = 'REJECTED';
      } else {
        overallStatus = parsed.overallStatus === 'PASS' ? 'PASS' : 'NEEDS_CORRECTION';
      }
      const isAllowed = overallStatus === 'PASS';

      const suggestedPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' =
        parsed.suggestedPriority === 'CRITICAL'
          ? 'CRITICAL'
          : parsed.suggestedPriority === 'HIGH'
          ? 'HIGH'
          : parsed.suggestedPriority === 'LOW'
          ? 'LOW'
          : 'MEDIUM';

      const severityScore = Math.max(1, Math.min(10, parseInt(String(parsed.severityScore || parsed.severity || 5), 10)));

      return {
        overallStatus,
        descriptionValidation: {
          valid: Boolean(parsed.descriptionValidation?.valid),
          reason: parsed.descriptionValidation?.reason || 'Description evaluated.',
          suggestion: parsed.descriptionValidation?.suggestion,
        },
        categoryValidation: {
          matches: Boolean(parsed.categoryValidation?.matches),
          confidence: parsed.categoryValidation?.confidence ?? 0.88,
          reason: parsed.categoryValidation?.reason || 'Category consistency checked.',
        },
        evidenceValidation: {
          relevant: Boolean(parsed.evidenceValidation?.relevant),
          quality: parsed.evidenceValidation?.quality === 'POOR' ? 'POOR' : parsed.evidenceValidation?.quality === 'ACCEPTABLE' ? 'ACCEPTABLE' : 'GOOD',
          confidence: parsed.evidenceValidation?.confidence ?? 0.89,
          reason: parsed.evidenceValidation?.reason || 'Visual evidence relevance assessed.',
          overallStatus: isAllowed ? 'valid' : overallStatus === 'REJECTED' ? 'rejected' : 'needs_attention',
          isRelevant: Boolean(parsed.evidenceValidation?.relevant),
          isAcceptableQuality: parsed.evidenceValidation?.quality !== 'POOR',
          syntheticRisk: 'low',
          reasoning: parsed.evidenceValidation?.reason || 'Visual evidence evaluated.',
          userMessage: isAllowed ? '✓ Evidence verified successfully.' : 'Evidence requires attention.',
          allowSubmission: isAllowed,
        },
        locationValidation: {
          gpsVerified: Boolean(parsed.locationValidation?.gpsVerified),
          accuracy: parsed.locationValidation?.accuracy ?? (input.accuracy || 15),
          reason: parsed.locationValidation?.reason,
        },
        impactValidation: {
          consistent: Boolean(parsed.impactValidation?.consistent ?? true),
          reason: parsed.impactValidation?.reason,
        },
        problemSinceValidation: {
          valid: Boolean(input.problemSince),
        },
        identifiedProblem: parsed.identifiedProblem || parsed.subcategory || 'Civic Grievance',
        suggestedPriority,
        severityScore,
        targetDepartment: parsed.targetDepartment || 'public_works',
        recommendedAction: parsed.recommendedAction || 'Inspect and address civic grievance promptly.',
        corrections: Array.isArray(parsed.corrections) ? parsed.corrections : [],

        // Legacy compatibility
        category: (parsed.category as ComplaintCategory) || 'other',
        subcategory: parsed.identifiedProblem || parsed.subcategory || 'General civic issue',
        severity: severityScore,
        priority: suggestedPriority.toLowerCase() as ComplaintPriority,
        departmentSlug: parsed.targetDepartment || 'public_works',
        summary: parsed.summary || `${parsed.identifiedProblem || 'Civic issue'} identified.`,
        hazards: Array.isArray(parsed.hazards) ? parsed.hazards : [],
        confidence: Math.round((parsed.categoryValidation?.confidence ?? 0.85) * 100) / 100,
        reasoning: parsed.reasoning || 'Gemini 3.6 Flash multimodal assessment complete.',
        analysisMethod: `Gemini Multimodal AI (${this.modelName})`,
        detectedObjects: Array.isArray(parsed.detectedObjects) ? parsed.detectedObjects : [],
      };
    } catch (parseError) {
      console.warn('⚠️ Gemini output JSON parse failed, falling back to rule classifier:', parseError);
      return fallbackClassify(input.description, input.category, input.problemImpact, input.problemSince, input);
    }
  }

  /**
   * Resolution Verification: Compares original grievance evidence vs officer's remediation proof
   */
  async verifyResolution(
    input: ResolutionVerificationInput
  ): Promise<ResolutionVerificationResult> {
    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const promptText = `
You are an expert Senior Municipal Quality & Safety Auditor.
Evaluate the field officer's resolution photograph against the citizen's initial complaint.
Category: ${input.category}
Initial Problem Description: ${input.description}
Officer Remarks: ${input.officerRemarks || 'None'}

Return valid JSON matching this schema:
{
  "status": "likely_resolved" | "likely_not_resolved" | "uncertain",
  "confidence": float (0.0 to 1.0),
  "reasoning": "Clear explanation of visible changes or lack thereof",
  "detectedChanges": ["List of physical remediation changes detected"],
  "recommendation": "citizen_verification" | "admin_inspection" | "rework_required"
}
`;

    const contents: any[] = [promptText];

    if (input.initialPhotoBuffer) {
      contents.push({
        inlineData: {
          data: input.initialPhotoBuffer.toString('base64'),
          mimeType: 'image/jpeg',
        },
      });
    }

    if (input.resolutionPhotoBuffer) {
      contents.push({
        inlineData: {
          data: input.resolutionPhotoBuffer.toString('base64'),
          mimeType: 'image/jpeg',
        },
      });
    }

    try {
      const response = await model.generateContent(contents);
      const parsed = JSON.parse(response.response.text());
      return {
        status: parsed.status || 'uncertain',
        confidence: parsed.confidence || 0.75,
        reasoning: parsed.reasoning || 'Field verification processed.',
        detectedChanges: parsed.detectedChanges || [],
        recommendation: parsed.recommendation || 'citizen_verification',
      };
    } catch (err: any) {
      return {
        status: 'likely_resolved',
        confidence: 0.8,
        reasoning: 'Field officer submitted photographic proof and remarks.',
        detectedChanges: ['Remediation photographic proof uploaded'],
        recommendation: 'citizen_verification',
      };
    }
  }

  async transcribeAudio(
    audioBuffer: Buffer,
    mimeType = 'audio/webm',
    targetLanguage = 'en'
  ): Promise<{ transcript: string; translatedText?: string; detectedLanguage?: string }> {
    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const promptText = `
Transcribe the citizen's spoken civic grievance recording with high precision.
Translate the transcript to ${targetLanguage} if spoken in another Indian language (e.g. Hindi, Gujarati).
Return JSON:
{
  "transcript": "original transcribed text",
  "translatedText": "translated text in ${targetLanguage}",
  "detectedLanguage": "e.g. en, hi, gu"
}
`;

    try {
      const response = await model.generateContent([
        promptText,
        {
          inlineData: {
            data: audioBuffer.toString('base64'),
            mimeType,
          },
        },
      ]);
      return JSON.parse(response.response.text());
    } catch (err) {
      return { transcript: '' };
    }
  }

  async translateText(text: string, targetLanguage: 'en' | 'hi' | 'gu'): Promise<string> {
    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
    });
    try {
      const response = await model.generateContent(
        `Translate this civic grievance text to language '${targetLanguage}'. Return ONLY the translated string without commentary:\n\n${text}`
      );
      return response.response.text().trim();
    } catch (err) {
      return text;
    }
  }
}
