/**
 * Sticker Manager Avanzado
 * 
 * ✅ SEGURO: Sin límites, procesamiento local de imágenes
 * Soporta: crop, blur, rotate, emoji, quote, meme
 */

import sharp from 'sharp';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { log } from './Logger.js';

class StickerManager {
    constructor() {
        this.tempDir = './temp/stickers';
        this.supportedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    }

    /**
     * ✅ Convertir imagen a sticker
     * Input: Buffer de imagen
     * Output: Buffer WebP (formato sticker de WhatsApp)
     */
    async imageToSticker(imageBuffer) {
        try {
            const sticker = await sharp(imageBuffer)
                .resize(512, 512, {
                    fit: 'contain',
                    background: { r: 255, g: 255, b: 255, alpha: 0 }
                })
                .webp({ quality: 80 })
                .toBuffer();

            return {
                success: true,
                buffer: sticker,
                format: 'webp'
            };
        } catch (err) {
            log('error', `Sticker conversion error: ${err.message}`);
            return { success: false, error: 'Error al convertir a sticker' };
        }
    }

    /**
     * ✅ Blur de imagen
     */
    async applyBlur(imageBuffer, severity = 50) {
        try {
            const blurred = await sharp(imageBuffer)
                .blur(Math.min(severity / 10, 10))
                .toBuffer();

            return {
                success: true,
                buffer: blurred
            };
        } catch (err) {
            log('error', `Blur error: ${err.message}`);
            return { success: false, error: 'Error al aplicar blur' };
        }
    }

    /**
     * ✅ Crop de imagen
     */
    async cropImage(imageBuffer, x, y, width, height) {
        try {
            const metadata = await sharp(imageBuffer).metadata();
            
            // Validar parámetros
            if (x < 0 || y < 0 || width > metadata.width || height > metadata.height) {
                return { success: false, error: 'Parámetros de crop inválidos' };
            }

            const cropped = await sharp(imageBuffer)
                .extract({ left: x, top: y, width, height })
                .toBuffer();

            return {
                success: true,
                buffer: cropped
            };
        } catch (err) {
            log('error', `Crop error: ${err.message}`);
            return { success: false, error: 'Error al recortar imagen' };
        }
    }

    /**
     * ✅ Rotate imagen
     */
    async rotateImage(imageBuffer, degrees) {
        try {
            const rotated = await sharp(imageBuffer)
                .rotate(degrees % 360)
                .toBuffer();

            return {
                success: true,
                buffer: rotated
            };
        } catch (err) {
            log('error', `Rotate error: ${err.message}`);
            return { success: false, error: 'Error al rotar imagen' };
        }
    }

    /**
     * ✅ Crear meme (imagen + texto arriba + texto abajo)
     */
    async createMeme(imageBuffer, topText, bottomText) {
        try {
            const fontPath = path.join(process.cwd(), 'assets', 'fonts', 'arial-bold.ttf');
            
            let image = sharp(imageBuffer);

            // Crear SVG con texto
            const svg = this._createMemeOverlay(topText, bottomText);
            
            const meme = await image
                .composite([
                    {
                        input: Buffer.from(svg),
                        top: 0,
                        left: 0
                    }
                ])
                .toBuffer();

            return {
                success: true,
                buffer: meme
            };
        } catch (err) {
            log('error', `Meme creation error: ${err.message}`);
            return { success: false, error: 'Error al crear meme' };
        }
    }

    /**
     * ✅ Crear SVG overlay para meme
     */
    _createMemeOverlay(topText, bottomText) {
        return `
            <svg width="500" height="500" xmlns="http://www.w3.org/2000/svg">
                <text x="250" y="40" font-size="40" font-weight="bold" text-anchor="middle" 
                      fill="white" stroke="black" stroke-width="2" font-family="Arial">
                    ${topText}
                </text>
                <text x="250" y="470" font-size="40" font-weight="bold" text-anchor="middle" 
                      fill="white" stroke="black" stroke-width="2" font-family="Arial">
                    ${bottomText}
                </text>
            </svg>
        `;
    }

    /**
     * ✅ Aplicar filtro de escala de grises
     */
    async grayscale(imageBuffer) {
        try {
            const gray = await sharp(imageBuffer)
                .grayscale()
                .toBuffer();

            return {
                success: true,
                buffer: gray
            };
        } catch (err) {
            log('error', `Grayscale error: ${err.message}`);
            return { success: false, error: 'Error al aplicar filtro' };
        }
    }

    /**
     * ✅ Invertir colores
     */
    async invert(imageBuffer) {
        try {
            const inverted = await sharp(imageBuffer)
                .negate()
                .toBuffer();

            return {
                success: true,
                buffer: inverted
            };
        } catch (err) {
            log('error', `Invert error: ${err.message}`);
            return { success: false, error: 'Error al invertir colores' };
        }
    }

    /**
     * ✅ Crear emoji sticker (desde texto)
     */
    async emojiToSticker(emoji) {
        try {
            // Usar Twemoji para obtener imagen del emoji
            const codePoint = Array.from(emoji)
                .map(char => char.charCodeAt(0).toString(16).padStart(4, '0'))
                .join('-')
                .toLowerCase();

            const emojiUrl = `https://twemoji.maxcdn.com/v/latest/72x72/${codePoint}.png`;
            
            const response = await axios.get(emojiUrl, { responseType: 'arraybuffer' });
            const sticker = await this.imageToSticker(response.data);

            return sticker;
        } catch (err) {
            log('error', `Emoji sticker error: ${err.message}`);
            return { success: false, error: 'Error al crear emoji sticker' };
        }
    }

    /**
     * ✅ Obtener información de imagen
     */
    async getImageInfo(imageBuffer) {
        try {
            const metadata = await sharp(imageBuffer).metadata();

            return {
                success: true,
                width: metadata.width,
                height: metadata.height,
                format: metadata.format,
                size: imageBuffer.length,
                hasAlpha: metadata.hasAlpha
            };
        } catch (err) {
            log('error', `Image info error: ${err.message}`);
            return { success: false, error: 'Error al obtener info de imagen' };
        }
    }
}

export default new StickerManager();
