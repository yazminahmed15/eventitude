<template>
    <div class="container py-4">
        <h1 class="text-center mb-4">Sign Up</h1>
        <form @submit.prevent="submitForm" class="card p-4 shadow-sm">
            <!-- First Name -->
            <div class="mb-3">
                <label for="first_name" class="form-label">First Name:</label>
                <input 
                    type="text" 
                    v-model="first_name" 
                    name="first_name" 
                    class="form-control" 
                    :class="{ 'is-invalid': submitted && !first_name }" 
                />
                <div v-show="submitted && !first_name" class="invalid-feedback">First Name is required</div>
            </div>

            <!-- Last Name -->
            <div class="mb-3">
                <label for="last_name" class="form-label">Last Name:</label>
                <input 
                    type="text" 
                    v-model="last_name" 
                    name="last_name" 
                    class="form-control" 
                    :class="{ 'is-invalid': submitted && !last_name }" 
                />
                <div v-show="submitted && !last_name" class="invalid-feedback">Last Name is required</div>
            </div>
            
            <!-- Email -->
            <div class="mb-3">
                <label for="email" class="form-label">Email:</label>
                <input 
                    type="email" 
                    v-model="email" 
                    name="email" 
                    class="form-control" 
                    :class="{ 'is-invalid': submitted && !email }" 
                />
                <div v-show="submitted && !email" class="invalid-feedback">Email is required</div>
            </div>

            <!-- Password -->
            <div class="mb-3">
                <label for="password" class="form-label">Password:</label>
                <input 
                    type="password" 
                    v-model="password" 
                    name="password" 
                    class="form-control" 
                    :class="{ 'is-invalid': submitted && !password }" 
                />
                <div v-show="submitted && !password" class="invalid-feedback">Password is required</div>
            </div>

            <!-- Error Message -->
            <div v-if="error" class="alert alert-danger">
                {{ error }}
            </div>

            <!-- Submit Button -->
            <button type="submit" class="btn btn-primary w-100">Sign Up</button>
        </form>

        <!-- Already Have an Account -->
        <div class="text-center mt-3">
            <button @click="goToLogin" class="btn btn-link">Already have an account? Login</button>
        </div>
    </div>
</template>

<script>
import EmailValidator from 'email-validator';
import { userService } from '../../services/users.service';

export default {
    data() {
        return {
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            submitted: false,
            error: ''
        }
    },
    methods: {
        submitForm() {
            this.submitted = true;
            this.error = "";

            const { first_name, last_name, email, password } = this;

            if (!(first_name && last_name && email && password)) {
                this.error = "All fields are required";
                return;
            }

            if (!EmailValidator.validate(email)) {
                this.error = "Invalid email address";
                return;
            }

            const password_pattern = /^(?=.*[0-9])(?=.*[a-z])[a-zA-Z0-9!@#$%^&*]{8,30}$/;
            if (!password_pattern.test(password)) {
                this.error = "Password must be 8 to 30 characters long, must contain a number, a letter & special character";
                return;
            }

            userService.createAccount({ first_name, last_name, email, password })
                .then(() => {
                    this.$router.push("/");
                })
                .catch(error => {
                    this.error = error;
                });
        },
        goToLogin() {
            this.$router.push("/login");
        }
    }
};
</script>

<style scoped>
.container {
    max-width: 500px;
    margin: 0 auto;
}

.card {
    border-radius: 8px;
    border: none;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-link {
    color: #007bff;
    text-decoration: none;
}
</style>