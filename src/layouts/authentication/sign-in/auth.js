import Swal from "sweetalert2";

const SESSION_TIME = 24 * 60 * 60 * 1000; // 24 hours

// ==========================
// PASSWORD STRENGTH CHECK
// ==========================
export const checkPasswordStrength = (password) => {
  if (!password) return "";

  let strength = "Weak";

  if (password.length >= 6) strength = "Medium";

  if (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*]/.test(password)
  ) {
    strength = "Strong";
  }

  return strength;
};

// ==========================
// LOGIN
// ==========================
export const login = async (username, password) => {
  // basic validation
  if (!username || !password) {
    Swal.fire("Warning", "Please enter username and password", "warning");
    return false;
  }

  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      const expiry = new Date().getTime() + SESSION_TIME;

      localStorage.setItem("auth", "true");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("expiry", expiry);

      return true;
    } else {
      Swal.fire("Error", data.message || "Invalid credentials", "error");
      return false;
    }
  } catch (error) {
    Swal.fire("Error", "Server error. Please try again later.", "error");
    return false;
  }
};

// ==========================
// LOGOUT
// ==========================
export const logout = () => {
  localStorage.removeItem("auth");
  localStorage.removeItem("token");
  localStorage.removeItem("expiry");
};

// ==========================
// CHECK AUTH
// ==========================
export const isAuthenticated = () => {
  const auth = localStorage.getItem("auth");
  const expiry = localStorage.getItem("expiry");

  if (!auth || !expiry) return false;

  // check expiry
  if (new Date().getTime() > Number(expiry)) {
    logout();
    return false;
  }

  return true;
};

// ==========================
// GET TOKEN (optional)
// ==========================
export const getToken = () => {
  return localStorage.getItem("token");
};
