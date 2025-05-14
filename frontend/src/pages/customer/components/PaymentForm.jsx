import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import { Box, Button } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { addStuff } from '../../../redux/userHandle';
import { useNavigate, useParams } from 'react-router-dom';
import Popup from '../../../components/Popup';
import { fetchProductDetailsFromCart, removeAllFromCart, removeSpecificProduct } from '../../../redux/userSlice';

console.log("Razorpay API Key:", process.env.REACT_APP_RAZORPAY_API_KEY); // Check if the API key is logged correctly

const PaymentForm = ({ handleBack }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { status, currentUser, productDetailsCart } = useSelector(state => state.user);
    const params = useParams();
    const productID = params.id;

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (productID) {
            dispatch(fetchProductDetailsFromCart(productID));
        }
    }, [productID, dispatch]);

    const productsQuantity = currentUser.cartDetails.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = currentUser.cartDetails.reduce((total, item) => total + (item.quantity * item.price.cost), 0);

    const singleProductQuantity = productDetailsCart && productDetailsCart.quantity;
    const totalsingleProductPrice = productDetailsCart && productDetailsCart.price && productDetailsCart.price.cost * productDetailsCart.quantity;

    const paymentID = `${Date.now()}`; // Generate unique payment ID

    const multiOrderData = {
        buyer: currentUser._id,
        shippingData: currentUser.shippingData,
        orderedProducts: currentUser.cartDetails,
        paymentInfo: { id: paymentID, status: "Successful" },
        productsQuantity,
        totalPrice,
    };

    const singleOrderData = {
        buyer: currentUser._id,
        shippingData: currentUser.shippingData,
        orderedProducts: productDetailsCart,
        paymentInfo: { id: paymentID, status: "Successful" },
        productsQuantity: singleProductQuantity,
        totalPrice: totalsingleProductPrice,
    };

    const handlePayment = async () => {
        const orderData = productID ? singleOrderData : multiOrderData;

        try {
            // Ensure Razorpay API Key is available
            const razorpayAPIKey = process.env.REACT_APP_RAZORPAY_API_KEY;
            if (!razorpayAPIKey) {
                setMessage("Razorpay API Key not found");
                setShowPopup(true);
                return;
            }

            // Create Razorpay order options
            const options = {
                key: razorpayAPIKey, // Use the API key from the environment variable
                amount: totalPrice * 100, // Amount in paise (smallest currency unit)
                currency: 'INR',
                name: 'A Touch of Arts',
                description: 'Order Payment',
                image: 'https://your-logo-url.com', // Replace with your logo URL
                handler: function (response) {
                    // Handle successful payment
                    dispatch(addStuff("newOrder", orderData));
                    if (productID) {
                        dispatch(removeSpecificProduct(productID));
                    } else {
                        dispatch(removeAllFromCart());
                    }
                    navigate('/Aftermath');
                },
                prefill: {
                    name: currentUser.name,
                    email: currentUser.email,
                    contact: currentUser.phone,
                },
                notes: {
                    address: currentUser.shippingData.address,
                },
                theme: {
                    color: '#F37254', // Custom color for Razorpay theme
                }
            };

            // Check if Razorpay library is available before proceeding
            if (typeof window.Razorpay === "undefined") {
                console.error("Razorpay library not loaded");
                setMessage("Razorpay library not loaded. Please try again.");
                setShowPopup(true);
                return;
            }

            // Create Razorpay instance and open checkout modal
            const razorpay = new window.Razorpay(options);
            razorpay.open();

        } catch (error) {
            console.error("Payment failed", error);
            setMessage(`Payment failed: ${error.message || "Unknown error"}`);
            setShowPopup(true);
        }
    };

    useEffect(() => {
        if (status === 'failed') {
            setMessage("Order Failed");
            setShowPopup(true);
        } else if (status === 'error') {
            setMessage("Network Error");
            setShowPopup(true);
        }
    }, [status]);

    // Ensure Razorpay script is loaded
    useEffect(() => {
        if (typeof window.Razorpay === "undefined") {
            console.error("Razorpay library not loaded");
            setMessage("Razorpay library not loaded. Please try again.");
            setShowPopup(true);
        } else {
            console.log("Razorpay library loaded successfully");
        }
    }, []);

    return (
        <React.Fragment>
            <Typography variant="h6" gutterBottom>
                Payment method
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={handleBack} sx={{ mt: 3, ml: 1 }}>
                    Back
                </Button>
                <Button
                    variant="contained"
                    sx={{ mt: 3, ml: 1 }}
                    onClick={handlePayment} // Trigger Razorpay checkout
                >
                    Place order
                </Button>
            </Box>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </React.Fragment>
    );
};

export default PaymentForm;
