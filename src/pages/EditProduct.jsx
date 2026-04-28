import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../services/api";
import { uploadImageToFirebase } from "../utils/firebaseImageUpload";
import "./CreateProduct.css";

const EditProduct = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        productname: "",
        price: "",
        discount: "0",
        stock: "",
        description: "",
        category: "veg",
        adminEarningValue: "0",
        supervisorEarningValue: "0",
        employeeEarningValue: "0"
    });

    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState([]);
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        if (location.state && location.state.product) {
            const product = location.state.product;
            setFormData({
                productname: product.productname || "",
                price: product.price || "",
                discount: product.discount || "0",
                stock: product.stock || "",
                description: product.description || "",
                category: product.category || "veg",
                adminEarningValue: product.adminEarningValue || "0",
                supervisorEarningValue: product.supervisorEarningValue || "0",
                employeeEarningValue: product.employeeEarningValue || "0"
            });
            setImages(product.images || []);
        } else {
            fetchProduct();
        }
    }, [location.state, id]);

    const fetchProduct = async () => {
        try {
            const res = await API.get(`/products/getProductById/${id}`);
            const product = res.data;
            setFormData({
                productname: product.productname || "",
                price: product.price || "",
                discount: product.discount || "0",
                stock: product.stock || "",
                description: product.description || "",
                category: product.category || "veg",
                adminEarningValue: product.adminEarningValue || "0",
                supervisorEarningValue: product.supervisorEarningValue || "0",
                employeeEarningValue: product.employeeEarningValue || "0"
            });
            setImages(product.images || []);
        } catch (error) {
            toast.error("Product details not found");
            navigate("/products");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);

        try {
            // Step 1: Upload to Firebase
            const imageUrl = await uploadImageToFirebase(file, id);
            
            // Step 2: Send URL to backend to save in database
            const response = await API.post(`/products/uploadImage/${id}`, {
                imageUrl: imageUrl
            });

            if (response.data.images) {
                setImages(response.data.images);
                toast.success("Image uploaded successfully!");
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            toast.error(error.message || "Failed to upload image.");
        } finally {
            setUploadingImage(false);
            e.target.value = ""; // Reset file input
        }
    };

    const handleDeleteImage = async (imageUrl) => {
        try {
            const response = await API.delete(`/products/deleteImage/${id}`, {
                data: { imageUrl }
            });

            if (response.data.images) {
                setImages(response.data.images);
                toast.success("Image deleted successfully!");
            }
        } catch (error) {
            console.error("Error deleting image:", error);
            toast.error(error.response?.data?.message || "Failed to delete image.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Include images in the update
            const dataToSubmit = {
                ...formData,
                images: images
            };

            await API.put(`/products/updateProduct/${id}`, dataToSubmit);
            toast.success("Product updated successfully");
            navigate("/products");
        } catch (error) {
            console.error("Error updating product:", error);
            toast.error(error.response?.data?.message || "Failed to update product.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-product-container">
            <div className="header">
                <h2>Edit Product</h2>
                <p>Update the details of the product.</p>
            </div>

            <form onSubmit={handleSubmit} className="product-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label>Product Name</label>
                        <input
                            type="text"
                            name="productname"
                            value={formData.productname}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Price (₹)</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Discount (%)</label>
                        <input
                            type="number"
                            name="discount"
                            value={formData.discount}
                            onChange={handleChange}
                            min="0"
                            max="100"
                        />
                    </div>

                    <div className="form-group">
                        <label>Stock Quantity</label>
                        <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        >
                            <option value="veg">Veg</option>
                            <option value="non-veg">Non-Veg</option>
                            <option value="spices">Spices</option>
                            <option value="grains">Grains</option>
                        </select>
                    </div>
                </div>

                <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        required
                    ></textarea>
                </div>

                <div className="section-title">Earning Values</div>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Admin (₹)</label>
                        <input
                            type="number"
                            name="adminEarningValue"
                            value={formData.adminEarningValue}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Supervisor (₹)</label>
                        <input
                            type="number"
                            name="supervisorEarningValue"
                            value={formData.supervisorEarningValue}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Employee (₹)</label>
                        <input
                            type="number"
                            name="employeeEarningValue"
                            value={formData.employeeEarningValue}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="section-title">Product Images</div>
                <div style={{ padding: "20px" }} className="upload-container">
                    {/* Display existing images */}
                    {images.length > 0 && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "15px", marginBottom: "20px" }}>
                            {images.map((imageUrl, index) => (
                                <div key={index} className="preview-box" style={{ position: "relative", border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden" }}>
                                    <img
                                        src={imageUrl}
                                        alt={`Product ${index + 1}`}
                                        style={{ width: "250px", height: "auto", }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteImage(imageUrl)}
                                        className="remove-btn"
                                        style={{
                                            position: "absolute",
                                            top: "5px",
                                            right: "5px",
                                            backgroundColor: "red",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "50%",
                                            width: "30px",
                                            height: "30px",
                                            cursor: "pointer",
                                            fontSize: "18px"
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add image button - show only if less than 5 images */}
                    {images.length < 5 && (
                        <div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                id="file-upload-edit"
                                hidden
                                disabled={uploadingImage}
                            />
                            <label
                                htmlFor="file-upload-edit"
                                style={{
                                    display: "inline-block",
                                    padding: "15px 30px",
                                    backgroundColor: "#4CAF50",
                                    color: "white",
                                    borderRadius: "5px",
                                    cursor: uploadingImage ? "not-allowed" : "pointer",
                                    opacity: uploadingImage ? 0.6 : 1,
                                    fontWeight: "bold"
                                }}
                            >
                                {uploadingImage ? "Uploading..." : "+ Add Image"}
                            </label>
                            <p style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>
                                {images.length}/5 images uploaded
                            </p>
                        </div>
                    )}

                    {images.length >= 5 && (
                        <p style={{ color: "green", fontWeight: "bold" }}>
                            ✓ All 5 images uploaded
                        </p>
                    )}
                </div>

                <div className="form-actions" style={{ display: 'flex', gap: '15px' }}>
                    <button type="submit" className="submit-btn" disabled={loading} style={{ flex: 1 }}>
                        {loading ? "Updating..." : "Update Product"}
                    </button>
                    <button
                        type="button"
                        className="submit-btn"
                        onClick={() => navigate('/products')}
                        style={{ flex: 1, backgroundColor: '#6c757d', borderColor: '#6c757d' }}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProduct;
