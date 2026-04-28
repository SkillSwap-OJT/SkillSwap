import { Exam } from '../models/Exam.js';
import { ExamResult } from '../models/ExamResult.js';
import { Skill } from '../models/Skill.js';
import { User } from '../models/User.js';
import { buildExamDefinition } from '../services/exam-template.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { badRequest, notFound } from '../utils/ApiError.js';

export const getExamForSkill = asyncHandler(async (req, res) => {
  const { skillId } = req.params;
  const skill = await Skill.findById(skillId);
  if (!skill) throw notFound('Skill not found');
  let exam = await Exam.findOne({ skill: skillId });
  exam = await ensureNormalizedExam(exam, skill);
  if (!exam) throw notFound('No exam available for this skill yet');
  res.json({ exam: exam.toCandidateJSON() });
});

export const submitExam = asyncHandler(async (req, res) => {
  const { skillId } = req.params;
  const { answers, proctoring } = req.body || {};

  if (!Array.isArray(answers)) throw badRequest('answers must be an array of integers');

  let exam = await Exam.findOne({ skill: skillId });
  if (!exam) {
    const skill = await Skill.findById(skillId);
    if (!skill) throw notFound('Skill not found');
    exam = await ensureNormalizedExam(null, skill);
  }
  const skill = await Skill.findById(skillId);
  if (!skill) throw notFound('Skill not found');
  exam = await ensureNormalizedExam(exam, skill);
  if (!exam) throw notFound('No exam for this skill');
  if (answers.length !== exam.questions.length) {
    throw badRequest(`Expected ${exam.questions.length} answers, got ${answers.length}`);
  }

  let correct = 0;
  exam.questions.forEach((q, i) => {
    if (Number(answers[i]) === q.correctIndex) correct += 1;
  });
  const score = Math.round((correct / exam.questions.length) * 100);
  const passed = score >= exam.passingScore;

  const result = await ExamResult.create({
    user: req.user.id,
    exam: exam._id,
    skill: exam.skill,
    score,
    passed,
    answers: answers.map(Number),
  });

  if (passed) {
    const user = await User.findById(req.user.id);
    if (user) {
      const entry = user.skillsOffered.find((s) => s.skill.toString() === skillId);
      if (entry) {
        entry.verified = true;
        entry.verifiedAt = new Date();
      } else {
        user.skillsOffered.push({
          skill: skillId,
          level: 'intermediate',
          verified: true,
          verifiedAt: new Date(),
        });
      }
      await user.save();
    }
  }

  res.json({
    score,
    passed,
    passingScore: exam.passingScore,
    correct,
    total: exam.questions.length,
    resultId: result._id,
    proctoringWarnings: buildProctoringWarnings(proctoring),
  });
});

export const myExamHistory = asyncHandler(async (req, res) => {
  const results = await ExamResult.find({ user: req.user.id })
    .populate('skill')
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ results });
});

async function ensureNormalizedExam(exam, skill) {
  if (!exam) {
    return Exam.create({
      skill: skill._id,
      ...buildExamDefinition(skill),
    });
  }

  if (isNormalizedExam(exam)) {
    return exam;
  }

  const definition = buildExamDefinition(skill);
  exam.title = definition.title;
  exam.description = definition.description;
  exam.passingScore = definition.passingScore;
  exam.durationMinutes = definition.durationMinutes;
  exam.questions = definition.questions;
  await exam.save();
  return exam;
}

function isNormalizedExam(exam) {
  return Array.isArray(exam?.questions) && exam.questions.every((question) => question?.text && Array.isArray(question?.options));
}

function buildProctoringWarnings(proctoring) {
  const warnings = [];
  if (!proctoring?.cameraActive) {
    warnings.push('Camera proctoring was unavailable for this attempt.');
  }
  if (Array.isArray(proctoring?.warnings)) {
    warnings.push(...proctoring.warnings);
  }
  return warnings;
}
