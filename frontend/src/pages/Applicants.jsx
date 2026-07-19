import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

function Applicants() {
  const { id } = useParams();
  const [applicants, setApplicants] = useState([]);

  const loadApplicants = () => {
    const token = localStorage.getItem("token");

    api
      .get(`/jobs/${id}/applicants`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setApplicants(res.data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    loadApplicants();
  }, []);

  const updateStatus = async (applicationId, status) => {
    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/jobs/applications/${applicationId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(`Application ${status}`);
      loadApplicants();
    } catch (error) {
      alert("Status update failed");
      console.log(error.response?.data);
    }
  };

  return (
    <div className="dashboard-page">
      <h1>Applicants</h1>

      {applicants.length === 0 ? (
        <h3>No applicants yet.</h3>
      ) : (
        <table className="applicant-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Resume</th>
              <th>Status</th>
              <th>Applied At</th>
              <th>Action</th>
               </tr>
          </thead>

          <tbody>
            {applicants.map((applicant) => (
              <tr key={applicant.application_id}>
                <td>{applicant.name}</td>


                <td>{applicant.email}</td>

<td>
  {applicant.resume ? (
    <a
      href={`hhttps://job-portal-backend-hnv4.onrender.com/${applicant.resume}`}
      target="_blank"
      rel="noreferrer"
    >
      View Resume
    </a>
  ) : (
    "No Resume"
  )}
</td>

<td>{applicant.status}</td>


                <td>{new Date(applicant.applied_at).toLocaleDateString()}</td>
                <td>
                  <button
                    className="apply-btn"
                    onClick={() =>
                      updateStatus(applicant.application_id, "accepted")
                    }
                  >
                    Accept
                  </button>

                  <button
                    className="delete-btn"
                    style={{ marginLeft: "8px" }}
                    onClick={() =>
                      updateStatus(applicant.application_id, "rejected")
                    }
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Applicants;