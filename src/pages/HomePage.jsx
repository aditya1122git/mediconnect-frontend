import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero" style={{ 
        backgroundImage: `url('/images/doctor-patient.jpg')`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        position: 'relative'
      }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Welcome to MediConnect</h1>
          <p className="hero-subtitle">Connecting Patients and Doctors in a Seamless Healthcare Experience</p>
          <div className="hero-buttons">
            <Link to="/login" className="btn btn-primary btn-lg">Sign In</Link>
            <Link to="/register" className="btn btn-outline-primary btn-lg">Create Account</Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2 className="section-title">Our Features</h2>
        <div className="feature-cards">
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
              </svg>
            </div>
            <h3>Patient Profiles</h3>
            <p>Create and manage your personal health profile including medical history and vital statistics.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8.5 5.5a.5.5 0 0 0-1 0v3.362l-1.429 2.38a.5.5 0 1 0 .858.515l1.5-2.5A.5.5 0 0 0 8.5 9V5.5z"/>
                <path d="M6.5 0a.5.5 0 0 0 0 1H7v1.07a7.001 7.001 0 0 0-3.273 12.474l-.602.602a.5.5 0 0 0 .707.708l.746-.746A6.97 6.97 0 0 0 8 16a6.97 6.97 0 0 0 3.422-.892l.746.746a.5.5 0 0 0 .707-.708l-.601-.602A7.001 7.001 0 0 0 9 2.07V1h.5a.5.5 0 0 0 0-1h-3z"/>
              </svg>
            </div>
            <h3>Appointment Scheduling</h3>
            <p>Book appointments with qualified doctors based on availability and receive instant confirmations.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm3.5 7.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5z"/>
              </svg>
            </div>
            <h3>Health Records</h3>
            <p>Access and maintain your complete health records in one secure location, easily accessible by authorized doctors.</p>
          </div>
        </div>
        
        <div className="feature-cards">
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                <path fillRule="evenodd" d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216z"/>
                <path d="M4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
              </svg>
            </div>
            <h3>Doctor Search</h3>
            <p>Find qualified specialists based on specialty, location, and patient ratings to ensure the best care.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8.5 1.5A1.5 1.5 0 0 1 10 0h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h6c-.314.418-.5.937-.5 1.5v7.793L4.854 6.646a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0l3.5-3.5a.5.5 0 0 0-.708-.708L8.5 9.293V1.5z"/>
              </svg>
            </div>
            <h3>Communication</h3>
            <p>Secure messaging between patients and healthcare providers to discuss health concerns and follow-ups.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
              </svg>
            </div>
            <h3>Medical Insights</h3>
            <p>Access personalized health analytics and insights based on your medical history and appointments.</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team" style={{ 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8eaed 100%)',
        position: 'relative',
        overflow: 'hidden',
        padding: '40px 20px',
        borderRadius: '8px',
        margin: '30px 0'
      }}>
        {/* Decorative elements */}
        <div style={{ position: 'absolute', top: '20px', left: '20px', fontSize: '28px' }}>👨‍💻</div>
        <div style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '28px' }}>💡</div>
        <div style={{ position: 'absolute', bottom: '20px', left: '20px', fontSize: '28px' }}>🚀</div>
        <div style={{ position: 'absolute', bottom: '20px', right: '20px', fontSize: '28px' }}>⚕️</div>
        
        {/* Pattern background */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05, 
                    backgroundImage: 'radial-gradient(#4a90e2 2px, transparent 2px), radial-gradient(#4a90e2 2px, transparent 2px)',
                    backgroundSize: '30px 30px',
                    backgroundPosition: '0 0, 15px 15px' }}></div>
        
        {/* Circle decorations */}
        <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '200px', height: '200px', 
                     borderRadius: '50%', background: 'rgba(74, 144, 226, 0.1)' }}></div>
        <div style={{ position: 'absolute', bottom: '-30px', right: '-30px', width: '150px', height: '150px', 
                     borderRadius: '50%', background: 'rgba(74, 144, 226, 0.1)' }}></div>
        
        {/* Wave shape */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40px',
          background: 'linear-gradient(45deg, #4a90e2 25%, transparent 25%), linear-gradient(-45deg, #4a90e2 25%, transparent 25%)',
          backgroundSize: '20px 20px',
          opacity: 0.1
        }}></div>
                     
        <h2 className="section-title" style={{ position: 'relative', zIndex: 2 }}>
          <span style={{ marginRight: '10px' }}>✨</span>
          Meet the Developer
          <span style={{ marginLeft: '10px' }}>✨</span>
        </h2>
        <div className="team-members">
          <div className="team-member" style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', background: 'white', position: 'relative', zIndex: 2, textAlign: 'center' }}>
            <div className="member-image" style={{ width: '120px', height: '120px', overflow: 'hidden', borderRadius: '50%', margin: '0 auto', border: '3px solid #4a90e2', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
              <img src="/images/person1.jpeg" alt="Aditya Raj" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h3>Aditya Raj</h3>
            <p className="member-position">Founder & CEO</p>
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

      {/* Testimonials Section */}
      <section className="testimonials">
        <h2 className="section-title">What Our Users Say</h2>
        <div className="testimonial-cards">
          <div className="testimonial-card">
            <div className="quote-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                <path d="M12 12a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1h-1.388c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 9 7.558V11a1 1 0 0 0 1 1h2Zm-6 0a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1H4.612c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 3 7.558V11a1 1 0 0 0 1 1h2Z"/>
              </svg>
            </div>
            <p>"MediConnect has transformed how I manage my healthcare. Booking appointments and accessing my medical records is now so simple!"</p>
            <div className="testimonial-author">
              <span className="author-name">Sarah Johnson</span>
              <span className="author-role">Patient</span>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="quote-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                <path d="M12 12a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1h-1.388c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 9 7.558V11a1 1 0 0 0 1 1h2Zm-6 0a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1H4.612c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 3 7.558V11a1 1 0 0 0 1 1h2Z"/>
              </svg>
            </div>
            <p>"As a doctor, this platform has streamlined my practice. Patient information is organized and accessible, making consultations more effective."</p>
            <div className="testimonial-author">
              <span className="author-name">Dr. James Wilson</span>
              <span className="author-role">Cardiologist</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Transform Your Healthcare Experience?</h2>
          <p>Join thousands of patients and doctors who trust MediConnect for their healthcare needs.</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary btn-lg">Get Started</Link>
            <Link to="/login" className="btn btn-outline-primary btn-lg">Sign In</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <h3>MediConnect</h3>
              <p>Connecting healthcare professionals with patients seamlessly.</p>
            </div>
            <div className="footer-links">
              <div className="link-group">
                <h4>Quick Links</h4>
                <ul>
                  <li><Link to="/about">About Us</Link></li>
                  <li><Link to="/contact">Contact Us</Link></li>
                  <li><Link to="/privacy">Privacy Policy</Link></li>
                  <li><Link to="/terms">Terms of Service</Link></li>
                </ul>
              </div>
              <div className="link-group">
                <h4>Follow Us</h4>
                <div className="footer-social">
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <i className="fab fa-instagram"></i> Instagram
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter/X">
                    <i className="fab fa-twitter"></i> Twitter
                  </a>
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <i className="fab fa-facebook"></i> Facebook
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} MediConnect. All rights reserved.</p>
            <p className="text-center mt-2" style={{ marginBottom: '0', paddingBottom: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>Made with ❤️ by Aditya Raj</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 