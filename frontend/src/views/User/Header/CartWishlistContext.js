import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../../../config/axiosConfig';

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
        try {
            const response = await axiosInstance.get('/user/get-user-details');
            if (response.data.status) {
                const user = response.data;
                setUserDetails({
                    name: user.userName,
                    cartLength: user.cartLength,
                    wishListLength: user.wishListLength
                });
            }
        } catch (error) {
            console.error('Error getting data:', error);
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
