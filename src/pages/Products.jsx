import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../services/api";
import "./Products.css";
import ImageModal from "../components/ImageModal";
import { IconButton } from "@mui/material";
import { Visibility } from "@mui/icons-material";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchQuery) {
      const delayDebounceFn = setTimeout(() => {
        fetchSearchProducts(searchQuery, 1);
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    } else {
      fetchProducts(currentPage);
    }
  }, [currentPage, searchQuery]);

  const fetchProducts = async (page) => {
    setLoading(true);
    try {
      const res = await API.get(`/products/admin/all?page=${page}&limit=10`);
      setProducts(res.data.products || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const fetchSearchProducts = async (query, page) => {
    setLoading(true);
    try {
      const res = await API.get(
        `/products/admin/search/${query}?page=${page}&limit=10`,
      );
      setProducts(res.data.products || []);
      setTotalPages(res.data.totalPages || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (product) => {
    navigate(`/edit-product/${product.id}`, { state: { product } });
  };

  const handleOpen = (url) => {
    setSelectedImage(url);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className="products-container">
      <div className="products-header">
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <h2 style={{ color: "black", margin: 0 }}>Products Management</h2>
          <button
            onClick={() => navigate("/CreateProducts")}
            style={{
              backgroundColor: "#6C5CE7",
              color: "white",
              padding: "8px 16px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            + Add Product
          </button>
        </div>
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="table-responsive">
        <table className="user-table">
          <thead>
            <tr>
              <th style={{ backgroundColor: "#6C5CE7", color: "white" }}>
                Image
              </th>
              <th style={{ backgroundColor: "#6C5CE7", color: "white" }}>
                Name
              </th>
              <th style={{ backgroundColor: "#6C5CE7", color: "white" }}>
                Category
              </th>
              <th style={{ backgroundColor: "#6C5CE7", color: "white" }}>
                Price
              </th>
              <th style={{ backgroundColor: "#6C5CE7", color: "white" }}>
                Discount
              </th>
              <th style={{ backgroundColor: "#6C5CE7", color: "white" }}>
                Selling Price
              </th>
              <th style={{ backgroundColor: "#6C5CE7", color: "white" }}>
                Stock
              </th>
              <th
                style={{
                  backgroundColor: "#6C5CE7",
                  color: "white",
                  textAlign: "center",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "black",
                  }}
                >
                  Loading...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "black",
                  }}
                >
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <img
                      src={
                        product.images?.[0]
                      }
                      alt={product.productname}
                      className="product-thumb"
                      onClick={() => handleOpen(product.images?.[0])}
                      style={{
                        cursor: "pointer",
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                        borderRadius: "4px",
                      }}
                    />
                  </td>
                  <td style={{ color: "black" }}>{product.productname}</td>
                  <td>
                    <span
                      className={`badge ${product.category}`}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        backgroundColor: "#f0edff",
                        color: "#6C5CE7",
                        textTransform: "capitalize",
                      }}
                    >
                      {product.category}
                    </span>
                  </td>
                  <td style={{ color: "black", textDecoration: "line-through" }}>₹{product.productprice}</td>
                  <td style={{ color: "black" }}>₹{product.discountvalue}</td>
                  <td style={{ color: "black" }}>₹{product.sellingPrice}</td>
                  <td style={{ color: "black" }}>{product.stock}</td>
                  <td>
                    <div
                      className="action-buttons"
                      style={{
                        display: "flex",
                        gap: "10px",
                        justifyContent: "center",
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/product/${product.id}`)}
                        style={{ color: "#6C5CE7" }}
                        title="View Details"
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      <button
                        onClick={() => startEdit(product)}
                        style={{
                          backgroundColor: "#6C5CE7",
                          color: "white",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div
          className="pagination"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "20px",
            gap: "15px",
          }}
        >
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid #dfe6e9",
              backgroundColor: currentPage === 1 ? "#f5f6fa" : "white",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              color: "black",
            }}
          >
            Previous
          </button>
          <span style={{ color: "#2d3436", fontWeight: "500" }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid #dfe6e9",
              backgroundColor: currentPage === totalPages ? "#f5f6fa" : "white",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              color: "black",
            }}
          >
            Next
          </button>
        </div>
      )}

      <ImageModal
        open={open}
        imageUrl={selectedImage}
        handleClose={handleClose}
      />
    </div>
  );
};

export default Products;
