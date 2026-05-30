import { GoogleGenAI, Modality, Part, Schema, Type } from "@google/genai";
import { FormData, GeneratedScript, AspectRatio, ReferenceMode, GenderSelection, Mode, IdeaFormData, GeneratedIdeaBatch, CharacterFormData, CharacterResult, PromptMakerFormData, PromptMakerResult, AdvancedImageFormData, AdvancedImageResult, Formula, ImagePrompt, LipsyncSegment } from '../types';
import { HOOKS, STORYTELLING_FORMULAS, RELATE_FORMULAS, MODEL_REGIONS, MARKETPLACE_COMPLIANCE_LIST, IDEA_ACTIONS, IDEA_GOALS, IDEA_ADDONS, CHARACTER_FRAMINGS } from "../constants";
import { pickRandomBanks, serializeBanks } from '../scriptBanks';

let _customApiKey = "";

export function setApiKey(key: string) {
  _customApiKey = key;
}

function getApiKey(): string {
  return _customApiKey || process.env.API_KEY || "";
}

// Helper function for Fisher-Yates Shuffle (True Randomness with Crypto)
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const randomBuffer = new Uint32Array(1);
    window.crypto.getRandomValues(randomBuffer);
    const j = randomBuffer[0] % (i + 1);
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// --- CONSTANTS FOR DIRECTOR MODE (UPDATED STRICT RULES) ---
const DIRECTOR_VISUAL_RULES = `
SAAT KAMU MENGANALISIS SKRIP SEBAGAI SUTRADARA, PATUHI INI DENGAN KETAT:

🔒 ATURAN UMUM (WAJIB):
1. Tidak boleh menyebut bagian tubuh sensitif secara eksplisit (dada, payudara, lekuk tubuh, dsb).
2. Fokus visual harus berbasis framing, komposisi, atau atribut pakaian, BUKAN anatomi tubuh.
3. Bahasa harus profesional, netral, dan non-sensual.
4. Semua gerakan harus natural, singkat, dan fungsional (tidak berlarut-larut).
5. Image reference adalah otoritas utama: tidak boleh mengubah pose, framing, atau sudut kamera pada detik 0–1.

🎯 ATURAN FOKUS (FOCUS RULES):
✅ BOLEH: Wajah model, Ekspresi wajah, Hijab/pakaian (desain/tekstur), Framing area (upper framing), Produk/atribut.
❌ DILARANG: Dada/chest, torso eksplisit, lekuk tubuh/curves, istilah anatomis sensitif, kata sifat sensual (seductive, alluring).
🟢 FORMAT AMAN: "FOKUS: Wajah model dan detail hijab yang dikenakan, dengan komposisi seimbang di area atas frame."

🎭 ATURAN AKSI MODEL (MODEL ACTION RULES):
✅ BOLEH: Berbicara (lip-sync sopan), Senyum ramah, Gestur tangan ringan & singkat, Merapikan hijab/pakaian fungsional, Anggukan kepala.
❌ DILARANG: Aksi menonjolkan tubuh, berulang/berlarut-larut, menelusuri bagian tubuh, caressing, touching slowly, showing curves.
🟢 FORMAT AMAN: "AKSI MODEL: Berbicara (Lip-Sync) dengan ekspresi ramah, melakukan satu gestur tangan ringan yang relevan dengan produk, lalu kembali ke posisi netral."

🎥 ATURAN GERAKAN KAMERA (CAMERA MOVEMENT RULES):
✅ BOLEH: Medium Shot / Medium Close Up (paling dekat setengah badan), Zoom ringan (in/out), Pan lembut kiri-kanan, Kamera mengikuti gestur umum.
❌ DILARANG: Close-up ekstrem pada tubuh, menelusuri tubuh, vertical pan atas-bawah tubuh, slow motion pada gestur tubuh, kata 'intimate', 'lingering'.
🟢 FORMAT AMAN: "GERAKAN KAMERA: Medium Close Up dengan pergerakan kamera minimal, zoom out ringan dan panning lembut untuk menjaga komposisi tetap seimbang."

🖼️ ATURAN FRAME AWAL (IMAGE CONSISTENCY RULE):
- Frame 0–1 detik: Wajib identik dengan gambar input. Tidak boleh reframing, zoom, atau ubah pose.
- Gerakan baru hanya boleh dimulai setelah detik ke-1.

🚫 NEGATIVE PROMPT (WAJIB ADA DI SETIAP OUTPUT PROMPT):
sexualized framing, body emphasis, chest focus, sensual movement, provocative pose, bad quality, distorted, blurry, watermark, text overlay, bad anatomy, deformed, ugly, pixelated, low resolution, static camera (if movement requested), shaky camera.

🧠 POLA EMAS: Jika bisa digambarkan dengan istilah sinematografi -> aman. Jika harus menyebut bagian tubuh -> ganti dengan istilah framing.
`;

// ============================================================
// FIX #1: SAFETY RULES KHUSUS UNTUK VIDEO PROMPT (I2V / FLOW)
// Mencegah trigger safety filter pada kategori produk sensitif
// ============================================================
const VIDEO_PROMPT_SAFETY_RULES = `
🔒 MANDATORY VIDEO PROMPT SAFETY RULES (NON-NEGOTIABLE):

PRODUCT CATEGORY LANGUAGE RULES:
- NEVER use the words: "underwear", "undershorts", "panties", "lingerie", "intimate apparel", "undergarment" in the prompt.
- ALWAYS reframe intimate/underwear products as: "fashion layering shorts", "modest activewear piece", "comfortable inner layer shorts", "fashion shorts", "layering garment".
- Product MUST always be described as displayed ON A HANGER or held by the hanger — NEVER described as worn on a body or held against a body.

TOUCH & FABRIC INTERACTION RULES:
- NEVER use: "hands feeling the fabric", "gently feeling", "touching softly", "caressing fabric", "stroking", "running fingers over".
- ALWAYS replace with: "examining the garment", "adjusting the hanger", "holding up the hanger", "inspecting the hem detail from a distance".

CLOSE-UP RULES:
- NEVER do close-up of: waistband area, elastic band, inner seams, crotch area, or any garment area that implies intimate use.
- SAFE close-ups ONLY: hem ruffle/trim details shot from below/outside the garment, fabric texture from a neutral angle, product label or brand tag.

BODY CONTACT RULES:
- Product must NEVER be shown pressed against, draped over, or touching any body area.
- Product stays on hanger in ALL scenes unless it is a B-roll flat lay on a table/surface.

SCENE FRAMING RULES:
- All character scenes: Medium Shot or above ONLY. No lower body framing.
- Camera movement: pan, orbit, push-in on FACE only — never pan downward toward waist/lower body.

MANDATORY CLOSING TAG (append to end of every generated prompt):
Family-safe commercial content. No intimate apparel framing. Product displayed on hanger only. No body contact with product. Modest, professional fashion editorial style.
`;

const MARKETING_30_FRAMEWORK = `
🧠 MARKETING 3.0 FRAMEWORK (WAJIB DIADAPTABSI):
Setiap kata dalam skrip harus mencerminkan jiwa Marketing 3.0. Jangan hanya jualan atau kasih info kosong.
1. Value-driven: Fokus pada nilai kehidupan dan purpose, bukan sekadar fitur produk atau konten receh.
2. Human-centric: Sentuh emosi terdalam, aspirasi, dan kecemasan audiens secara manusiawi. Bicara heart-to-heart.
3. Collaborative spirit: Gunakan bahasa yang inklusif ("kita", "bersama") untuk membangun rasa komunitas.
4. Sustainability/Impact: Tunjukkan dampak positif (kecil atau besar) bagi hidup mereka atau lingkungan.
`;

