import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { Box } from "@mui/material";

const ProductDetails = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [productData, setProductData] = useState(null);

    useEffect(() => {
        fetchProductDetails();
    }, [productId]);

    const fetchProductDetails = async () => {
        try {
            setError("");
            const getData = await API.get(`/products/getProductByid/${productId}`);
            if (getData) {
                setProductData(getData.data)
                console.log(getData.data);
                setError("");
            }
        } catch (err) {
            console.error("Error fetching product details:", err);
            setError("Failed to load product details.");
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <button
                onClick={() => navigate(-1)}
                style={{ marginBottom: "20px", padding: "8px 16px", cursor: "pointer", backgroundColor: "#f0f0f0", border: "1px solid #ccc", borderRadius: "4px" }}
            >
                ← Back
            </button>

            <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", marginBottom: "30px", color: "black" }}>
                <h2 style={{ marginTop: 0, marginBottom: "20px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>Product Details</h2>
                {error !== "" ?
                    <div>{error}</div>
                    :
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                        <div><strong>Product Name:</strong> {productData?.productname}</div>
                        <div><strong>Slug:</strong> {productData?.slug}</div>
                        <div><strong>HSN Code:</strong> {productData?.hsncode}</div>
                        <div><strong>Category:</strong> {productData?.category}</div>
                        <div><strong>Price:</strong> {productData?.productprice}₹</div>
                        <div><strong>Discount:</strong> {productData?.discountvalue}₹</div>
                        <div><strong>Selling Price:</strong> {productData?.sellingPrice}₹</div>
                        <div><strong>Stock:</strong> {productData?.stock}</div>
                        <div><strong>Unit:</strong> {productData?.unit}</div>
                        <div><strong>Admin Earning:</strong> {productData?.adminEarningValue}₹</div>
                        <div><strong>Supervisor Earning:</strong> {productData?.supervisorEarningValue}₹</div>
                        <div><strong>Employee Earning:</strong> {productData?.employeeEarningValue}₹</div>
                        <div><strong>Description:</strong> {productData?.description}</div>
                        <br/>
                        {productData?.images?.map((image) => (
                            <Box sx={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                                <img key={image} src={image} alt="" style={{ width: "300px" }} />
                            </Box>
                        ))}
                    </div>
                }
            </div>
        </div>
    );
};

export default ProductDetails;
