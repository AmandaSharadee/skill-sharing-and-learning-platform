import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './post.css';
import './summary.css';
import NavBar from '../../Components/NavBar/NavBar';
import { HiCalendarDateRange } from "react-icons/hi2";
import { FaBookOpen, FaVideo, FaImage, FaRegClock, FaCheck, FaRegCalendarAlt } from "react-icons/fa";
import { MdOutlineTimeline } from "react-icons/md";
import { BiSolidCategory } from "react-icons/bi";

function LearningPlanSummary() {
  const { id } = useParams();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const [progress, setProgress] = useState(0);
  const [resources, setResources] = useState({ videos: 0, images: 0, links: 0 });
  const [timelineData, setTimelineData] = useState({
    planned: [],
    actual: []
  });

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/learningplan/user/${id}`);
        const plansData = Array.isArray(response.data) ? response.data : [response.data];
        setPlans(plansData);
        
        plansData.forEach(plan => {
          calculateProgress(plan);
          countResources(plan);
          generateTimeline(plan);
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching plan:', error);
        setLoading(false);
      }
    };

    if (id) {
      fetchPlan();
    }
  }, [id]);

  const calculateProgress = (planData) => {
    console.log('Calculating progress for:', planData);
    
    if (!planData.startDate || !planData.endDate) {
      if (planData.createDate) {
        const createDate = planData.createDate.split('T')[0];
        setProgress(50);
        return;
      }
      return;
    }

    const startDate = new Date(planData.startDate);
    const endDate = new Date(planData.endDate);
    const today = new Date();

    if (today <= startDate) {
      setProgress(0);
    } else if (today >= endDate) {
      setProgress(100);
    } else {
      const totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
      const daysElapsed = (today - startDate) / (1000 * 60 * 60 * 24);
      setProgress(Math.round((daysElapsed / totalDays) * 100));
    }
  };

  const countResources = (planData) => {
    let videoCount = 0;
    let imageCount = 0;
    let linkCount = 0;

    if (planData.contentURL && planData.contentURL.trim() !== "") {
      if (planData.contentURL.includes('youtube.com') || planData.contentURL.includes('youtu.be')) {
        videoCount++;
      } else {
        linkCount++;
      }
    }

    if (planData.imageUrl && planData.imageUrl.trim() !== "") {
      imageCount++;
    }

    setResources({
      videos: videoCount,
      images: imageCount,
      links: linkCount
    });
  };

  const generateTimeline = (planData) => {
    const plannedTimeline = [];
    const actualTimeline = [];

    if (planData) {
      if (planData.startDate) {
        plannedTimeline.push({
          date: planData.startDate.split('T')[0],
          event: 'Start Learning Plan',
          completed: true
        });
      }

      if (!planData.startDate && planData.createDate) {
        plannedTimeline.push({
          date: planData.createDate.split('T')[0],
          event: 'Plan Created',
          completed: true
        });
      }

      if (planData.endDate) {
        plannedTimeline.push({
          date: planData.endDate.split('T')[0],
          event: `Complete ${planData.title}`,
          completed: Date.now() >= new Date(planData.endDate).getTime()
        });
      }

      actualTimeline.push({
        date: (planData.startDate || planData.createDate).split('T')[0],
        event: planData.title,
        completed: true
      });
    }

    setTimelineData({
      planned: plannedTimeline,
      actual: actualTimeline
    });
  };

  if (loading) {
    return (
      <div className="glass-container">
        <NavBar />
        <div className="summary-loading">Loading plan summary...</div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="glass-container">
        <NavBar />
        <div className="summary-error">No plans found</div>
      </div>
    );
  }

  return (
    <div className="glass-container">
      <NavBar />
      <div className="summary-container">
        {plans.map((plan, index) => (
          <div key={index} className="plan-summary">
            <div className="summary-header">
              <h1 className="summary-title">{plan.title} - Learning Summary</h1>
              <div className="summary-meta">
                <div className="summary-meta-item">
                  <BiSolidCategory />
                  <span>{plan.category}</span>
                </div>
                <div className="summary-meta-item">
                  <HiCalendarDateRange />
                  <span>
                    {plan.startDate ? new Date(plan.startDate).toLocaleDateString() : 'No start date'} 
                    {plan.endDate ? ` to ${new Date(plan.endDate).toLocaleDateString()}` : ''}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="summary-progress-section">
              <h2>Overall Progress</h2>
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                <span className="progress-text">{progress}%</span>
              </div>
              <div className="resources-summary">
                <div className="resource-count">
                  <FaVideo />
                  <span>{resources.videos} Videos</span>
                </div>
                <div className="resource-count">
                  <FaImage />
                  <span>{resources.images} Images</span>
                </div>
                <div className="resource-count">
                  <FaBookOpen />
                  <span>{resources.links} External Resources</span>
                </div>
              </div>
            </div>
            
            <div className="summary-content">
              <div className="summary-section topics-section">
                <h2><FaBookOpen /> Topics</h2>
                <div className="topics-list">
                  <div className="topic-item">
                    <div className="topic-header">
                      <h3>{plan.category}</h3>
                      <span className={`topic-status ${progress >= 100 ? 'completed' : 'in-progress'}`}>
                        {progress >= 100 ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                    <div className="topic-progress-container">
                      <div className="topic-progress-bar" style={{ width: `${progress}%` }}></div>
                      <span className="topic-progress-text">{progress}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="summary-section resources-section">
                <h2><FaBookOpen /> Resources</h2>
                <div className="resources-list">
                  {plan.contentURL && (
                    <div className="resource-item">
                      <div className="resource-icon">
                        <FaVideo />
                      </div>
                      <div className="resource-details">
                        <h3>{plan.title} - Video Content</h3>
                        <div className="resource-meta">
                          <span><FaRegCalendarAlt /> {new Date(plan.createDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {plan.imageUrl && (
                    <div className="resource-item">
                      <div className="resource-icon">
                        <FaImage />
                      </div>
                      <div className="resource-details">
                        <h3>{plan.title} - Image Resource</h3>
                        <div className="resource-meta">
                          <span><FaRegCalendarAlt /> {new Date(plan.createDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="summary-section timeline-section">
                <h2><MdOutlineTimeline /> Timeline</h2>
                <div className="timeline-container">
                  <div className="timeline-column planned">
                    <h3>Planned Timeline</h3>
                    {timelineData.planned.map((event, index) => (
                      <div key={index} className={`timeline-event ${event.completed ? 'completed' : 'pending'}`}>
                        <div className="timeline-date">{event.date}</div>
                        <div className="timeline-content">
                          <div className="timeline-marker">
                            {event.completed ? <FaCheck /> : <div className="pending-circle"></div>}
                          </div>
                          <div className="timeline-text">{event.event}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="timeline-column actual">
                    <h3>Actual Timeline</h3>
                    {timelineData.actual.map((event, index) => (
                      <div key={index} className="timeline-event completed">
                        <div className="timeline-date">{event.date}</div>
                        <div className="timeline-content">
                          <div className="timeline-marker"><FaCheck /></div>
                          <div className="timeline-text">{event.event}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="summary-actions">
              <button 
                className="summary-btn" 
                onClick={() => window.location.href = `/updateLearningPlan/${plan.id}`}
              >
                Edit Learning Plan
              </button>
            </div>
          </div>
        ))}
        <button 
          className="summary-btn" 
          onClick={() => window.location.href = '/allLearningPlan'}
        >
          Back to All Plans
        </button>
      </div>
    </div>
  );
}

export default LearningPlanSummary;
