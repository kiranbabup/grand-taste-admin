import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../services/api";
import { uploadImageToFirebase } from "../utils/firebaseImageUpload";
import "./CreateProduct.css";
import { Box, Modal, Typography, Button } from "@mui/material";

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [form, setForm] = useState({});
    const [loading, setLoading] = useState(true);

    const [newImages, setNewImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [selectedDeleteImage, setSelectedDeleteImage] = useState("");

    // FETCH PRODUCT
    const fetchProduct = async () => {
        try {
            const res = await API.get(`/products/getProductByid/${id}`);
            setProduct(res.data);
            setForm(res.data);
        } catch (err) {
            toast.error("Failed to load product");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProduct();
        return () => {
            // Cleanup previews
            previewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, []);

    // HANDLE INPUT CHANGE
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // UPDATE PRODUCT
    const handleUpdate = async () => {
        try {
            await API.put(`/products/update/${id}`, form);
            toast.success("Product updated successfully");
            fetchProduct();
        } catch (err) {
            toast.error("Update failed");
        }
    };

    // HANDLE IMAGE SELECT
    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);

        // Validate total count
        if ((product.images?.length || 0) + newImages.length + files.length > 5) {
            toast.error("Maximum 5 images allowed");
            return;
        }

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setNewImages([...newImages, ...files]);
        setPreviewUrls([...previewUrls, ...newPreviews]);
    };

    const removeSelectedImage = (index) => {
        const updatedImages = newImages.filter((_, i) => i !== index);
        const updatedPreviews = previewUrls.filter((_, i) => i !== index);

        // Revoke URL to avoid memory leaks
        URL.revokeObjectURL(previewUrls[index]);

        setNewImages(updatedImages);
        setPreviewUrls(updatedPreviews);
    };

    // UPLOAD IMAGES
    const handleUploadImages = async () => {
        if (newImages.length === 0) return;

        setIsUploading(true);
        const toastId = toast.loading("Uploading images...");

        try {
            const urls = [];
            for (let file of newImages) {
                const imageUrl = await uploadImageToFirebase(file, id);
                urls.push(imageUrl);
            }

            // Send both for compatibility with older/newer backend versions
            const res = await API.post(`/products/uploadImage/${id}`, {
                imageUrls: urls
            });

            console.log(res.data)

            toast.success("Images uploaded successfully", { id: toastId });
            setNewImages([]);
            setPreviewUrls([]);
            fetchProduct();
        } catch (err) {
            toast.error(err.message || "Upload failed", { id: toastId });
        } finally {
            setIsUploading(false);
        }
    };

    // DELETE IMAGE
    const confirmDeleteImage = (img) => {
        setSelectedDeleteImage(img);
        setDeleteModal(true);
    };

    const handleDeleteImage = async () => {
        try {
            await API.delete(`/products/deleteImage/${id}`, {
                data: { imageUrl: selectedDeleteImage },
            });

            toast.success("Image deleted");
            setDeleteModal(false);
            fetchProduct();
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="products-container">
            <button
                onClick={() => navigate(-1)}
                style={{ marginBottom: "20px", padding: "8px 16px", cursor: "pointer", backgroundColor: "#f0f0f0", border: "1px solid #ccc", borderRadius: "4px" }}
            >
                ← Back
            </button>
            <div className="form-card">
                <h2>Edit Product</h2>
                <p className="subtitle">Update product details</p>

                {/* FORM */}
                <div className="form-grid">
                    <div className="form-group">
                        <label>Product Name</label>
                        <input
                            type="text"
                            name="productname"
                            value={form.productname || ""}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Slug</label>
                        <input
                            type="text"
                            name="slug"
                            value={form.slug || ""}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>HSN Code</label>
                        <input
                            type="text"
                            name="hsncode"
                            value={form.hsncode || ""}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Category</label>
                        <select
                            name="category"
                            value={form.category || ""}
                            onChange={handleChange}
                        >
                            <option value="veg">Veg</option>
                            <option value="non-veg">Non Veg</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>MRP Price (₹)</label>
                        <input
                            type="number"
                            name="productprice"
                            value={form.productprice || ""}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Discount (Amount)</label>
                        <input
                            type="number"
                            name="discountvalue"
                            value={form.discountvalue || ""}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>GST Percentage (%)</label>
                        <input
                            type="number"
                            name="gstpercentage"
                            value={form.gstpercentage || ""}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Stock Quantity</label>
                        <input
                            type="number"
                            name="stock"
                            value={form.stock || ""}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Unit (e.g. pcs, kg, ltr)</label>
                        <select
                            name="unit"
                            value={form.unit}
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

                </div>

                {/* DESCRIPTION */}
                <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                        name="description"
                        rows={4}
                        value={form.description || ""}
                        onChange={handleChange}
                    />
                </div>
                <p className="subtitle">Update Staff Earnings</p>

                {/* FORM */}
                <div className="form-grid">
                    <div className="form-group">
                        <label>Admin Earnings (₹)</label>
                        <input
                            type="number"
                            name="adminEarningValue"
                            value={form.adminEarningValue || ""}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Supervisor Earnings (₹)</label>
                        <input
                            type="number"
                            name="supervisorEarningValue"
                            value={form.supervisorEarningValue || ""}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Employee Earnings (₹)</label>
                        <input
                            type="number"
                            name="employeeEarningValue"
                            value={form.employeeEarningValue || ""}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-grid">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        Cancel
                    </button>
                    <button className="submit-btn" onClick={handleUpdate}>
                        Update Product
                    </button>
                </div>


                {/* IMAGES */}
                <div style={{ marginTop: "30px" }}>
                    <h3>Images ({product.images?.length || 0}/5)</h3>

                    <div className="image-grid">
                        {product.images?.map((img, index) => (
                            <Box sx={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "30px"
                            }} key={index} >
                                <img src={img} alt="" style={{ width: "200px" }} />
                                <button
                                    className="delete-btn"
                                    onClick={() => confirmDeleteImage(img)}
                                >
                                    Delete
                                </button>
                            </Box>
                        ))}

                        {product.images?.length < 5 && (
                            <label className="upload-box" style={{ width: "200px", height: "50px", justifyContent: "center", alignItems: "center", display: "flex", overflow: "hidden", border: "2px dashed grey", color: "blue", cursor: "pointer", marginTop: "10px" }}>
                                + Add New Image
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    hidden
                                    onChange={handleImageSelect}
                                />
                            </label>
                        )}
                    </div>

                    {/* PREVIEW OF NEWLY SELECTED IMAGES */}
                    {previewUrls.length > 0 && (
                        <div style={{ marginTop: "20px" }}>
                            <h4>Ready to Upload ({previewUrls.length})</h4>
                            <div className="image-grid">
                                {previewUrls.map((url, index) => (
                                    <div key={index} className="preview-container" style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: "30px" }}>
                                        <img src={url} alt="Preview" style={{ width: "150px", borderRadius: "8px" }} />
                                        <button
                                            className="delete-btn small"
                                            onClick={() => removeSelectedImage(index)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <Box sx={{ display: "flex", gap: "20px", marginTop: "20px" }}>
                                <button
                                    className="back-btn"
                                    style={{ width: "100%", margin: 0 }}
                                    onClick={() => {
                                        setNewImages([]);
                                        setPreviewUrls([]);
                                    }}
                                >
                                    Clear Selection
                                </button>
                                <button
                                    className="submit-btn"
                                    style={{ width: "100%", margin: 0 }}
                                    onClick={handleUploadImages}
                                    disabled={isUploading}
                                >
                                    {isUploading ? "Uploading..." : "Confirm Upload"}
                                </button>
                            </Box>
                        </div>
                    )}
                </div>
            </div >

            {/* DELETE MODAL */}
            <Modal
                open={deleteModal}
                onClose={() => setDeleteModal(false)}
                aria-labelledby="delete-modal-title"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 'auto',
                    minWidth: '200px',
                    maxWidth: '350px',
                    bgcolor: 'background.paper',
                    borderRadius: '16px',
                    boxShadow: 24,
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    border: 'none',
                    outline: 'none'
                }}>
                    <Typography id="delete-modal-title" variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                        Delete this image?
                    </Typography>
                    
                    {selectedDeleteImage && (
                        <Box sx={{
                            width: '100%',
                            maxWidth: '350px',
                            minWidth: '200px',
                            height: 'auto',
                            overflow: 'hidden',
                            borderRadius: '8px',
                            border: '1px solid #eee'
                        }}>
                            <img 
                                src={selectedDeleteImage} 
                                alt="To be deleted" 
                                style={{ width: '100%', height: 'auto', display: 'block' }} 
                            />
                        </Box>
                    )}

                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                        This action cannot be undone.
                    </Typography>
                
                    <Box sx={{ display: 'flex', gap: 2, width: '100%', mt: 2, border: '1px dashed grey', padding: '12px'  }}>
                        <Button 
                            variant="outlined" 
                            fullWidth 
                            onClick={() => setDeleteModal(false)}
                            sx={{ borderRadius: '8px', textTransform: 'none' }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="contained" 
                            color="error" 
                            fullWidth 
                            onClick={handleDeleteImage}
                            sx={{ borderRadius: '8px', textTransform: 'none', boxShadow: 'none', '&:hover': { boxShadow: 'none', bgcolor: '#d32f2f' } }}
                        >
                            Delete
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </div >
    );
};

export default EditProduct;
