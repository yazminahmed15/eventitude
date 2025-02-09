const createAccount = (userData) => {
    return fetch ("http://localhost:3333/users",
    {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            password: userData.password,
        })
    })
   .then(response => {
        if (response.status === 201) {
            return response.json();
        } else if(response.status === 400){
         throw "Bad Request"
        } else {
         throw "Something went wrong"
        }
    })
    .then(rJson => {
        localStorage.setItem("user_id", rJson.user_id);
        localStorage.setItem("session_token", rJson.session_token)
        return rJson
    })
    .catch(error => {
        console.log("Error:", error)
        return Promise.reject(error)
    })

}


const login = (email, password) => {
    return fetch ("http://localhost:3333/login",
    {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            password,
        }),
    })
    .then(response => {
        if (response.status === 200) {
            return response.json();
        } else if(response.status === 400){
            throw "Bad Request"
        } else {
            throw "Something went wrong"
        }
    })
    .then(rJson => {
        localStorage.setItem("user_id", rJson.user_id);
        localStorage.setItem("session_token", rJson.session_token)
        return rJson
    })
    .catch(error => {
        console.log("Error:", error)
        return Promise.reject(error)
    })
}

const logOut = () => {
    return fetch("http://localhost:3333/logout",
    {
        method: 'POST',
        headers: {           
            'Content-Type': 'application/json',
            'X-Authorization': localStorage.getItem("session_token")
        } 
    })  
    .then((response) => {
        if (response.status === 200) {
                localStorage.removeItem("user_id");
                localStorage.removeItem("session_token");
                return 
        } else if(response.status === 401) {
            throw "Not Logged-In"
        } else {
            throw "Something went wrong"
        }
    })  
    .catch((error) => {
        console.log("Error:", error)
        return Promise.reject(error) 
    })
}


export const userService = {
    login,
    logOut,
    createAccount,
}