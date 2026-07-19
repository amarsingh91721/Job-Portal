import { useEffect, useState } from "react";
import api from "../services/api";

function Profile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
    phone: "",
    location: "",
    bio: "",
    company: "",
    profile_photo: "",
    resume: "",
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProfile(response.data);

        if (response.data.profile_photo) {
          setPhotoPreview(
            `http://localhost:5000${response.data.profile_photo}`
          );
        }
      } catch (error) {
        alert(
          error.response?.data?.message || "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) {
      return;
    }

    setProfilePhoto(selectedFile);
    setPhotoPreview(URL.createObjectURL(selectedFile));
  };

  const updateStoredUser = (updatedUser) => {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setProfile(updatedUser);
  };

  const handleUpdateProfile = async () => {
    try {
      if (!profile.name.trim()) {
        alert("Name is required");
        return;
      }

      const response = await api.put(
        "/auth/profile",
        {
          name: profile.name,
          phone: profile.phone,
          location: profile.location,
          bio: profile.bio,
          company: profile.company,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      updateStoredUser(response.data.user);

      alert("Profile updated successfully!");
    } catch (error) {
      alert(
        error.response?.data?.message || "Profile update failed"
      );
    }
  };

  const handlePhotoUpload = async () => {
    try {
      if (!profilePhoto) {
        alert("Please choose a profile photo");
        return;
      }

      const formData = new FormData();
      formData.append("profile_photo", profilePhoto);

      const response = await api.post(
        "/auth/upload-profile-photo",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      updateStoredUser(response.data.user);

      setPhotoPreview(
        `http://localhost:5000${response.data.user.profile_photo}`
      );

      setProfilePhoto(null);

      alert("Profile photo uploaded successfully!");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Profile photo upload failed"
      );
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <h2>Loading profile...</h2>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1>My Profile</h1>

        <div className="profile-layout">
          <div className="profile-photo-section">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Profile"
                className="profile-photo"
              />
            ) : (
              <div className="profile-photo-placeholder">
                {profile.name
                  ? profile.name.charAt(0).toUpperCase()
                  : "U"}
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
            />

            <button
              className="profile-secondary-btn"
              onClick={handlePhotoUpload}
            >
              Upload Photo
            </button>

            <div className="profile-basic-info">
              <h2>{profile.name}</h2>
              <p>{profile.email}</p>

              <span className="profile-role">
                {profile.role}
              </span>
            </div>
          </div>

          <div className="profile-form-section">
            <div className="profile-form-group">
              <label>Name</label>

              <input
                type="text"
                name="name"
                value={profile.name || ""}
                onChange={handleChange}
                placeholder="Enter your name"
              />
            </div>

            <div className="profile-form-group">
              <label>Email</label>

              <input
                type="email"
                value={profile.email || ""}
                disabled
              />
            </div>

            <div className="profile-form-group">
              <label>Phone Number</label>

              <input
                type="text"
                name="phone"
                value={profile.phone || ""}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
            </div>

            <div className="profile-form-group">
              <label>Location</label>

              <input
                type="text"
                name="location"
                value={profile.location || ""}
                onChange={handleChange}
                placeholder="Enter location"
              />
            </div>

            {profile.role === "recruiter" && (
              <div className="profile-form-group">
                <label>Company</label>

                <input
                  type="text"
                  name="company"
                  value={profile.company || ""}
                  onChange={handleChange}
                  placeholder="Enter company name"
                />
              </div>
            )}

            <div className="profile-form-group">
              <label>Bio</label>

              <textarea
                name="bio"
                value={profile.bio || ""}
                onChange={handleChange}
                placeholder="Write something about yourself"
                rows="5"
              />
            </div>

            {profile.role === "candidate" && (
              <div className="profile-resume-section">
                <label>Resume</label>

                {profile.resume ? (
                  <a
                    href={`https://job-portal-backend-hnv4.onrender.com${profile.resume}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Uploaded Resume
                  </a>
                ) : (
                  <p>No resume uploaded yet.</p>
                )}

                <small>
                  You can upload or replace your resume from the
                  Dashboard.
                </small>
              </div>
            )}

            <button
              className="profile-save-btn"
              onClick={handleUpdateProfile}
            >
              Save Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;