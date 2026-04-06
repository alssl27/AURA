import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is not defined in the environment.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

document.addEventListener('DOMContentLoaded', () => {
  const findStyleBtn = document.getElementById('find-style-btn');
  const hairTypeSelect = document.getElementById('hair-type') as HTMLSelectElement;
  const desiredLookInput = document.getElementById('desired-look') as HTMLInputElement;
  
  const emptyState = document.getElementById('empty-state');
  const loadingState = document.getElementById('loading-state');
  const resultContent = document.getElementById('result-content');

  if (findStyleBtn && hairTypeSelect && desiredLookInput) {
    findStyleBtn.addEventListener('click', async () => {
      const hairType = hairTypeSelect.value;
      const desiredLook = desiredLookInput.value;

      if (!hairType || !desiredLook) {
        alert('Please select a hair type and enter a desired look.');
        return;
      }

      // Show loading
      if (emptyState) emptyState.classList.add('hidden');
      if (resultContent) resultContent.classList.add('hidden');
      if (loadingState) loadingState.classList.remove('hidden');
      findStyleBtn.setAttribute('disabled', 'true');

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `As a professional hair stylist, suggest a hair style for someone with ${hairType} hair who wants a ${desiredLook} look. Provide the style name, a brief description, and why it works for them.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                styleName: { type: Type.STRING },
                description: { type: Type.STRING },
                whyItWorks: { type: Type.STRING },
                maintenanceLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] }
              },
              required: ["styleName", "description", "whyItWorks", "maintenanceLevel"]
            }
          }
        });

        const data = JSON.parse(response.text || "{}");
        
        if (resultContent) {
          resultContent.innerHTML = `
            <div class="flex justify-between items-start">
              <h3 class="font-serif text-3xl text-white">${data.styleName}</h3>
              <span class="text-[10px] border border-white/20 px-2 py-1 uppercase tracking-widest text-gray-400">
                ${data.maintenanceLevel} Maintenance
              </span>
            </div>
            <p class="text-gray-300 leading-relaxed italic">"${data.description}"</p>
            <div class="pt-4 border-t border-white/10">
              <p class="text-xs uppercase tracking-widest text-gray-500 mb-2">Why it works for you</p>
              <p class="text-sm text-gray-400 leading-relaxed">${data.whyItWorks}</p>
            </div>
            <button id="reset-btn" class="text-xs uppercase tracking-widest text-gray-500 flex items-center gap-2 hover:text-white transition-colors mt-4">
              Start Over
            </button>
          `;
          
          document.getElementById('reset-btn')?.addEventListener('click', () => {
            resultContent.classList.add('hidden');
            if (emptyState) emptyState.classList.remove('hidden');
            hairTypeSelect.value = "";
            desiredLookInput.value = "";
          });
        }

        if (loadingState) loadingState.classList.add('hidden');
        if (resultContent) resultContent.classList.remove('hidden');

      } catch (error) {
        console.error("Error getting recommendation:", error);
        alert('Something went wrong. Please try again.');
        if (loadingState) loadingState.classList.add('hidden');
        if (emptyState) emptyState.classList.remove('hidden');
      } finally {
        findStyleBtn.removeAttribute('disabled');
      }
    });
  }
});
