import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Radar, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [philosophers, setPhilosophers] = useState([]);
  const questionsPerPage = 5;

  useEffect(() => {
    axios.get('http://localhost:5000/philosophers')
      .then(res => setPhilosophers(res.data));

    axios.get('http://localhost:5000/questions')
      .then(res => {
        setQuestions(res.data);
        setAnswers(Array(res.data.length).fill(3));
      });
  }, []);

  const handleChange = (index, value) => {
    const updated = [...answers];
    updated[index] = parseInt(value);
    setAnswers(updated);
  };

  const handleSubmit = () => {
    axios.post('http://localhost:5000/submit', { answers })
      .then(res => setResults(res.data));
  };

  const handleReset = () => {
    setResults(null);
    setAnswers(Array(questions.length).fill(3));
    setCurrentPage(0);
    setTestStarted(false);
  };

  const startIndex = currentPage * questionsPerPage;
  const currentQuestions = questions.slice(startIndex, startIndex + questionsPerPage);

  const getLabels = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes('universal') && lower.includes('personal')) {
      return ['1 - Personal', '2', '3 - Neutral', '4', '5 - Universal'];
    } else if (lower.includes('objective') && lower.includes('subjective')) {
      return ['1 - Subjective', '2', '3 - Neutral', '4', '5 - Objective'];
    } else if (lower.includes('emotion') && lower.includes('logic')) {
      return ['1 - Emotional', '2', '3 - Neutral', '4', '5 - Logical'];
    } else if (lower.includes('passion') && lower.includes('reason')) {
      return ['1 - Passion', '2', '3 - Balance', '4', '5 - Reason'];
    } else if (lower.includes('peace') && lower.includes('justice')) {
      return ['1 - Peace', '2', '3 - Balance', '4', '5 - Justice'];
    } else if (lower.includes('freedom') && lower.includes('collective')) {
      return ['1 - Collective Good', '2', '3 - Balance', '4', '5 - Individual Freedom'];
    } else if (text.includes(" or ")) {
      const [left, right] = text.split(" or ").map(t => t.trim());
      return [`1 - ${left}`, '2', '3 - Neutral', '4', `5 - ${right}`];
    } else {
      return ['1 - Strongly Disagree', '2', '3 - Neutral', '4', '5 - Strongly Agree'];
    }
  };

 

  if (!testStarted) {
    return (
      <div className="container py-5">
        <h1 className="text-center mb-5">Discover Your Philosophy</h1>
        <div className="row row-cols-1 row-cols-md-2 g-4">
          {philosophers.map(philo => (
            <div key={philo.name} className="col">
              <div className="card h-100 shadow-sm">
                <img
                  src={`https://source.unsplash.com/400x200/?philosopher,${philo.name}`}
                  className="card-img-top"
                  alt={philo.name}
                />
                <div className="card-body">
                  <h5 className="card-title">{philo.name}</h5>
                  <p className="card-text small">{philo.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-5">
          <button className="btn btn-primary btn-lg" onClick={() => setTestStarted(true)}>
            Take the Test
          </button>
        </div>
      </div>
    );
  }
const getTopMatchesDescription = () => {
  if (!results || results.length === 0) return null;
  const top = [...results].sort((a, b) => b.percent - a.percent).slice(0, 3);
  return (
    <div className="text-start mt-4">
      <h4>Your Top Matches:</h4>
      <ul className="list-group">
        {top.map((match, idx) => (
          <li className="list-group-item" key={idx}>
            {idx + 1}. {match.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container bg-white p-4 rounded shadow w-100" style={{ maxWidth: '1000px' }}>
        <h1 className="text-center mb-4">Discover Your Philosophy</h1>

        {!results ? (
          <div>
            {currentQuestions.map((q, idx) => {
              const index = startIndex + idx;
              const value = answers[index];
              const labels = getLabels(q.text);

              return (
                <div key={index} className="mb-4">
                  <p className="fw-semibold">{q.text}</p>
                  <input
                    type="range"
                    className="form-range"
                    min="1"
                    max="5"
                    value={value}
                    onChange={(e) => handleChange(index, e.target.value)}
                  />
                  <div className="text-center mb-2">
                    <span className="badge bg-info text-dark px-3 py-2 fs-6">Selected: {value}</span>
                  </div>
                  <div className="d-flex justify-content-between small text-muted">
                    {labels.map((label, i) => (
                      <span key={i}>{label}</span>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="d-flex justify-content-between mt-4">
              <button
                className="btn btn-secondary"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 0}
              >
                Previous
              </button>

              {startIndex + questionsPerPage < questions.length ? (
                <button className="btn btn-primary" onClick={() => setCurrentPage(currentPage + 1)}>
                  Next
                </button>
              ) : (
                <button className="btn btn-success" onClick={handleSubmit}>
                  Submit
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="mb-4">Your Results</h2>

            <div className="row mb-5">
              <div className="col-md-6 mb-4">
                <h5>Philosophical Radar</h5>
                <Radar
                  data={{
                    labels: results.map(r => r.name),
                    datasets: [{
                      label: 'Philosophy Match %',
                      data: results.map(r => r.percent),
                      backgroundColor: 'rgba(54, 162, 235, 0.2)',
                      borderColor: 'rgba(54, 162, 235, 1)',
                      borderWidth: 1,
                    }],
                  }}
                />
              </div>
              <div className="col-md-6 mb-4">
                <h5>Bar Comparison</h5>
                <Bar
                  data={{
                    labels: results.map(r => r.name),
                    datasets: [{
                      label: 'Match %',
                      data: results.map(r => r.percent),
                      backgroundColor: 'rgba(255, 99, 132, 0.5)',
                      borderColor: 'rgba(255, 99, 132, 1)',
                      borderWidth: 1,
                    }],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: false },
                    },
                    scales: {
                      y: { beginAtZero: true, max: 100 }
                    }
                  }}
                />
              </div>
            </div>

            {getTopMatchesDescription()}

            <button className="btn btn-outline-primary mt-4" onClick={handleReset}>
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
