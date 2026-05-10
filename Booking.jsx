import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import './Booking.css';

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const vehicle = location.state?.vehicle;

  const [tripDetails, setTripDetails] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    startDate: '',
    endDate: '',
  });

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('esewa');
  const [duration, setDuration] = useState(0);
  const [status, setStatus] = useState('idle'); // 'idle' | 'checking' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  // Calculate duration whenever dates change
  useEffect(() => {
    if (tripDetails.startDate && tripDetails.endDate) {
      const start = new Date(tripDetails.startDate);
      const end = new Date(tripDetails.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // If end date is before start date, it will be 0 or negative logically, handle it:
      if (end >= start) {
        setDuration(diffDays === 0 ? 1 : diffDays); // Minimum 1 day
      } else {
        setDuration(0);
      }
    } else {
      setDuration(0);
    }
  }, [tripDetails.startDate, tripDetails.endDate]);

  if (!vehicle) {
    return (
      <div className="booking-empty">
        <h2>No Vehicle Selected</h2>
        <p>Please go back to the vehicles page and select a vehicle to book.</p>
        <button onClick={() => navigate('/vehicles')} className="btn-primary">Browse Vehicles</button>
      </div>
    );
  }

  const handleInputChange = (e) => {
    setTripDetails({ ...tripDetails, [e.target.name]: e.target.value });
  };

  const totalCost = duration * Number(vehicle.price_per_day);
  const isFormComplete = tripDetails.pickupLocation && tripDetails.dropoffLocation && tripDetails.startDate && tripDetails.endDate && acceptedTerms && duration > 0;

  const handleConfirmBooking = () => {
    setStatus('checking');
    setErrorMessage('');

    // Simulate backend availability check and booking save
    setTimeout(() => {
      // Example of simulating an error if they pick a specific date or randomly
      const isAvailable = Math.random() > 0.1; // 90% chance of success for demo

      if (isAvailable) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage('Sorry, this vehicle is not available for the selected dates.');
      }
    }, 1500);
  };

  if (status === 'success') {
    return (
      <div className="booking-page">
        <div className="booking-success-message">
          <CheckCircle2 size={64} color="#10b981" />
          <h2>Booking Confirmed!</h2>
          <p>Your {vehicle.name} has been successfully reserved.</p>
          <div className="success-details">
            <p><strong>From:</strong> {tripDetails.startDate}</p>
            <p><strong>To:</strong> {tripDetails.endDate}</p>
            <p><strong>Total Cost:</strong> NPR {totalCost.toLocaleString()}</p>
            <p><strong>Payment Method:</strong> {paymentMethod === 'esewa' ? 'eSewa' : 'Khalti'}</p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">Return to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="booking-header-text">
        <h2>Complete Your Booking</h2>
      </div>

      <div className="booking-container">
        {/* Left Column */}
        <div className="booking-main">

          {/* Vehicle Info Card */}
          <div className="booking-section vehicle-preview">
            <img src={vehicle.image_url || 'https://placehold.co/600x300?text=No+Image'} alt={vehicle.name} className="preview-image" />
            <div className="preview-details">
              <h3>{vehicle.name}</h3>
              <p className="preview-meta">{vehicle.type} • {vehicle.fuel_type} • {vehicle.seats} seats</p>
              <p className="preview-price">NPR {Number(vehicle.price_per_day).toLocaleString()} <span className="price-unit">/ day</span></p>
            </div>
          </div>

          {/* Trip Details Form */}
          <div className="booking-section">
            <div className="section-header">
              <span className="icon">📍</span>
              <h3>Trip Details</h3>
            </div>
            <div className="form-grid">
              <div className="input-group">
                <label>Pick-up Location</label>
                <input type="text" name="pickupLocation" placeholder="e.g. Kathmandu" value={tripDetails.pickupLocation} onChange={handleInputChange} />
              </div>
              <div className="input-group">
                <label>Drop-off Location</label>
                <input type="text" name="dropoffLocation" placeholder="e.g. Pokhara" value={tripDetails.dropoffLocation} onChange={handleInputChange} />
              </div>
              <div className="input-group">
                <label>Start Date</label>
                <input type="date" name="startDate" value={tripDetails.startDate} onChange={handleInputChange} min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="input-group">
                <label>End Date</label>
                <input type="date" name="endDate" value={tripDetails.endDate} onChange={handleInputChange} min={tripDetails.startDate || new Date().toISOString().split('T')[0]} />
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="booking-section">
            <div className="section-header">
              <span className="icon">🛡️</span>
              <h3>Terms & Conditions</h3>
            </div>
            <div className="terms-box">
              <p>MERO GADI — RENTAL TERMS & CONDITIONS</p>
              <p>1. ELIGIBILITY: Renters must be 21 years or older with a valid driving license issued by the Government of Nepal or an International Driving Permit.</p>
              <p>2. RENTAL PERIOD: The rental period begins and ends as specified in the booking confirmation. Extensions must be requested 12 hours in advance.</p>
              <p>3. VEHICLE CONDITION: The vehicle must be returned in the same condition as received. Any damage will be assessed and charged accordingly.</p>
            </div>
            <label className="terms-checkbox">
              <input type="radio" checked={acceptedTerms} onClick={() => setAcceptedTerms(!acceptedTerms)} readOnly />
              <span>I have read and accept the Terms & Conditions</span>
            </label>
          </div>

          {/* Payment Method */}
          <div className="booking-section">
            <div className="section-header">
              <span className="icon">💳</span>
              <h3>Payment Method</h3>
            </div>
            <div className="payment-options">
              <label className={`payment-option ${paymentMethod === 'esewa' ? 'selected' : ''}`}>
                <div className="payment-left">
                  <input type="radio" name="payment" value="esewa" checked={paymentMethod === 'esewa'} onChange={() => setPaymentMethod('esewa')} />
                  <span><strong>eSewa</strong> Digital Wallet</span>
                </div>
                <span className="esewa-text">eSewa</span>
              </label>

              <label className={`payment-option ${paymentMethod === 'khalti' ? 'selected' : ''}`}>
                <div className="payment-left">
                  <input type="radio" name="payment" value="khalti" checked={paymentMethod === 'khalti'} onChange={() => setPaymentMethod('khalti')} />
                  <span><strong>Khalti</strong> Digital Wallet</span>
                </div>
                <span className="khalti-text">Khalti</span>
              </label>
            </div>
          </div>

        </div>

        {/* Right Column - Booking Summary */}
        <div className="booking-sidebar">
          <div className="summary-card">
            <h3>Booking Summary</h3>
            <div className="summary-row">
              <span className="summary-label">Vehicle</span>
              <span className="summary-value">{vehicle.name}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Daily Rate</span>
              <span className="summary-value">NPR {Number(vehicle.price_per_day).toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Duration</span>
              <span className="summary-value">{duration > 0 ? `${duration} days` : '-- days'}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Payment</span>
              <span className="summary-value">{paymentMethod === 'esewa' ? 'eSewa' : 'Khalti'}</span>
            </div>

            <hr className="summary-divider" />

            <div className="summary-row total-row">
              <span>Total</span>
              <span className="total-amount">NPR {totalCost > 0 ? totalCost.toLocaleString() : '0'}</span>
            </div>

            {status === 'error' && (
              <div className="error-message">
                <AlertCircle size={16} />
                {errorMessage}
              </div>
            )}

            <button
              className={`btn-confirm ${!isFormComplete || status === 'checking' ? 'disabled' : ''}`}
              disabled={!isFormComplete || status === 'checking'}
              onClick={handleConfirmBooking}
            >
              {status === 'checking' ? 'Checking Availability...' : '✓ Confirm Booking'}
            </button>

            {!isFormComplete && status !== 'checking' && (
              <p className="helper-text">
                {!acceptedTerms ? 'Please accept the Terms & Conditions to proceed.' : 'Please fill all details to proceed.'}
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Booking;
