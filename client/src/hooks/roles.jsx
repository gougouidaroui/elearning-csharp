import * as jwt_decode from 'jwt-decode';

// Function to check if the user is an Admin
const useUserRoles = () => {
    const checkIfAdmin = (token) => {
        try {
            // Decode the JWT token
            const decodedToken = jwt_decode.jwtDecode(token);

            // Check if the token contains the 'role' claim
            const userRole = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

            // Return true if the user is an Admin, else false
            return userRole === 'Admin';
        } catch (error) {
            console.error("Error decoding token:", error);
            return false; // Return false in case of any error
        }
    };

    // Example usage:
    const token = localStorage.getItem('token'); // Get token from local storage
    return checkIfAdmin(token);
};

export default useUserRoles;
