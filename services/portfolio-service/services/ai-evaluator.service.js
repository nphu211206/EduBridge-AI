// File: services/portfolio-service/services/ai-evaluator.service.js
// EduBridge AI — Multi-Discipline AI Evaluator
// Evaluates portfolio items, external profiles across ALL fields

const OpenAI = require('openai');

let openai;
let isReady = false;

const initAI = () => {
    if (isReady) return true;
    const key = process.env.OPENAI_API_KEY;
    if (!key) { console.warn('⚠️ OPENAI_API_KEY missing. AI evaluation disabled.'); return false; }
    openai = new OpenAI({ apiKey: key });
    isReady = true;
    console.log('✅ AI Evaluator initialized (OpenAI)');
    return true;
};

const MODEL = 'gpt-3.5-turbo-1106';

// ====================================================================
// CORE: Generate structured AI response
// ====================================================================
const generateJSON = async (prompt, funcName) => {
    if (!isReady) initAI();
    if (!isReady || !openai) throw new Error('AI service not ready.');

    const completion = await openai.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.6,
        max_tokens: 2048,
    });

    const text = completion.choices[0].message.content;
    if (!text) throw new Error('AI returned empty response.');
    return JSON.parse(text);
};

// ====================================================================
// PROMPTS PER FIELD CATEGORY
// ====================================================================
const FIELD_PROMPTS = {
    code_project: (title, desc, url) => `
Bạn là Expert Code Reviewer. Đánh giá dự án code "${title}".
Mô tả: "${desc || 'Không có mô tả'}"
URL: ${url || 'Không có'}

Trả về JSON:
{
  "score": (number 0-100),
  "evaluation": "(string) Nhận xét 2-3 câu về code quality, architecture, tech stack.",
  "detected_skills": ["skill1", "skill2", ...],
  "strengths": ["điểm mạnh 1", "điểm mạnh 2"],
  "improvements": ["cần cải thiện 1"]
}`,

    design_work: (title, desc) => `
Bạn là Senior Art Director. Đánh giá tác phẩm thiết kế "${title}".
Mô tả: "${desc || 'Không có mô tả'}"

Đánh giá theo: composition, color theory, typography, creativity, technical execution.
Trả về JSON:
{
  "score": (number 0-100),
  "evaluation": "(string) Nhận xét 2-3 câu về chất lượng thiết kế.",
  "detected_skills": ["Figma", "Typography", ...],
  "strengths": ["điểm mạnh 1"],
  "improvements": ["cần cải thiện 1"]
}`,

    business_report: (title, desc) => `
Bạn là Senior Business Analyst. Đánh giá báo cáo kinh doanh "${title}".
Mô tả: "${desc || 'Không có mô tả'}"

Đánh giá theo: logical reasoning, data accuracy, market analysis, conclusions, presentation.
Trả về JSON:
{
  "score": (number 0-100),
  "evaluation": "(string) Nhận xét về chất lượng phân tích.",
  "detected_skills": ["Phân tích tài chính", "Excel nâng cao", ...],
  "strengths": ["điểm mạnh 1"],
  "improvements": ["cần cải thiện 1"]
}`,

    research_paper: (title, desc) => `
Bạn là Academic Reviewer. Đánh giá bài nghiên cứu "${title}".
Mô tả: "${desc || 'Không có mô tả'}"

Đánh giá theo: methodology, originality, literature review, data analysis, writing quality.
Trả về JSON:
{
  "score": (number 0-100),
  "evaluation": "(string) Nhận xét về chất lượng nghiên cứu.",
  "detected_skills": ["Nghiên cứu khoa học", "Thống kê", ...],
  "strengths": ["điểm mạnh 1"],
  "improvements": ["cần cải thiện 1"]
}`,

    writing_sample: (title, desc) => `
Bạn là Senior Editor. Đánh giá bài viết "${title}".
Mô tả: "${desc || 'Không có mô tả'}"

Đánh giá theo: clarity, argument structure, grammar, style, persuasiveness.
Trả về JSON:
{
  "score": (number 0-100),
  "evaluation": "(string) Nhận xét về kỹ năng viết.",
  "detected_skills": ["Giao tiếp", "Tư duy phản biện", ...],
  "strengths": ["điểm mạnh 1"],
  "improvements": ["cần cải thiện 1"]
}`,

    video_project: (title, desc) => `
Bạn là Senior Video Producer. Đánh giá dự án video "${title}".
Mô tả: "${desc || 'Không có mô tả'}"

Đánh giá theo: storytelling, technical quality, editing, audio, visual composition.
Trả về JSON:
{
  "score": (number 0-100),
  "evaluation": "(string) Nhận xét về video.",
  "detected_skills": ["Video Editing", "Motion Graphics", ...],
  "strengths": ["điểm mạnh 1"],
  "improvements": ["cần cải thiện 1"]
}`,

    presentation: (title, desc) => `
Bạn là Communication Expert. Đánh giá bài thuyết trình "${title}".
Mô tả: "${desc || 'Không có mô tả'}"

Đánh giá theo: structure, visual design, clarity, data presentation, storytelling.
Trả về JSON:
{
  "score": (number 0-100),
  "evaluation": "(string) Nhận xét về bài thuyết trình.",
  "detected_skills": ["Thuyết trình", "Sáng tạo", ...],
  "strengths": ["điểm mạnh 1"],
  "improvements": ["cần cải thiện 1"]
}`,
};

