import { LoginForm } from "@/components/LoginForm";
import { Toaster } from "@/components/ui/toaster";

const LoginPage = () => {

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
        <Toaster />
      </div>
    </div>
    // <div className="vh-100 Main">
    //   <div className="h-100 d-flex flex-column justify-content-center align-items-center">
    //     <div
    //       className="card bg-light p-3"
    //       style={{ boxShadow: "0px 0px 20px 1px rgba(0,0,0,0.75)" }}
    //     >
    //       <div className="card-body">
    //         <div className="d-flex flex-column align-items-center justify-content-around border-bottom ">
    //           <h2 className=""><strong>Welcome Back.</strong></h2>
    //           <p className="text-muted">Sign In and Start Your Ideal Study Session.</p>
    //         </div>
    //         <Form className="p-4">
    //           <Form.Group className="mb-3" controlId="formBasicEmail">
    //             <Form.Label className="">Email</Form.Label>
    //             <Form.Control
    //               type="text"
    //               placeholder="Enter email..."
    //               onChange={(e) => setEmail(e.target.value)}
    //             />
    //           </Form.Group>
    //           <Form.Group className="mb-3" controlId="formBasicPassword">
    //             <Form.Label className="">Password</Form.Label>
    //             <Form.Control
    //               type="password"
    //               placeholder="Password"
    //               onChange={(e) => setPassword(e.target.value)}
    //             />
    //           </Form.Group>
    //           <div className="d-flex flex-column">
    //           <Button variant="dark" className="w-100" onClick={handleLogin}>
    //             Log In
    //           </Button>
    //           <Link to={"/register"} className="">Don't Have An Account Yet? Click Here to Register.</Link>
    //           </div>
              
    //         </Form>
    //       </div>
    //     </div>
    //   </div>
    //  <ToastContainer />
    // </div>
  );
};

export default LoginPage;
