import { useState } from "react";
import toast from "react-hot-toast";
import API from "../services/api";
import "./CreateProduct.css";

const CreateProduct = () => {
    const [formData, setFormData] = useState({
        productname: "",
        slug: "",
        description: "",
        category: "veg",
        productprice: 0.00,
        discountvalue: 0.00,
        gstpercentage: 0.00,
        hsncode: "",
        stock: 0,
        unit: "", // pcs / kg / g / ltr / ml ...
        adminEarningValue: 0.00,
        supervisorEarningValue: 0.00,
        employeeEarningValue: 0.00,
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
        if (files.length > 0) {
            const file = files[0]; // Only take the first image

            // Clean up old preview if exists
            if (previews.length > 0) {
                URL.revokeObjectURL(previews[0]);
            }

            const newPreview = URL.createObjectURL(file);
            setImages([file]); // Replace with single image
            setPreviews([newPreview]);
        }
    };

    const removeImage = () => {
        if (previews.length > 0) {
            URL.revokeObjectURL(previews[0]);
        }
        setImages([]);
        setPreviews([]);
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
            const response = await API.post("/products/create", data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.status === 201 || response.data.success) {
                toast.success("Product created successfully!");
                setFormData({
                    productname: "",
                    slug: "",
                    description: "",
                    category: "veg",
                    productprice: 0.00,
                    discountvalue: 0.00,
                    gstpercentage: 0.00,
                    hsncode: "",
                    stock: 0,
                    unit: "",
                    adminEarningValue: 0.00,
                    supervisorEarningValue: 0.00,
                    employeeEarningValue: 0.00,
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
                        <label>Slug (Short Name)</label>
                        <input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            placeholder="e.g. delicious-veg-burger"
                        />
                    </div>

                    <div className="form-group">
                        <label>MRP Price (₹)</label>
                        <input
                            type="number"
                            name="productprice"
                            value={formData.productprice}
                            onChange={handleChange}
                            placeholder="0.00"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Discount (Amount)</label>
                        <input
                            type="number"
                            name="discountvalue"
                            value={formData.discountvalue}
                            onChange={handleChange}
                            placeholder="0"
                            min="0"
                        />
                    </div>

                    <div className="form-group">
                        <label>GST Percentage (%)</label>
                        <input
                            type="number"
                            name="gstpercentage"
                            value={formData.gstpercentage}
                            onChange={handleChange}
                            placeholder="0"
                        />
                    </div>

                    <div className="form-group">
                        <label>HSN Code</label>
                        <input
                            type="text"
                            name="hsncode"
                            value={formData.hsncode}
                            onChange={handleChange}
                            placeholder="Enter HSN code"
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
                        <label>Unit (e.g. pcs, kg, ltr)</label>
                        <select
                            name="unit"
                            value={formData.unit}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Unit</option>
                            <option value="pcs">pcs</option>
                            <option value="kg">kg</option>
                            <option value="g">g</option>
                            <option value="ltr">ltr</option>
                            <option value="ml">ml</option>
                            <option value="packet">packet</option>
                        </select>
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
                    <label>Product Image</label>
                    <div className="image-upload-wrapper">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            id="image-input"
                        />

                        {previews.length === 0 ? (
                            <label htmlFor="image-input" className="image-upload-label">
                                <span>+ Add Image</span>
                                <small>Click to upload product photo</small>
                            </label>
                        ) : (
                            <div className="image-previews">
                                {previews.map((preview, index) => (
                                    <div key={index} className="preview-card">
                                        <img src={preview} alt="Product Preview" />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="remove-btn"
                                            title="Remove image"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                                <label htmlFor="image-input" className="clear-all" style={{ textAlign: 'center', display: 'block', marginTop: '10px', color: '#5f3dc4', cursor: 'pointer' }}>
                                    Change Image
                                </label>
                            </div>
                        )}
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
