import React, { useEffect, useState } from "react";
import "./HomePage.css";
import NavBar from "../Components/NavBar";
import axios from "axios";
import { API_URL } from "../apiRoute";
import { toast, ToastContainer } from "react-toastify";
import { Buddy } from "../Models/StudyBuddy";
import { ListGroup, ListGroupItem } from "react-bootstrap";
import { IoPersonCircleSharp } from "react-icons/io5";
import io from 'socket.io-client'
import { useAuth } from "../Context/useAuth";

const FindBuddiesPage = () => {
  const [buddies, setBuddies] = useState<Buddy[] | undefined>();
  const { user }= useAuth()
  const socket = io(API_URL)
  
  const sendBuddyRequest  = async (receiver_id: number) => {
    console.log(user?.user_id, receiver_id)
    await axios.post(`${API_URL}/friends/send`,{
        sender_id: user?.user_id,
        receiver_id: receiver_id
    }).then((res) => {
        toast.success("Friend request sent!")
    }).catch((err) => {
        toast.error("error sending friend request " + err)
    }
    )
  }

  const getBuddies = async () => {
    await axios
      .get(`${API_URL}/users/getAllUsers/${user?.user_id}`)
      .then((res) => {
        console.log(res.data);
        if (res.data.length > 0) {
          const studyBuddies = res.data.map((buddy: Buddy) => {
            return {
              username: buddy.username,
              first_name: buddy.first_name,
              last_name: buddy.last_name,
              user_id: buddy.user_id,
            };
          });
          setBuddies(studyBuddies);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("error fetching buddies " + err);
      });
  };

  useEffect(() => {
    getBuddies();
  }, []);
  return (
    <div className="Main vh-100">
      <div className="h-100">
        <NavBar />
        <div className="container">
          <div className="row mt-5">
            <div className="col-3"></div>
            <div className="col-5">
              <h2 className="text-center text-light">Find A Study Buddy</h2>
              <ListGroup className="mt-5">
                {buddies ? (
                  buddies.map((buddy, id) => (
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
                          <button className="btn btn-dark btn-block" onClick={() => sendBuddyRequest(buddy?.user_id)}>
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
            <div className="col-3"></div>
          </div>
        </div>
      </div>
      <ToastContainer/>
    </div>
  );
};

export default FindBuddiesPage;