export async function detectImageGender(
  base64Data: string, 
  mimeType: string
): Promise<'pria' | 'wanita' | null> {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  const prompt = `
    Lihat gambar ini. Apakah subjek manusia UTAMA dalam gambar ini terlihat seperti Laki-laki (Male) atau Perempuan (Female)?
    
    Jawab HANYA dengan satu kata:
    - "pria" (jika laki-laki)
    - "wanita" (jika perempuan)
    - "unknown" (jika tidak ada manusia atau tidak jelas)
    
    Jangan tambahkan teks lain.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: mimeType } },
          { text: prompt }
        ]
      }
    });

    const text = response.text?.trim().toLowerCase();
    if (text === 'pria') return 'pria';
    if (text === 'wanita') return 'wanita';
    return null;
  } catch (error) {
    console.error("Error detecting gender:", error);
    return null;
  }
}

export async function generateVeo3VideoPrompt(
  image: { data: string; mimeType: string },
  sceneDescription: string,
  scriptContent: string,
  genderRule?: string,
  regionRule?: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  let demographicInstruction = "";
  if (genderRule || regionRule) {
      demographicInstruction = `
**CRITICAL DEMOGRAPHIC RULES:**
If the scene features a person, you MUST strictly adhere to these demographic constraints to match the base image:
${regionRule ? `- REGION/RACE: ${regionRule}` : ''}
${genderRule ? `- GENDER: ${genderRule === 'pria & wanita' ? "Mix 'Male' and 'Female' characters appropriately" : `Strictly ${genderRule.toUpperCase()}`}` : ''}
- HIJAB & MODESTY: If the person in the provided image wears a hijab/headscarf, you MUST explicitly mention it along with modest long-sleeved clothing.
- PRODUCT: If the character in the image is holding a product, explicitly mention it in your description.
Make sure your English description explicitly mentions these attributes.
`;
  } else {
      demographicInstruction = `
**CRITICAL REFERENCE DEMOGRAPHIC RULE:**
Analyze the provided reference image. You MUST strictly use the EXACT face, identity, and GENDER (Male/Female) of the person in the reference image.
- HIJAB & MODESTY: If the reference image features a hijab/headscarf, explicitly mention it in your description along with modest long-sleeved clothing.
- PRODUCT: If the person in the reference image is holding a product/item, explicitly mention it in the description.
Make sure your English description explicitly mentions the correct gender and matches the reference image attributes.
`;
  }

  // ============================================================
  // FIX #2: Tambah VIDEO_PROMPT_SAFETY_RULES ke Veo3 prompt
  // ============================================================
  const systemInstruction = `
Your task is to create an optimal, cinematic, and highly expressive Veo 3 prompt based on the provided image, scene description, and the full script content.
The prompt you generate must be written in English. The dialogue section MUST be exactly extracted from the script in its original language (Indonesian). Evaluate the "Scene Description" to know which part of the "Full Script Content" is being described, then extract the corresponding dialogue.

CRITICAL REQUIREMENT: To prevent the "talking photo" or "frozen" effect, you MUST explicitly describe the subject's emotional expressions, natural gestures (e.g., hand movements, shifting posture, blinking), and lifelike breathing. Do NOT create static portrait scenes.

${VIDEO_PROMPT_SAFETY_RULES}

${demographicInstruction}

**MANDATORY CONTENT SAFETY RULES:**
- ONLY describe movement using CINEMATIC terms: camera tracking, focus pull, pan, dolly, cut.
- For body motion: ONLY use "slight head turn", "natural hand gesture", "adjusting product on hanger", "nodding". 
- NEVER use terms like: body curves, weight transfer, body sway, sensual, alluring, lingering, seductive, intimate.
- Frame description MUST stay at shoulder/upper-chest level (Medium Shot or Medium Close Up ONLY).
- NEGATIVE PROMPT must always include: sexualized framing, body emphasis, chest focus, sensual movement, provocative pose, curves emphasis.

**INPUTS:**
1.  **Image:** A static image representing the scene.
2.  **Scene Description:** "${sceneDescription}"
3.  **Full Script Content:** "${scriptContent}"

**YOUR PROMPT MUST BE STRICTLY FORMATTED EXACTLY LIKE THIS EXAMPLE (but adapted using details from the inputs):**

A pensive Indonesian woman wearing a modest long-sleeved outfit stands in front of a glowing abstract digital network visualization. At the beginning of the scene, she lightly rests her chin on one hand while looking away thoughtfully, then slowly lowers her hand as she starts speaking, expressing emotional frustration and vulnerability. During the dialogue, she naturally gestures with her hands, occasionally opening her palms, slightly shaking her head in disbelief, and softly emphasizing certain words with realistic conversational body language. Her facial expression gradually shifts from exhaustion into quiet determination.

Dialogue (spoken naturally in Indonesian):
"[Insert exact matching dialogue sentence/paragraph here]"

The woman performs realistic human motion throughout the scene: expressive hand gestures, natural posture shifting, subtle weight transfer, realistic breathing, blinking, emotional eye movement, slight body lean, dynamic conversational gestures, authentic lip sync, and soft cloth movement. Avoid static posing. The performance should feel like a real person talking emotionally in a documentary interview.

The camera uses a cinematic medium shot with slight natural handheld micro movement for realism, maintaining consistent facial identity and subject focus while allowing organic motion. The digital nodes and connection lines behind her softly animate and pulse.

Soft cinematic lighting, realistic skin texture, emotionally immersive atmosphere, cinematic depth of field, realistic shadows, modern tech-documentary aesthetic, natural human behavior, ultra realistic motion, anti-stiffness, anti-frozen pose, NO slideshow effect, NO static portrait animation, NO fake zoom, cinematic realism, 4K commercial quality.
NEGATIVE PROMPT: sexualized framing, body emphasis, chest focus, sensual movement, provocative pose, bad anatomy, distorted, blurry, watermark.
`;

  try {
    const contents: { parts: Part[] } = {
      parts: [
        {
          inlineData: {
            data: image.data,
            mimeType: image.mimeType,
          }
        },
        { text: systemInstruction }
      ]
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: contents,
    });

    const videoPrompt = response.text?.trim();

    if (!videoPrompt) {
      throw new Error("AI did not return a Veo 3 video prompt.");
    }

    return videoPrompt;

  } catch (error: any) {
    console.error("Error calling Gemini for Veo 3 video prompt generation:", error);
    let errorMessage = "Gagal membuat prompt video Veo 3.";
    if (error.message) {
      errorMessage += ` Pesan: ${error.message}`;
    }
    throw new Error(errorMessage);
  }
}

export async function generateVideoPrompt(
  image: { data: string; mimeType: string },
  originalPrompt: string,
  focusItem?: string,
  genderRule?: string,
  regionRule?: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  let demographicInstruction = "";
  if (genderRule || regionRule) {
      demographicInstruction = `
**CRITICAL DEMOGRAPHIC RULES:**
If the scene features a person, you MUST strictly adhere to these demographic constraints to match the base image:
${regionRule ? `- REGION/RACE: ${regionRule}` : ''}
${genderRule ? `- GENDER: ${genderRule === 'pria & wanita' ? "Mix 'Male' and 'Female' characters appropriately" : `Strictly ${genderRule.toUpperCase()}`}` : ''}
- HIJAB & MODESTY: If the person in the provided image wears a hijab/headscarf, you MUST explicitly mention it along with modest long-sleeved clothing.
- PRODUCT: If the character in the image is holding a product, explicitly mention it in your description.
Make sure your English description explicitly mentions these attributes.
`;
  } else {
      demographicInstruction = `
**CRITICAL REFERENCE DEMOGRAPHIC RULE:**
Analyze the provided reference image. You MUST strictly use the EXACT face, identity, and GENDER (Male/Female) of the person in the reference image.
- HIJAB & MODESTY: If the reference image features a hijab/headscarf, explicitly mention it in your description along with modest long-sleeved clothing.
- PRODUCT: If the person in the reference image is holding a product/item, explicitly mention it in the description.
Make sure your English description explicitly mentions the correct gender and matches the reference image attributes.
`;
  }

  // ============================================================
  // FIX #3: Tambah VIDEO_PROMPT_SAFETY_RULES + MANDATORY SAFETY
  // ke generateVideoPrompt (dipakai untuk B-Roll / non-lipsync)
  // ============================================================
  const systemInstruction = `
Your task is to create an optimal, cinematic, and highly expressive video prompt based on the provided image and original prompt context. 
The prompt you generate must be written in English and follow a specific descriptive format to ensure the generated video feels truly alive, with both the subject and the camera moving naturally.

CRITICAL REQUIREMENT: The video must feature NON-VERBAL PERFORMANCE ONLY. To prevent the "talking photo" or "frozen" effect, you MUST explicitly describe the subject's actions, natural gestures (e.g., hand movements, shifting posture, looking around, blinking), lifelike breathing, and dynamic camera movements. The subject's mouth must remain naturally closed, and they must NEVER appear to be speaking or addressing the camera like a presenter. Do NOT create static portrait scenes.

${VIDEO_PROMPT_SAFETY_RULES}

${demographicInstruction}

**MANDATORY CONTENT SAFETY RULES:**
- ONLY describe movement using CINEMATIC terms: camera tracking, focus pull, pan, dolly, cut.
- For body motion: ONLY use "slight head turn", "natural hand gesture", "adjusting product on hanger", "nodding", "looking at product".
- NEVER use terms like: body curves, weight transfer, body sway, sensual, alluring, lingering, seductive, intimate, feeling the fabric, caressing.
- Frame description MUST stay at shoulder/upper level (Medium Shot or Medium Close Up ONLY).
- If product is intimate apparel category: ALWAYS reframe as fashion layering/activewear. Product ALWAYS on hanger, NEVER against body.
- NEGATIVE PROMPT must always include: sexualized framing, body emphasis, chest focus, sensual movement, provocative pose, curves emphasis, fabric touching.

**INPUTS:**
1.  **Image:** A static image representing the scene.
2.  **Original Prompt Context:** "${originalPrompt}"
${focusItem ? `3.  **Focus Item:** "${focusItem}" - Ensure the camera or action highlights this item. If this item is a garment, show it on a hanger or laid flat — never worn or held against the body.` : ''}

**YOUR PROMPT MUST BE STRICTLY FORMATTED EXACTLY LIKE THIS EXAMPLE (but adapted using details from the inputs):**

A stylish young Indonesian woman in her late 20s wearing a modest long-sleeved outfit and hijab (IF observed in the image) carefully tends to plants inside a meticulously organized modern hydroponic farm while holding a product on a hanger (IF observed in the image). She is fully focused on her work and never addresses the camera. Her mouth remains naturally closed except for subtle relaxed breathing. NON-VERBAL PERFORMANCE ONLY.

She performs realistic human motion throughout the scene: gently adjusting plant trays, inspecting roots, spraying water mist, moving naturally between rows, subtle posture shifting, realistic breathing, blinking, slight head turns, natural eye focus on the plants, soft cloth movement, and authentic working gestures. Her demeanor is calm, focused, and quietly content. Avoid posing for the camera.

The camera captures her in an observational cinematic style with slow dynamic tracking movement, following her activity naturally as if filmed for a premium documentary. Slight handheld micro movement adds realism while maintaining clear subject focus and facial consistency. She does not look into the lens and never appears to speak.

[Describe the background/environment based on inputs]

Soft cinematic lighting creates beautiful rim light, realistic skin texture, cinematic depth of field, realistic shadows, natural textures of fabric, emotionally immersive atmosphere, premium color grading, ultra realistic motion, anti-stiffness, anti-frozen pose, NO talking, NO lip sync, NO dialogue, NO presenter behavior, NO slideshow effect, NO static portrait animation, cinematic realism, 4K commercial quality.
NEGATIVE PROMPT: sexualized framing, body emphasis, chest focus, sensual movement, provocative pose, fabric touching, hands feeling fabric, waistband close-up, intimate apparel framing, body contact with product.
`;

  try {
    const contents: { parts: Part[] } = {
      parts: [
        {
          inlineData: {
            data: image.data,
            mimeType: image.mimeType,
          }
        },
        { text: systemInstruction }
      ]
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: contents,
    });

    const videoPrompt = response.text?.trim();
    return videoPrompt || "A cinematic tracking shot of the subject showing lifelike motion, natural breathing, subtle gestures, and realistic facial expressions. Soft cinematic lighting, ultra realistic motion, 4k quality. NEGATIVE PROMPT: sexualized framing, body emphasis, chest focus, sensual movement.";

  } catch (error: any) {
    console.error("Error generating dynamic video prompt:", error);
    return "A dynamic camera movement revealing the subject with natural expressions and organic motion. Cinematic lighting, ultra detailed, realistic physics, 4k. NEGATIVE PROMPT: sexualized framing, body emphasis, chest focus.";
  }
}

export async function generateTextToVideoPrompt(
  sceneDescription: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  const systemInstruction = `
You are an expert video prompt creator for AI text-to-video generators. Your task is to transform a simple scene description from a script into a rich, detailed, and cinematic video prompt in ENGLISH.

**INSTRUCTIONS:**
1.  **Analyze the Scene:** Read the provided scene description in Indonesian.
2.  **Compose a Detailed Prompt:** Write a single, comprehensive paragraph in ENGLISH.
3.  **Incorporate Subject, Action, Environment, Mood, Lighting, and Camera Movement.**
4.  **Output:** Provide ONLY the final prompt string in English.

**SAFETY RULES:**
- NEVER use sensual, intimate, or body-emphasis language.
- If the scene involves garments/clothing products, describe them on hangers or displayed flat — never worn in a suggestive way.
- Always append: NEGATIVE PROMPT: sexualized framing, body emphasis, sensual movement, provocative pose.
`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `${systemInstruction}\n\nSCENE: ${sceneDescription}`,
    });
    return response.text?.trim() || "";
  } catch (error: any) {
    console.error("Error calling Gemini for text-to-video prompt generation:", error);
    throw new Error("Gagal membuat prompt text-to-video.");
  }
}

export async function generateImage(
  prompt: string,
  aspectRatio: AspectRatio,
  referenceImage?: { data: string; mimeType: string },
  referenceMode?: ReferenceMode,
  genderRule?: string,
  regionRule?: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  
  if (!prompt || !prompt.trim()) {
      throw new Error("Prompt gambar kosong. Tidak dapat membuat gambar.");
  }

  try {
    if (!referenceImage) {
          // STRICT DEMOGRAPHIC INJECTION IF PROVIDED
          let finalPrompt = prompt;
          if (genderRule || regionRule) {
              const rules = [];
              if (regionRule) rules.push(`REGION/RACE: ${regionRule}`);
              if (genderRule) {
                  rules.push(genderRule === 'pria & wanita' 
                    ? `GENDER: Ensure mixing of 'Male' and 'Female' characters appropriately as requested in the scene.`
                    : `GENDER: STRICTLY ${genderRule.toUpperCase()} characters ONLY.`);
              }
              finalPrompt = `[CRITICAL DEMOGRAPHIC RULES: ${rules.join(' | ')}. Ignore any conflicting demographics in the prompt below, enforce these strictly if the scene contains people.]\n\n${prompt}`;
          }

          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash-image',
              contents: { parts: [{ text: finalPrompt }] },
              config: {
                  imageConfig: { aspectRatio: aspectRatio }
              }
          });

          for (const part of response.candidates?.[0]?.content?.parts || []) {
              if (part.inlineData && part.inlineData.data) {
                  return part.inlineData.data;
              }
          }
           throw new Error("AI tidak mengembalikan data gambar.");
    } 
    else {
      // LOGIC BARU: Strict Reference Control
      let finalPrompt = "";
      let demographicInstruction = `
           - ANALYZE GENDER: You MUST recognize if the person in the reference image is Male or Female.
           - LOCK GENDER: You MUST generate the character with the EXACT SAME GENDER as the reference image. Ignore any conflicting gender in the prompt.`;
      
      if (referenceMode === 'kreatif') {
        // KREATIF: WAJAH SAMA, BAJU & BG BERUBAH
        finalPrompt = `
        TASK: Creative Scene Generation with Face Identity Lock.
        
        INPUT REFERENCE: Contains the "Actor".
        SCENE PROMPT: "${prompt}"
        
        INSTRUCTIONS:
        1. IF SCENE REQUIRES A PERSON:${demographicInstruction}
           - LOCK FACE/IDENTITY: Use the exact face from the reference image.
           - MODESTY & HIJAB ANALYSIS: Analyze the reference image carefully. If the person is wearing a hijab/headscarf, you MUST ensure strictly that the generated character ALSO wears a hijab and modest, long-sleeved clothing. DO NOT generate short sleeves or non-hijab appearances if the original character has a hijab.
           - PRODUCT HOLDING ITEM: Analyze the reference image. If the 
  person is holding a product, LOCK the exact holding style:
  same orientation, same position, same display method.
  If product is on a hanger → MUST stay on hanger, upright.
  If held with both hands → MUST stay held with both hands.
  NEVER fold, rotate, lay flat, or reposition the product.
           - CHANGE OUTFIT: Generate NEW CLOTHING suitable for the scene described (Subject to Modesty & Hijab constraints if applicable).
           - CHANGE BACKGROUND & POSE: Create a new environment and pose matching the scene.
           
        2. IF SCENE IS AN OBJECT/SCENERY (No Person):
           - IGNORE the reference image content entirely. Just generate the scene described.
           
         Aspect Ratio: ${aspectRatio}. Style: Photorealistic.
        `;
      } else {
        // POSE & BG: WAJAH & BAJU SAMA, BG BERUBAH
        finalPrompt = `
        TASK: Scene Recontextualization with Character Lock.
        
        INPUT REFERENCE: Contains the "Actor" and "Outfit".
        SCENE PROMPT: "${prompt}"
        
        INSTRUCTIONS:
        1. IF SCENE REQUIRES A PERSON:${demographicInstruction}
           - LOCK FACE/IDENTITY: Use the exact face from the reference.
           - LOCK OUTFIT: Use the EXACT clothing/outfit from the reference. Do not change it to be revealing if they are wearing a hijab.
           - PRODUCT HOLDING ITEM: Analyze the reference image. If the 
  person is holding a product, LOCK the exact holding style:
  same orientation, same position, same display method.
  If product is on a hanger → MUST stay on hanger, upright.
  If held with both hands → MUST stay held with both hands.
  NEVER fold, rotate, lay flat, or reposition the product.
           - CHANGE BACKGROUND & POSE: Place this character in the new environment/pose described.
           
        2. IF SCENE IS AN OBJECT/SCENERY (No Person):
           - IGNORE the reference image content entirely. Just generate the scene described.

        Aspect Ratio: ${aspectRatio}. Style: Photorealistic.
        `;
      }
      
      const contents: { parts: Part[] } = {
        parts: [
          { inlineData: { data: referenceImage.data, mimeType: referenceImage.mimeType } },
          { text: finalPrompt }
        ]
      };

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: contents,
        config: {
          imageConfig: { aspectRatio: aspectRatio }
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData && part.inlineData.data) {
          return part.inlineData.data;
        }
      }
      throw new Error("Gagal menghasilkan gambar dengan referensi.");
    }
  } catch (error: any) {
    console.error("Error in generateImage:", error);
    let msg = error.message || "Gagal menghasilkan gambar.";
    
    if (msg.includes("Empty instances") || msg.includes("INVALID_ARGUMENT")) {
        msg = "Gagal membuat gambar: Parameter tidak valid atau prompt kosong.";
    } else if (msg.includes("429") || msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("exhausted")) {
        msg = "Gagal membuat gambar: Kuota API habis (Quota Exceeded) atau batas limit tercapai.";
    } else if (msg.includes("400") || msg.toLowerCase().includes("safety")) {
        msg = "Gagal membuat gambar: Diblokir oleh filter keamanan (Safety Filter). Coba perhalus prompt Anda.";
    }
    
    throw new Error(msg);
  }
}

export async function smartEditImage(
  base64Data: string,
  mimeType: string,
  targetAspectRatio: AspectRatio,
  editInstruction: string = ""
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const prompt = `Fill all void spaces (black areas) to achieve strictly ${targetAspectRatio} ratio seamlessy. Preserve subject identity and pose perfectly. ${editInstruction}`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                { inlineData: { data: base64Data, mimeType: mimeType } },
                { text: prompt }
            ]
        },
        config: {
            responseModalities: [Modality.IMAGE],
        }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData && part.inlineData.data) {
            return part.inlineData.data;
        }
    }
    throw new Error("Failed to edit image.");
  } catch (error) {
      console.error("Smart Edit Error", error);
      throw error;
  }
}

export async function generateScripts(formData: FormData): Promise<GeneratedScript[]> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    
    // --- 1. SHARED LOGIC: CHARACTER & VISUAL DEFINITIONS ---
    let characterInstruction = "";
    if (formData.useReferenceModel) {
        if (formData.referenceMode === 'kreatif') {
            characterInstruction = `KONDISI: ADA REFERENCE IMAGE (MODE: KREATIF - WAJIB GANTI BAJU). 
            - LOCK IDENTITY: Wajah HARUS sama persis dengan referensi. Ikuti gender (Pria/Wanita) dari referensi.
            - ATURAN HIJAB & KESOPANAN: Jika pada referensi model berhijab, pakaian baru yang diuraikan (CHANGE OUTFIT) WAJIB tetap berupa hijab dan pakaian bawahan/atasan lengan panjang tertutup yang sopan. (Dilarang pakai lengan pendek/terbuka).
            - ATURAN PRODUK: Jika pada referensi model memegang produk, 
  WAJIB pertahankan produk dengan CARA PERSIS SAMA seperti 
  referensi (posisi, orientasi, cara pegang).
  Contoh: jika digantung di hanger → tetap di hanger tegak.
  Jika dipegang tangan → tetap dipegang dengan posisi sama.
  DILARANG mengubah orientasi, melipat, atau menaruh produk.
            - CHANGE OUTFIT: Pakaian BERUBAH sesuai deskripsi scene/skrip (dengan penyesuaian aturan kesopanan di atas).
            - CHANGE BG/POSE: Background dan pose berubah sesuai skrip.
            - EXCEPTION: Jika scene adalah shot produk/pemandangan TANPA orang, abaikan referensi model.`;
        } else {
            characterInstruction = `KONDISI: ADA REFERENCE IMAGE (MODE: POSE & BG - BAJU TETAP). 
            - LOCK IDENTITY & OUTFIT: Wajah DAN Pakaian HARUS SAMA persis dengan referensi. Ikuti gender dari referensi (pertahankan atribut hijab/tertutup jika ada).
            - ATURAN PRODUK: Jika pada referensi model memegang produk, 
  WAJIB pertahankan produk dengan CARA PERSIS SAMA seperti 
  referensi (posisi, orientasi, cara pegang).
  Contoh: jika digantung di hanger → tetap di hanger tegak.
  Jika dipegang tangan → tetap dipegang dengan posisi sama.
  DILARANG mengubah orientasi, melipat, atau menaruh produk.
            - CHANGE BG/POSE: Hanya ubah background, pose, dan ekspresi.
            - EXCEPTION: Jika scene adalah shot produk/pemandangan TANPA orang, abaikan referensi model.`;
        }
    } else {
        const regionName = MODEL_REGIONS.find(r => r.id === formData.modelRegion)?.label || formData.modelRegion || "Asia Tenggara (Indonesia)";
        const genderRule = formData.gender === 'pria & wanita' 
          ? `GENDER: 'pria & wanita'. ATURAN: Buat karakter pria dan wanita secara bergantian (misal skrip 1 tokoh pria, skrip 2 tokoh wanita, dst).` 
          : `GENDER: HANYA ${formData.gender.toUpperCase()}. ATURAN: Semua karakter instruksikan SECARA SPESIFIK dan KONSISTEN sebagai ${formData.gender}.`;
        
        characterInstruction = `KONDISI: TIDAK ADA REFERENCE IMAGE. TUGAS ANDA: Buat karakter baru yang spesifik. 
            - WILAYAH/KARAKTERISTIK WAJAH WAJIB: ${regionName}. Keterangan dalam prompt harus jelas menyebutkan ras/wilayah ini.
            - ${genderRule}`;
    }

    // --- 2. CTA & MODE LOGIC ---
    let ctaInstruction = "";
    const isSalesMode = formData.mode === Mode.SALES;
    const isSpesialis = isSalesMode && formData.salesMode === 'spesialis';

    if (isSpesialis) {
        const parsedIsi = parseInt(formData.jumlahIsi || '1');
        const banks = pickRandomBanks({
            productQty: !isNaN(parsedIsi) ? parsedIsi : 1
        });
        const serializedBanks = serializeBanks(banks);
        const hargaText = formData.hargaNormal ? `Harga Normal: ${formData.hargaNormal}` : '';
        const promoText = formData.hargaPromo ? `Harga Promo: ${formData.hargaPromo}` : '';
        const isiText = formData.jumlahIsi ? `Jumlah Isi: ${formData.jumlahIsi}` : '';

        const spesialisInstruction = `
        ANDA SEDANG MENGGUNAKAN MODE JUALAN SPESIALIS (${formData.spesialisType?.toUpperCase() || 'AMAN'}).
        BERIKUT DATA HARGA:
        ${hargaText}
        ${promoText}
        ${isiText}

        ${formData.spesialisType === 'aman' ? `## MODE AMAN
        DILARANG menyebut nominal harga secara langsung. Sebagai gantinya gunakan:
        - value perception
        - kesan murah
        - kesan worth it
        - kesan hemat
        - kesan lebih terjangkau
        - perbandingan implisit
        Contoh: "Kirain bakal mahal ternyata masih masuk akal.", "Dengan kualitas kayak gini ternyata nggak semahal yang aku kira."
        Jangan pernah menyebut angka harga pada mode aman.` : `## MODE BEBAS
        - boleh menyebut harga secara jelas
        - boleh menyebut diskon
        - boleh menyebut nominal promo
        - boleh membandingkan harga langsung
        - boleh menyebut "cuma", "tinggal", "diskon", dll
        Gunakan data harga normal dan harga promo (jika ada) untuk membuat hook promo, perbandingan harga, dan urgency.`}

# STRUKTUR SCRIPT WAJIB (HARUS MENGALIR SEPERTI ORANG NGOBROL):
        
        1. HOOK PROMO (KALIMAT PERTAMA)
        ATURAN KERAS: Buka video LANGSUNG menggunakan kalimat dari BANK BAHAS PROMO. Ganti variabel seperti [harga], [X], [X]% dengan data yang masuk akal dan sesuai konteks. DILARANG membuka script dengan pertanyaan masalah (contoh: "Sering risih...?"). Langsung tembak promonya!

        2. BRIDGING / JEMBATAN TRANSISI (SANGAT PENTING!)
        JANGAN KAKU! Anda WAJIB membuat kalimat penghubung (bridging) yang SANGAT NATURAL dari kalimat promo menuju pembahasan produk. Jangan sampai terkesan melompat, bisa menggunakan salah satu template dari "BANK BRIDGING / JEMBATAN TRANSISI" di bawah untuk menyambungkan obrolan ke fitur produk secara natural.
        Contoh transisi yang natural boleh kamu kreasikan:
        - "...Makanya mumpung lagi murah, ini saatnya kamu cobain [Nama Produk] buat ngatasin masalah [Masalah]."
        - "...Kapan lagi kan dapet barang sebagus [Nama Produk] dengan harga segini. Apalagi buat kamu yang pengen..."
        - "...Dengan harga segitu, kamu udah dapet [Nama Produk] yang bahannya aja dari..."
        
        3. FITUR / MASALAH YANG DISELESAIKAN
        Lanjutkan dengan menjelaskan alasan kenapa produk ini worth it (berdasarkan deskripsi produk). Bahasannya harus mengalir santai, seperti merekomendasikan barang ke teman (Human-Centric). Jangan menyebutkan fitur seperti membaca brosur.

        4. PERBANDINGAN HARGA / VALUE
        Gunakan BANK PERBANDINGAN untuk membangun persepsi worth it.

        5. CTA (WAJIB COPAS DARI BANK CTA)
        ATURAN KERAS CTA:
        1. Anda WAJIB menyalin secara PERSIS salah satu dari BANK CTA.
        2. ATURAN {HARGA}: Jika Anda memilih CTA dari "CTA 3" yang memiliki teks {HARGA}, ganti {HARGA} dengan nominal harga yang diberikan (jika ada).
        3. JIKA HARGA TIDAK DIBERIKAN: DILARANG memilih CTA yang mengandung {HARGA}.
        4. Boleh menambahkan frasa "di keranjang bawah" atau "kiri bawah" di akhir CTA.

        HINDARI: bahasa AI, terlalu formal, teknis, atau pengulangan. DILARANG menambahkan instruksi gerakan/gesture [GESTURE] di dalam script.

        ${serializedBanks}
        `;

        ctaInstruction = spesialisInstruction;
    } else if (isSalesMode) {
        const selectedCTAType = formData.ctaType || 'CTA Ajakan Lembut';
        
        let ctaExamples = "";
        if (selectedCTAType.includes('Lembut')) {
            ctaExamples = `
            - "Kalau kamu merasa ini cocok, belinya di keranjang bawah ya 😊"
            - "Cek dulu produknya lewat keranjang bawah, siapa tahu kamu suka 🌸"
            - "Kalau tertarik, boleh masukin ke keranjang bawah pelan-pelan aja."
            - "Nggak harus sekarang, tapi boleh intip dulu di keranjang bawah ya."
            `;
        } else if (selectedCTAType.includes('Logika')) {
            ctaExamples = `
            - "Siapa tahu ada promo sebelum habis langsung amankan lewat keranjang bawah ya."
            - "Harga lagi bersahabat, mending masukin dulu ke keranjang bawah biar nggak ketinggalan."
            - "Stok cepat habis, belinya di keranjang bawah sekarang biar aman ya."
            - "Lebih hemat kalau langsung dimasukin ke keranjang bawah sebelum naik harga."
            `;
        } else if (selectedCTAType.includes('Emosional')) {
            ctaExamples = `
            - "Kamu pantas hidup lebih mudah amankan lewat keranjang bawah sekarang ya."
            - "Jangan tunggu sampai nyesel, belinya di keranjang bawah ya."
            - "Kalau ini bisa bikin harimu lebih ringan, mulai dari keranjang bawah."
            - "Hadiah kecil buat dirimu sendiri? Ambil lewat keranjang bawah ya."
            `;
        } else if (selectedCTAType.includes('Penasaran')) {
            ctaExamples = `
            - "Penasaran kenapa ini viral? Cek langsung di keranjang bawah ya 👇"
            - "Bagian terbaiknya ada setelah kamu buka keranjang bawah."
            - "Yang bikin banyak orang tertarik ada di keranjang bawah coba lihat deh."
            - "Kalau mau tahu rahasianya, intip dulu di keranjang bawah ya."
            `;
        } else if (selectedCTAType.includes('Sosial')) {
            ctaExamples = `
            - "Ribuan orang sudah pakai kamu bisa ikut lewat keranjang bawah ya."
            - "Produk ini lagi naik daun, belinya gampang lewat keranjang bawah ya."
            - "Join pengguna lainnya, amankan produkmu di keranjang bawah."
            - "Biar nggak ketinggalan tren, langsung ambil lewat keranjang bawah ya."
            `;
        } else if (selectedCTAType.includes('Eksperimen')) {
            ctaExamples = `
            - "Coba dulu masukin ke keranjang bawah biar ga lupa ya."
            - "Belinya di keranjang bawah ya, coba dulu nggak masalah."
            - "Mulai dari satu dulu, tinggal masukin ke keranjang bawah aja."
            - "Nggak perlu komitmen besar, cukup ambil dulu di keranjang bawah."
            `;
        } else if (selectedCTAType.includes('Hard Selling')) {
             ctaExamples = `
            - "Stop nunda. Belinya di keranjang bawah sekarang sebelum harganya naik ya!"
            - "Scroll tanpa ambil? Siap-siap nyesel deh segera ke keranjang bawah ya."
            - "Yang cepat dapat, yang lambat bisa kehabisan. Mending Ambil di keranjang bawah sekarang!"
            - "Nggak ada alasan buat nunggu — amankan barangmu lewat keranjang bawah sekarang juga!"
            `;
        } else {
             ctaExamples = `- "Cek keranjang bawah untuk detailnya ya."`;
        }

        ctaInstruction = `
        📢 ATURAN CTA KHUSUS (MODE JUALAN):
        1. PILIHAN GAYA CTA: Anda HARUS menggunakan gaya "${selectedCTAType}".
        2. ISTILAH WAJIB: Gunakan frasa "keranjang bawah" untuk mengarahkan pembelian.
        3. ISTILAH TERLARANG (HARAM): Jangan pernah gunakan "keranjang kuning", "keranjang oren", "klik link", atau warna lain.
        4. CONTOH KALIMAT YANG WAJIB DITIRU (Pola & Nada):
           ${ctaExamples}
        5. Sambungkan CTA ini secara natural dengan kalimat penutup skrip.
        `;

    } else {
        ctaInstruction = `
        📢 ATURAN CTA KHUSUS (MODE UMUM):
        1. DEFAULT: Ajak partisipasi kolaboratif (Sharing, Follow untuk tips lain, Diskusi di komen).
        2. KONDISI KHUSUS (BERITA DUKA / KESEDIHAN): 
           - JIKA topik membahas musibah, kematian, atau kesedihan: CTA WAJIB berupa ajakan BERDOA atau HARAPAN BAIK.
           - DILARANG meminta like/follow/share pada konten duka.
        3. JANGAN JUALAN: Tidak boleh ada ajakan membeli atau menyebut keranjang.
        `;
    }
    
    // --- VISUAL SCENE INSTRUCTION ---
    const visualInstruction = formData.generateImagePrompts
        ? `imagePrompts: WAJIB ADA. Bertindaklah sebagai SUTRADARA. Analisis teks skrip kalimat per kalimat.
        Untuk setiap scene visual, buat prompt text-to-image dalam bahasa Inggris.
        
        WAJIB SERTAKAN 'source':
        - "source": Tulis ulang kalimat/potongan skrip asli yang menjadi dasar visualisasi scene ini.
        - "prompt": Deskripsi visual (Bahasa Inggris) sesuai aturan Director.
        
        ${characterInstruction}
        ${DIRECTOR_VISUAL_RULES}`
        : `imagePrompts: TIDAK PERLU. Kembalikan array kosong [].`;

    // --- FLOW INSTRUCTION (IMAGE FLOW / GROK) ---
    const flowInstruction = formData.enableLipsync
    ? `lipsyncSegments: WAJIB ADA. Pecah SELURUH skrip menjadi segmen-segmen berdurasi ${formData.flowSegmentDuration} detik secara merata dan logis.
    
    Untuk panduan pembagian dialog: Segmen berdurasi ${formData.flowSegmentDuration} detik idealnya menampung sekitar ${Math.round((formData.flowSegmentDuration/8)*20)} - ${Math.round((formData.flowSegmentDuration/8)*24)} kata dengan tempo natural.
    Pastikan tidak ada dialog yang terlewat, dan pergantian segmen terasa natural.
    Jika "${formData.flowAudioMode}" adalah "VO", model TIDAK BERBICARA (mulut tertutup rapat).
    Jika "${formData.flowAudioMode}" adalah "Lipsync", model BERBICARA (lip-sync dialog).
    
    PENTING: JANGAN BUAT PROMPT VIDEO (videoPrompt) PADA TAHAP INI! Biarkan kosong atau hilangkan field tersebut.
    Bertindaklah sebagai SUTRADARA. Untuk setiap segmen, buat "imagePrompt" dalam Bahasa Inggris yang ketat mengikuti DIRECTOR_VISUAL_RULES di bawah.
Wajib mencakup:
- FOKUS: Area framing yang aman (wajah, ekspresi, pakaian/hijab, produk).
- AKSI MODEL: Gestur natural, singkat, fungsional.
- GERAKAN KAMERA: Shot type spesifik (Medium Shot / MCU), pergerakan minimal.
- NEGATIVE PROMPT: Wajib sertakan di setiap imagePrompt.
- KONSISTENSI: Setiap imagePrompt harus konsisten dengan karakter yang sama (wajah, outfit, atribut).
- PRODUK (KRITIS): Analisis gambar referensi. Jika model memegang produk, 
  Anda WAJIB menuliskan secara spesifik di SETIAP imagePrompt agar model 
  memegang produk dengan CARA, POSISI, dan ORIENTASI yang SAMA PERSIS dengan referensi. 
  Jika di referensi produk berada di HANGER, tulis wajib "holding product on a hanger upright". 
  DILARANG menyuruh melipat, menaruh, atau mengubah cara pegang produk!
  EXCEPTION: Jika segmen adalah pure B-Roll tanpa model, boleh diabaikan.
        
        STRUCTURE JSON untuk setiap item dalam array lipsyncSegments:
        {
          "segmentNumber": number,
          "duration": "x detik",
          "dialog": "teks dialog...",
          "imagePrompt": "Prompt visual detail (Bahasa Inggris) untuk generate gambar statis frame awal...",
          "videoPrompt": ""
        }

        ${characterInstruction}
        ${DIRECTOR_VISUAL_RULES}`
        : `lipsyncSegments: TIDAK PERLU. Kembalikan array kosong [].`;

    let systemPrompt = "";
    
    // === SCENARIO 1: MANUAL SCRIPT INPUT ===
    if (formData.scriptSource === 'manual') {
        systemPrompt = `Anda adalah ScriptMate AI. TUGAS: Lengkapi naskah ini dengan Caption, Hashtag, dan Visualisasi.
        INPUT SKRIP: """${formData.manualScript}"""
        
        ${MARKETING_30_FRAMEWORK}
        ${ctaInstruction}

        INSTRUKSI OUTPUT: "scriptContent": Kembalikan teks asli. "caption": Buat caption. "hashtags": Buat hashtag.
        VISUAL: ${visualInstruction}
        AUDIO: ${flowInstruction}
        OUTPUT JSON: [{ "id": "uuid", "scriptContent": "...", "caption": "...", "hashtags": ["..."], "imagePrompts": [{ "source": "...", "prompt": "..." }], "lipsyncSegments": [{ "segmentNumber": 1, "duration": "...", "dialog": "...", "imagePrompt": "...", "videoPrompt": "" }] }]`;
    } 
    // === SCENARIO 2: AI SCRIPT GENERATION ===
    else {
        const minutes = parseInt(formData.durationMinutes || '0');
        const seconds = parseInt(formData.durationSeconds || '0');
        const totalSeconds = (minutes * 60) + seconds;

        // --- HOOK SELECTION LOGIC ---
        let hookInstruction = "";
        let formulaInstruction = "";
        
        let specificHooks: {index: number, text: string}[] = [];

        if (isSpesialis) {
            // For spesialis, we bypass the standard hooks and formulas
            hookInstruction = `(Hook dan formula mengikuti aturan MODE SPESIALIS di atas)`;
            formulaInstruction = `(Formula mengikuti aturan 4 langkah MODE SPESIALIS)`;
            if (formData.manualHook) {
                hookInstruction += `\nWAJIB Gunakan Hook Manual ini di awal: "${formData.manualHook}"`;
            }
        } else {
            if (formData.manualHook) {
                hookInstruction = `Gunakan Hook Spesifik berikut untuk semua variasi: "${formData.manualHook}". Set "hookNumber": 0.
                PENTING: Pastikan kalimat hook ini menyatu secara natural dengan kalimat berikutnya. Jangan mencampur bahasa Inggris yang tidak wajar. Maknanya harus mudah diterima.`;
            } else {
                const hooksWithIndex = HOOKS.map((h, i) => ({ index: i + 1, text: h }));
                const shuffledHooks = shuffleArray(hooksWithIndex);
                specificHooks = shuffledHooks.slice(0, formData.scriptCount);
                
                const modeSpecificHookInstructions = formData.mode === Mode.GENERAL
                  ? `PENTING UNTUK PEMBUATAN HOOK KONTEN UMUM:
                  - Template hook yang disediakan sebenarnya ditujukan untuk konten jualan. TUGAS ANDA adalah MODIFIKASI/ADAPTASI template hook tersebut secara kreatif agar NYAMBUNG SANGAT NATURAL dengan topik bahasan (Konten Umum).
                  - Ganti konteks "produk/solusi" menjadi "informasi/solusi" yang relevan dengan topik.
                  - PASTIKAN SELURUH HOOK DITULIS DALAM BAHASA INDONESIA MURNI yang mudah dipahami sehari-hari. Dilarang keras mencampur bahasa Inggris tanpa alasan logis agar maknanya mudah diterima.`
                  : `PENTING UNTUK PEMBUATAN HOOK JUALAN:
                  - Ganti variabel (X, Y, Z, dll) pada template hook dengan nama produk atau deskripsi yang SESUAI KONTEKS.
                  - Kreasikan dan perhalus template hook ini agar NYAMBUNG DAN NATURAL dengan kalimat promosinya.
                  - PASTIKAN SELURUH HOOK DITULIS DALAM BAHASA INDONESIA MURNI. Dilarang keras mencampur bahasa Inggris tanpa alasan logis agar maknanya mudah diterima.`;

                hookInstruction = `SAYA TELAH MEMILIH TEMPLATE HOOK DARI DAFTAR (TOTAL ${HOOKS.length}) UNTUK DIGUNAKAN.
                Untuk setiap skrip yang dibuat, WAJIB MENGGUNAKAN DAN MENGADAPTASI template hook yang saya tentukan di bawah ini:
                
                ${specificHooks.map((h, i) => `VARIASI SKRIP #${i + 1}:
                - Gunakan / Adaptasi Template Hook Nomor: ${h.index}
                - Teks Template Hook: "${h.text}"
                - Set field "hookNumber": ${h.index} di JSON output.`).join('\n\n')}
                
                ${modeSpecificHookInstructions}
                `;
            }

            // --- FORMULA SELECTION LOGIC ---
            if (formData.selectedFormulas && formData.selectedFormulas.length > 0) {
                 const allFormulas = [...STORYTELLING_FORMULAS, ...RELATE_FORMULAS];
                 const selectedLabels = formData.selectedFormulas.map(id => allFormulas.find(f => f.id === id)?.label || id);
                 formulaInstruction = `Gunakan salah satu formula berikut: ${selectedLabels.join(', ')}.`;
            } else {
                formulaInstruction = `Pilih formula storytelling secara ACAK. Anda BOLEH dan DISARANKAN menggunakan formula di luar daftar standar jika cocok (misal: PAS, AIDA, BAB, FAB, atau formula kreatif lainnya). Sebutkan nama formula yang digunakan di field "storytellingFormula".`;
            }
        }

        // --- CONTENT INPUT CONTEXT & COMPLIANCE ---
        let contentInputContext = "";
        let complianceInstruction = "";

        if (formData.mode === Mode.SALES) {
            contentInputContext = `
            INFORMASI PRODUK (WAJIB DIGUNAKAN):
            - Nama Produk: "${formData.productName}"
            - Deskripsi Produk: "${formData.productDescription}"
            
            PENTING: Gunakan informasi ini sebagai bahan utama skrip. Jangan mengarang fitur yang tidak ada di deskripsi.
            `;

            complianceInstruction = `
            🚨 ATURAN COMPLIANCE (ANTI-OVERCLAIM):
            Anda dilarang keras membuat klaim berlebihan (overclaim).
            Gunakan panduan berikut untuk mengubah kata-kata berisiko menjadi aman:
            
            ${MARKETPLACE_COMPLIANCE_LIST}

            PRINSIP: Jujur, Tidak Menjanjikan Hasil Instan/Permanen secara absolut, Fokus pada "Membantu/Mendukung".
            `;
        } else {
            contentInputContext = `TOPIK KONTEN: "${formData.topic}"`;
        }
        
        systemPrompt = `Anda adalah ScriptMate AI, copywriter & sutradara profesional yang menguasai Marketing 3.0.
        
        ${MARKETING_30_FRAMEWORK}
        
        TUGAS: Buat ${formData.scriptCount} variasi skrip konten pendek.
        Tipe: ${formData.mode}.
        Tone: ${formData.tone}. Audiens: ${formData.audience}. Durasi: ${totalSeconds}s.
        
        ${contentInputContext}
        
        ${complianceInstruction}

        ${hookInstruction}
        
        ATURAN FORMULA:
        ${formulaInstruction}
        
        ATURAN CTA (SANGAT PENTING):
        ${ctaInstruction}
        
        ATURAN LAIN:
        - ${formData.hardSelling ? 'Hard Selling (Tetap Human-Centric).' : 'Soft Selling.'}
        - ${formData.seoFriendly ? 'SEO Friendly.' : ''}
        - Hitung jumlah kata dari "scriptContent" yang dihasilkan dan masukkan angka pastinya ke field "wordCount".
        - Hitung estimasi durasi membaca skrip dengan asumsi kecepatan bicara konstan 150 kata per menit (misal: 150 kata = 60 detik / 1 menit). Format waktunya (misal: "30 detik" atau "1 menit 15 detik"). Masukkan ke field "estimatedDuration".
        
        VISUAL: ${visualInstruction}
        AUDIO: ${flowInstruction}
        
        OUTPUT FORMAT:
        Hasilkan output HANYA dalam format JSON Array di dalam code block markdown.
        Contoh:
        \`\`\`json
        [{ 
            "id": "uuid", 
            "scriptContent": "...", 
            "storytellingFormula": "...", 
            "hookNumber": 123, 
            "wordCount": 150,
            "estimatedDuration": "60 detik",
            "caption": "...", 
            "hashtags": ["..."], 
            "imagePrompts": [{ "source": "...", "prompt": "..." }], 
            "lipsyncSegments": [{ "segmentNumber": 1, "duration": "...", "dialog": "...", "imagePrompt": "...", "videoPrompt": "" }] 
        }]
        \`\`\``;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: systemPrompt
        });
        
        const text = response.text || "[]";
        let scripts: any[] = [];
        
        try {
            const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch && jsonMatch[1]) {
                 scripts = JSON.parse(jsonMatch[1]);
            } else {
                 const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
                 scripts = JSON.parse(cleanText);
            }
        } catch (e) { 
            console.error("JSON Parse Error", e, text); 
            try {
                 const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
                 const singleObj = JSON.parse(cleanText);
                 if (!Array.isArray(singleObj)) {
                     scripts = [singleObj];
                 }
            } catch (e2) {
                 throw new Error("Gagal memproses format respons dari AI.");
            }
        }
        
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        const groundingChunks = groundingMetadata?.groundingChunks?.map((chunk: any) => {
            if (chunk.web) {
                return { web: { uri: chunk.web.uri, title: chunk.web.title } };
            }
            return null;
        }).filter((c: any) => c !== null) || [];
        const isGroundingUsed = groundingChunks.length > 0;

        return scripts.map((s: any, index: number) => ({
            ...s, 
            id: s.id || `script_${Date.now()}_${index}`, 
            createdAt: Date.now(),
            aspectRatio: formData.aspectRatio, 
            referenceMode: formData.referenceMode, 
            isFromGoogleSearch: isGroundingUsed,
            groundingChunks: groundingChunks,
            hookNumber: s.hookNumber || 0
        }));
    } catch (error: any) { 
        console.error("Generate Scripts Error", error); 
        let message = error.message || "Gagal membuat skrip.";
        if (message.includes("429") || message.toLowerCase().includes("quota") || message.toLowerCase().includes("exhausted")) {
            message = "Gagal membuat skrip/prompt: Kuota API habis (Quota Exceeded). Silakan coba lagi nanti.";
        }
        throw new Error(message); 
    }
}

