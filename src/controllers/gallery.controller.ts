import { Request, Response } from 'express';
import * as galleryService from '../services/gallery.service';

// Categories
export const createCategory = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        const category = await galleryService.createCategory(name);
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create category' });
    }
};

export const getAllCategories = async (req: Request, res: Response) => {
    try {
        const categories = await galleryService.getAllCategories();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
};

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const category = await galleryService.updateCategory(Number(id), name);
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update category' });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await galleryService.deleteCategory(Number(id));
        res.json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete category' });
    }
};

// Albums
export const createAlbum = async (req: Request, res: Response) => {
    try {
        const album = await galleryService.createAlbum(req.body);
        res.status(201).json(album);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create album' });
    }
};

export const getAllAlbums = async (req: Request, res: Response) => {
    try {
        const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
        const albums = await galleryService.getAllAlbums(categoryId);
        res.json(albums);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch albums' });
    }
};

export const getAlbumById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const album = await galleryService.getAlbumById(Number(id));
        if (!album) {
            return res.status(404).json({ error: 'Album not found' });
        }
        res.json(album);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch album' });
    }
};

export const updateAlbum = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const album = await galleryService.updateAlbum(Number(id), req.body);
        res.json(album);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update album' });
    }
};

export const deleteAlbum = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await galleryService.deleteAlbum(Number(id));
        res.json({ message: 'Album deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete album' });
    }
};

// Images
export const addImagesToAlbum = async (req: Request, res: Response) => {
    try {
        const { id: albumId } = req.params;
        const { imageUrls } = req.body; // Array of strings
        if (!imageUrls || !Array.isArray(imageUrls)) {
            return res.status(400).json({ error: 'imageUrls must be an array of strings' });
        }
        const images = await galleryService.addImagesToAlbum(Number(albumId), imageUrls);
        res.status(201).json(images);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add images' });
    }
};

export const deleteImage = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await galleryService.deleteImage(Number(id));
        res.json({ message: 'Image deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete image' });
    }
};
