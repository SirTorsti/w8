const initializeRegister = () => {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', fetchData);
    } else {
        console.error('Register form not found');
    }
}

const fetchData = async (e) => {
    e.preventDefault();

    const formData = {
        email: e.target.email.value,
        password: e.target.password.value,
        username: e.target.username.value,
        isAdmin: e.target.isAdmin ? e.target.isAdmin.checked : false
    }

    try {
        const response = await fetch("/api/user/register", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error:", errorData);
        } else {
            window.location.href = '/index.html';
        }

    } catch (error) {
        console.log("Error while trying to register: " + error.message);
    }
}


initializeRegister()