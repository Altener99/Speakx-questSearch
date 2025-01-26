import React, { useState, useEffect } from "react";
import axios from "axios";
import logo from "./main-logo@3x.webp";

function Home() {
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState(""); // Filter by type
  const [types, setTypes] = useState([]); // Store unique question types
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 10;
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    // Fetch all questions
    axios
      .get("http://speakx-quest-search-4bqt.vercel.app/api/questions")
      .then((response) => {
        setQuestions(response.data);
      })
      .catch((error) => {
        console.error("Error fetching questions:", error);
      });

    // Fetch unique question types
    axios
      .get("http://speakx-quest-search-4bqt.vercel.app/api/types")
      .then((response) => {
        setTypes(response.data);
      })
      .catch((error) => {
        console.error("Error fetching types:", error);
      });
  }, []);

  const handleSearch = (e) => {
    setQuery(e.target.value);
    setCurrentPage(1);
  };

  const filteredQuestions = questions.filter((question) => {
    const matchesQuery = question.title.toLowerCase().includes(query.toLowerCase());
    const matchesType = filterType ? question.type === filterType : true;
    return matchesQuery && matchesType;
  });

  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = filteredQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);

  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);

  const maxVisibleButtons = 5;
  const startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
  const endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

  const visiblePages = Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);

  const handlePagination = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="min-h-screen min-w-full bg-[#fff8e9] flex flex-col items-center p-4">
      <div className="w-full max-w-4xl">
        <img src={logo} alt="" />
        <h1 className="text-3xl font-bold text-[#FF5805] mb-6 text-center">QuestSearch</h1>

        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between items-center">
          <input
            type="text"
            placeholder="Search for questions..."
            value={query}
            onChange={handleSearch}
            className="w-full sm:w-3/5 p-4 border rounded-full shadow-md outline-none focus:ring-4 focus:ring-[#FFD4A1] focus:border-[#FF5805] text-gray-800 placeholder-gray-500 bg-white"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="mt-4 sm:mt-0 sm:ml-4 p-2 border rounded-md text-gray-700 shadow-sm text-sm focus:ring-2 focus:ring-[#FFD4A1]"
          >
            <option value="">All Types</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 bg-white shadow-lg rounded-lg px-4 h-[800px] overflow-y-auto">
          {currentQuestions.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {currentQuestions.map((question) => (
                <li key={question.id} className="py-4 flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium text-[#FF5805] uppercase tracking-wide">
                      {question.type}
                    </span>
                    <h2 className="text-lg font-semibold text-gray-800">{question.title}</h2>
                  </div>
                  <button className="text-[#FF5805] hover:text-blue-800 font-medium text-2xl">View Details</button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center p-4 text-gray-500">No questions found</p>
          )}
        </div>

        <div className="top-full flex justify-center mt-6 space-x-1">
          {startPage > 1 && (
            <button
              onClick={() => handlePagination(1)}
              className="w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium bg-gray-200 text-gray-700 hover:bg-blue-100 hover:text-blue-500"
            >
              &laquo;
            </button>
          )}
          {visiblePages.map((page) => (
            <button
              key={page}
              onClick={() => handlePagination(page)}
              className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 ${
                currentPage === page
                  ? "bg-[#FF5805] text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-blue-100 hover:text-blue-500"
              }`}
            >
              {page}
            </button>
          ))}
          {endPage < totalPages && (
            <button
              onClick={() => handlePagination(totalPages)}
              className="w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium bg-gray-200 text-gray-700 hover:bg-blue-100 hover:text-blue-500"
            >
              &raquo;
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
