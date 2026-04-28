import { useState } from "react";
import toast from "react-hot-toast";
import API from "../services/api";
import "./CreateProduct.css";

const CreateProduct = () => {
    const [formData, setFormData] = useState({
        productname: "",
        price: "",
        discount: "0",
        stock: "",
        description: "",
        category: "veg",
        adminEarningValue: "0",
        supervisorEarningValue: "0",
        employeeEarningValue: "0",
    });

    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 5) {
            toast.error("You can only upload up to 5 images.");
            return;
        }

        const newPreviews = files.map((file) => URL.createObjectURL(file));
        setImages((prev) => [...prev, ...files]);
        setPreviews((prev) => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        URL.revokeObjectURL(previews[index]);
        setImages((prev) => prev.filter((_, i) => i !== index));
        setPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach((key) => {
            data.append(key, formData[key]);
        });

        images.forEach((image) => {
            data.append("images", image);
        });

        try {
            const response = await API.post("/products/createProduct", data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.status === 201 || response.data.success) {
                toast.success("Product created successfully!");
                setFormData({
                    productname: "",
                    price: "",
                    discount: "0",
                    stock: "",
                    description: "",
                    category: "veg",
                    adminEarningValue: "0",
                    supervisorEarningValue: "0",
                    employeeEarningValue: "0",
                });
                setImages([]);
                setPreviews([]);
            }
        } catch (error) {
            console.error("Error creating product:", error);
            toast.error(error.response?.data?.message || "Failed to create product.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-product-container">
            <div className="header">
                <h2>Create New Product</h2>
                <p>Fill in the details below to add a new product to your catalog.</p>
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
                            placeholder="Enter product name"
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
                            placeholder="0.00"
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
                            placeholder="0"
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
                            placeholder="Enter quantity"
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
                            {/* <option value="spices">Spices</option> */}
                            {/* <option value="grains">Grains</option> */}
                        </select>
                    </div>
                </div>

                <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter product description"
                        rows="4"
                        required
                    ></textarea>
                </div>

                <div className="section-title">Earning Values (Fixed Amount per Sale)</div>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Admin Earning (₹)</label>
                        <input
                            type="number"
                            name="adminEarningValue"
                            value={formData.adminEarningValue}
                            onChange={handleChange}
                            placeholder="0"
                        />
                    </div>

                    <div className="form-group">
                        <label>Supervisor Earning (₹)</label>
                        <input
                            type="number"
                            name="supervisorEarningValue"
                            value={formData.supervisorEarningValue}
                            onChange={handleChange}
                            placeholder="0"
                        />
                    </div>

                    <div className="form-group">
                        <label>Employee Earning (₹)</label>
                        <input
                            type="number"
                            name="employeeEarningValue"
                            value={formData.employeeEarningValue}
                            onChange={handleChange}
                            placeholder="0"
                        />
                    </div>
                </div>

                <div className="image-upload-section">
                    <label >Product Images (Max 5)</label>
                    <div style={{ padding: "20px" }} className="upload-container">
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageChange}
                            id="file-upload"
                            hidden
                        />
                        <label htmlFor="file-upload" className="upload-box" style={{ cursor: "pointer", color: "blue" }}>
                            <span className="plus">+</span>
                            <span>Add Images</span>
                        </label>

                        {previews.map((preview, index) => (
                            <div key={index} className="preview-box">
                                <img src={preview} style={{ width: "300px" }} alt={`preview ${index}`} />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="remove-btn"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? "Creating..." : "Create Product"}
                </button>
            </form>
        </div>
    );
};

export default CreateProduct;
