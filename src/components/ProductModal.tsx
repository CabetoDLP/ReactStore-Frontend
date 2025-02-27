import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
} from '@mui/material';

import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import axiosInstance from '../api/axios';
import { useEffect, useState } from 'react';
import ProductOptions from './ProductModalOptions';

export interface Product {
  productid: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageurls: string[];
}

interface ProductModalProps {
  productId: string | null; // Only product ID
  open: boolean;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ productId, open, onClose }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>(''); // State for main image
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [error, setError] = useState<string | null>(null); // State for error handeling

  // Function to get product details
  const fetchSelectedProduct = async () => {
    if (!productId) return; // If there's no ID, nothing happens
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post(
        '/products/showProduct',
        { productid: productId },
        { withCredentials: true }
      );
      const product = response.data.product; // Suposing backend gives back a `product`
      setSelectedProduct(product);
      setSelectedImage(product.imageurls[0] || ''); // Sets the first image
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError('Failed to load product details.');
    } finally {
      setLoading(false);
    }
  };

  // Calls `fetchSelectedProduct` each time the modal opens or changes the ID
  useEffect(() => {
    if (open) {
      fetchSelectedProduct();
    } else {
      setSelectedProduct(null);
      setSelectedImage('');
    }
  }, [productId, open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogContent sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
        {loading ? (
          <Typography variant="h6">Cargando...</Typography>
        ) : error ? (
          <Typography variant="h6" color="error">{error}</Typography>
        ) : selectedProduct ? (
          <>
            {/* Galería de miniaturas */}
            <Box sx={{display: "flex", flexDirection: 'row' }}>
              <ImageList sx={{ height: 420 }} cols={1} rowHeight={100}>
                {(selectedProduct.imageurls || []).map((url, index) => (
                  <ImageListItem
                    key={index}
                    onMouseEnter={() => setSelectedImage(url)} // Changes the image while hover
                    sx={{
                      cursor: 'pointer',
                      border: selectedImage === url ? '2px solid blue' : 'none', // Highlights active miniature
                    }}
                  >
                    <img
                      src={url}
                      alt={`Thumbnail ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
              <img
                src={selectedImage} // Main image based on state
                alt="Selected product"
                style={{
                  width: '30em',
                  height: '30em',
                  objectFit: 'cover',
                  borderRadius: 8,
                }}
              />
            </Box>

            {/* Main image and product details */}
            <Box flex={1} display="flex" flexDirection="column" gap={2} >
              <DialogTitle variant="h3">{selectedProduct.name || 'No title'}</DialogTitle>
              <Typography variant="h4">
                ${selectedProduct.price?.toLocaleString('es-CO') || 'N/A'}
              </Typography>
              <Typography variant="body1">
                {selectedProduct.description || 'No description available'}
              </Typography>
              <Typography variant="body1">Stock: {selectedProduct.stock || 'N/A'}</Typography>
              <Typography variant="body1">Category: {selectedProduct.category || 'N/A'}</Typography>

              <DialogActions
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginTop: 'auto'
                }}
              >
                {selectedProduct && productId && (
                  <ProductOptions productId={productId} stock={selectedProduct.stock} />
                )}
              </DialogActions>
            </Box>
          </>
        ) : (
          <Typography variant="h6">Producto no encontrado.</Typography>
        )}
      </DialogContent>

      
    </Dialog>
  );
};

export default ProductModal;