export async function generateLongFormContent(
    scriptContent: string,
    topic: string,
    tone: string,
    audience: string
): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = `
    Anda adalah Content Writer expert.
    
    TUGAS: Kembangkan skrip pendek berikut menjadi artikel lengkap / postingan Facebook yang panjang dan mendalam.
    
    INPUT SKRIP:
    "${scriptContent}"
    
    KONTEKS:
    - Topik: ${topic}
    - Tone: ${tone}
    - Target Audiens: ${audience}
    
    INSTRUKSI:
    1. Buat headline yang menarik perhatian (Clickbait positif).
    2. Gunakan gaya bahasa storytelling yang engaging.
    3. Elaborasi poin-poin dalam skrip menjadi paragraf yang lebih detail.
    4. Tambahkan insight baru atau tips praktis yang relevan.
    5. Gunakan formatting yang rapi (paragraf pendek, bullet points jika perlu).
    6. Akhiri dengan pertanyaan diskusi untuk memancing interaksi.
    
    OUTPUT: HANYA teks artikel/postingan. Jangan ada teks pembuka seperti "Tentu, ini artikelnya...".
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: prompt
        });
        return response.text?.trim() || "";
    } catch (error: any) {
        console.error("Error generating long form content:", error);
        throw new Error("Gagal membuat konten panjang.");
    }
}

export async function generateContentIdeas(formData: IdeaFormData): Promise<GeneratedIdeaBatch> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    
    const randomActions = shuffleArray(IDEA_ACTIONS).slice(0, 5).join(", ");
    const randomGoals = shuffleArray(IDEA_GOALS).slice(0, 5).join(", ");
    
    const prompt = `
    Anda adalah Creative Strategist.
    
    TUGAS: Buat ${formData.count} ide konten unik dan viral untuk topik: "${formData.topic}".
    
    GUNAKAN KOMBINASI DARI ELEMEN INI UNTUK VARIASI:
    - Actions: ${randomActions}, dll.
    - Goals: ${randomGoals}, dll.
    
    FORMAT OUTPUT JSON:
    Tulis JSON di dalam code block markdown \`\`\`json \`\`\` :
    {
      "ideas": [
        "Judul/Ide 1...",
        "Judul/Ide 2..."
      ]
    }
    
    Pastikan ide-ide tersebut actionable, menarik (click-worthy), dan relevan untuk media sosial (TikTok/Reels/Shorts).
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: prompt
        });
        
        const text = response.text || "{}";
        let jsonResult = { ideas: [] };
        try { 
            const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            if (jsonMatch && jsonMatch[1]) {
                 jsonResult = JSON.parse(jsonMatch[1]);
            } else {
                 const cleanText = text.replace(/```(?:json)?/g, '').replace(/```/g, '').trim(); 
                 jsonResult = JSON.parse(cleanText);
            }
        } catch (e) {
             const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim(); 
             jsonResult = JSON.parse(cleanText);
        }

        return {
            id: `idea_batch_${Date.now()}`,
            topic: formData.topic,
            ideas: jsonResult.ideas || [],
            timestamp: Date.now()
        };

    } catch (error: any) {
        console.error("Error generating ideas:", error);
        throw new Error("Gagal mencari ide konten.");
    }
}

export async function generateCharacterSession(formData: CharacterFormData): Promise<CharacterResult> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    
    const regionText = formData.region === 'others' ? formData.customRegion : MODEL_REGIONS.find(r => r.id === formData.region)?.label;
    const framingText = CHARACTER_FRAMINGS.find(f => f.id === formData.framing)?.prompt || "Medium shot";
    
    const prompt = `
    Anda adalah AI Prompt Engineer untuk Image Generation (Midjourney/Flux/Stable Diffusion).
    
    INPUT DATA KARAKTER:
    - Region/Etnis: ${regionText}
    - Gender: ${formData.gender}
    - Umur: ${formData.age}
    - Deskripsi User: "${formData.userDescription || '-'}"
    - Framing/Shot: ${framingText}
    - Style: ${formData.genre}
    
    TUGAS:
    1. Buat deskripsi karakter (Summary) dalam Bahasa Indonesia yang merangkum visual karakter ini.
    2. Buat PROMPT A (Portrait/Front View) dalam BAHASA INGGRIS. Detail, lighting cinematic, photorealistic (sesuai style). Fokus pada wajah dan framing yang diminta.
    3. Buat PROMPT B (Action/Side View) dalam BAHASA INGGRIS. Karakter yang sama, tapi angle berbeda atau sedang melakukan aktivitas natural.
    
    FORMAT OUTPUT JSON:
    {
      "summary": "Deskripsi singkat karakter...",
      "promptA": "Prompt bahasa inggris untuk shot utama...",
      "promptB": "Prompt bahasa inggris untuk shot kedua..."
    }
    
    Negative Prompts (masukkan dalam prompt jika perlu): ugly, deformed, noisy, blurry, distorted.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        
        const result = JSON.parse(response.text || "{}");
        
        return {
            id: `char_${Date.now()}`,
            summary: result.summary,
            promptA: result.promptA,
            promptB: result.promptB,
            isLoadingA: false,
            isLoadingB: false,
            timestamp: Date.now()
        };

    } catch (error: any) {
        console.error("Error generating character prompts:", error);
        throw new Error("Gagal membuat prompt karakter.");
    }
}

