import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import React from 'react'
import { Link } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

const EmailVerificationPage = () => {
  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Verify Your Email</CardTitle>
            <CardDescription>
              We have sent you an email with a link to verify your account. Please check your email and click the link to complete the verification process.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to={'/login'}>
              <Button className='w-full'>Proceed To Login</Button>
            </Link>
          </CardContent>
        </Card>
    </div>
  )
}

export default EmailVerificationPage