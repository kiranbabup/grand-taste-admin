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
        slug: "",
        description: "",
        category: "veg",
        productprice: 0,
        discountvalue: 0,
        gstpercentage: 0,
        hsncode: "",
        stock: 0,
        unit: "",
        adminEarningValue: 0,
        supervisorEarningValue: 0,
        employeeEarningValue: 0,
    });

    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState([]);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);

    // Modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [imageToDelete, setImageToDelete] = useState(null);

    useEffect(() => {
        if (location.state && location.state.product) {
            const product = location.state.product;
            setFormData({
                productname: product.productname || "",
                slug: product.slug || "",
                description: product.description || "",
                category: product.category || "veg",
                productprice: product.productprice || 0,
                discountvalue: product.discountvalue || 0,
                gstpercentage: product.gstpercentage || 0,
                hsncode: product.hsncode || "",
                stock: product.stock || 0,
                unit: product.unit || "",
                adminEarningValue: product.adminEarningValue || 0,
                supervisorEarningValue: product.supervisorEarningValue || 0,
                employeeEarningValue: product.employeeEarningValue || 0,
            });
            setImages(product.images || []);
        } else {
            fetchProduct();
        }
    }, [location.state, id]);

    const fetchProduct = async () => {
        try {
            const res = await API.get(`/products/getProductByid/${id}`);
            const product = res.data;
            setFormData({
                productname: product.productname || "",
                slug: product.slug || "",
                description: product.description || "",
                category: product.category || "veg",
                productprice: product.productprice || 0,
                discountvalue: product.discountvalue || 0,
                gstpercentage: product.gstpercentage || 0,
                hsncode: product.hsncode || "",
                stock: product.stock || 0,
                unit: product.unit || "",
                adminEarningValue: product.adminEarningValue || 0,
                supervisorEarningValue: product.supervisorEarningValue || 0,
                employeeEarningValue: product.employeeEarningValue || 0,
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

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setFilePreview(URL.createObjectURL(file));
        }
    };

    const handleImageUpload = async () => {
        if (!selectedFile) return;

        setUploadingImage(true);

        try {
            // Step 1: Upload to Firebase
            const imageUrl = await uploadImageToFirebase(selectedFile, id);
            
            // Step 2: Send URL to backend to save in database
            const response = await API.post(`/products/uploadImage/${id}`, {
                imageUrl: imageUrl
            });

            if (response.data.images) {
                setImages(response.data.images);
                toast.success("Image uploaded successfully!");
                setSelectedFile(null);
                if (filePreview) URL.revokeObjectURL(filePreview);
                setFilePreview(null);
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            toast.error(error.message || "Failed to upload image.");
        } finally {
            setUploadingImage(false);
        }
    };

    const confirmDelete = (imageUrl) => {
        setImageToDelete(imageUrl);
        setShowDeleteModal(true);
    };

    const handleDeleteImage = async () => {
        if (!imageToDelete) return;
        
        try {
            const response = await API.delete(`/products/deleteImage/${id}`, {
                data: { imageUrl: imageToDelete }
            });

            if (response.data.images) {
                setImages(response.data.images);
                toast.success("Image deleted successfully!");
                setShowDeleteModal(false);
                setImageToDelete(null);
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
            // Only send form data (backend updateProduct doesn't handle images)
            const dataToSubmit = {
                ...formData
            };

            await API.put(`/products/update/${id}`, dataToSubmit);
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
                        <label>Slug (Short Name)</label>
                        <input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>MRP Price (₹)</label>
                        <input
                            type="number"
                            name="productprice"
                            value={formData.productprice}
                            onChange={handleChange}
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
                        />
                    </div>

                    <div className="form-group">
                        <label>HSN Code</label>
                        <input
                            type="text"
                            name="hsncode"
                            value={formData.hsncode}
                            onChange={handleChange}
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
                                <div key={index} className="preview-box" style={{ position: "relative", border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden", display: 'flex', flexDirection: 'column' }}>
                                    <img
                                        src={imageUrl}
                                        alt={`Product ${index + 1}`}
                                        style={{ width: "100%", height: "150px", objectFit: 'cover' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => confirmDelete(imageUrl)}
                                        className="remove-btn"
                                        style={{
                                            position: "absolute",
                                            top: "5px",
                                            right: "5px",
                                            backgroundColor: "red",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "50%",
                                            width: "25px",
                                            height: "25px",
                                            cursor: "pointer",
                                            fontSize: "16px"
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add image button */}
                    {images.length < 5 && (
                        <div className="upload-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    id="file-upload-edit"
                                    hidden
                                />
                                <label
                                    htmlFor="file-upload-edit"
                                    style={{
                                        display: "inline-block",
                                        padding: "10px 20px",
                                        backgroundColor: "#f0f0f0",
                                        color: "#333",
                                        borderRadius: "5px",
                                        cursor: "pointer",
                                        border: '1px solid #ccc',
                                        fontWeight: "500"
                                    }}
                                >
                                    {selectedFile ? "Change Selection" : "Select Image"}
                                </label>

                                {selectedFile && (
                                    <button
                                        type="button"
                                        onClick={handleImageUpload}
                                        disabled={uploadingImage}
                                        style={{
                                            padding: "10px 20px",
                                            backgroundColor: "#4CAF50",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "5px",
                                            cursor: uploadingImage ? "not-allowed" : "pointer",
                                            opacity: uploadingImage ? 0.6 : 1,
                                            fontWeight: "bold"
                                        }}
                                    >
                                        {uploadingImage ? "Uploading..." : "Upload Image"}
                                    </button>
                                )}
                            </div>
                            
                            {filePreview && (
                                <div style={{ marginTop: '10px' }}>
                                    <p style={{ fontSize: '12px', marginBottom: '5px' }}>Selected Preview:</p>
                                    <img src={filePreview} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '5px' }} />
                                </div>
                            )}

                            <p style={{ fontSize: "12px", color: "#666" }}>
                                {images.length}/5 images uploaded
                            </p>
                        </div>
                    )}
                </div>

                <div className="form-actions" style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                    <button type="submit" className="submit-btn" disabled={loading} style={{ flex: 1 }}>
                        {loading ? "Saving..." : "Save Content"}
                    </button>
                    <button
                        type="button"
                        className="submit-btn"
                        onClick={() => navigate('/products')}
                        style={{ flex: 1, backgroundColor: '#6c757d', borderColor: '#6c757d' }}
                    >
                        Back to List
                    </button>
                </div>
            </form>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '15px',
                        maxWidth: '400px',
                        width: '90%',
                        textAlign: 'center',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                    }}>
                        <h3 style={{ marginBottom: '15px' }}>Confirm Delete</h3>
                        <p style={{ marginBottom: '20px', color: '#666' }}>Are you sure you want to delete this image?</p>
                        
                        {imageToDelete && (
                            <img 
                                src={imageToDelete} 
                                alt="To delete" 
                                style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', marginBottom: '20px', borderRadius: '8px' }} 
                            />
                        )}
                        
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button 
                                onClick={handleDeleteImage}
                                style={{ padding: '10px 25px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Yes, Delete
                            </button>
                            <button 
                                onClick={() => { setShowDeleteModal(false); setImageToDelete(null); }}
                                style={{ padding: '10px 25px', backgroundColor: '#eee', color: '#333', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditProduct;
