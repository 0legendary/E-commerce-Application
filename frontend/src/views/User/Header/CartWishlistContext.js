import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../../../config/axiosConfig';
import { handleApiResponse } from '../../../utils/utilsHelper';
 
// Create context
const CartWishlistContext = createContext();

// Custom hook to use the CartWishlistContext
export const useCartWishlist = () => useContext(CartWishlistContext);

// Provider component
export const CartWishlistProvider = ({ children }) => {
    const [userDetails, setUserDetails] = useState({
        name: null,
        cartLength: 0,
        wishListLength: 0
    });

    // Function to fetch user details
    const fetchUserDetails = async () => {
        const result = await handleApiResponse(axiosInstance.get('/user/get-user-details'));
      
        if (result.success) {
          const { userName, cartLength, wishListLength } = result.data;
          setUserDetails({
            name: userName,
            cartLength,
            wishListLength
          });
        } else {
          console.error('Error:', result.message);  // Log the error message from the backend
        }
      };

    // Effect to fetch user details on component mount
    useEffect(() => {
        fetchUserDetails();
    }, []);

    // Function to update cart length
    const updateCartLength = (newLength) => {
        setUserDetails((prevDetails) => ({
            ...prevDetails,
            cartLength: prevDetails.cartLength + newLength
        }));
    };

    // Function to update wishlist length
    const updateWishlistLength = (newLength) => {
        setUserDetails((prevDetails) => ({
            ...prevDetails,
            wishListLength: prevDetails.wishListLength + newLength
        }));
    };

    return (
        <CartWishlistContext.Provider value={{ userDetails, updateCartLength, updateWishlistLength }}>
            {children}
        </CartWishlistContext.Provider>
    );
};