export async function generateCreativeImagePrompts(formData: PromptMakerFormData): Promise<PromptMakerResult> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    
    const prompt = `
    Anda adalah Prompt Engineer Expert.
    
    INPUT:
    - Ide Dasar: "${formData.idea}"
    - Genre/Style: ${formData.genre}
    - Angle Kamera: ${formData.angle}
    
    TUGAS:
    1. Buat "indoPrompt": Deskripsi scene yang artistik dan detail dalam Bahasa Indonesia.
    2. Buat "engPrompt": Prompt final dalam Bahasa Inggris yang sangat detail untuk AI Image Generator (seperti Midjourney). Masukkan detail lighting, texture, camera lens, color grading, dan composition.
    
    FORMAT OUTPUT JSON:
    {
      "indoPrompt": "...",
      "engPrompt": "..."
    }
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
         const result = JSON.parse(response.text || "{}");
         
         return {
             id: `prompt_${Date.now()}`,
             idea: formData.idea,
             indoPrompt: result.indoPrompt,
             engPrompt: result.engPrompt,
             timestamp: Date.now()
         };

    } catch (error: any) {
        console.error("Error creating prompts:", error);
         throw new Error("Gagal membuat prompt.");
    }
}

export async function generateAdvancedImages(
  formData: AdvancedImageFormData
): Promise<AdvancedImageResult[]> {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const results: AdvancedImageResult[] = [];
  const baseFilename = formData.filename || `gen_${Date.now()}`;

  const hasReference = formData.refModel || formData.refTop || formData.refBottom || formData.refProduct;

  for (let i = 0; i < formData.count; i++) {
    let base64 = "";
    
    try {
        if (!hasReference) {
             const response = await ai.models.generateContent({
                 model: 'gemini-2.5-flash-image',
                 contents: { parts: [{ text: formData.prompt }] },
                 config: {
                     imageConfig: { aspectRatio: formData.aspectRatio }
                 }
             });
             for (const part of response.candidates?.[0]?.content?.parts || []) {
                 if (part.inlineData && part.inlineData.data) {
                     base64 = part.inlineData.data;
                     break;
                 }
             }
        } else {
            const parts: Part[] = [];
            let contextPrompt = `TASK: Generate a high-quality, photorealistic image based on the description: "${formData.prompt}".\n\n`;
            
            if (formData.refModel) {
                parts.push({ inlineData: { data: formData.refModel.data, mimeType: formData.refModel.mimeType }});
                contextPrompt += `[Reference 1: Main Subject/Person - Preserve Identity]\n`;
            }
            if (formData.refTop) {
                parts.push({ inlineData: { data: formData.refTop.data, mimeType: formData.refTop.mimeType }});
                contextPrompt += `[Reference: Clothing Top - Use this style/garment]\n`;
            }
            if (formData.refBottom) {
                parts.push({ inlineData: { data: formData.refBottom.data, mimeType: formData.refBottom.mimeType }});
                contextPrompt += `[Reference: Clothing Bottom - Use this style/garment]\n`;
            }
            if (formData.refProduct) {
                parts.push({ inlineData: { data: formData.refProduct.data, mimeType: formData.refProduct.mimeType }});
                contextPrompt += `[Reference: Product - Feature this item]\n`;
            }

            contextPrompt += `\nINSTRUCTIONS:
            - Seamlessly integrate reference elements into the scene.
            - Aspect Ratio: ${formData.aspectRatio}.
            - Lighting: Cinematic, Professional.
            `;
            
            parts.push({ text: contextPrompt });

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: parts },
                config: {
                    imageConfig: { aspectRatio: formData.aspectRatio }
                }
            });

             for (const part of response.candidates?.[0]?.content?.parts || []) {
                  if (part.inlineData && part.inlineData.data) {
                      base64 = part.inlineData.data;
                      break;
                  }
             }
        }

        if (!base64) throw new Error("No image data returned.");

        let videoPrompt = "";
        try {
            videoPrompt = await generateVideoPrompt(
                { data: base64, mimeType: 'image/png' },
                formData.prompt,
                formData.focusItem
            );
        } catch (e) {
            console.warn("Video prompt gen failed", e);
        }

        results.push({
            id: `adv_${Date.now()}_${i}`,
            filename: `${baseFilename}_${i + 1}`,
            base64: base64,
            prompt: formData.prompt,
            videoPrompt: videoPrompt,
            isLoadingVideoPrompt: false,
            timestamp: Date.now(),
            aspectRatio: formData.aspectRatio
        });

    } catch (err: any) {
        console.error(`Failed to generate image ${i+1}`, err);
        let msg = err.message || "Gagal generate gambar.";
        if (msg.includes("429") || msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("exhausted")) {
            msg = "Gagal membuat gambar: Kuota API habis (Quota Exceeded).";
        } else if (msg.includes("400") || msg.toLowerCase().includes("safety")) {
            msg = "Gagal membuat gambar: Diblokir oleh filter keamanan (Safety Filter).";
        }
        if (formData.count === 1) throw new Error(msg);
    }
  }
  
  return results;
}

export async function generateFlowVideoPrompt(
  image: { data: string; mimeType: string },
  segmentDuration: number,
  audioMode: 'VO' | 'Lipsync',
  dialog: string,
  imagePrompt: string,
  genderRule?: string,
  regionRule?: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const numScenes = Math.max(1, Math.round(segmentDuration / 2));

  let voiceDescription = "warm, empathetic Indonesian, age 20-30";
  if (genderRule) {
    voiceDescription =
      genderRule.toLowerCase().includes('pria') || genderRule.toLowerCase() === 'male'
        ? "warm, clear male Indonesian, age 20-30"
        : "warm, empathetic female Indonesian, age 20-30";
  }

  // ------------------------------------------------------------------
  // DEMOGRAPHIC INSTRUCTION (internal — tidak masuk ke output)
  // ------------------------------------------------------------------
  let demographicInstruction = "";
  if (genderRule || regionRule) {
    demographicInstruction = `
