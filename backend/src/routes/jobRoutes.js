
const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all jobs
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM jobs ORDER BY created_at DESC"
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Post a new job
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, company, location, salary, description } = req.body;

    const result = await pool.query(
      `INSERT INTO jobs
      (title, company, location, salary, description, created_by)
      VALUES($1,$2,$3,$4,$5,$6)
      RETURNING *`,
      [
        title,
        company,
        location,
        salary,
        description,
        req.user.id,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Get jobs posted by logged-in recruiter
router.get("/my/jobs", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM jobs WHERE created_by=$1 ORDER BY created_at DESC",
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Apply for a job
router.post("/:id/apply", authMiddleware, async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;

    const result = await pool.query(
      "INSERT INTO applications(job_id, user_id) VALUES($1, $2) RETURNING *",
      [jobId, userId]
    );

    res.json({
      message: "Applied successfully",
      application: result.rows[0],
    });
  } 
  

  catch (err) {
  console.log("ERROR CODE:", err.code);
  console.log(err);

  if (err.code === "23505") {
    return res.status(400).json({
      message: "You have already applied for this job.",
    });
  }

  res.status(500).json({
    message: err.message,
  });
}

});


// Delete a job
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const jobId = req.params.id;

    const result = await pool.query(
      "DELETE FROM jobs WHERE id=$1 AND created_by=$2 RETURNING *",
      [jobId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Job not found or you are not allowed to delete this job",
      });
    }

    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Get applicants for a job
router.get("/:id/applicants", authMiddleware, async (req, res) => {
  try {
    const jobId = req.params.id;

   const result = await pool.query(
  `SELECT
      applications.id AS application_id,
      applications.status,
      applications.applied_at,
      users.id AS user_id,
      users.name,
      users.email,
      users.resume
   FROM applications
   JOIN users ON applications.user_id = users.id
   WHERE applications.job_id = $1`,
  [jobId]
);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// Update application status
router.put("/applications/:id/status", authMiddleware, async (req, res) => {
  try {
    const applicationId = req.params.id;
    const { status } = req.body;

    const result = await pool.query(
      "UPDATE applications SET status=$1 WHERE id=$2 RETURNING *",
      [status, applicationId]
    );

    res.json({
      message: "Status updated successfully",
      application: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my applications
router.get("/my/applications", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        applications.id AS application_id,
        applications.status,
        applications.applied_at,
        jobs.id AS job_id,
        jobs.title,
        jobs.company,
        jobs.location,
        jobs.salary
       FROM applications
       JOIN jobs ON applications.job_id = jobs.id
       WHERE applications.user_id = $1
       ORDER BY applications.applied_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Update a job
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const jobId = req.params.id;
    const { title, company, location, salary, description } = req.body;

    const result = await pool.query(
      `UPDATE jobs
       SET title=$1, company=$2, location=$3, salary=$4, description=$5
       WHERE id=$6 AND created_by=$7
       RETURNING *`,
      [title, company, location, salary, description, jobId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Job not found or you are not allowed to edit this job",
      });
    }

    res.json({
      message: "Job updated successfully",
      job: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Save a job
router.post("/:id/save", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "INSERT INTO saved_jobs(job_id, user_id) VALUES($1, $2) RETURNING *",
      [req.params.id, req.user.id]
    );

    res.json({ message: "Job saved successfully", savedJob: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ message: "Job already saved" });
    }

    res.status(500).json({ message: err.message });
  }
});

// Get my saved jobs
router.get("/my/saved", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT jobs.*
       FROM saved_jobs
       JOIN jobs ON saved_jobs.job_id = jobs.id
       WHERE saved_jobs.user_id = $1
       ORDER BY saved_jobs.saved_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;