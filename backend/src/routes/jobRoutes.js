const express = require("express");
const multer = require("multer");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Multer setup for company logo upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Get all jobs with search, filters and sorting
router.get("/", async (req, res) => {
  try {
    const {
      search,
      category,
      job_type,
      work_mode,
      experience_level,
      location,
      sort,
    } = req.query;

    let query = "SELECT * FROM jobs WHERE 1=1";

    const values = [];
    let parameterNumber = 1;

    // Search using title, company, location or description
    if (search) {
      query += `
        AND (
          title ILIKE $${parameterNumber}
          OR company ILIKE $${parameterNumber}
          OR location ILIKE $${parameterNumber}
          OR description ILIKE $${parameterNumber}
        )
      `;

      values.push(`%${search}%`);
      parameterNumber++;
    }

    if (category) {
      query += ` AND category = $${parameterNumber}`;
      values.push(category);
      parameterNumber++;
    }

    if (job_type) {
      query += ` AND job_type = $${parameterNumber}`;
      values.push(job_type);
      parameterNumber++;
    }

    if (work_mode) {
      query += ` AND work_mode = $${parameterNumber}`;
      values.push(work_mode);
      parameterNumber++;
    }

    if (experience_level) {
      query += ` AND experience_level = $${parameterNumber}`;
      values.push(experience_level);
      parameterNumber++;
    }

    if (location) {
      query += ` AND location ILIKE $${parameterNumber}`;
      values.push(`%${location}%`);
      parameterNumber++;
    }

    // Sorting
    if (sort === "oldest") {
      query += " ORDER BY created_at ASC";
    } else if (sort === "salary_high") {
      query += `
        ORDER BY
        NULLIF(
          regexp_replace(salary, '[^0-9.]', '', 'g'),
          ''
        )::numeric DESC NULLS LAST
      `;
    } else if (sort === "salary_low") {
      query += `
        ORDER BY
        NULLIF(
          regexp_replace(salary, '[^0-9.]', '', 'g'),
          ''
        )::numeric ASC NULLS LAST
      `;
    } else {
      query += " ORDER BY created_at DESC";
    }

    const result = await pool.query(query, values);

    res.json(result.rows);
  } catch (err) {
    console.log("GET JOBS ERROR:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});

// Post a new job with company logo and filter fields
router.post(
  "/",
  authMiddleware,
  upload.single("company_logo"),
  async (req, res) => {
    try {
      const {
        title,
        company,
        location,
        salary,
        description,
        category,
        job_type,
        work_mode,
        experience_level,
      } = req.body;

      if (!title || !company || !location || !description) {
        return res.status(400).json({
          message:
            "Title, company, location and description are required.",
        });
      }

      const companyLogo = req.file
        ? `/uploads/${req.file.filename}`
        : null;

      const result = await pool.query(
        `INSERT INTO jobs
        (
          title,
          company,
          location,
          salary,
          description,
          created_by,
          company_logo,
          category,
          job_type,
          work_mode,
          experience_level
        )
        VALUES(
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11
        )
        RETURNING *`,
        [
          title,
          company,
          location,
          salary,
          description,
          req.user.id,
          companyLogo,
          category || null,
          job_type || null,
          work_mode || null,
          experience_level || null,
        ]
      );

      res.status(201).json({
        message: "Job posted successfully",
        job: result.rows[0],
      });
    } catch (err) {
      console.log("POST JOB ERROR:", err);

      res.status(500).json({
        message: err.message,
      });
    }
  }
);

// Get jobs posted by logged-in recruiter
router.get("/my/jobs", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM jobs
       WHERE created_by=$1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// Recruiter dashboard analytics
router.get("/analytics/recruiter", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        message: "Only recruiters can view analytics",
      });
    }

    const summaryResult = await pool.query(
      `SELECT
        COUNT(DISTINCT jobs.id)::int AS total_jobs,
        COUNT(applications.id)::int AS total_applications,
        COUNT(applications.id) FILTER (
          WHERE applications.status = 'pending'
        )::int AS pending,
        COUNT(applications.id) FILTER (
          WHERE applications.status = 'accepted'
        )::int AS accepted,
        COUNT(applications.id) FILTER (
          WHERE applications.status = 'rejected'
        )::int AS rejected
       FROM jobs
       LEFT JOIN applications
       ON applications.job_id = jobs.id
       WHERE jobs.created_by = $1`,
      [req.user.id]
    );

    const jobStatsResult = await pool.query(
      `SELECT
        jobs.id,
        jobs.title,
        jobs.company,
        COUNT(applications.id)::int AS application_count
       FROM jobs
       LEFT JOIN applications
       ON applications.job_id = jobs.id
       WHERE jobs.created_by = $1
       GROUP BY jobs.id, jobs.title, jobs.company
       ORDER BY application_count DESC, jobs.created_at DESC`,
      [req.user.id]
    );

    res.json({
      summary: summaryResult.rows[0],
      jobs: jobStatsResult.rows,
    });
  } catch (error) {
    console.log("ANALYTICS ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

// Get candidate applications
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
        jobs.salary,
        jobs.company_logo,
        jobs.category,
        jobs.job_type,
        jobs.work_mode,
        jobs.experience_level
       FROM applications
       JOIN jobs
       ON applications.job_id = jobs.id
       WHERE applications.user_id = $1
       ORDER BY applications.applied_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// Get candidate saved jobs
router.get("/my/saved", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT jobs.*
       FROM saved_jobs
       JOIN jobs
       ON saved_jobs.job_id = jobs.id
       WHERE saved_jobs.user_id = $1
       ORDER BY saved_jobs.saved_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// Apply for a job
router.post("/:id/apply", authMiddleware, async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;

    const result = await pool.query(
      `INSERT INTO applications(job_id, user_id)
       VALUES($1, $2)
       RETURNING *`,
      [jobId, userId]
    );

    res.json({
      message: "Applied successfully",
      application: result.rows[0],
    });
  } catch (err) {
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

// Save a job
router.post("/:id/save", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `INSERT INTO saved_jobs(job_id, user_id)
       VALUES($1, $2)
       RETURNING *`,
      [req.params.id, req.user.id]
    );

    res.json({
      message: "Job saved successfully",
      savedJob: result.rows[0],
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({
        message: "Job already saved",
      });
    }

    res.status(500).json({
      message: err.message,
    });
  }
});

// Get applicants for a job
router.get("/:id/applicants", authMiddleware, async (req, res) => {
  try {
    const jobId = req.params.id;

    const jobOwner = await pool.query(
      `SELECT id
       FROM jobs
       WHERE id=$1 AND created_by=$2`,
      [jobId, req.user.id]
    );

    if (jobOwner.rows.length === 0) {
      return res.status(403).json({
        message:
          "You are not allowed to view applicants for this job.",
      });
    }

    const result = await pool.query(
      `SELECT
        applications.id AS application_id,
        applications.status,
        applications.applied_at,
        users.id AS user_id,
        users.name,
        users.email,
        users.resume,
        users.profile_photo,
        users.phone,
        users.location
       FROM applications
       JOIN users
       ON applications.user_id = users.id
       WHERE applications.job_id = $1
       ORDER BY applications.applied_at DESC`,
      [jobId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// Update application status and create notification
router.put(
  "/applications/:id/status",
  authMiddleware,
  async (req, res) => {
    const client = await pool.connect();

    try {
      const applicationId = req.params.id;
      const { status } = req.body;

      const allowedStatuses = [
        "pending",
        "accepted",
        "rejected",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message:
            "Status must be pending, accepted or rejected.",
        });
      }

      await client.query("BEGIN");

      const result = await client.query(
        `UPDATE applications
         SET status=$1
         WHERE id=$2
         AND job_id IN (
           SELECT id
           FROM jobs
           WHERE created_by=$3
         )
         RETURNING id, job_id, user_id, status`,
        [status, applicationId, req.user.id]
      );

      if (result.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          message:
            "Application not found or you cannot update it.",
        });
      }

      const application = result.rows[0];

      const jobResult = await client.query(
        `SELECT title, company
         FROM jobs
         WHERE id=$1`,
        [application.job_id]
      );

      const job = jobResult.rows[0];

      const message =
        status === "accepted"
          ? `Your application for ${job.title} at ${job.company} has been accepted.`
          : status === "rejected"
          ? `Your application for ${job.title} at ${job.company} has been rejected.`
          : `Your application for ${job.title} at ${job.company} is pending review.`;

      await client.query(
        `INSERT INTO notifications(user_id, message)
         VALUES($1, $2)`,
        [application.user_id, message]
      );

      await client.query("COMMIT");

      res.json({
        message: "Status updated successfully",
        application,
      });
    } catch (error) {
      await client.query("ROLLBACK");

      res.status(500).json({
        message: error.message,
      });
    } finally {
      client.release();
    }
  }
);

// Update a job with optional company logo
router.put(
  "/:id",
  authMiddleware,
  upload.single("company_logo"),
  async (req, res) => {
    try {
      const jobId = req.params.id;

      const {
        title,
        company,
        location,
        salary,
        description,
        category,
        job_type,
        work_mode,
        experience_level,
      } = req.body;

      const oldJob = await pool.query(
        `SELECT company_logo
         FROM jobs
         WHERE id=$1 AND created_by=$2`,
        [jobId, req.user.id]
      );

      if (oldJob.rows.length === 0) {
        return res.status(404).json({
          message:
            "Job not found or you are not allowed to edit this job",
        });
      }

      const companyLogo = req.file
        ? `/uploads/${req.file.filename}`
        : oldJob.rows[0].company_logo;

      const result = await pool.query(
        `UPDATE jobs
         SET
           title=$1,
           company=$2,
           location=$3,
           salary=$4,
           description=$5,
           company_logo=$6,
           category=$7,
           job_type=$8,
           work_mode=$9,
           experience_level=$10
         WHERE id=$11 AND created_by=$12
         RETURNING *`,
        [
          title,
          company,
          location,
          salary,
          description,
          companyLogo,
          category || null,
          job_type || null,
          work_mode || null,
          experience_level || null,
          jobId,
          req.user.id,
        ]
      );

      res.json({
        message: "Job updated successfully",
        job: result.rows[0],
      });
    } catch (err) {
      console.log("UPDATE JOB ERROR:", err);

      res.status(500).json({
        message: err.message,
      });
    }
  }
);

// Delete a job
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const jobId = req.params.id;

    const result = await pool.query(
      `DELETE FROM jobs
       WHERE id=$1 AND created_by=$2
       RETURNING *`,
      [jobId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message:
          "Job not found or you are not allowed to delete this job",
      });
    }

    res.json({
      message: "Job deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;