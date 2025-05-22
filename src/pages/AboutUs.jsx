import React from 'react';
import { Link } from 'react-router-dom';

const AboutUs = () => {
  return (
    <div className="about-page">
      <div className="container">
        <div className="page-header">
          <h1>About MediConnect</h1>
        </div>
        
        <section className="about-intro">
          <h2>Our Mission</h2>
          <p>
            At MediConnect, we're on a mission to transform healthcare delivery by bridging the gap between 
            patients and healthcare providers through innovative technology solutions. We believe that everyone 
            deserves accessible, efficient, and personalized healthcare experiences.
          </p>
        </section>
        
        <section className="about-story">
          <h2>Our Story</h2>
          <p>
            MediConnect was founded in 2023 with a simple yet powerful vision: to create a healthcare platform that 
            puts users first. We recognized the challenges faced by both patients and medical professionals in 
            today's healthcare landscape – from scheduling difficulties and fragmented medical records to 
            communication barriers.
          </p>
          <p>
            Our team of healthcare experts and technology innovators came together to develop a comprehensive 
            solution that streamlines healthcare interactions, making the experience better for everyone involved.
          </p>
        </section>
        
        <section className="about-team">
          <h2>Our Leadership</h2>
          <div className="team-grid">
            <div className="team-member" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
              <img src="/images/person1.jpeg" alt="Aditya Raj" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '50%', border: '3px solid #4a90e2', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }} />
              <h3>Aditya Raj</h3>
              <p className="position">Founder & CEO</p>
              <p>
                Full-stack developer and healthcare technology innovator with a passion for building accessible digital solutions. Combining expertise in MERN stack development with a deep understanding of healthcare workflows to create intuitive, user-centered platforms. Committed to leveraging technology that bridges gaps in healthcare access and improves patient outcomes.
              </p>
              <div className="social-links" style={{ marginTop: '15px' }}>
                <a href="https://github.com/aditya1122git/aditya-projects.git" target="_blank" rel="noopener noreferrer" style={{ margin: '0 10px', color: '#333', fontSize: '20px' }}>
                  <i className="fab fa-github"></i>
                </a>
                <a href="https://www.linkedin.com/in/aditya-raj-07a7a02a7" target="_blank" rel="noopener noreferrer" style={{ margin: '0 10px', color: '#0077B5', fontSize: '20px' }}>
                  <i className="fab fa-linkedin"></i>
                </a>
              </div>
            </div>
          </div>
        </section>
        
        <section className="about-values">
          <h2>Our Core Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <h3>Patient-Centered</h3>
              <p>
                We design every aspect of our platform with patients' needs and experiences at the forefront.
              </p>
            </div>
            
            <div className="value-card">
              <h3>Innovation</h3>
              <p>
                We constantly seek new ways to improve healthcare delivery through thoughtful technology solutions.
              </p>
            </div>
            
            <div className="value-card">
              <h3>Integrity</h3>
              <p>
                We uphold the highest standards of privacy, security, and ethical practice in all we do.
              </p>
            </div>
            
            <div className="value-card">
              <h3>Accessibility</h3>
              <p>
                We believe quality healthcare should be accessible to all, regardless of location or circumstance.
              </p>
            </div>
          </div>
        </section>
        
        <div className="page-cta">
          <h2>Join the MediConnect Community</h2>
          <p>Experience the future of healthcare connectivity today.</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary">Create Account</Link>
            <Link to="/contact" className="btn btn-outline-primary">Contact Us</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs; 