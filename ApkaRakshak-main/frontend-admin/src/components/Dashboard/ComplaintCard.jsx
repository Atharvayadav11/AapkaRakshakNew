import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Clock,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  CheckCircle,
  MessageCircle,
  Send,
  ChevronDown,
  ChevronUp,
  Shield,
  ShieldCheck,
  Loader,
  XCircle,
} from 'lucide-react';
import axios from 'axios';

const ComplaintCard = ({ complaint }) => {
  const {
    _id,
    category = 'Unknown',
    description = 'No description provided',
    time,
    location = {},
    geminiAnalysis = {},
    upvotes = 0,
    downvotes = 0,
    isVerified = false,
    userDetailss,
    anonymous = false,
    imageUrl, // Assuming the complaint has an imageUrl field
  } = complaint || {};

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [verifiedStatus, setVerifiedStatus] = useState(isVerified);
  
  // Criminal check states
  const [criminalCheckStatus, setCriminalCheckStatus] = useState(null); // null, 'checking', 'Red', 'Blue', 'error'
  const [criminalCheckResult, setCriminalCheckResult] = useState(null);
  const [criminalCheckLoading, setCriminalCheckLoading] = useState(false);

  // Fetch existing comments from localStorage
  useEffect(() => {
    const storedComments = localStorage.getItem(`comments_${_id}`);
    if (storedComments) {
      setComments(JSON.parse(storedComments));
    }

    // Check if criminal check was previously performed
    const storedCriminalCheck = localStorage.getItem(`criminal_check_${_id}`);
    if (storedCriminalCheck) {
      const checkData = JSON.parse(storedCriminalCheck);
      setCriminalCheckStatus(checkData.status);
      setCriminalCheckResult(checkData.result);
    }
  }, [_id]);

  // Save comments to localStorage
  const saveComments = (updatedComments) => {
    localStorage.setItem(`comments_${_id}`, JSON.stringify(updatedComments));
  };

  // Save criminal check result to localStorage
  const saveCriminalCheck = (status, result) => {
    localStorage.setItem(`criminal_check_${_id}`, JSON.stringify({
      status,
      result,
      timestamp: new Date().toISOString()
    }));
  };

  // Add a new comment
  const handleAddComment = () => {
    if (newComment.trim()) {
      const updatedComments = [
        ...comments,
        { id: Date.now(), text: newComment, timestamp: new Date() },
      ];
      setComments(updatedComments);
      saveComments(updatedComments);
      setNewComment('');
    }
  };

  // Get the color for the incident priority level
  const getIncidentLevelColor = (level) => {
    switch (level) {
      case 'Low Priority':
        return 'bg-yellow-500';
      case 'Medium Priority':
        return 'bg-orange-500';
      case 'High Priority':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Toggle verification status using the backend API
  const handleToggleVerification = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3001/api/toggleVerification/${_id}`
      );
      if (response.status === 200) {
        setVerifiedStatus((prevStatus) => !prevStatus);
      }
    } catch (error) {
      console.error('Error toggling verification:', error);
    }
  };

  // Handle criminal check
  const handleCriminalCheck = async (checked) => {
    if (!checked) {
      // If unchecked, reset the criminal check status
      setCriminalCheckStatus(null);
      setCriminalCheckResult(null);
      localStorage.removeItem(`criminal_check_${_id}`);
      return;
    }

    if (!imageUrl) {
      alert('No image available for this complaint');
      return;
    }

    setCriminalCheckLoading(true);
    setCriminalCheckStatus('checking');

    try {
      console.log('Sending criminal check request for image:', imageUrl);
      
      const response = await axios.post('http://localhost:5000/compare-faces', {
        image1: imageUrl
      }, {
        timeout: 30000, // 30 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Criminal check response:', response.data);

      const { result, message, matchedName, confidence } = response.data;
      
      setCriminalCheckStatus(result); // 'Red' or 'Blue'
      setCriminalCheckResult({
        message,
        matchedName,
        confidence,
        timestamp: new Date().toISOString()
      });
      
      saveCriminalCheck(result, {
        message,
        matchedName,
        confidence,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in criminal check:', error);
      setCriminalCheckStatus('error');
      setCriminalCheckResult({
        message: error.response?.data?.error || error.message || 'Failed to check criminal database',
        timestamp: new Date().toISOString()
      });
      
      saveCriminalCheck('error', {
        message: error.response?.data?.error || error.message || 'Failed to check criminal database',
        timestamp: new Date().toISOString()
      });
    } finally {
      setCriminalCheckLoading(false);
    }
  };

  // Get criminal check display info
  const getCriminalCheckDisplay = () => {
    if (criminalCheckLoading) {
      return {
        icon: <Loader size={20} className="mr-1 animate-spin" />,
        text: 'Checking...',
        color: 'text-blue-500'
      };
    }

    switch (criminalCheckStatus) {
      case 'Red':
        // Check if confidence is less than 80% for partial match
        const confidence = criminalCheckResult?.confidence;
        const isPartialMatch = confidence && confidence < 80;
        
        return {
          icon: <XCircle size={20} className="mr-1" />,
          text: isPartialMatch ? 'Partial Match Found' : 'Criminal Match Found',
          color: isPartialMatch ? 'text-orange-500' : 'text-red-500'
        };
      case 'Blue':
        return {
          icon: <ShieldCheck size={20} className="mr-1" />,
          text: 'No Criminal Match',
          color: 'text-green-500'
        };
      case 'error':
        return {
          icon: <AlertTriangle size={20} className="mr-1" />,
          text: 'Check Failed',
          color: 'text-orange-500'
        };
      default:
        return {
          icon: <Shield size={20} className="mr-1" />,
          text: 'Check Criminal Database',
          color: 'text-gray-500'
        };
    }
  };

  const criminalDisplay = getCriminalCheckDisplay();

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{category}</h2>
          <div
            className={`${getIncidentLevelColor(
              geminiAnalysis.incidentLevel
            )} text-white px-3 py-1 rounded-full text-sm font-semibold`}
          >
            {geminiAnalysis.incidentLevel || 'Unknown Priority'}
          </div>
        </div>

        <p className="text-gray-600 mb-4">{description}</p>

        <div className="space-y-2 mb-4">
          {location.latitude && location.longitude && (
            <p className="flex items-center text-sm text-gray-500">
              <MapPin size={16} className="mr-2" />
              Lat: {location.latitude.toFixed(4)}, Long:{' '}
              {location.longitude.toFixed(4)}
            </p>
          )}
          {time && (
            <p className="flex items-center text-sm text-gray-500">
              <Clock size={16} className="mr-2" />
              {new Date(time).toLocaleString()}
            </p>
          )}
        </div>

        {geminiAnalysis && Object.keys(geminiAnalysis).length > 0 && (
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">AI Analysis:</h3>
            {geminiAnalysis.imageDescription && (
              <p className="text-sm text-gray-600 mb-1">
                <strong>Image Description:</strong>{' '}
                {geminiAnalysis.imageDescription}
              </p>
            )}
            {geminiAnalysis.descriptionMatch && (
              <p className="text-sm text-gray-600 mb-1">
                <strong>Description Match:</strong>{' '}
                {geminiAnalysis.descriptionMatch}
              </p>
            )}
            {geminiAnalysis.additionalDetails && (
              <p className="text-sm text-gray-600">
                <strong>Additional Details:</strong>{' '}
                {geminiAnalysis.additionalDetails}
              </p>
            )}
          </div>
        )}

        {/* Criminal Check Result Display */}
        {criminalCheckResult && (
          <div className={`p-4 rounded-lg mb-4 ${
            criminalCheckStatus === 'Red' ? 
              (criminalCheckResult.confidence && criminalCheckResult.confidence < 80 ? 'bg-orange-50 border border-orange-200' : 'bg-red-50 border border-red-200') :
            criminalCheckStatus === 'Blue' ? 'bg-green-50 border border-green-200' :
            'bg-orange-50 border border-orange-200'
          }`}>
            <h3 className="font-semibold text-gray-700 mb-2">Criminal Database Check:</h3>
            <p className={`text-sm ${criminalDisplay.color}`}>
              <strong>Result:</strong> {criminalCheckResult.message}
            </p>
            {criminalCheckResult.matchedName && (
              <p className="text-sm text-red-600 mt-1">
                <strong>Matched Person:</strong> {criminalCheckResult.matchedName}
              </p>
            )}
            {criminalCheckResult.confidence && (
              <p className="text-sm text-red-600 mt-1">
                <strong>Confidence:</strong> {criminalCheckResult.confidence}%
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Checked on: {new Date(criminalCheckResult.timestamp).toLocaleString()}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button className="flex items-center text-gray-500 hover:text-blue-500">
              <ThumbsUp size={20} className="mr-1" />
              <span>{upvotes}</span>
            </button>
            <button className="flex items-center text-gray-500 hover:text-red-500">
              <ThumbsDown size={20} className="mr-1" />
              <span>{downvotes}</span>
            </button>
          </div>

          <div className="flex items-center space-x-6">
            {/* Criminal Check Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={criminalCheckStatus !== null}
                onChange={(e) => handleCriminalCheck(e.target.checked)}
                disabled={criminalCheckLoading || !imageUrl}
                className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 disabled:opacity-50"
              />
              <label className={`text-sm ${criminalDisplay.color}`}>
                <span className="flex items-center">
                  {criminalDisplay.icon}
                  {criminalDisplay.text}
                </span>
              </label>
              {!imageUrl && (
                <span className="text-xs text-gray-400">(No image)</span>
              )}
            </div>

            {/* Verification Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={verifiedStatus}
                onChange={handleToggleVerification}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="text-sm">
                {verifiedStatus ? (
                  <span className="flex items-center text-green-500">
                    <CheckCircle size={20} className="mr-1" />
                    Verified
                  </span>
                ) : (
                  <span className="flex items-center text-yellow-500">
                    <AlertTriangle size={20} className="mr-1" />
                    Unverified
                  </span>
                )}
              </label>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          {anonymous ? (
            <p>Reported anonymously</p>
          ) : (
            <p>Reported by: {userDetailss?.userEmail || 'Unknown User'}</p>
          )}
        </div>
      </div>

      <div className="mt-4 border-t pt-4">
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center text-blue-500 hover:text-blue-700"
        >
          <MessageCircle size={20} className="mr-2" />
          {showComments ? 'Hide' : 'Show'} Comments
          {showComments ? (
            <ChevronUp size={20} className="ml-1" />
          ) : (
            <ChevronDown size={20} className="ml-1" />
          )}
        </button>

        {showComments && (
          <div className="mt-4">
            <div className="space-y-3 mb-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-700">{comment.text}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(comment.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex items-center">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-grow px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddComment}
                className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintCard;