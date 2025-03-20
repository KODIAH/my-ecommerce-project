// Wait for the document to fully load before executing the script
document.addEventListener("DOMContentLoaded", () => {
    // Get references to forms if they exist on the page
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const resetForm = document.getElementById("resetPasswordForm");
    const verifyCodeForm = document.getElementById("verifyCodeForm");
    const newPasswordForm = document.getElementById("newPasswordForm");

    // Backend Base URL (Adjust if necessary)
    const BASE_URL = "http://localhost:5000/api";

    // Error message container (assumes a div with id="error-message" exists in the HTML)
    const errorMessageContainer = document.getElementById("error-message");

    /** ------------------------- HELPER FUNCTIONS ------------------------- **/
    // Show loading state on a button
    const showLoading = (button) => {
        button.disabled = true;
        button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Processing...`;
    };

    // Reset button to its original state
    const resetButton = (button, originalText) => {
        button.disabled = false;
        button.innerHTML = originalText;
    };

    // Validate email format
    const validateEmail = (email) => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    };

    // Display error message to the user
    const showError = (message) => {
        errorMessageContainer.textContent = message;
        errorMessageContainer.style.display = "block";
        errorMessageContainer.focus(); // Ensure screen readers announce the error
    };

    // Clear error message
    const clearError = () => {
        errorMessageContainer.textContent = "";
        errorMessageContainer.style.display = "none";
    };

    // Validate password strength
    const validatePassword = (password) => {
        const minLength = 8;
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasUpperCase = /[A-Z]/.test(password);

        if (password.length < minLength) {
            return "Password must be at least 8 characters long.";
        }
        if (!hasSpecialChar) {
            return "Password must contain at least one special character.";
        }
        if (!hasNumber) {
            return "Password must contain at least one number.";
        }
        if (!hasUpperCase) {
            return "Password must contain at least one uppercase letter.";
        }
        return null;
    };

    /** ------------------------- LOGIN FUNCTIONALITY ------------------------- **/
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            const submitButton = loginForm.querySelector("button[type='submit']");
            const originalButtonText = submitButton.innerHTML;

            // Basic validation
            if (!email || !password) {
                showError("All fields are required.");
                return;
            }

            if (!validateEmail(email)) {
                showError("Please enter a valid email address.");
                return;
            }

            try {
                showLoading(submitButton);
                clearError();

                // Send login request to backend
                const response = await fetch(`${BASE_URL}/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem("authToken", data.token); // Store token in localStorage
                    window.location.href = "admin.html"; // Redirect to admin dashboard
                } else {
                    showError(data.message || "Login failed. Please try again.");
                }
            } catch (error) {
                console.error("Login Error:", error);
                showError("Something went wrong. Please try again.");
            } finally {
                resetButton(submitButton, originalButtonText);
            }
        });
    }

    /** ------------------------- SIGNUP FUNCTIONALITY ------------------------- **/
    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            const submitButton = signupForm.querySelector("button[type='submit']");
            const originalButtonText = submitButton.innerHTML;

            // Basic validation
            if (!name || !email || !password) {
                showError("All fields are required.");
                return;
            }

            if (!validateEmail(email)) {
                showError("Please enter a valid email address.");
                return;
            }

            const passwordError = validatePassword(password);
            if (passwordError) {
                showError(passwordError);
                return;
            }

            try {
                showLoading(submitButton);
                clearError();

                // Send signup request to backend
                const response = await fetch(`${BASE_URL}/signup`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    alert("Signup successful! Redirecting to login...");
                    window.location.href = "login.html"; // Redirect to login page
                } else {
                    showError(data.message || "Signup failed. Please try again.");
                }
            } catch (error) {
                console.error("Signup Error:", error);
                showError("Something went wrong. Please try again.");
            } finally {
                resetButton(submitButton, originalButtonText);
            }
        });
    }

    /** ------------------------- RESET PASSWORD FUNCTIONALITY ------------------------- **/
    if (resetForm) {
        resetForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("email").value.trim();
            const submitButton = resetForm.querySelector("button[type='submit']");
            const originalButtonText = submitButton.innerHTML;

            // Basic validation
            if (!email) {
                showError("Email is required.");
                return;
            }

            if (!validateEmail(email)) {
                showError("Please enter a valid email address.");
                return;
            }

            try {
                showLoading(submitButton);
                clearError();

                // Send reset password request to backend
                const response = await fetch(`${BASE_URL}/reset-password`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                });

                const data = await response.json();

                if (response.ok) {
                    alert("Reset code sent to your email. Redirecting to verify code...");
                    window.location.href = "verify-code.html"; // Redirect to verify code page
                } else {
                    showError(data.message || "Reset password failed. Please try again.");
                }
            } catch (error) {
                console.error("Reset Password Error:", error);
                showError("Something went wrong. Please try again.");
            } finally {
                resetButton(submitButton, originalButtonText);
            }
        });
    }

    /** ------------------------- VERIFY CODE FUNCTIONALITY ------------------------- **/
    if (verifyCodeForm) {
        verifyCodeForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const code = document.getElementById("code").value.trim();
            const submitButton = verifyCodeForm.querySelector("button[type='submit']");
            const originalButtonText = submitButton.innerHTML;

            // Basic validation
            if (!code) {
                showError("Verification code is required.");
                return;
            }

            try {
                showLoading(submitButton);
                clearError();

                // Send verification code to backend
                const response = await fetch(`${BASE_URL}/verify-code`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code }),
                });

                const data = await response.json();

                if (response.ok) {
                    alert("Code verified! Redirecting to set new password...");
                    window.location.href = "new-password.html"; // Redirect to set new password page
                } else {
                    showError(data.message || "Invalid code. Please try again.");
                }
            } catch (error) {
                console.error("Verify Code Error:", error);
                showError("Something went wrong. Please try again.");
            } finally {
                resetButton(submitButton, originalButtonText);
            }
        });
    }

    /** ------------------------- SET NEW PASSWORD FUNCTIONALITY ------------------------- **/
    if (newPasswordForm) {
        newPasswordForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const newPassword = document.getElementById("newPassword").value.trim();
            const confirmPassword = document.getElementById("confirmPassword").value.trim();
            const submitButton = newPasswordForm.querySelector("button[type='submit']");
            const originalButtonText = submitButton.innerHTML;

            // Basic validation
            if (!newPassword || !confirmPassword) {
                showError("Both fields are required.");
                return;
            }

            if (newPassword !== confirmPassword) {
                showError("Passwords do not match.");
                return;
            }

            const passwordError = validatePassword(newPassword);
            if (passwordError) {
                showError(passwordError);
                return;
            }

            try {
                showLoading(submitButton);
                clearError();

                // Send new password to backend
                const response = await fetch(`${BASE_URL}/set-new-password`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ newPassword }),
                });

                const data = await response.json();

                if (response.ok) {
                    alert("Password reset successful! Redirecting to login...");
                    window.location.href = "login.html"; // Redirect to login page
                } else {
                    showError(data.message || "Password reset failed. Please try again.");
                }
            } catch (error) {
                console.error("Set New Password Error:", error);
                showError("Something went wrong. Please try again.");
            } finally {
                resetButton(submitButton, originalButtonText);
            }
        });
    }
});