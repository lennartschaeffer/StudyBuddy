import React, { useEffect, useState } from "react";
import "./HomePage.css";
import { ReactSearchAutocomplete } from "react-search-autocomplete";
import axios from "axios";
import { API_URL } from "../apiRoute";
import { toast, ToastContainer } from "react-toastify";
import { Buddy } from "../Models/StudyBuddy";
import { Form, ListGroup, ListGroupItem } from "react-bootstrap";
import { IoPersonCircleSharp } from "react-icons/io5";
import io from "socket.io-client";
import { useAuth } from "../Context/useAuth";
import { useQuery } from "react-query";
import { getAllUsers } from "../endpoints/Users";
import { FaSearch } from "react-icons/fa";

const FindBuddiesPage = () => {
  const { user } = useAuth();
  const socket = io(API_URL);
  const [filteredBuddies, setFilteredBuddies] = useState<Buddy[]>([]);

  const sendBuddyRequest = async (receiver_id: number) => {
    console.log(user?.user_id, receiver_id);
    await axios
      .post(`${API_URL}/friends/send`, {
        sender_id: user?.user_id,
        receiver_id: receiver_id,
      })
      .then((res) => {
        toast.success("Friend request sent!");
      })
      .catch((err) => {
        toast.error("error sending friend request " + err);
      });
  };

  const { data: studyBuddies } = useQuery(
    "studyBuddies",
    () => getAllUsers(user?.user_id!),
    {
      onSuccess: (data) => {
        console.log(data);
      },
      onError: (error) => {
        console.log(error);
      },
    }
  );

  const handleSearch = (text: string) => {
    if (studyBuddies) {
      const filtered = studyBuddies.filter((buddy: Buddy) => {
        return buddy.username.toLowerCase().includes(text.toLowerCase());
      });
      setFilteredBuddies(filtered);
    }
  };

  return (
    <div className="Main vh-100">
      <div className="h-100">
        <div className="container h-100 d-flex flex-column justify-content-center align-items-center">
          <div className="row ">
            <div className="col-12">
              <div className="card p-2">
                <div className="card-body">
                  <h1 className="text-center">
                    <b>Find A Study Buddy</b>
                    <FaSearch size={30} className="m-4"/>
                  </h1>
                  <p className="text-muted">
                    Search for a buddy to study with or add a friend to your
                    buddy list!
                  </p>
                  <Form.Control
                    onChange={(e) => handleSearch(e.target.value)}
                    type="text"
                    placeholder="Search for a buddy..."
                  />
                  <ListGroup className="mt-5">
                    {filteredBuddies ? (
                      filteredBuddies.map((buddy: Buddy, id: number) => (
                        <ListGroupItem key={id}>
                          <div className="row">
                            <div className="col-2 d-flex align-items-center">
                              <IoPersonCircleSharp size={40} />
                            </div>
                            <div className="col-7 d-flex align-items-center justify-content-start">
                              <p className="m-0 text-start">
                                <b>
                                  {buddy?.first_name} {buddy?.last_name} (@
                                  {buddy?.username})
                                </b>
                              </p>
                            </div>
                            <div className="col-3 d-flex align-items-center">
                              <button
                                className="btn btn-dark btn-block"
                                onClick={() => sendBuddyRequest(buddy?.user_id)}
                              >
                                Add +
                              </button>
                            </div>
                          </div>
                        </ListGroupItem>
                      ))
                    ) : (
                      <p>No buddies were found :(</p>
                    )}
                  </ListGroup>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default FindBuddiesPage;
