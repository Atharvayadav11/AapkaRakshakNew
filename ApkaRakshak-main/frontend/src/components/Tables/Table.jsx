import React, { useEffect, useState } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "../shared/Navbar";

const FIRSTable = () => {
  const [data, setData] = useState([]);
  const [district, setDistrict] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (district) {
      fetchData();
    }
  }, [district, page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/firs/district/${district}?page=${page}&limit=10`);
      setData(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const districtOptions = [
    "AHMEDNAGAR", "AKOLA", "AMRAVATI CITY", "AMRAVATI RURAL", "BEED", "BHANDARA",
    "BRIHAN MUMBAI CITY", "BULDHANA", "CHANDRAPUR", "CHHATRAPATI SAMBHAJINAGAR (RURAL)",
    "CHHATRAPATI SAMBHAJINAGAR CITY", "DHARASHIV", "DHULE", "GADCHIROLI", "GONDIA",
    "HINGOLI", "JALGAON", "JALNA", "KOLHAPUR", "LATUR", "MIRA-BHAYANDAR, VASAI-VIRAR POLICE COMMISSIONER",
    "NAGPUR CITY", "NAGPUR RURAL", "NANDED", "NANDURBAR", "NASHIK CITY", "NASHIK RURAL",
    "NAVI MUMBAI", "PALGHAR", "PARBHANI", "PIMPRI-CHINCHWAD", "PUNE CITY", "PUNE RURAL",
    "RAIGAD", "RAILWAY CHHATRAPATI SAMBHAJINAGAR", "RAILWAY MUMBAI", "RAILWAY NAGPUR",
    "RAILWAY PUNE", "RATNAGIRI", "SANGLI", "SATARA", "SINDHUDURG", "SOLAPUR CITY",
    "SOLAPUR RURAL", "THANE CITY", "THANE RURAL", "WARDHA", "WASHIM", "YAVATMAL"
  ];

  return (
    <>
    
    <Navbar />
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <select
          value={district}
          onChange={(e) => {
            setDistrict(e.target.value);
            setPage(1);
          }}
          className="border border-gray-300 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Select District</option>
          {districtOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Search
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">FIR No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Police Station</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Registration Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sections</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {data.map((fir) => (
                  <tr key={fir._id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{fir["FIR No."]}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{fir["Police Station"]}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{fir["Registration Date"]}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{fir["Sections"]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 mt-4">No data found</p>
          )}

          {totalPages > 0 && (
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md disabled:opacity-50 hover:bg-gray-300 transition-colors"
              >
                <ChevronLeft className="mr-2" size={16} />
                Previous
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md disabled:opacity-50 hover:bg-gray-300 transition-colors"
              >
                Next
                <ChevronRight className="ml-2" size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
    </>
  );
};

export default FIRSTable;