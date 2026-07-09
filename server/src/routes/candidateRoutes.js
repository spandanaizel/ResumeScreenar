const express = require("express");
const {
  analyzeResume,
  getAnalyses,
  getAnalysisById,
  deleteAnalysis,
  getSkillGaps,
} = require("../controllers/candidateController");
const {
  createRoadmap,
  getRoadmaps,
  getRoadmapById,
  deleteRoadmap,
} = require("../controllers/roadmapController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.use(protect);

router.post("/analyze", upload.single("resume"), analyzeResume);
router.get("/analyses", getAnalyses);
router.get("/analyses/:id", getAnalysisById);
router.delete("/analyses/:id", deleteAnalysis);

router.get("/skill-gaps", getSkillGaps);

router.post("/roadmap/:analysisId", createRoadmap);
router.get("/roadmaps", getRoadmaps);
router.get("/roadmaps/:id", getRoadmapById);
router.delete("/roadmaps/:id", deleteRoadmap);

module.exports = router;
