const express = require("express");
const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  analyzeResumesForJob,
  getRankings,
  getRecruiterAnalysisById,
} = require("../controllers/recruiterController");
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.use(protect, authorize("recruiter"));

router.post("/jobs", createJob);
router.get("/jobs", getJobs);
router.get("/jobs/:id", getJobById);
router.put("/jobs/:id", updateJob);
router.delete("/jobs/:id", deleteJob);

router.post(
  "/jobs/:jobId/analyze-resumes",
  upload.uploadBulk.array("resumes", upload.MAX_BULK_FILES),
  analyzeResumesForJob
);
router.get("/jobs/:jobId/rankings", getRankings);

router.get("/analyses/:id", getRecruiterAnalysisById);

module.exports = router;