- Region/Race: ${regionRule || 'follow reference image'}
- Gender: ${genderRule === 'pria & wanita'
    ? 'Mix male and female characters appropriately'
    : `Strictly ${(genderRule || '').toUpperCase()}`}
- If reference image shows hijab/headscarf: ALL scenes must include hijab and modest long-sleeved clothing.
`;
  } else {
    demographicInstruction = `
- Match EXACT face, gender, hijab style, and outfit of the person in the reference image.
- If reference shows hijab: ALL scenes must include hijab and modest long-sleeved clothing.
`;
  }

  // ------------------------------------------------------------------
  // EXAMPLE FORMAT — output bersih tanpa negative prompt / warning block
  // ------------------------------------------------------------------
  const exampleFormatting =
    audioMode === 'VO'
      ? `A cinematic ${segmentDuration}-second video with ${numScenes} scenes. Ultra-realistic, 4K.
[MASTER VISUAL — extracted from reference image]
Character: [exact face, hijab color/style, outfit color/fabric from reference image]
Product: [exact visual: color, texture, trim detail, hanger type from reference image]
Environment: [lighting style, background color/setting from reference image]
Full voice-over: "[exact VO text]"
Voice: ${voiceDescription}.
SCENE 1 (0-2.0s) — BASE FRAME:
Starts from the EXACT reference image frame. Zero visual deviation from reference at second 0.
The character stands/sits exactly as in the reference image, holding the product in the exact same position.
Camera begins static, then slowly tracks right. Identical lighting and environment as reference image.
VOICE-OVER: "[slice of VO]"
SCENE 2 (2.0-4.0s) — PRODUCT CLOSE-UP:
Same environment and lighting as Scene 1. Camera moves closer to the product on the hanger, 
still in the same physical space — no background change. The character's hand holding the hanger
may remain at frame edge. Same lighting, same color palette as reference image.
VOICE-OVER: "[slice of VO]"
... continue up to Scene ${numScenes} ...
Maintain exact visual continuity across all scenes: same character appearance, same product, same lighting, same color palette as reference image. Fast cuts. Smooth transitions. Professional fashion editorial style. 4K.`

      : `A cinematic ${segmentDuration}-second video with ${numScenes} scenes. Ultra-realistic, 4K.
