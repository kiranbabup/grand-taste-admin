import React from "react";
import { Dialog, DialogContent, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const ImageModal = ({ open, imageUrl, handleClose }) => {
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm">
      <IconButton
        onClick={handleClose}
        style={{ position: "absolute", right: 10, top: 10, zIndex: 1 }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent style={{ textAlign: "center" }}>
        <img
          src={imageUrl}
          alt="Preview"
          style={{ width: "300px", height: "auto"  }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ImageModal;