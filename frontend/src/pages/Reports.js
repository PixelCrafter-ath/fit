import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Button, 
  Table, 
  Spinner, 
  Alert,
  Dropdown
} from 'react-bootstrap';
import Badge from 'react-bootstrap/Badge';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Reports() {
  const [weeklySummaries, setWeeklySummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch weekly summaries
      const response = await axios.get('http://localhost:5000/api/weekly-summary?limit=10');
      setWeeklySummaries(response.data.summaries);
      
      // Prepare chart data
      prepareChartData(response.data.summaries);
      
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = (summaries) => {
    if (!summaries.length) return;

    // Group by week and calculate averages
    const weeklyData = {};
    
    summaries.forEach(summary => {
      const week = summary.week_start_date;
      if (!weeklyData[week]) {
        weeklyData[week] = {
          week: week,
          totalUpdates: 0,
          totalContacts: 0,
          completionRates: []
        };
      }
      
      weeklyData[week].totalUpdates += summary.days_updated;
      weeklyData[week].totalContacts += 1;
      weeklyData[week].completionRates.push(
        (summary.days_updated / summary.total_expected_days) * 100
      );
    });

    // Convert to arrays and sort by date
    const sortedData = Object.values(weeklyData)
      .sort((a, b) => a.week.localeCompare(b.week));

    const chartData = {
      labels: sortedData.map(item => `Week of ${item.week}`),
      datasets: [
        {
          label: 'Total Updates',
          data: sortedData.map(item => item.totalUpdates),
          backgroundColor: 'rgba(40, 167, 69, 0.6)',
          borderColor: 'rgba(40, 167, 69, 1)',
          borderWidth: 1,
        },
        {
          label: 'Avg Completion %',
          data: sortedData.map(item => 
            item.completionRates.reduce((a, b) => a + b, 0) / item.completionRates.length
          ),
          backgroundColor: 'rgba(0, 123, 255, 0.6)',
          borderColor: 'rgba(0, 123, 255, 1)',
          borderWidth: 1,
          type: 'line',
          yAxisID: 'y1'
        }
      ]
    };

    setChartData(chartData);
  };

  const exportReport = async (format, type) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/exports/${format}/${type}`,
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}.${format === 'csv' ? 'csv' : 'json'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report');
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Weekly Performance Trends',
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Total Updates'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Completion Percentage'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading reports...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 fade-in-up">
        <h2 className="section-title gradient-text">
          📈 Reports & Analytics
        </h2>
        <Dropdown>
          <Dropdown.Toggle variant="success" id="dropdown-basic">
            📥 Export Reports
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Header>Export as CSV</Dropdown.Header>
            <Dropdown.Item onClick={() => exportReport('csv', 'contacts')}>
              Contacts CSV
            </Dropdown.Item>
            <Dropdown.Item onClick={() => exportReport('csv', 'messages')}>
              Messages CSV
            </Dropdown.Item>
            <Dropdown.Item onClick={() => exportReport('csv', 'weekly-summaries')}>
              Weekly Summaries CSV
            </Dropdown.Item>
            <Dropdown.Item onClick={() => exportReport('csv', 'message-logs')}>
              Message Logs CSV
            </Dropdown.Item>
            
            <Dropdown.Divider />
            
            <Dropdown.Header>Export as JSON</Dropdown.Header>
            <Dropdown.Item onClick={() => exportReport('json', 'contacts')}>
              Contacts JSON
            </Dropdown.Item>
            <Dropdown.Item onClick={() => exportReport('json', 'messages')}>
              Messages JSON
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Charts Section */}
      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                📊 Performance Trends
              </h5>
            </Card.Header>
            <Card.Body>
              {chartData ? (
                <Bar data={chartData} options={chartOptions} />
              ) : (
                <div className="text-center py-5">
                  📊
                  <p className="mt-2 text-muted">No data available for charts</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Weekly Summaries Table */}
      <Row>
        <Col md={12}>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  📋 Recent Weekly Summaries
                </h5>
                <Button variant="outline-secondary" size="sm" onClick={fetchReports}>
                  Refresh Data
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {weeklySummaries.length > 0 ? (
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Week</th>
                        <th>Contact</th>
                        <th>Phone</th>
                        <th>Days Updated</th>
                        <th>Days Missed</th>
                        <th>Completion Rate</th>
                        <th>Streak</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weeklySummaries.map((summary) => (
                        <tr key={`${summary.contact._id}-${summary.week_start_date}`}>
                          <td>
                            <strong>{summary.week_start_date}</strong>
                            <br />
                            <small className="text-muted">to {summary.week_end_date}</small>
                          </td>
                          <td>
                            <strong>{summary.contact?.name || 'Unknown'}</strong>
                          </td>
                          <td>{summary.contact?.phone_number || 'Unknown'}</td>
                          <td>
                            <Badge bg="success">
                              {summary.days_updated}/{summary.total_expected_days}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg="danger">{summary.days_missed}</Badge>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="flex-grow-1 me-2">
                                <div className="progress" style={{height: '10px'}}>
                  <div 
                    className={`progress-bar ${
                      (summary.days_updated / summary.total_expected_days) >= 0.8 ? 'bg-success' :
                      (summary.days_updated / summary.total_expected_days) >= 0.5 ? 'bg-warning' : 'bg-danger'
                    }`}
                    role="progressbar"
                    style={{width: `${(summary.days_updated / summary.total_expected_days) * 100}%`}}
                  ></div>
                </div>
              </div>
              <small>
                {Math.round((summary.days_updated / summary.total_expected_days) * 100)}%
              </small>
            </div>
          </td>
          <td>
            <Badge bg={
              summary.average_streak >= 7 ? 'success' :
              summary.average_streak >= 3 ? 'warning' : 'secondary'
            }>
              {summary.average_streak} days
            </Badge>
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
</div>
              ) : (
                <div className="text-center py-5">
                  📋
                  <p className="mt-2 text-muted">No weekly summaries found</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Key Metrics */}
      <Row className="mt-4">
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              📈
              <Card.Title className="mt-2">
                {weeklySummaries.length > 0 
                  ? `${Math.round(
                      weeklySummaries.reduce((sum, s) => 
                        sum + (s.days_updated / s.total_expected_days) * 100, 0
                      ) / weeklySummaries.length
                    )}%`
                  : '0%'
                }
              </Card.Title>
              <Card.Text>Average Completion Rate</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              📊
              <Card.Title className="mt-2">
                {weeklySummaries.length}
              </Card.Title>
              <Card.Text>Weeks Tracked</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              📋
              <Card.Title className="mt-2">
                {weeklySummaries.reduce((sum, s) => sum + s.days_updated, 0)}
              </Card.Title>
              <Card.Text>Total Updates Recorded</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Reports;