[MASTER VISUAL — extracted from reference image]
Character: [exact face, hijab color/style, outfit color/fabric from reference image]
Product: [exact visual: color, texture, trim detail, hanger type from reference image]
Environment: [lighting style, background color/setting from reference image]
Full dialogue (lipsync scenes only): "[exact dialogue]"
Voice: ${voiceDescription}.
SCENE 1 (0-2.0s) — BASE FRAME, WITH LIPSYNC:
Starts from the EXACT reference image frame. Zero visual deviation from reference at second 0.
The character stands/sits exactly as in the reference image, holding the product in the exact same position.
Camera begins static then slowly pushes in toward face. Character begins speaking/lip-syncing.
Identical lighting and environment as reference image.
DIALOGUE: "[slice of dialogue]"
SCENE 2 (2.0-4.0s) — PRODUCT CLOSE-UP:
Same environment and lighting as Scene 1. Camera moves closer to the product on the hanger,
still in the same physical space. Character's hand holding the hanger may remain at frame edge.
Same lighting, same color palette as reference image. No face visible. No lipsync.
DIALOGUE: "[slice of dialogue]"
SCENE 3 (4.0-6.0s) — TALKING HEAD, WITH LIPSYNC:
Return to medium shot of the same character with the same product on hanger. 
Same environment as Scene 1. Camera pans slightly left. Character continues speaking/lip-syncing.
Exact same face, hijab, outfit, and product as reference image.
DIALOGUE: "[slice of dialogue]"
... continue up to Scene ${numScenes} ...
Maintain exact visual continuity across all scenes: same character appearance, same product, same lighting, same environment as reference image. Fast cuts. Smooth transitions. Professional fashion editorial style. 4K.`;

  // ------------------------------------------------------------------
  // SYSTEM INSTRUCTION — satu blok lengkap
  // ------------------------------------------------------------------
  const systemInstruction = `
