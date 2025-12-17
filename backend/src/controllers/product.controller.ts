import { Request, Response } from 'express';
import { AppDataSource } from '../config/ormconfig';
import { Product } from '../entities/Product';
import { Like } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import multer from 'multer';

// Konfigurasi multer untuk upload gambar
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadDir = path.join(__dirname, '../../uploads/products');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  }
});

const multerConfig = {
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
      // Pesan error hanya untuk informasi, tidak dikirim ke callback
      console.log('Hanya file gambar yang diperbolehkan');
    }
  }
};

// Single image upload for main product image
export const upload = multer(multerConfig);

// Multiple images upload for additional product images
export const uploadMultiple = multer(multerConfig).array('additional_images', 5); // Allow up to 5 additional images

export const getRecommendedProducts = async (req: Request, res: Response) => {
  try {
    // Get 5 random products request
    const products = await AppDataSource.getRepository(Product)
      .createQueryBuilder('product')
      .where('product.is_active = :isActive', { isActive: true })
      .orderBy('RANDOM()')
      .take(5)
      .getMany();

    return res.json({ data: products });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    console.log('Request body:', req.body);
    console.log('Files received:', req.files ? Object.keys(req.files) : 'No files');

    const { name, description, price, discount_price, stock, category, is_active } = req.body;
    let image_url = null;
    let additional_images: string[] = [];

    console.log('Main image set:', image_url);

    // Cek apakah ada file yang diupload
    console.log('Request files:', req.files);

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    console.log('Files received:', files ? Object.keys(files) : 'No files');

    // Handle main image
    if (files && files['image'] && files['image'][0]) {
      const baseUrl = process.env.BASE_URL || 'http://localhost:4000';
      image_url = `${baseUrl}/uploads/products/${files['image'][0].filename}`;
      console.log('Main image set:', image_url);
    } else {
      console.log('No main image found in request');
      return res.status(400).json({ message: 'Gambar utama produk wajib diupload' });
    }

    // Handle additional images
    if (files && files['additional_images'] && files['additional_images'].length > 0) {
      const baseUrl = process.env.BASE_URL || 'http://localhost:4000';
      additional_images = files['additional_images'].map(file =>
        `${baseUrl}/uploads/products/${file.filename}`
      );
      console.log('Additional images:', additional_images);
      // Ensure additional_images is properly formatted for PostgreSQL
      console.log('Additional images type:', typeof additional_images, Array.isArray(additional_images));
    } else {
      console.log('No additional images found in request');
      additional_images = [];
    }

    // Validasi sederhana
    if (!name || price == null) {
      return res.status(400).json({ message: 'Name dan price wajib diisi' });
    }

    // Validasi price, discount_price, dan stock
    console.log('Validating price:', price, 'type:', typeof price);
    console.log('Validating discount_price:', discount_price, 'type:', typeof discount_price);
    console.log('Validating stock:', stock, 'type:', typeof stock);

    let parsedPrice: number;
    let parsedDiscountPrice: number | undefined;
    let parsedStock: number;

    try {
      parsedPrice = parseFloat(price);
      parsedDiscountPrice = discount_price ? parseFloat(discount_price) : undefined;
      parsedStock = stock != null ? parseInt(stock) : 0;

      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ message: 'Harga harus berupa angka positif' });
      }
      if (parsedDiscountPrice !== undefined && (isNaN(parsedDiscountPrice) || parsedDiscountPrice < 0)) {
        return res.status(400).json({ message: 'Harga diskon harus berupa angka positif' });
      }
      if (isNaN(parsedStock) || parsedStock < 0) {
        return res.status(400).json({ message: 'Stok harus berupa angka >= 0' });
      }
    } catch (error) {
      console.error('Error parsing numeric values:', error);
      return res.status(400).json({ message: 'Format angka tidak valid' });
    }

    const productRepo = AppDataSource.getRepository(Product);

    // Log untuk debugging
    console.log('Creating product with data:', {
      name,
      price: parsedPrice,
      discount_price: parsedDiscountPrice,
      stock: parsedStock,
      additional_images
    });

    // Buat produk baru
    console.log('Creating new product with values:', {
      name,
      price: parsedPrice,
      discount_price: parsedDiscountPrice,
      stock: parsedStock,
      category,
      image_url,
      additional_images,
      is_active
    });

    const product = productRepo.create({
      name,
      description: description || undefined,
      price: parsedPrice,
      discount_price: parsedDiscountPrice !== undefined && parsedDiscountPrice > 0 ? parsedDiscountPrice : undefined,
      stock: parsedStock,
      category: category || undefined,
      image_url: image_url || undefined,
      additional_images: additional_images && additional_images.length > 0 ? additional_images : undefined,
      is_active: is_active !== undefined ? is_active === 'true' || is_active === true : true
    });

    await productRepo.save(product);

    return res.status(201).json(product);
  } catch (err) {
    console.error('Error creating product:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'ID produk diperlukan' });
    }

    const productRepo = AppDataSource.getRepository(Product);
    const product = await productRepo.findOne({ where: { id } });

    if (!product) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }

    // Set header Cache-Control untuk mencegah caching dan status 304
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    return res.json(product);
  } catch (err) {
    console.error('Error fetching product:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, discount_price, stock, category, is_active } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'ID produk diperlukan' });
    }

    const productRepo = AppDataSource.getRepository(Product);
    const product = await productRepo.findOne({ where: { id } });

    if (!product) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }

    // Update image_url jika ada file baru yang diupload
    let image_url = product.image_url;
    let additional_images = product.additional_images || [];

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Handle main image update
    if (files && files['image'] && files['image'][0]) {
      const baseUrl = process.env.BASE_URL || 'http://localhost:4000';
      image_url = `${baseUrl}/uploads/products/${files['image'][0].filename}`;

      // Hapus file gambar lama jika ada
      if (product.image_url) {
        try {
          const oldImagePath = product.image_url.split('/uploads/products/')[1];
          if (oldImagePath) {
            const fullPath = path.join(__dirname, '../../uploads/products', oldImagePath);
            if (fs.existsSync(fullPath)) {
              fs.unlinkSync(fullPath);
            }
          }
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }
    }

    // Handle additional images update
    if (files && files['additional_images'] && files['additional_images'].length > 0) {
      const baseUrl = process.env.BASE_URL || 'http://localhost:4000';

      // Hapus file gambar tambahan lama jika ada
      if (product.additional_images && product.additional_images.length > 0) {
        for (const oldImageUrl of product.additional_images) {
          try {
            const oldImagePath = oldImageUrl.split('/uploads/products/')[1];
            if (oldImagePath) {
              const fullPath = path.join(__dirname, '../../uploads/products', oldImagePath);
              if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
              }
            }
          } catch (error) {
            console.error('Error deleting old additional image:', error);
          }
        }
      }

      // Set gambar tambahan baru
      additional_images = files['additional_images'].map(file =>
        `${baseUrl}/uploads/products/${file.filename}`
      );
    }

    // Validasi data
    if (price !== undefined) {
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ message: 'Price harus angka positif' });
      }
      product.price = parsedPrice;
    }

    if (discount_price !== undefined) {
      if (discount_price === '' || discount_price === null) {
        product.discount_price = undefined;
      } else {
        const parsedDiscountPrice = parseFloat(discount_price);
        if (isNaN(parsedDiscountPrice) || parsedDiscountPrice < 0) {
          return res.status(400).json({ message: 'Discount price harus angka positif' });
        }
        product.discount_price = parsedDiscountPrice;
      }
    }

    if (stock !== undefined) {
      const parsedStock = parseInt(stock);
      if (isNaN(parsedStock) || parsedStock < 0) {
        return res.status(400).json({ message: 'Stock harus angka >= 0' });
      }
      product.stock = parsedStock;
    }

    // Update properti produk
    product.name = name || product.name;
    product.description = description !== undefined ? description : product.description;
    product.category = category || product.category;
    product.image_url = image_url;
    product.additional_images = additional_images.length > 0 ? additional_images : undefined;
    product.is_active = is_active !== undefined ? is_active === 'true' || is_active === true : product.is_active;

    await productRepo.save(product);

    return res.json(product);
  } catch (err) {
    console.error('Error updating product:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'ID produk diperlukan' });
    }

    const productRepo = AppDataSource.getRepository(Product);
    const product = await productRepo.findOne({ where: { id } });

    if (!product) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }

    // Hapus file gambar utama jika ada
    if (product.image_url) {
      try {
        const imagePath = product.image_url.split('/uploads/products/')[1];
        if (imagePath) {
          const fullPath = path.join(__dirname, '../../uploads/products', imagePath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        }
      } catch (error) {
        console.error('Error deleting main image:', error);
      }
    }

    // Hapus file gambar tambahan jika ada
    if (product.additional_images && product.additional_images.length > 0) {
      for (const imageUrl of product.additional_images) {
        try {
          const imagePath = imageUrl.split('/uploads/products/')[1];
          if (imagePath) {
            const fullPath = path.join(__dirname, '../../uploads/products', imagePath);
            if (fs.existsSync(fullPath)) {
              fs.unlinkSync(fullPath);
            }
          }
        } catch (error) {
          console.error('Error deleting additional image:', error);
        }
      }
    }

    await productRepo.remove(product);

    return res.json({ message: 'Produk berhasil dihapus' });
  } catch (err) {
    console.error('Error deleting product:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search, category, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const productRepo = AppDataSource.getRepository(Product);

    // Buat query builder
    const queryBuilder = productRepo.createQueryBuilder('product');

    // Tambahkan kondisi pencarian jika ada
    if (search) {
      queryBuilder.where('product.name LIKE :search OR product.description LIKE :search', {
        search: `%${search}%`
      });
    }

    // Filter berdasarkan kategori jika ada
    if (category && category !== 'all') {
      queryBuilder.andWhere('product.category = :category', { category });
    }

    // Hitung total items untuk pagination
    const total = await queryBuilder.getCount();

    // Validasi sortBy untuk mencegah SQL injection
    const allowedSortFields = ['id', 'name', 'price', 'discount_price', 'stock', 'category', 'created_at', 'updated_at'];
    const validSortBy = allowedSortFields.includes(sortBy as string) ? sortBy as string : 'created_at';

    // Validasi sortOrder untuk memastikan nilai yang valid
    const validSortOrder = (sortOrder as string)?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Tambahkan sorting dan pagination
    queryBuilder
      .orderBy(`product.${validSortBy}`, validSortOrder)
      .skip(skip)
      .take(limitNum);

    const products = await queryBuilder.getMany();

    // Set header Cache-Control untuk mencegah caching dan status 304
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    return res.json({
      data: products,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    // Tambahkan detail error untuk memudahkan debugging
    return res.status(500).json({
      message: 'Internal server error',
      error: err instanceof Error ? err.message : 'Unknown error',
      query: { page: req.query.page, limit: req.query.limit, search: req.query.search, category: req.query.category, sortBy: req.query.sortBy, sortOrder: req.query.sortOrder }
    });
  }
};
