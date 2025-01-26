import React from 'react'
import { Link } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

const EmailVerificationPage = () => {
  return (
    <div className="vh-100 Main">
      <div className="h-100 d-flex flex-column justify-content-center align-items-center">
        <div
          className="card bg-light p-3"
          style={{ boxShadow: "0px 0px 20px 1px rgba(0,0,0,0.75)" }}
        >
          <div className="card-body">
            <div className="d-flex flex-column align-items-center justify-content-around border-bottom ">
              <h2 className=""><strong>Verify Your Email.</strong></h2>
              <p className="text-muted">
                Please check your email for a verification link. Once you have verified your email, you can log in.
              </p>
            </div>
            <Link to={'/login'} className='btn btn-dark d-block'>Proceed to Login</Link>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}

export default EmailVerificationPage