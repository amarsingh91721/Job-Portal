import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home-page">
      <section className="hero">
        <div>
          <h1>Find Your Dream Job</h1>
          <p>
            Explore thousands of jobs from top companies and start your career journey today.
          </p>

          <div className="hero-buttons">
            <Link to="/jobs" className="primary-btn">Browse Jobs</Link>
            <Link to="/register" className="secondary-btn">Get Started</Link>
          </div>
        </div>
      </section>

      <section className="stats">
        <div>
          <h2>10K+</h2>
          <p>Jobs Posted</p>
        </div>

        <div>
          <h2>500+</h2>
          <p>Companies</p>
        </div>

        <div>
          <h2>25K+</h2>
          <p>Candidates</p>
        </div>
      </section>

      <section className="companies">
        <h2>Top Companies Hiring</h2>

        <div className="company-list">
          <div>Google</div>
          <div>Microsoft</div>
          <div>Amazon</div>
          <div>Adobe</div>
        </div>
      </section>
    </div>
  );
}

export default Home;