You are an expert cinematic video prompt writer for AI video generators (Veo3, Flow, Kling).
Your task: create a structured multi-scene video prompt based on the provided reference image and script dialog.

==============================================================
STEP 1 — ANALYZE REFERENCE IMAGE FIRST (before writing anything)
==============================================================
Carefully extract and memorize these elements from the reference image:
A. CHARACTER:
   - Exact face features and skin tone
   - Hijab: present or not? If yes: exact color, style, fabric
   - Outfit: exact color(s), fabric type, sleeve length, neckline style
   - Expression and posture

B. PRODUCT:
   - Exact color(s) and pattern
   - Fabric texture and finish
   - Decorative details (ruffles, trim, lace, embroidery)
   - How it is held/displayed (hanger type, clip style, orientation)
   - Position relative to character's body

C. ENVIRONMENT:
   - Background: color, texture, depth, any objects
   - Lighting: direction, warmth, softness, shadows
   - Overall color palette and mood

These extracted elements = the MASTER VISUAL.
Every scene you write MUST faithfully reproduce this MASTER VISUAL.

==============================================================
STEP 2 — VISUAL CONSISTENCY RULES (apply to every scene)
==============================================================
IDENTITY LOCK:
- Character's face, hijab, and outfit must be IDENTICAL across all scenes.
- Do NOT change: hijab color, outfit color, product appearance, lighting style.
- Only these elements may change between scenes: camera angle, character action, which part of scene is in frame.

