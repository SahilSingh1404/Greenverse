import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';
import { UserContext } from "./UserContext"; // Ensure this path is correct
// import SignupPage from './LoginPage';
import { FaUserCircle } from "react-icons/fa";

const SignupPage = () => {
    const [userDetails, setUserDetails] = useState({
        email: "",
        password: ""
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const loggedData = useContext(UserContext); // Ensure UserContext is properly imported and used

    const handleInput = (e) => {
        const { name, value } = e.target;
        setUserDetails((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSign=()=>{
        navigate("/signup")
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userDetails.email)) {
            setError('Invalid email format');
            return;
        }
         if (userDetails.password.length < 8) {
             setError('Password must be at least 8 characters long');
             return;
         }

        fetch("http://localhost:5000/auth/login", {
            method: "POST",
            body: JSON.stringify(userDetails),
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then((response) => {
                if (response.status === 404) {
                    setError("Email doesn't exist");
                } else if (response.status === 400) {
                    setError("Incorrect Password");
                }

                setTimeout(() => {
                    setError("");
                }, 5000);

                return response.json();
            })
            .then((data) => {
                if (data.token !== undefined) {
                     localStorage.setItem("nutrify-user", JSON.stringify(data));
                    loggedData.setLoggedUser(data);
                    
                    if (userDetails.email === "admin@example.com" && userDetails.password === "adminpassword") {
                        navigate("/admin");
                    } else {
                        navigate("/dashboard");
                    }
                }
            })
            .catch((err) => {
                console.log(err);
                setError("An error occurred. Please try again.");
            });
    };

    return (
        <div className="container">
            <div className="left-panel">
                <div className="logo">
                    <img src="/path/to/logo.png" alt="GreenVerse Logo" />
                </div>
                <h1 className='title'>GreenVerse</h1>
                <p className='personal-details'>Enter your personal details to start the journey with us</p>
                <button className="signup-btn" onClick={handleSign}>SIGN UP</button>
            </div>
            <div className="right-panel">
                <div className="help-link">Need Help?</div>
                <div className="form-container">
                    <div className="avatar">
                        <FaUserCircle className="avatar-icon" />
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <input type="email" name="email" placeholder="Email" value={userDetails.email} onChange={handleInput} />
                        </div>
                        <div className="input-group">
                            <input type="password" name="password" placeholder="Password" value={userDetails.password} onChange={handleInput} />
                        <button type="submit" className="signin-btn">SIGN IN</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SignupPage;