// Fallback for unknown types
const GENERIC_PROMPT = (title, desc, itemType) => `
Bạn là chuyên gia đánh giá đa ngành. Đánh giá tác phẩm "${title}" (loại: ${itemType}).
Mô tả: "${desc || 'Không có mô tả'}"

Trả về JSON:
{
  "score": (number 0-100),
  "evaluation": "(string) Nhận xét tổng quát 2-3 câu.",
  "detected_skills": ["skill1", "skill2"],
  "strengths": ["điểm mạnh 1"],
  "improvements": ["cần cải thiện 1"]
}`;

// ====================================================================
// PUBLIC API
// ====================================================================

/**
 * Evaluate a single portfolio item using AI
 */
const evaluatePortfolioItem = async (item) => {
    const { title, description, itemType, externalUrl } = item;
    const promptFn = FIELD_PROMPTS[itemType];
    const prompt = promptFn
        ? promptFn(title, description, externalUrl)
        : GENERIC_PROMPT(title, description, itemType);

    try {
        const result = await generateJSON(prompt, `evaluateItem:${itemType}`);
        result.score = Math.max(0, Math.min(100, Math.round(result.score || 50)));
        return result;
    } catch (error) {
        console.error(`AI evaluation failed for "${title}":`, error.message);
        return {
            score: null,
            evaluation: `AI đánh giá thất bại: ${error.message}`,
            detected_skills: [],
            strengths: [],
            improvements: [],
        };
    }
};

/**
 * Evaluate an external profile (GitHub, Behance, etc.)
 */
const evaluateExternalProfile = async (platform, profileData) => {
    const prompt = `
Bạn là chuyên gia đánh giá hồ sơ ${platform}. Phân tích dữ liệu profile sau:

${JSON.stringify(profileData, null, 2)}

Trả về JSON:
{
  "score": (number 0-100),
  "evaluation": "(string) Nhận xét tổng quan về profile.",
  "detected_skills": ["skill1", "skill2"],
  "highlights": ["điểm nổi bật 1", "điểm nổi bật 2"],
  "level": "(string) Beginner/Intermediate/Advanced/Expert"
}`;

    try {
        const result = await generateJSON(prompt, `evaluateProfile:${platform}`);
        result.score = Math.max(0, Math.min(100, Math.round(result.score || 50)));
        return result;
    } catch (error) {
        console.error(`AI profile eval failed for ${platform}:`, error.message);
        return { score: null, evaluation: `Đánh giá thất bại: ${error.message}` };
    }
};

/**
 * Generate overall portfolio summary
 */
const generatePortfolioSummary = async (userField, items, skills) => {
    const itemsSummary = items.map(i => `- ${i.Title} (${i.ItemType}): ${i.AiScore || 'N/A'}/100`).join('\n');
    const skillsSummary = skills.map(s => `- ${s.Name}: ${s.Score}/100`).join('\n');

    const prompt = `
Bạn là Career Advisor. Viết nhận xét tổng quan cho portfolio lĩnh vực "${userField}".

Tác phẩm:
${itemsSummary || '(Chưa có)'}

Kỹ năng:
${skillsSummary || '(Chưa có)'}

Trả về JSON:
{
  "overallScore": (number 0-100),
  "summary": "(string) Nhận xét tổng quan 3-5 câu về năng lực.",
  "topStrengths": ["điểm mạnh 1", "điểm mạnh 2"],
  "developmentAreas": ["cần phát triển 1"],
  "careerSuggestions": ["gợi ý nghề nghiệp 1", "gợi ý 2"]
}`;

    try {
        const result = await generateJSON(prompt, 'portfolioSummary');
        result.overallScore = Math.max(0, Math.min(100, Math.round(result.overallScore || 50)));
        return result;
    } catch (error) {
        console.error('AI portfolio summary failed:', error.message);
        return { overallScore: null, summary: `Tóm tắt thất bại: ${error.message}` };
    }
};

module.exports = {
    initAI,
    evaluatePortfolioItem,
    evaluateExternalProfile,
    generatePortfolioSummary,
};