REFERENCE IMAGE = FRAME ZERO:
- Scene 1 must BEGIN from the exact frame of the reference image.
- Second 0.0 of the video must be visually identical to the reference image.
- Camera movement and character action only begin AFTER the first 0.5 seconds.

ENVIRONMENT CONSISTENCY:
- ALL scenes (including product close-ups) occur in the SAME physical space as the reference image.
- Do NOT describe a different background, different lighting, or different color palette for any scene.
- Product close-up scenes: camera moves CLOSER within the same space — not to a different studio setup.

PRODUCT CONSISTENCY:
- Describe the product using ONLY visual properties observed in the reference image.
- Do NOT name the garment category if it could trigger safety filters.
  ✅ CORRECT: "a soft pink garment with delicate eyelet ruffle trim, on a light wooden hanger"
  ❌ WRONG: "shorts", "underwear", "lingerie", "layering shorts", "undershorts"
- Product stays on hanger in ALL scenes. Never against or touching body.
- Product close-up: camera approaches the hanger in the same space. Character may be partially in frame or off-frame.

==============================================================
STEP 3 — OUTPUT FORMAT RULES
==============================================================
- Output is sent DIRECTLY to a video AI generator. Keep it clean and cinematic.
- DO NOT include in output:
  ❌ NEGATIVE PROMPT lines (they trigger safety filters)
  ❌ Warning blocks or safety disclaimers
  ❌ Internal instruction labels (FOCUS:, ACTION:, MANDATORY RULES:)
  ❌ Words: "sexualized", "intimate", "provocative", "sensual", "underwear",
     "lingerie", "waistband", "body emphasis", "chest focus"
- DO include in every scene:
  ✅ Exact camera movement
  ✅ Character action (brief, natural, non-sensual)
  ✅ Reference to MASTER VISUAL elements for consistency
  ✅ Slice of exact dialog/VO text

DIALOG/VO RULES:
- Use ONLY the exact text provided in Input #6.
- Do NOT invent, add, or modify any dialog or voice-over.
- Slice the text logically across scenes based on natural speech pacing.

==============================================================
INTERNAL DEMOGRAPHIC NOTES (do not output these):
==============================================================
${demographicInstruction}

==============================================================
INPUTS:
==============================================================
1. Reference Image: [provided above]
2. Image Description: "${imagePrompt}"
3. Duration: ${segmentDuration} seconds
4. Number of Scenes: ${numScenes}
5. Audio Mode: ${audioMode}
6. EXACT TEXT (do not modify): "${dialog}"

==============================================================
OUTPUT — follow this structure:
==============================================================
${exampleFormatting}
`;

  try {
    const contents = {
      parts: [
        { inlineData: { data: image.data, mimeType: image.mimeType } },
        { text: systemInstruction },
      ],
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: contents,
    });

        // MENGHILANGKAN SEMUA BARIS KOSONG (ENTER GANDA)
    let finalPrompt = response.text?.trim() || "";
    finalPrompt = finalPrompt.replace(/\n\s*\n/g, '\n'); // <--- Ini kode pentingnya
    
    return finalPrompt;
  } catch (error: any) {
    console.error("Error generating flow video prompt:", error);
    let msg = error.message || "Unknown error";
    if (
      msg.includes("429") ||
      msg.toLowerCase().includes("quota") ||
      msg.toLowerCase().includes("exhausted")
    ) {
      msg = "Kuota API habis (Quota Exceeded).";
    }
    throw new Error("Gagal membuat prompt video Flow: " + msg);
  }
}