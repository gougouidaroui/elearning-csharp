import './Home.css';
import { Link } from 'react-router-dom';
function Home() {
  return (
    <>
            <main>
                    <section className="hero">
      <div className="hero-content">
        <h1>Start Learning Today</h1>
        <p>Access a wide variety of courses to enhance your skills and career.</p>
        <Link to="/courses" className="btn-cta">Explore Courses</Link>
      </div>
    </section>
            </main>
                <section className="features">
      <h2>Why Choose Us?</h2>
      <div className="features-list">
        <div className="feature">
          <h3>Interactive Courses</h3>
          <p>Our courses are interactive and designed to keep you engaged.</p>
        </div>
        <div className="feature">
          <h3>Expert Instructors</h3>
          <p>Learn from industry experts who provide practical insights.</p>
        </div>
        <div className="feature">
          <h3>Flexible Learning</h3>
          <p>Learn at your own pace, anytime, anywhere.</p>
        </div>
      </div>
    </section>

    </>
  )
}

export default Home
