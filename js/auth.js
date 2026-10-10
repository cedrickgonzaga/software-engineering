
async function login(email, password) {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password,
    });
    
    if (error) throw error;


    const role = data.user.user_metadata.role || 'user';
    localStorage.setItem("role", role);

    if (role === "it_admin") window.location.href = "../it-admin/dashboard.html";
    else if (role === "facility_admin") window.location.href = "../facility-admin/dashboard.html";
    else window.location.href = "../user/dashboard.html";
  } catch (err) {
    alert(err.message);
  }
}

async function register(email, password, fullName, role) {
  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName,
          role: role
        }
      }
    });

    if (error) throw error;
    alert("Registration successful! You can now log in.");
    window.location.href = "login.html";
  } catch (err) {
    alert(err.message);
  }
}

async function logout() {
  await supabaseClient.auth.signOut();
  localStorage.removeItem("role");
  window.location.href = "../landing/login.html";
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    login(document.getElementById("email").value, document.getElementById("password").value);
  });
}

const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    register(
      document.getElementById("email").value,
      document.getElementById("password").value,
      document.getElementById("fullName").value,
      document.getElementById("role") ? document.getElementById("role").value : "user"
    );
  });
}

const logoutBtnTop = document.getElementById("logoutBtnTop");
if (logoutBtnTop) {
  logoutBtnTop.addEventListener("click", logout);
}




document.addEventListener("DOMContentLoaded", async () => {
    const { data: { session } } = await supabaseClient.auth.getSession();
    const currentPath = window.location.pathname;
    
    const isPublicPage = currentPath.includes("landing") || currentPath.endsWith("index.html") || currentPath === "/";

    if (!session && !isPublicPage) {

        window.location.href = "../landing/login.html";
    } else if (session && isPublicPage) {

        const role = localStorage.getItem("role") || 'user';
        if (role === "it_admin") window.location.href = "../it-admin/dashboard.html";
        else if (role === "facility_admin") window.location.href = "../facility-admin/dashboard.html";
        else window.location.href = "../user/dashboard.html";
    }
});
