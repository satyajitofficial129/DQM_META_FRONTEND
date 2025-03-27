"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import ChatSidebar from "@/components/Sidebar/ChatSidebar";
import { NEXT_PUBLIC_API_BASE_URL } from "@/utils/settings";
import getAuthUserId from "@/utils/getAuthUserId";
import Link from "next/link";
import { useRouter } from "next/compat/router";
import { FaRegTrashAlt } from "react-icons/fa";

const Page = () => {
  const [conversations, setConversations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const apiBaseUrl = NEXT_PUBLIC_API_BASE_URL;
  const router = useRouter();

  const handleRedirect = (customerId) => {
    const updateChat = async () => {
      try {
        const endpoint = `/go-to-chat/${customerId}`;
        const url = `${apiBaseUrl}${endpoint}`;
        const response = await axios.get(url);

        // Show success message
        // console.log(response.data.message);
        toast.success(response.data.message);

        // Redirect only if successful
        window.location.href = '/chat';
      } catch (error) {
        console.error('Error during API call:', error);
        toast.error('An error occurred while processing your request.');
      }
    };

    updateChat();
  };

  const fetchConversations = async (search = "") => {
    try {
      const authUserId = await getAuthUserId();
      
      // Build API URL dynamically
      let endpoint = `/follow-up-list/${authUserId}?page=${currentPage}`;
      if (search) {
        endpoint += `&customer_name=${encodeURIComponent(search)}`;
      }
  
      const url = `${apiBaseUrl}${endpoint}`;
      const response = await axios.get(url);
  
      if (response.status === 200) {
        const data = response.data.data.map((conversation) => ({
          customerId: conversation.id,
          customerName: conversation.name,
          messageLogs: conversation.message_logs || [],
        }));
  
        setConversations(data);
        setTotalPages(response.data.total_pages);
        setTotalItems(response.data.total_items);
      }
    } catch (error) {
      toast.error("Error fetching conversations");
      console.error("Error fetching conversations:", error);
    }
  };
  
  // 🔹 Handle search button click
  const handleSearch = () => {
    setCurrentPage(1);
    fetchConversations(customerName);
  };
  const resetCustomerName = () => {
    setCustomerName("");
    setCurrentPage(1);
    fetchConversations("");
  };
  
  // 🔹 Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    fetchConversations(customerName);
  }, [currentPage]);
  

  return (
    <section className="chat-section">
      <div className="chat-container" style={{ width: "1650px" }}>
        <ChatSidebar />
        <div className="chat-content">
          <div style={{ padding: "40px 20px", height: '-webkit-fill-available', overflow: 'scroll' }}>
          <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f1f1f1', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: '10px', color: '#333', fontWeight: 'bold' }}>Search By Customer Name</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                type="text"
                placeholder="Enter Customer Name here..."
                style={{
                  flex: '1',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '15px',
                  backgroundColor: '#fff',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                  outline: 'none',
                  transition: 'border-color 0.3s, box-shadow 0.3s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#007bff';
                  e.target.style.boxShadow = '0 0 5px rgba(0, 123, 255, 0.5)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#ddd';
                  e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.1)';
                }}
              />
              <button
                onClick={handleSearch}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  transition: 'background-color 0.3s',
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = '#0056b3')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = '#007bff')}
              >
                Submit
              </button>

              <button
              onClick={resetCustomerName}
              style={{
                padding: '12px 20px',
                backgroundColor: 'red',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '15px',
                transition: 'background-color 0.3s',
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = 'red')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = 'red')}
              >
                Reset
              </button>
              
            </div>
          </div>

          <div className="table-responsive mt-4" >
            <table className="table table-bordered " style={{ height: '95%', overflow: 'scroll' }}>
              <thead className="thead-dark">
                <tr>
                  <th scope="col" style={{ width: '20%' }}>Customer Name</th>
                  <th scope="col" style={{ width: '58%' }}>Conversation</th>
                  <th scope="col" style={{ width: '12%', textAlign: 'center' }}>Remove From Followup</th>
                  <th scope="col" style={{ width: '10%', textAlign: 'center' }}>Go To Chat</th>
                </tr>
              </thead>
              <tbody>
                {conversations.map((conversation, index) => (
                  <tr key={index}>
                    <td>{conversation.customerName}</td>
                    <td>
                      <ul style={{ padding: '0', margin: '0' }}>
                        {conversation.messageLogs.map((log, idx) => (
                          <li key={idx} style={{ listStyle: 'none' }}>
                            {log.unique_facebook_id === null ? (
                              <span className="badge bg-primary " style={{ marginRight: '10px', }}>Agent</span>
                            ) : (
                              <span className="badge bg-secondary " style={{ marginRight: '10px', }}>Client</span>
                            )}
                            {log.message_content || "No content"}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                      <div
                        className="btn btn-sm btn-danger"
                        style={{ width: '100%' }}
                        onClick={() => {
                          const isConfirmed = window.confirm("Are you sure ? you want to Remove From Follow Up!!");
                          if (isConfirmed) {
                            handleFollowUp(conversation.customerId);
                          }
                        }}
                      >
                        <FaRegTrashAlt />
                      </div>
                    </td>

                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                      <div
                        className="btn btn-sm btn-success"
                        style={{ width: '100%' }}
                        onClick={() => handleRedirect(conversation.customerId)}
                      >
                        <i className="ri-corner-up-left-double-line"></i>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
          

          {/* Pagination Controls */}
          <div className="pagination-controls mt-3" style={{ position: 'absolute', right: '0', bottom: '0' }}>
            <nav aria-label="Page navigation">
              <ul className="pagination justify-content-center" style={{ marginBottom: '0' }}>

                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                </li>

                {/* Page Number */}
                <li className="page-item disabled">
                  <span className="page-link">
                    Page {currentPage} of {totalPages}
                  </span>
                </li>
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Page;
