<template>
    <div class="container py-4">
        <h1 class="text-center mb-4">Login</h1>
        <form @submit.prevent="handleSubmit" class="card p-4 shadow-sm">
            <!-- Email Input -->
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

            <!-- Password Input --> 
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

            <!-- Error Alert -->
            <div v-if="error" class="alert alert-danger">
                {{ error }}
            </div>

            <!-- Submit Button -->
            <button class="btn btn-primary w-100">Login</button>
        </form>
    </div>
</template>



<script>
import { userService } from '../../services/users.service';
import EmailValidator from 'email-validator';

export default {
    data() {
        return {
            email: '',
            password: '',
            submitted: false,
            error: ''
        };
    },
    methods: {
        handleSubmit() {
            this.submitted = true;
            this.error = "";

            const { email, password } = this;

            if (!(email && password)) {
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

            userService.login(email, password)
                .then(() => {
                    console.log("Auth Successful");
                    this.$router.push('/');
                })
                .catch(error => {
                    this.error = error;
                    this.submitted = false;
                });
        }
    }
};
</script>

<style>
.container {
    max-width: 400px;
    margin: 0 auto;
}
.card {
    border-radius: 8px;
    border: none;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
