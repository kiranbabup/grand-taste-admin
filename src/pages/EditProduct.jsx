import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../services/api";
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
        } catch (error) {
            toast.error("Product details not found");
            navigate("/products");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await API.put(`/products/updateProduct/${id}`, formData);
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
